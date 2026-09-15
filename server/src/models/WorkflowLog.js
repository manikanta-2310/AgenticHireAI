import mongoose from 'mongoose';

const workflowLogSchema = new mongoose.Schema({
  workflow_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workflow',
    required: true,
  },
  agent_name: {
    type: String,
    required: true,
  },
  input: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  output: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  status: {
    type: String,
    enum: ['success', 'failure', 'retrying', 'skipped'],
    required: true,
  },
  error: {
    message: String,
    stack: String,
  },
  duration_ms: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
});

export const WorkflowLog = mongoose.model('WorkflowLog', workflowLogSchema);
export default WorkflowLog;
