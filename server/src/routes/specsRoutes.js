import express from 'express';
import {
  getHiringSpecs,
  getHiringSpecById,
  getWorkflowSpec,
  getScoringRubric,
} from '../controllers/specsController.js';

const router = express.Router();

router.get('/hiring', getHiringSpecs);
router.get('/hiring/:id', getHiringSpecById);
router.get('/workflow/:name?', getWorkflowSpec);
router.get('/rubric', getScoringRubric);

export default router;
