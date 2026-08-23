import mongoose from 'mongoose';
import dotenv from 'dotenv';
import ResearchFinding from './server/models/ResearchFinding.js';
import Workspace from './server/models/Workspace.js';
import User from './server/models/User.js';

dotenv.config();

const test = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  const user = await User.findOne();
  const workspace = await Workspace.findOne({ userId: user._id });
  const finding = await ResearchFinding.findOne({ workspaceId: workspace._id });
  
  if (!finding) {
    console.log("No finding found");
    process.exit(0);
  }
  
  const claim = finding.keyFindings && finding.keyFindings.length > 0 ? finding.keyFindings[0] : finding.claims[0].claim;
  
  console.log('Claim to test:', claim);
  
  // mock req, res
  const req = {
    params: { workspaceId: workspace._id },
    body: { claim },
    user: { _id: user._id }
  };
  
  const res = {
    status: (code) => ({
      json: (data) => console.log('Response:', JSON.stringify(data, null, 2))
    })
  };
  
  const next = (err) => console.error('Error:', err);
  
  const { traceEvidence } = await import('./server/controllers/researchController.js');
  await traceEvidence(req, res, next);
  
  process.exit(0);
};

test();
