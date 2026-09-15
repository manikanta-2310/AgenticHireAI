'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import api from '../../../../lib/api';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Bot,
  Sparkles,
  RotateCw,
  Clock,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import Badge from '../../../../components/Badge';

export default function CandidateApplyPage({ params }) {
  const unwrappedParams = use(params);
  const jobId = unwrappedParams.jobId;

  const [job, setJob] = useState(null);
  const [name, setName] = useState('John Doe');
  const [email, setEmail] = useState('john.doe@example.com');
  const [phone, setPhone] = useState('(555) 234-5678');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submittedWorkflowId, setSubmittedWorkflowId] = useState(null);
  const [workflowStatus, setWorkflowStatus] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadJob = async () => {
      try {
        const res = await api.getJob(jobId);
        if (res.success) setJob(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    loadJob();
  }, [jobId]);

  // Poll workflow progress after submission
  useEffect(() => {
    if (!submittedWorkflowId) return;
    const checkStatus = async () => {
      try {
        const res = await api.getWorkflow(submittedWorkflowId);
        if (res.success) {
          setWorkflowStatus(res.data);
        }
      } catch (e) {
        console.error(e);
      }
    };
    checkStatus();
    const interval = setInterval(checkStatus, 2000);
    return () => clearInterval(interval);
  }, [submittedWorkflowId]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  // Quick helper to load pre-made sample resume for rapid testing
  const handleLoadSampleResume = () => {
    const sampleText = `John Doe\njohn.doe@example.com | (555) 234-5678\nSenior Frontend Developer with 4 years experience in React, JavaScript, CSS, HTML, Next.js, Tailwind CSS, and Zustand. Built high performance micro-frontends and real-time dashboards.`;
    const blob = new Blob([sampleText], { type: 'text/plain' });
    const sampleFile = new File([blob], 'john-react-resume.txt', { type: 'text/plain' });
    setFile(sampleFile);
    setName('John Doe');
    setEmail('john.doe@example.com');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please upload your resume file (PDF or text).');
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    formData.append('phone', phone);
    formData.append('job_id', jobId);
    formData.append('resume', file);

    try {
      const res = await api.uploadApplication(formData);
      if (res.success && res.data) {
        setSubmittedWorkflowId(res.data.workflow_id);
      }
    } catch (err) {
      setError(err.message || 'Failed to submit application');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-12 space-y-8">
      <Link href={`/jobs/${jobId}`} className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-white">
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to job description</span>
      </Link>

      {!submittedWorkflowId ? (
        <div className="glass-panel p-8 rounded-3xl border border-slate-800 space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-400 block mb-1">
              Public Application Portal
            </span>
            <h1 className="text-2xl font-extrabold text-white">Apply for {job?.title || 'Open Role'}</h1>
            <p className="text-xs text-slate-400 mt-1">
              Fill in your details and attach your resume. Our autonomous AI multi-agent workflow will evaluate your profile immediately.
            </p>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center space-x-2 text-rose-400 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-white text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-white text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Resume Upload Drag & Drop Box */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Resume Document (PDF or TXT)
                </label>
                <button
                  type="button"
                  onClick={handleLoadSampleResume}
                  className="text-[11px] font-bold text-blue-400 hover:text-blue-300 flex items-center space-x-1"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Use Sample Resume (1-Click Test)</span>
                </button>
              </div>

              <div className="border-2 border-dashed border-slate-700 hover:border-blue-500 rounded-2xl p-8 text-center transition-all bg-slate-900/40 relative">
                <input
                  type="file"
                  accept=".pdf,.txt,.doc,.docx"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-blue-600/10 flex items-center justify-center text-blue-400">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  {file ? (
                    <div>
                      <span className="font-bold text-sm text-emerald-400 block">{file.name}</span>
                      <span className="text-[11px] text-slate-400">{(file.size / 1024).toFixed(1)} KB — Ready to evaluate</span>
                    </div>
                  ) : (
                    <div>
                      <span className="font-semibold text-sm text-white block">
                        Drop resume file here or click to browse
                      </span>
                      <span className="text-xs text-slate-500 mt-0.5 block">
                        Supports PDF and plain text formats up to 10MB
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-sm shadow-xl shadow-blue-600/30 flex items-center justify-center space-x-2 disabled:opacity-60 transition-all"
            >
              <span>{loading ? 'Submitting Application...' : 'Submit Application & Trigger AI Evaluation'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      ) : (
        /* Real-time Workflow Execution Progress */
        <div className="glass-panel p-8 rounded-3xl border border-slate-800 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-extrabold text-white">Application Received!</h2>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Autonomous LangGraph AI workflow has been triggered. Below is the live execution state across all agents.
            </p>
          </div>

          {/* Dynamic Step Progression Card */}
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-300">
                <Bot className="w-4 h-4 text-blue-400" />
                <span>LangGraph Multi-Agent Pipeline State</span>
              </div>
              <Badge
                variant={
                  workflowStatus?.status === 'completed'
                    ? 'green'
                    : workflowStatus?.status === 'waiting_approval'
                    ? 'yellow'
                    : 'blue'
                }
                size="sm"
              >
                {workflowStatus?.status || 'processing'}
              </Badge>
            </div>

            <div className="space-y-3">
              {[
                { id: 'resume_parser', title: '1. Resume Parser Agent' },
                { id: 'embedding_agent', title: '2. Embedding Agent (Qdrant RAG)' },
                { id: 'matching_agent', title: '3. Matching Agent (Spec Rubric)' },
                { id: 'shortlisting_agent', title: '4. Shortlisting Agent (Dynamic Thresholds)' },
                { id: 'human_approval', title: '5. Human Recruiter Approval Checkpoint' },
                { id: 'interview_agent', title: '6. Interview Agent (Questions & Coding Task)' },
                { id: 'email_agent', title: '7. Email Agent (Status Notification)' },
              ].map((step) => {
                const nodeState = workflowStatus?.node_states?.[step.id]?.status || 'pending';
                return (
                  <div key={step.id} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs">
                    <span className="font-medium text-slate-300">{step.title}</span>
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        nodeState === 'success' || nodeState === 'approved'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : nodeState === 'running'
                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30 animate-pulse'
                          : nodeState === 'waiting_approval'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : nodeState === 'skipped'
                          ? 'bg-slate-800 text-slate-500'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {nodeState}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-center space-x-4 pt-4">
            <Link
              href="/dashboard/workflows"
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all"
            >
              Inspect Workflow on Recruiter Canvas →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
