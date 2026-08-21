import express from 'express';
import { generateReport, getReport, exportReportPDF } from '../controllers/reportController.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(protect);

router.post('/:workspaceId/generate', generateReport);
router.get('/:workspaceId', getReport);
router.get('/:workspaceId/export/pdf', exportReportPDF);

export default router;
