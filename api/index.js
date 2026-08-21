import app from '../server/app.js';
import connectDB from '../server/config/db.js';

export default async (req, res) => {
  // Ensure database is connected before handling any route in serverless
  await connectDB();
  
  // Pass the request to the Express app
  return app(req, res);
};
