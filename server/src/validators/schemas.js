import { z } from 'zod';

export const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['recruiter', 'admin', 'reviewer']).optional().default('recruiter'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const createJobSchema = z.object({
  title: z.string().min(2, 'Title is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  department: z.string().optional().default('Engineering'),
  location: z.string().optional().default('Remote'),
  required_skills: z.array(z.string()).min(1, 'At least one required skill is needed'),
  preferred_skills: z.array(z.string()).optional().default([]),
  min_experience: z.number().min(0).default(1),
  hiring_spec_id: z.string().optional().default('frontend-developer'),
  workflow_spec_id: z.string().optional().default('default-hiring-workflow'),
});

export const applySchema = z.object({
  name: z.string().min(2, 'Candidate name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().optional().default(''),
  job_id: z.string().min(1, 'Job ID is required'),
});

export const approveWorkflowSchema = z.object({
  workflow_id: z.string().min(1, 'Workflow ID is required'),
  action: z.enum(['approve', 'reject']),
  recruiter_notes: z.string().optional().default(''),
});
