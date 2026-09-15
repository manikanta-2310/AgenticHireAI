import Workflow from '../models/Workflow.js';
import WorkflowLog from '../models/WorkflowLog.js';
import Candidate from '../models/Candidate.js';
import Job from '../models/Job.js';
import specLoader from '../config/specLoader.js';
import resumeParserAgent from '../agents/parserAgent.js';
import embeddingAgent from '../agents/embeddingAgent.js';
import matchingAgent from '../agents/matchingAgent.js';
import shortlistingAgent from '../agents/shortlistingAgent.js';
import interviewAgent from '../agents/interviewAgent.js';
import emailAgent from '../agents/emailAgent.js';
import logger from '../utils/logger.js';

export class RecruitmentWorkflowEngine {
  constructor() {
    this.agents = {
      resume_parser: resumeParserAgent,
      embedding_agent: embeddingAgent,
      matching_agent: matchingAgent,
      shortlisting_agent: shortlistingAgent,
      interview_agent: interviewAgent,
      email_agent: emailAgent,
    };
  }

  // Create a new workflow instance for an applicant
  async createWorkflow(candidateId, jobId, workflowSpecId = 'default-hiring-workflow') {
    const workflow = await Workflow.create({
      candidate_id: candidateId,
      job_id: jobId,
      workflow_spec_id: workflowSpecId,
      current_state: 'idle',
      status: 'running',
      node_states: {
        resume_parser: { status: 'pending', retries: 0 },
        embedding_agent: { status: 'pending', retries: 0 },
        matching_agent: { status: 'pending', retries: 0 },
        shortlisting_agent: { status: 'pending', retries: 0 },
        human_approval: { status: 'pending' },
        interview_agent: { status: 'pending', retries: 0 },
        email_agent: { status: 'pending', retries: 0 },
      },
    });

    return workflow;
  }

  // Execute an individual node with spec-driven retry policies and logging
  async executeNodeWithRetry(workflow, nodeName, executeFn, inputPayload) {
    const retryPolicy = specLoader.getRetryPolicy();
    const maxRetries = retryPolicy.max_retries || 3;
    const retryDelay = retryPolicy.retry_delay_ms || 3000;

    let attempt = 0;
    const startTime = Date.now();

    workflow.current_state = nodeName;
    if (!workflow.node_states[nodeName]) {
      workflow.node_states[nodeName] = { status: 'running', retries: 0 };
    }
    workflow.node_states[nodeName].status = 'running';
    workflow.node_states[nodeName].started_at = new Date();
    await workflow.save();

    while (attempt <= maxRetries) {
      try {
        logger.info(`[Workflow ${workflow._id}] Running node '${nodeName}' (Attempt ${attempt + 1}/${maxRetries + 1})`);
        
        const output = await executeFn();
        
        const duration = Date.now() - startTime;
        workflow.node_states[nodeName].status = 'success';
        workflow.node_states[nodeName].finished_at = new Date();
        workflow.node_states[nodeName].retries = attempt;
        
        workflow.execution_history.push({
          node: nodeName,
          status: 'success',
          details: output?.data || {},
        });
        await workflow.save();

        await WorkflowLog.create({
          workflow_id: workflow._id,
          agent_name: nodeName,
          input: inputPayload,
          output: output?.data || output,
          status: 'success',
          duration_ms: duration,
        });

        return output;
      } catch (err) {
        attempt++;
        logger.error(`[Workflow ${workflow._id}] Node '${nodeName}' failed on attempt ${attempt}: ${err.message}`);
        
        const isRetryable = retryPolicy.retryable_errors.some(e => err.message.includes(e)) || attempt <= maxRetries;
        
        if (attempt <= maxRetries && isRetryable) {
          workflow.node_states[nodeName].retries = attempt;
          await workflow.save();
          
          await WorkflowLog.create({
            workflow_id: workflow._id,
            agent_name: nodeName,
            input: inputPayload,
            status: 'retrying',
            error: { message: err.message, stack: err.stack },
          });

          await new Promise(res => setTimeout(res, retryDelay));
        } else {
          // Final failure
          workflow.node_states[nodeName].status = 'failed';
          workflow.node_states[nodeName].error = err.message;
          workflow.status = 'failed';
          workflow.error = {
            message: err.message,
            stack: err.stack,
            node: nodeName,
          };
          await workflow.save();

          await WorkflowLog.create({
            workflow_id: workflow._id,
            agent_name: nodeName,
            input: inputPayload,
            status: 'failure',
            error: { message: err.message, stack: err.stack },
          });

          throw err;
        }
      }
    }
  }

