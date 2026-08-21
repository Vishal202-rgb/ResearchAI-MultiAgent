import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema(
  {
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    researchRunId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ResearchRun',
      required: true,
    },
    title: { type: String, required: true },
    executiveSummary: { type: String, default: '' },
    researchQuestion: { type: String, default: '' },
    methodology: { type: String, default: '' },
    keyFindings: [{ type: String }],
    detailedAnalysis: { type: String, default: '' },
    limitations: [{ type: String }],
    conclusion: { type: String, default: '' },
    references: [{
      title: String,
      url: String,
      publisher: String
    }],
    markdown: { type: String, required: true },
  },
  { timestamps: true }
);

const Report = mongoose.model('Report', reportSchema);

export default Report;
