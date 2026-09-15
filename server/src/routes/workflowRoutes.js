import express from 'express';
import {
  startWorkflow,
  retryWorkflow,
  approveWorkflow,
  getWorkflowById,
  getAllWorkflows,
} from '../controllers/workflowController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Allow public status checking for candidates, protected management for recruiters
router.get('/:id', getWorkflowById);

router.get('/', authenticate, getAllWorkflows);
router.post('/start', authenticate, startWorkflow);
router.post('/retry', authenticate, retryWorkflow);
router.post('/approve', authenticate, approveWorkflow);

export default router;
