import express from 'express';
import { upload, uploadDocument, getDocuments, deleteDocument } from '../controllers/documentController.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/:workspaceId', upload.single('file'), uploadDocument);
router.get('/:workspaceId', getDocuments);
router.delete('/:workspaceId/:documentId', deleteDocument);

export default router;