  // Run the full autonomous recruitment pipeline
  async startWorkflow(workflowId) {
    const workflow = await Workflow.findById(workflowId);
    if (!workflow) throw new Error(`Workflow ${workflowId} not found`);

    const candidate = await Candidate.findById(workflow.candidate_id);
    const job = await Job.findById(workflow.job_id);

    if (!candidate || !job) {
      throw new Error('Candidate or Job associated with workflow not found');
    }

    // Load dynamic hiring spec
    let hiringSpec = null;
    try {
      hiringSpec = specLoader.getHiringSpec(job.hiring_spec_id || 'frontend-developer');
    } catch (e) {
      hiringSpec = {
        role: job.title,
        required_skills: job.required_skills,
        preferred_skills: job.preferred_skills,
        min_experience_years: job.min_experience,
        minimum_score: 75,
        shortlist_threshold: 80,
        hold_threshold: 60,
      };
    }

    try {
      // Step 1: Resume Parser Agent
      let parsedResult;
      if (candidate.parsed_resume_json && Object.keys(candidate.parsed_resume_json).length > 0) {
        parsedResult = { data: candidate.parsed_resume_json, raw_text: candidate.parsed_resume_json.raw_text_snippet || '' };
        workflow.node_states.resume_parser.status = 'success';
        await workflow.save();
      } else {
        parsedResult = await this.executeNodeWithRetry(
          workflow,
          'resume_parser',
          () => resumeParserAgent.parsePdfFile(candidate.resume_url),
          { resume_url: candidate.resume_url }
        );
        candidate.parsed_resume_json = parsedResult.data;
        if (parsedResult.data?.name && candidate.name === 'Candidate') {
          candidate.name = parsedResult.data.name;
        }
        await candidate.save();
      }

      // Step 2: Embedding Agent (Qdrant)
      await this.executeNodeWithRetry(
        workflow,
        'embedding_agent',
        () => embeddingAgent.execute({
          candidateId: candidate._id.toString(),
          resumeText: parsedResult.raw_text || JSON.stringify(parsedResult.data),
          candidateData: parsedResult.data,
        }),
        { candidateId: candidate._id }
      );

      // Step 3: Matching Agent
      const matchResult = await this.executeNodeWithRetry(
        workflow,
        'matching_agent',
        () => matchingAgent.execute({
          candidateData: candidate.parsed_resume_json,
          hiringSpec,
          jobDetails: job,
        }),
        { candidateId: candidate._id, hiringSpecId: job.hiring_spec_id }
      );

      candidate.match_score = matchResult.data.match_score;
      candidate.match_details = matchResult.data;
      await candidate.save();

      // Step 4: Shortlisting Agent
      const shortlistResult = await this.executeNodeWithRetry(
        workflow,
        'shortlisting_agent',
        () => shortlistingAgent.execute({
          matchScore: matchResult.data.match_score,
          hiringSpec,
        }),
        { matchScore: matchResult.data.match_score }
      );

      candidate.shortlist_decision = shortlistResult.data.decision;
      candidate.status = shortlistResult.data.decision === 'reject' ? 'rejected' : 'waiting_approval';
      await candidate.save();

      // Step 5: Human Approval Gate
      if (shortlistResult.data.requires_human_approval) {
        logger.info(`[Workflow ${workflow._id}] Pausing for Human Approval checkpoint.`);
        workflow.current_state = 'human_approval';
        workflow.status = 'waiting_approval';
        workflow.node_states.human_approval.status = 'waiting_approval';
        await workflow.save();
        return workflow;
      }

      // If rejected without human approval requirement:
      if (shortlistResult.data.decision === 'reject') {
        workflow.node_states.human_approval.status = 'skipped';
        await workflow.save();

        // Step 6 (Bypass Interview Agent) -> Step 7: Email Agent
        await this.executeNodeWithRetry(
          workflow,
          'email_agent',
          () => emailAgent.execute({
            candidate,
            job,
            decision: 'reject',
            matchScore: candidate.match_score,
          }),
          { candidateEmail: candidate.email, decision: 'reject' }
        );

        workflow.current_state = 'completed';
        workflow.status = 'completed';
        await workflow.save();
        return workflow;
      }

    } catch (err) {
      logger.error(`[Workflow ${workflow._id}] Uncaught execution error: ${err.message}`);
      workflow.status = 'failed';
      await workflow.save();
      throw err;
    }
  }

