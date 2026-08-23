import express from 'express';
import { generatePlan, getPlan, startRun, getRun, getResults, deepDive, runDebateStage } from '../controllers/researchController.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

// Planner (Part 3)
router.post('/planner/:workspaceId', generatePlan);
router.get('/planner/:workspaceId', getPlan);

// Research Run (Part 4)
router.post('/run/:workspaceId', startRun);
router.post('/run/:workspaceId/deep-dive', deepDive);
router.post('/debate/:workspaceId', runDebateStage);
router.get('/run/:workspaceId', getRun);
router.get('/results/:workspaceId', getResults);

export default router;
