import express from 'express';
import protect from '../middleware/authMiddleware.js';
import {
  getInsights,
  getSources,
  saveInsight,
  saveSource,
  updateInsight,
  updateSource,
  deleteInsight,
  deleteSource
} from '../controllers/libraryController.js';

const router = express.Router();

router.use(protect);

router.get('/insights', getInsights);
router.post('/insights', saveInsight);
router.put('/insights/:id', updateInsight);
router.delete('/insights/:id', deleteInsight);

router.get('/sources', getSources);
router.post('/sources', saveSource);
router.put('/sources/:id', updateSource);
router.delete('/sources/:id', deleteSource);

export default router;
