import Candidate from '../models/Candidate.js';
import Job from '../models/Job.js';
import Workflow from '../models/Workflow.js';
import recruitmentWorkflowEngine from '../workflows/recruitmentWorkflow.js';
import { applySchema } from '../validators/schemas.js';
import logger from '../utils/logger.js';

export const applyAndUploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Resume file (PDF or document) is required' });
    }

    const validatedData = applySchema.parse(req.body);
    const job = await Job.findById(validatedData.job_id);

    if (!job) {
      return res.status(404).json({ success: false, error: 'Target Job not found' });
    }

    const candidate = await Candidate.create({
      name: validatedData.name,
      email: validatedData.email,
      phone: validatedData.phone || '',
      job_id: job._id,
      resume_url: req.file.path,
      resume_filename: req.file.originalname,
      status: 'applied',
    });

    // Auto-create and trigger LangGraph recruitment workflow autonomously
    const workflow = await recruitmentWorkflowEngine.createWorkflow(
      candidate._id,
      job._id,
      job.workflow_spec_id || 'default-hiring-workflow'
    );

    // Asynchronously launch workflow
    recruitmentWorkflowEngine.startWorkflow(workflow._id).catch(err => {
      logger.error(`Background workflow execution failed: ${err.message}`);
    });

    res.status(201).json({
      success: true,
      message: 'Application submitted and AI evaluation workflow initiated successfully.',
      data: {
        candidate,
        workflow_id: workflow._id,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getCandidates = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.job_id) filter.job_id = req.query.job_id;
    if (req.query.status) filter.status = req.query.status;

    const candidates = await Candidate.find(filter)
      .populate('job_id', 'title department location')
      .sort({ created_at: -1 });

    res.status(200).json({ success: true, count: candidates.length, data: candidates });
  } catch (err) {
    next(err);
  }
};

export const getCandidateById = async (req, res, next) => {
  try {
    const candidate = await Candidate.findById(req.params.id).populate('job_id');
    if (!candidate) {
      return res.status(404).json({ success: false, error: 'Candidate not found' });
    }

    const workflow = await Workflow.findOne({ candidate_id: candidate._id });

    res.status(200).json({
      success: true,
      data: {
        ...candidate.toObject(),
        workflow,
      },
    });
  } catch (err) {
    next(err);
  }
};
