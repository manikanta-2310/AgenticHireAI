import mongoose from 'mongoose';

const candidateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  phone: {
    type: String,
    default: '',
  },
  job_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true,
  },
  resume_url: {
    type: String,
    required: true,
  },
  resume_filename: {
    type: String,
  },
  parsed_resume_json: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  match_score: {
    type: Number,
    default: 0,
  },
  match_details: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  shortlist_decision: {
    type: String,
    enum: ['pending', 'shortlist', 'hold', 'reject', 'approved', 'rejected_by_recruiter'],
    default: 'pending',
  },
  interview_pack: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },
  email_sent: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    enum: ['applied', 'parsing', 'evaluated', 'waiting_approval', 'approved', 'interview_scheduled', 'rejected', 'hold'],
    default: 'applied',
  },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
});

export const Candidate = mongoose.model('Candidate', candidateSchema);
export default Candidate;
