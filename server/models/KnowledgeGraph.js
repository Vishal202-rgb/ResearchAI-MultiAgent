import mongoose from 'mongoose';

const knowledgeGraphSchema = new mongoose.Schema(
  {
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    nodes: [
      {
        id: { type: String, required: true },
        label: { type: String, default: 'Concept' },
        val: { type: Number, default: 1 },
      },
    ],
    links: [
      {
        source: { type: String, required: true },
        target: { type: String, required: true },
        label: { type: String, default: 'RELATED_TO' },
      },
    ],
  },
  { timestamps: true }
);

const KnowledgeGraph = mongoose.model('KnowledgeGraph', knowledgeGraphSchema);

export default KnowledgeGraph;
