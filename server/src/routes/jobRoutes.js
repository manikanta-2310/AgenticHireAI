import express from 'express';
import { createJob, getJobs, getJobById, updateJob } from '../controllers/jobController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Public routes for job seekers
router.get('/', getJobs);
router.get('/:id', getJobById);

// Recruiter authenticated routes
router.post('/', authenticate, createJob);
router.put('/:id', authenticate, updateJob);

export default router;
