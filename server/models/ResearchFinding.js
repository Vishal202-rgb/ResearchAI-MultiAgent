import mongoose from 'mongoose';

const claimSchema = new mongoose.Schema({
  claim: { type: String, required: true },
  evidence: { type: String, default: '' },
  confidence: { type: Number, default: 0, min: 0, max: 1 },
  status: {
    type: String,
    enum: ['supported', 'partially_supported', 'contradicted', 'unverified'],
    default: 'unverified',
  },
  sources: [{ type: String }],
});

const researchFindingSchema = new mongoose.Schema(
  {
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
      index: true,
    },
    researchRunId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ResearchRun',
      required: true,
      index: true,
    },
    summary: { type: String, default: '' },
    keyFindings: [{ type: String }],
    insights: [{ type: String }],
    limitations: [{ type: String }],
    claims: [claimSchema],
    rawAnalysis: { type: String, default: '' },
  },
  { timestamps: true }
);

const ResearchFinding = mongoose.model('ResearchFinding', researchFindingSchema);

export default ResearchFinding;
