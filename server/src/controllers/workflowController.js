import Workflow from '../models/Workflow.js';
import WorkflowLog from '../models/WorkflowLog.js';
import recruitmentWorkflowEngine from '../workflows/recruitmentWorkflow.js';
import { approveWorkflowSchema } from '../validators/schemas.js';

export const startWorkflow = async (req, res, next) => {
  try {
    const { workflow_id } = req.body;
    const workflow = await Workflow.findById(workflow_id);
    if (!workflow) {
      return res.status(404).json({ success: false, error: 'Workflow not found' });
    }

    recruitmentWorkflowEngine.startWorkflow(workflow._id).catch(err => {
      console.error(err);
    });

    res.status(200).json({ success: true, message: 'Workflow execution initiated', data: workflow });
  } catch (err) {
    next(err);
  }
};

export const retryWorkflow = async (req, res, next) => {
  try {
    const { workflow_id } = req.body;
    const workflow = await Workflow.findById(workflow_id);
    if (!workflow) {
      return res.status(404).json({ success: false, error: 'Workflow not found' });
    }

    workflow.status = 'running';
    workflow.error = undefined;
    await workflow.save();

    recruitmentWorkflowEngine.startWorkflow(workflow._id).catch(err => {
      console.error(err);
    });

    res.status(200).json({ success: true, message: 'Workflow retry started', data: workflow });
  } catch (err) {
    next(err);
  }
};

export const approveWorkflow = async (req, res, next) => {
  try {
    const validatedData = approveWorkflowSchema.parse(req.body);
    const workflow = await Workflow.findById(validatedData.workflow_id);

    if (!workflow) {
      return res.status(404).json({ success: false, error: 'Workflow not found' });
    }

    if (workflow.status !== 'waiting_approval') {
      return res.status(400).json({
        success: false,
        error: `Workflow is in status '${workflow.status}', not 'waiting_approval'`,
      });
    }

    const updatedWorkflow = await recruitmentWorkflowEngine.resumeAfterApproval(
      workflow._id,
      validatedData.action,
      validatedData.recruiter_notes
    );

    res.status(200).json({
      success: true,
      message: `Workflow ${validatedData.action === 'approve' ? 'approved and resumed' : 'rejected'} successfully`,
      data: updatedWorkflow,
    });
  } catch (err) {
    next(err);
  }
};

export const getWorkflowById = async (req, res, next) => {
  try {
    const workflow = await Workflow.findById(req.params.id)
      .populate('candidate_id')
      .populate('job_id');

    if (!workflow) {
      return res.status(404).json({ success: false, error: 'Workflow not found' });
    }

    const logs = await WorkflowLog.find({ workflow_id: workflow._id }).sort({ created_at: 1 });

    res.status(200).json({
      success: true,
      data: {
        ...workflow.toObject(),
        logs,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getAllWorkflows = async (req, res, next) => {
  try {
    const workflows = await Workflow.find()
      .populate('candidate_id', 'name email match_score status')
      .populate('job_id', 'title department')
      .sort({ created_at: -1 });

    res.status(200).json({ success: true, count: workflows.length, data: workflows });
  } catch (err) {
    next(err);
  }
};
