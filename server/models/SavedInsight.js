import mongoose from 'mongoose';

const savedInsightSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  workspaceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true },
  findingText: { type: String, required: true },
  sourceReferences: [{ type: String }],
  tags: [{ type: String }],
  personalNote: { type: String, default: '' }
}, { timestamps: true });

savedInsightSchema.index({ userId: 1, workspaceId: 1, findingText: 1 }, { unique: true });

export default mongoose.model('SavedInsight', savedInsightSchema);
