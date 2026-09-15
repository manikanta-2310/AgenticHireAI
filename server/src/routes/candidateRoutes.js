import express from 'express';
import { applyAndUploadResume, getCandidates, getCandidateById } from '../controllers/candidateController.js';
import { authenticate } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// Public candidate application upload route
router.post('/upload', upload.single('resume'), applyAndUploadResume);

// Recruiter authenticated candidate management routes
router.get('/', authenticate, getCandidates);
router.get('/:id', authenticate, getCandidateById);

export default router;
