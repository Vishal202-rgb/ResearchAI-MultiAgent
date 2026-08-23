import mongoose from 'mongoose';

const savedSourceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  workspaceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true },
  title: { type: String, required: true },
  url: { type: String, required: true },
  publisher: { type: String },
  date: { type: String },
  tags: [{ type: String }],
  personalNote: { type: String, default: '' }
}, { timestamps: true });

savedSourceSchema.index({ userId: 1, workspaceId: 1, url: 1 }, { unique: true });

export default mongoose.model('SavedSource', savedSourceSchema);
