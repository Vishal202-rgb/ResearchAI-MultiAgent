import mongoose from 'mongoose';

const sourceSchema = new mongoose.Schema(
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
    title: { type: String, default: '' },
    url: { type: String, default: '' },
    publisher: { type: String, default: '' },
    publishedDate: { type: String, default: '' },
    snippet: { type: String, default: '' },
    content: { type: String, default: '' },
    relevanceScore: { type: Number, default: 0, min: 0, max: 1 },
    taskTitle: { type: String, default: '' },
    isSimulated: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Source = mongoose.model('Source', sourceSchema);

export default Source;
