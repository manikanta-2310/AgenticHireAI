import express from 'express';
import { getRecruiterAnalytics } from '../controllers/analyticsController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, getRecruiterAnalytics);

export default router;
