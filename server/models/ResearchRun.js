import mongoose from 'mongoose';

const agentStatusSchema = new mongoose.Schema({
  agent: {
    type: String,
    enum: ['planner', 'researcher', 'analyst', 'fact_checker', 'synthesizer'],
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'running', 'completed', 'failed'],
    default: 'pending',
  },
  startedAt: { type: Date },
  completedAt: { type: Date },
  error: { type: String, default: '' },
});

const researchRunSchema = new mongoose.Schema(
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
    researchPlanId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ResearchPlan',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'running', 'completed', 'failed'],
      default: 'pending',
    },
    agentStatuses: [agentStatusSchema],
    startedAt: { type: Date },
    completedAt: { type: Date },
    error: { type: String, default: '' },
  },
  { timestamps: true }
);

const ResearchRun = mongoose.model('ResearchRun', researchRunSchema);

export default ResearchRun;
