import express from 'express';
import { generateReport, getReport, exportReportPDF, compareWorkspaces } from '../controllers/reportController.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(protect);

router.get('/compare', compareWorkspaces);
router.post('/:workspaceId/generate', generateReport);
router.get('/:workspaceId', getReport);
router.get('/:workspaceId/export/pdf', exportReportPDF);

export default router;
