'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '../../lib/api';
import StatCard from '../../components/StatCard';
import Badge from '../../components/Badge';
import {
  Briefcase,
  Users,
  GitBranch,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Bot,
  PlusCircle,
} from 'lucide-react';

export default function DashboardOverviewPage() {
  const [analytics, setAnalytics] = useState(null);
  const [recentCandidates, setRecentCandidates] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [analyticsRes, candidatesRes, jobsRes] = await Promise.all([
          api.getAnalytics().catch(() => ({ success: false })),
          api.getCandidates().catch(() => ({ success: false })),
          api.getJobs().catch(() => ({ success: false })),
        ]);

        if (analyticsRes.success) setAnalytics(analyticsRes.data);
        if (candidatesRes.success) setRecentCandidates(candidatesRes.data.slice(0, 5));
        if (jobsRes.success) setJobs(jobsRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const summary = analytics?.summary || {
    totalJobs: jobs.length || 2,
    totalCandidates: recentCandidates.length || 0,
    totalWorkflows: 0,
    shortlistedCount: 0,
    shortlistRate: 75,
    pendingApprovalCount: 0,
    averageMatchScore: 84,
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Recruiter Command Center</h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time multi-agent recruitment orchestration & approval status
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            href="/dashboard/jobs/create"
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Hiring Job</span>
          </Link>
          <Link
            href="/dashboard/workflows"
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs font-semibold hover:bg-slate-800 transition-all"
          >
            <GitBranch className="w-4 h-4 text-blue-400" />
            <span>Workflow Visualizer</span>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Active Jobs"
          value={summary.totalJobs}
          icon={Briefcase}
          change="+1 this week"
          glowColor="blue"
          description="Hiring specifications active"
        />
        <StatCard
          title="Candidate Applications"
          value={summary.totalCandidates}
          icon={Users}
          change="+3 automated"
          glowColor="purple"
          description="Processed by Resume Parser"
        />
        <StatCard
          title="Avg Match Score"
          value={`${summary.averageMatchScore}%`}
          icon={TrendingUp}
          change="Target > 75%"
          glowColor="emerald"
          description="RAG & rubric grounded"
        />
        <StatCard
          title="Pending Approvals"
          value={summary.pendingApprovalCount}
          icon={Clock}
          change="Human Checkpoint"
          glowColor="amber"
          description="Recruiter review required"
        />
      </div>

      {/* Active Jobs & Recent Candidate Submissions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Applicants */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">Recent Candidates & AI Match Scores</h2>
            <Link href="/dashboard/candidates" className="text-xs font-semibold text-blue-400 hover:text-blue-300">
              View all candidates →
            </Link>
          </div>

          {loading ? (
            <div className="py-8 text-center text-xs text-slate-500">Loading applicants...</div>
          ) : recentCandidates.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-sm">
              No candidates applied yet. Open a job apply page to test autonomous flow!
            </div>
          ) : (
            <div className="divide-y divide-slate-800/60">
              {recentCandidates.map((cand) => (
                <div key={cand._id} className="py-3.5 flex items-center justify-between group">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center font-bold text-blue-400 text-sm">
                      {cand.name ? cand.name.substring(0, 2).toUpperCase() : 'CA'}
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-white group-hover:text-blue-400 transition-colors">
                        {cand.name}
                      </h4>
                      <p className="text-xs text-slate-400">{cand.job_id?.title || 'Open Position'} • {cand.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <span className="text-xs font-bold text-white block">
                        {cand.match_score > 0 ? `${cand.match_score}% Match` : 'Processing'}
                      </span>
                      <span className="text-[11px] text-slate-500 uppercase">{cand.status}</span>
                    </div>

                    <Badge
                      variant={
                        cand.status === 'approved' || cand.status === 'interview_scheduled'
                          ? 'green'
                          : cand.status === 'waiting_approval'
                          ? 'yellow'
                          : cand.status === 'rejected'
                          ? 'red'
                          : 'blue'
                      }
                      size="sm"
                    >
                      {cand.shortlist_decision || cand.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Testing Actions / Spec Status */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-6">
          <div>
            <h2 className="text-lg font-bold text-white">Spec-Driven Workflow</h2>
            <p className="text-xs text-slate-400 mt-1">
              All 6 AI agents execute sequentially with dynamic retry policies and recruiter approval gates.
            </p>
          </div>

          <div className="space-y-3">
            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Bot className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-medium text-slate-300">Resume Parser</span>
              </div>
              <span className="text-[11px] text-emerald-400 font-semibold">Active (JSON)</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Bot className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-medium text-slate-300">Qdrant RAG Embedding</span>
              </div>
              <span className="text-[11px] text-emerald-400 font-semibold">384-dim Dense</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Bot className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-medium text-slate-300">Matching Agent</span>
              </div>
              <span className="text-[11px] text-emerald-400 font-semibold">Rubric Scaled</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Bot className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-medium text-slate-300">Human Approval Gate</span>
              </div>
              <span className="text-[11px] text-amber-400 font-semibold">Checkpoint</span>
            </div>
          </div>

          <Link
            href="/dashboard/workflows"
            className="w-full block text-center py-2.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 text-xs font-bold transition-all"
          >
            Launch Interactive Workflow Graph
          </Link>
        </div>
      </div>
    </div>
  );
}
