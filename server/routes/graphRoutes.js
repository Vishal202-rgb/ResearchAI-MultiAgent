import express from 'express';
import { getGraph, generateGraph } from '../controllers/graphController.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(protect);

router.get('/:workspaceId', getGraph);
router.post('/:workspaceId/generate', generateGraph);

export default router;
