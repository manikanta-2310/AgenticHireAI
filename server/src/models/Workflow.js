import mongoose from 'mongoose';

const workflowSchema = new mongoose.Schema({
  candidate_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Candidate',
    required: true,
  },
  job_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true,
  },
  workflow_spec_id: {
    type: String,
    default: 'default-hiring-workflow',
  },
  current_state: {
    type: String,
    enum: [
      'idle',
      'resume_parser',
      'embedding_agent',
      'matching_agent',
      'shortlisting_agent',
      'human_approval',
      'interview_agent',
      'email_agent',
      'completed',
      'failed'
    ],
    default: 'idle',
  },
  status: {
    type: String,
    enum: ['running', 'waiting_approval', 'completed', 'failed', 'paused'],
    default: 'running',
  },
  node_states: {
    resume_parser: { status: { type: String, default: 'pending' }, started_at: Date, finished_at: Date, retries: { type: Number, default: 0 }, error: String },
    embedding_agent: { status: { type: String, default: 'pending' }, started_at: Date, finished_at: Date, retries: { type: Number, default: 0 }, error: String },
    matching_agent: { status: { type: String, default: 'pending' }, started_at: Date, finished_at: Date, retries: { type: Number, default: 0 }, error: String },
    shortlisting_agent: { status: { type: String, default: 'pending' }, started_at: Date, finished_at: Date, retries: { type: Number, default: 0 }, error: String },
    human_approval: { status: { type: String, default: 'pending' }, action: String, recruiter_notes: String, approved_at: Date },
    interview_agent: { status: { type: String, default: 'pending' }, started_at: Date, finished_at: Date, retries: { type: Number, default: 0 }, error: String },
    email_agent: { status: { type: String, default: 'pending' }, started_at: Date, finished_at: Date, retries: { type: Number, default: 0 }, error: String },
  },
  execution_history: [{
    node: String,
    status: String,
    timestamp: { type: Date, default: Date.now },
    details: mongoose.Schema.Types.Mixed,
  }],
  error: {
    message: String,
    stack: String,
    node: String,
  },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
});

export const Workflow = mongoose.model('Workflow', workflowSchema);
export default Workflow;
