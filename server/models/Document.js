import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema(
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
    name: { type: String, required: true },
    originalName: { type: String, required: true },
    type: { type: String, required: true },
    size: { type: Number, required: true },
    path: { type: String, required: true }, // Local path where it was uploaded temporarily
    status: {
      type: String,
      enum: ['pending', 'processing', 'indexed', 'failed'],
      default: 'pending',
    },
    error: { type: String, default: '' },
    pageCount: { type: Number, default: 0 },
    chunkCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Document = mongoose.model('Document', documentSchema);

export default Document;
