import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import connectDB from '../config/db.js';
import User from '../models/User.js';
import Job from '../models/Job.js';
import Candidate from '../models/Candidate.js';
import Workflow from '../models/Workflow.js';
import WorkflowLog from '../models/WorkflowLog.js';
import specLoader from '../config/specLoader.js';
import recruitmentWorkflowEngine from '../workflows/recruitmentWorkflow.js';
import logger from '../utils/logger.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const seedDatabase = async () => {
  try {
    await connectDB();

    logger.info('Clearing existing records for fresh seed...');
    await User.deleteMany({});
    await Job.deleteMany({});
    await Candidate.deleteMany({});
    await Workflow.deleteMany({});
    await WorkflowLog.deleteMany({});

    // 1. Create Default Recruiter User
    const recruiter = await User.create({
      name: 'Alex Recruiter',
      email: 'recruiter@agentic.ai',
      password: 'password123',
      role: 'recruiter',
    });
    logger.info(`Recruiter created: ${recruiter.email}`);

    // 2. Create Default Jobs from specs
    const frontendSpec = specLoader.getHiringSpec('frontend-developer');
    const backendSpec = specLoader.getHiringSpec('backend-developer');

    const jobFrontend = await Job.create({
      title: 'Senior Frontend Developer',
      description: 'Lead engineering for responsive modern web applications with React, Next.js, and interactive canvases.',
      department: 'Engineering',
      location: 'Remote',
      required_skills: frontendSpec.required_skills,
      preferred_skills: frontendSpec.preferred_skills,
      min_experience: frontendSpec.min_experience_years || 3,
      hiring_spec_id: 'frontend-developer',
      workflow_spec_id: 'default-hiring-workflow',
      created_by: recruiter._id,
      status: 'active',
    });

    const jobBackend = await Job.create({
      title: 'Backend Engineer (AI & RAG)',
      description: 'Build resilient Node.js Express microservices, vector search pipelines with Qdrant, and multi-agent workflows.',
      department: 'Engineering',
      location: 'Remote / NYC',
      required_skills: backendSpec.required_skills,
      preferred_skills: backendSpec.preferred_skills,
      min_experience: backendSpec.min_experience_years || 3,
      hiring_spec_id: 'backend-developer',
      workflow_spec_id: 'default-hiring-workflow',
      created_by: recruiter._id,
      status: 'active',
    });

    logger.info(`Jobs created: ${jobFrontend.title}, ${jobBackend.title}`);

    // 3. Create Sample Applicant & Trigger autonomous workflow
    const sampleResumePath = path.resolve(__dirname, '../../uploads/samples/john-react-resume.txt');
    const candidate = await Candidate.create({
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '(555) 234-5678',
      job_id: jobFrontend._id,
      resume_url: sampleResumePath,
      resume_filename: 'john-react-resume.txt',
      status: 'applied',
    });

    const workflow = await recruitmentWorkflowEngine.createWorkflow(
      candidate._id,
      jobFrontend._id,
      'default-hiring-workflow'
    );

    logger.info(`Triggering AI autonomous workflow for candidate: ${candidate.name}`);
    await recruitmentWorkflowEngine.startWorkflow(workflow._id);

    logger.info('Database seeded successfully and initial AI workflow executed!');
    return { recruiter, jobFrontend, jobBackend, candidate, workflow };
  } catch (err) {
    logger.error(`Seed error: ${err.message}`);
  }
};

if (process.argv[2] === '--run') {
  seedDatabase().then(() => process.exit(0));
}

export default seedDatabase;