  // Resume workflow after human recruiter approval/rejection
  async resumeAfterApproval(workflowId, action, recruiterNotes = '') {
    const workflow = await Workflow.findById(workflowId);
    if (!workflow) throw new Error('Workflow not found');

    const candidate = await Candidate.findById(workflow.candidate_id);
    const job = await Job.findById(workflow.job_id);

    // Update approval checkpoint state
    workflow.node_states.human_approval = {
      status: action === 'approve' ? 'success' : 'rejected',
      action,
      recruiter_notes: recruiterNotes,
      approved_at: new Date(),
    };
    workflow.execution_history.push({
      node: 'human_approval',
      status: action === 'approve' ? 'approved' : 'rejected',
      details: { action, recruiterNotes },
    });
    workflow.status = 'running';
    await workflow.save();

    let hiringSpec = null;
    try {
      hiringSpec = specLoader.getHiringSpec(job.hiring_spec_id || 'frontend-developer');
    } catch (e) {
      hiringSpec = { role: job.title };
    }

    if (action === 'approve') {
      candidate.status = 'approved';
      candidate.shortlist_decision = 'approved';
      await candidate.save();

      // Step 6: Interview Agent
      const interviewResult = await this.executeNodeWithRetry(
        workflow,
        'interview_agent',
        () => interviewAgent.execute({
          candidateData: candidate.parsed_resume_json,
          matchDetails: candidate.match_details,
          hiringSpec,
          jobDetails: job,
        }),
        { candidateId: candidate._id }
      );

      candidate.interview_pack = interviewResult.data;
      candidate.status = 'interview_scheduled';
      await candidate.save();

      // Step 7: Email Agent
      await this.executeNodeWithRetry(
        workflow,
        'email_agent',
        () => emailAgent.execute({
          candidate,
          job,
          decision: 'approved',
          matchScore: candidate.match_score,
        }),
        { candidateEmail: candidate.email, decision: 'approved' }
      );

      candidate.email_sent = true;
      await candidate.save();

    } else {
      // Recruiter rejected
      candidate.status = 'rejected';
      candidate.shortlist_decision = 'rejected_by_recruiter';
      await candidate.save();

      workflow.node_states.interview_agent.status = 'skipped';
      await workflow.save();

      // Send polite rejection email
      await this.executeNodeWithRetry(
        workflow,
        'email_agent',
        () => emailAgent.execute({
          candidate,
          job,
          decision: 'reject',
          matchScore: candidate.match_score,
        }),
        { candidateEmail: candidate.email, decision: 'reject' }
      );
    }

    workflow.current_state = 'completed';
    workflow.status = 'completed';
    await workflow.save();

    return workflow;
  }
}

export const recruitmentWorkflowEngine = new RecruitmentWorkflowEngine();
export default recruitmentWorkflowEngine;
