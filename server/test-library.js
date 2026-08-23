import dotenv from 'dotenv';
dotenv.config();

import connectDB from './config/db.js';
import SavedInsight from './models/SavedInsight.js';
import SavedSource from './models/SavedSource.js';
import User from './models/User.js';
import Workspace from './models/Workspace.js';
import mongoose from 'mongoose';

async function test() {
  try {
    console.log('Connecting to database...');
    await connectDB();
    console.log('Connected.');
    
    // Test logic here
    const insightsCount = await SavedInsight.countDocuments();
    console.log('Total insights:', insightsCount);
    
    const sourcesCount = await SavedSource.countDocuments();
    console.log('Total sources:', sourcesCount);

    console.log('Testing Save, Find, Update, Delete...');

    // 1. Find a user and workspace (if any exist) or use a dummy ObjectId
    const user = await User.findOne() || { _id: new mongoose.Types.ObjectId() };
    const workspace = await Workspace.findOne() || { _id: new mongoose.Types.ObjectId() };
    
    // 2. Save Insight
    const newInsight = new SavedInsight({
      userId: user._id,
      workspaceId: workspace._id,
      findingText: `Test finding ${Date.now()}`,
      tags: ['test']
    });
    await newInsight.save();
    console.log('Saved insight successfully:', newInsight._id);

    // 3. Find Insight
    const foundInsight = await SavedInsight.findById(newInsight._id);
    console.log('Found insight successfully:', foundInsight._id);

    // 4. Update Insight
    foundInsight.personalNote = 'Updated test note';
    await foundInsight.save();
    console.log('Updated insight successfully');

    // 5. Delete Insight
    await SavedInsight.findByIdAndDelete(newInsight._id);
    console.log('Deleted insight successfully');

    // 6. Save Source
    const newSource = new SavedSource({
      userId: user._id,
      workspaceId: workspace._id,
      title: 'Test Title',
      url: `https://example.com/test/${Date.now()}`,
      publisher: 'Test Publisher'
    });
    await newSource.save();
    console.log('Saved source successfully:', newSource._id);

    // 7. Update Source
    newSource.personalNote = 'Updated source note';
    await newSource.save();
    console.log('Updated source successfully');

    // 8. Delete Source
    await SavedSource.findByIdAndDelete(newSource._id);
    console.log('Deleted source successfully');
    
    console.log('All tests passed.');

  } catch (err) {
    console.error('Test failed:', err);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

test();
