import express from 'express';
import {
  getWorkspaces,
  createWorkspace,
  getWorkspace,
  updateWorkspace,
  deleteWorkspace,
  getWorkspaceStats,
} from '../controllers/workspaceController.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/stats', getWorkspaceStats);
router.route('/').get(getWorkspaces).post(createWorkspace);
router.route('/:id').get(getWorkspace).put(updateWorkspace).delete(deleteWorkspace);

export default router;
