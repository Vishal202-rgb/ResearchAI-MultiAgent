import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: './server/.env' });

import SavedInsight from './server/models/SavedInsight.js';
import SavedSource from './server/models/SavedSource.js';

async function test() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const insights = await SavedInsight.find();
    console.log('Insights:', insights.length);
    
    const sources = await SavedSource.find();
    console.log('Sources:', sources.length);
    
    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}
test();
