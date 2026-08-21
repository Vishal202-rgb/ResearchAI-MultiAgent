import mongoose from 'mongoose';

const workspaceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: '',
    },
    researchQuestion: {
      type: String,
      trim: true,
      maxlength: [500, 'Research question cannot exceed 500 characters'],
      default: '',
    },
    researchObjective: {
      type: String,
      trim: true,
      maxlength: [500, 'Research objective cannot exceed 500 characters'],
      default: '',
    },
    researchDomain: {
      type: String,
      trim: true,
      maxlength: [100, 'Research domain cannot exceed 100 characters'],
      default: '',
    },
    status: {
      type: String,
      enum: ['draft', 'active', 'completed', 'archived'],
      default: 'draft',
    },
  },
  {
    timestamps: true,
  }
);

const Workspace = mongoose.model('Workspace', workspaceSchema);

export default Workspace;
