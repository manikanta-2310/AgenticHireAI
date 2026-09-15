import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Job description is required'],
  },
  department: {
    type: String,
    default: 'Engineering',
  },
  location: {
    type: String,
    default: 'Remote',
  },
  required_skills: {
    type: [String],
    required: true,
    default: [],
  },
  preferred_skills: {
    type: [String],
    default: [],
  },
  min_experience: {
    type: Number,
    required: true,
    default: 1,
  },
  hiring_spec_id: {
    type: String,
    default: 'frontend-developer',
  },
  workflow_spec_id: {
    type: String,
    default: 'default-hiring-workflow',
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  status: {
    type: String,
    enum: ['active', 'closed', 'draft'],
    default: 'active',
  },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
});

export const Job = mongoose.model('Job', jobSchema);
export default Job;
