import multer from 'multer';
import fs from 'fs';
import path from 'path';
import Document from '../models/Document.js';
import Workspace from '../models/Workspace.js';
import AppError from '../utils/AppError.js';
import { processDocument } from '../services/rag/documentProcessor.js';

// Setup Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`);
  },
});

export const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf' || file.mimetype === 'text/plain') {
      cb(null, true);
    } else {
      cb(new AppError('Only PDF and TXT files are allowed', 400), false);
    }
  }
});

export const uploadDocument = async (req, res, next) => {
  try {
    const { workspaceId } = req.params;
    
    if (!req.file) {
      return next(new AppError('No file uploaded', 400));
    }

    const workspace = await Workspace.findOne({ _id: workspaceId, userId: req.user._id });
    if (!workspace) {
      return next(new AppError('Workspace not found', 404));
    }

    const doc = await Document.create({
      workspaceId,
      userId: req.user._id,
      name: req.file.originalname,
      originalName: req.file.originalname,
      type: req.file.mimetype,
      size: req.file.size,
      path: req.file.path,
      status: 'pending'
    });

    // Start background processing
    processDocument(doc._id).catch(err => console.error('Doc process error:', err));

    res.status(201).json({
      success: true,
      data: { document: doc }
    });
  } catch (error) {
    next(error);
  }
};

export const getDocuments = async (req, res, next) => {
  try {
    const { workspaceId } = req.params;
    const documents = await Document.find({ workspaceId, userId: req.user._id }).sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      data: { documents }
    });
  } catch (error) {
    next(error);
  }
};
