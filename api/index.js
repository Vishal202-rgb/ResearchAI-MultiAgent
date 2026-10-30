import dotenv from 'dotenv';
dotenv.config();

import app from '../server/app.js';
import connectDB from '../server/config/db.js';

export default async (req, res) => {
  // Ensure database is connected before handling any route in serverless
  try {
    await connectDB();
  } catch (dbErr) {
    console.error('Failed to connect to MongoDB in serverless handler:', dbErr.message);
  }

  // Pass the request to the Express app and keep function alive until response is finished
  return new Promise((resolve, reject) => {
    res.on('finish', resolve);
    res.on('close', resolve);
    res.on('error', reject);
    app(req, res);
  });
};

