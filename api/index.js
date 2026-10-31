import dotenv from 'dotenv';
dotenv.config();

import app from '../server/app.js';
import connectDB from '../server/config/db.js';

export default async (req, res) => {
  // Normalize req.url for Express router if Vercel strips /api prefix
  if (req.url && !req.url.startsWith('/api') && !req.url.startsWith('/index.html')) {
    req.url = '/api' + (req.url.startsWith('/') ? req.url : '/' + req.url);
  }

  // Ensure database is connected before handling any route in serverless
  try {
    await connectDB();
  } catch (dbErr) {
    console.error('Failed to connect to MongoDB in serverless handler:', dbErr.message);
    // Allow health check through even if DB is down, otherwise return 503
    if (!req.url.includes('/health')) {
      return res.status(503).json({
        success: false,
        message: 'Database connection failed. Please ensure MONGODB_URI is correctly configured.',
        error: dbErr.message,
      });
    }
  }

  // Pass the request to the Express app and keep function alive until response is finished
  return new Promise((resolve, reject) => {
    res.on('finish', resolve);
    res.on('close', resolve);
    res.on('error', reject);
    app(req, res);
  });
};

