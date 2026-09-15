import specLoader from '../config/specLoader.js';
import llmClient from '../utils/llm.js';
import logger from '../utils/logger.js';

export class InterviewAgent {
  async execute({ candidateData, matchDetails, hiringSpec, jobDetails }) {
    logger.info(`[InterviewAgent] Generating technical interview pack for candidate '${candidateData?.name}'`);

    const prompts = specLoader.getAgentPrompts();
    const systemPrompt = prompts.interview_agent?.system || 'You are a Technical Interview Architect.';
    const role = hiringSpec?.role || jobDetails?.title || 'Software Engineer';
    const missingSkills = matchDetails?.missing_skills || [];
    const matchedSkills = matchDetails?.matched_skills || [];

    const fallbackInterviewPack = () => {
      return {
        role,
        interview_rounds: hiringSpec?.interview_rounds || 2,
        technical_questions: [
          {
            question: `How would you architect state management in a large-scale ${role} project using ${matchedSkills[0] || 'modern frameworks'}?`,
            topic: matchedSkills[0] || 'Core Architecture',
            difficulty: 'Intermediate',
            target_skills: [matchedSkills[0] || 'Frameworks'],
            evaluation_criteria: 'Demonstrates deep understanding of state reactivity, immutability, and modular separation.'
          },
          {
            question: `Explain how you handle asynchronous workflow failures and error recovery in distributed microservices.`,
            topic: 'Error Handling & Reliability',
            difficulty: 'Advanced',
            target_skills: ['Async Architecture', 'Resilience'],
            evaluation_criteria: 'Mentions idempotency, exponential backoff, dead-letter queues, or state checkpoints.'
          },
          {
            question: `Since this role involves ${missingSkills.join(', ') || 'specialized tools'}, how would you approach adopting these in production?`,
            topic: 'Adaptability & Tooling',
            difficulty: 'Intermediate',
            target_skills: missingSkills,
            evaluation_criteria: 'Clear methodology for self-learning, prototyping, and integrating new paradigms.'
          }
        ],
        coding_challenge: {
          title: `${role} Take-Home Practical Challenge`,
          problem_statement: `Build a resilient module that fetches candidate application data, performs validation, and gracefully handles network timeouts.`,
          requirements: [
            'Implement input validation using Zod or custom schemas',
            'Handle edge cases and network retry policies',
            'Write at least 2 unit tests covering happy and error paths'
          ],
          time_limit_hours: 3,
          evaluation_rubric: {
            code_quality: '30%',
            architecture_and_patterns: '30%',
            error_handling: '20%',
            test_coverage: '20%'
          }
        }
      };
    };

    const userPrompt = `Generate a technical interview question pack and coding challenge for:
Candidate: ${candidateData?.name}
Role: ${role}
Candidate Strengths: ${matchedSkills.join(', ')}
Candidate Gaps / Areas to Probe: ${missingSkills.join(', ')}
Output valid JSON containing: role, interview_rounds, technical_questions (array), coding_challenge (object).`;

    const interviewPack = await llmClient.invokeJson(systemPrompt, userPrompt, fallbackInterviewPack);

    return {
      success: true,
      data: interviewPack,
    };
  }
}

export const interviewAgent = new InterviewAgent();
export default interviewAgent;
