import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  agentType: {
    type: String,
    enum: ['researcher', 'analyst', 'fact_checker', 'synthesizer'],
    required: true,
  },
  priority: {
    type: String,
    enum: ['high', 'medium', 'low'],
    default: 'medium',
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'failed'],
    default: 'pending',
  },
});

const researchPlanSchema = new mongoose.Schema(
  {
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: [true, 'Workspace ID is required'],
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    researchQuestion: {
      type: String,
      required: [true, 'Research question is required'],
    },
    objective: {
      type: String,
      default: '',
    },
    subQuestions: [
      {
        type: String,
      },
    ],
    tasks: [taskSchema],
    status: {
      type: String,
      enum: ['generating', 'completed', 'failed'],
      default: 'generating',
    },
  },
  {
    timestamps: true,
  }
);

const ResearchPlan = mongoose.model('ResearchPlan', researchPlanSchema);

export default ResearchPlan;
