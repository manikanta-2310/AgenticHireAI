import Job from '../models/Job.js';
import { createJobSchema } from '../validators/schemas.js';
import specLoader from '../config/specLoader.js';

export const createJob = async (req, res, next) => {
  try {
    const validatedData = createJobSchema.parse(req.body);
    
    // Enrich with spec defaults if needed
    try {
      const hiringSpec = specLoader.getHiringSpec(validatedData.hiring_spec_id);
      if (!validatedData.required_skills || validatedData.required_skills.length === 0) {
        validatedData.required_skills = hiringSpec.required_skills;
      }
      if (!validatedData.preferred_skills || validatedData.preferred_skills.length === 0) {
        validatedData.preferred_skills = hiringSpec.preferred_skills;
      }
    } catch (e) {
      // Custom job
    }

    const job = await Job.create({
      ...validatedData,
      created_by: req.user?._id,
    });

    res.status(201).json({ success: true, data: job });
  } catch (err) {
    next(err);
  }
};

export const getJobs = async (req, res, next) => {
  try {
    const filter = req.query.status ? { status: req.query.status } : {};
    const jobs = await Job.find(filter).sort({ created_at: -1 });
    res.status(200).json({ success: true, count: jobs.length, data: jobs });
  } catch (err) {
    next(err);
  }
};

export const getJobById = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, error: 'Job not found' });
    }
    res.status(200).json({ success: true, data: job });
  } catch (err) {
    next(err);
  }
};

export const updateJob = async (req, res, next) => {
  try {
    const job = await Job.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!job) {
      return res.status(404).json({ success: false, error: 'Job not found' });
    }
    res.status(200).json({ success: true, data: job });
  } catch (err) {
    next(err);
  }
};
