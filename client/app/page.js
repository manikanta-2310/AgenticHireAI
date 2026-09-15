'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '../lib/api';
import { useAuthStore } from '../store/useAuthStore';
import {
  Sparkles,
  Bot,
  Briefcase,
  GitBranch,
  ShieldCheck,
  Zap,
  ArrowRight,
  CheckCircle,
  Clock,
  Layers,
  Search,
} from 'lucide-react';
import Badge from '../components/Badge';

export default function HomePage() {
  const { isAuthenticated, initialize } = useAuthStore();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initialize();
    const loadJobs = async () => {
      try {
        const res = await api.getJobs('active');
        if (res.success) {
          setJobs(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadJobs();
  }, []);

  return (
    <div className="relative overflow-hidden pb-20">
      {/* Background glow effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-blue-600/20 via-indigo-600/10 to-transparent blur-[120px] pointer-events-none" />

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 pt-16 pb-12 text-center relative z-10">
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold mb-6 animate-pulse-slow">
          <Sparkles className="w-4 h-4" />
          <span>Spec-Driven Multi-Agent ATS Platform</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight md:leading-none">
          Autonomous Hiring Powered by <br className="hidden md:block" />
          <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-300 bg-clip-text text-transparent">
            AI Multi-Agent Workflows
          </span>
        </h1>

        <p className="mt-6 text-base md:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Experience enterprise recruitment orchestration: candidates apply publicly, autonomous AI agents parse & match profiles with RAG intelligence, and recruiters approve decisions with visual workflow monitoring.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/dashboard"
            className="flex items-center space-x-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-xl shadow-blue-600/30 transition-all hover:scale-105"
          >
            <Briefcase className="w-4 h-4" />
            <span>Open Recruiter Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/dashboard/workflows"
            className="flex items-center space-x-2 px-6 py-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-sm transition-all"
          >
            <GitBranch className="w-4 h-4 text-blue-400" />
            <span>View Workflow Graph</span>
          </Link>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
              <Bot className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">6 Autonomous AI Agents</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Resume Parser, Embedding, Matching, Shortlisting, Interview, and Email agents orchestrated with LangGraph.
            </p>
          </div>

          <div className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">100% Spec-Driven</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Zero hardcoded rules. Scoring weights, retry policies, and prompts are loaded dynamically from JSON specs.
            </p>
          </div>

          <div className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">RAG Organizational Context</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Qdrant vector similarity search grounds AI evaluations in company policies and rubrics.
            </p>
          </div>
        </div>
      </section>

      {/* Public Job Openings Section */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">Active Public Opportunities</h2>
            <p className="text-sm text-slate-400 mt-1">
              Apply directly below. Submitting your resume automatically triggers the LangGraph AI workflow.
            </p>
          </div>
          <Link
            href="/dashboard/jobs/create"
            className="inline-flex items-center space-x-2 text-xs font-semibold text-blue-400 hover:text-blue-300"
          >
            <span>Post a new job (Recruiter)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-500 text-sm">Loading job opportunities...</div>
        ) : jobs.length === 0 ? (
          <div className="p-8 rounded-2xl glass-panel border border-dashed border-slate-800 text-center space-y-4">
            <Briefcase className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="text-slate-400 text-sm">No active jobs found. Create one from the recruiter dashboard!</p>
            <Link
              href="/dashboard/jobs/create"
              className="inline-block px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold"
            >
              Create First Job
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {jobs.map((job) => (
              <div
                key={job._id}
                className="p-6 rounded-2xl glass-card border border-slate-800/80 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">
                      {job.department || 'Engineering'}
                    </span>
                    <Badge variant="blue" size="sm">
                      {job.location || 'Remote'}
                    </Badge>
                  </div>
                  <h3 className="text-xl font-bold text-white">{job.title}</h3>
                  <p className="text-sm text-slate-400 mt-2 line-clamp-2">{job.description}</p>

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {job.required_skills?.slice(0, 4).map((skill, idx) => (
                      <Badge key={idx} variant="default" size="sm">
                        {skill}
                      </Badge>
                    ))}
                    {job.required_skills?.length > 4 && (
                      <span className="text-[11px] text-slate-500 self-center">
                        +{job.required_skills.length - 4} more
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center justify-between">
                  <span className="text-xs text-slate-500">
                    Min {job.min_experience || 2}+ years exp
                  </span>
                  <Link
                    href={`/jobs/${job._id}/apply`}
                    className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/20 transition-all"
                  >
                    <span>Apply Now</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
