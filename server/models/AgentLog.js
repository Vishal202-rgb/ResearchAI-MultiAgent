import mongoose from 'mongoose';

const agentLogSchema = new mongoose.Schema(
  {
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: [true, 'Workspace ID is required'],
      index: true,
    },
    researchPlanId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ResearchPlan',
      required: [true, 'Research Plan ID is required'],
      index: true,
    },
    agentType: {
      type: String,
      enum: ['planner', 'researcher', 'analyst', 'fact_checker', 'synthesizer'],
      required: true,
    },
    status: {
      type: String,
      enum: ['started', 'completed', 'failed'],
      required: true,
    },
    message: {
      type: String,
      default: '',
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
    },
    error: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const AgentLog = mongoose.model('AgentLog', agentLogSchema);

export default AgentLog;
