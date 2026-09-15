'use client';

import React, { useEffect, useState } from 'react';
import WorkflowGraph from '../../../components/WorkflowGraph';
import { useWorkflowStore } from '../../../store/useWorkflowStore';
import api from '../../../lib/api';
import Badge from '../../../components/Badge';
import {
  GitBranch,
  UserCheck,
  CheckCircle2,
  XCircle,
  RotateCw,
  Clock,
  Terminal,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

export default function WorkflowsMonitorPage() {
  const { workflows, fetchAllWorkflows, approveCandidate, retry } = useWorkflowStore();
  const [selectedWorkflowId, setSelectedWorkflowId] = useState(null);
  const [activeWorkflow, setActiveWorkflow] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [recruiterNotes, setRecruiterNotes] = useState('');

  // Initial load and polling
  useEffect(() => {
    fetchAllWorkflows();
    const interval = setInterval(() => {
      fetchAllWorkflows();
    }, 3000);
    return () => clearInterval(interval);
  }, [fetchAllWorkflows]);

  // Select first workflow if none selected
  useEffect(() => {
    if (workflows.length > 0 && !selectedWorkflowId) {
      setSelectedWorkflowId(workflows[0]._id);
    }
  }, [workflows, selectedWorkflowId]);

  // Load detailed active workflow
  useEffect(() => {
    if (!selectedWorkflowId) return;
    const loadDetails = async () => {
      try {
        const res = await api.getWorkflow(selectedWorkflowId);
        if (res.success) {
          setActiveWorkflow(res.data);
        }
      } catch (err) {
        console.error(err);
      }
    };
    loadDetails();
    const pollInterval = setInterval(loadDetails, 2500);
    return () => clearInterval(pollInterval);
  }, [selectedWorkflowId]);

  const handleApproval = async (action) => {
    if (!selectedWorkflowId) return;
    setActionLoading(true);
    try {
      await approveCandidate(selectedWorkflowId, action, recruiterNotes);
      setRecruiterNotes('');
    } catch (err) {
      alert(`Approval error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const isWaitingApproval = activeWorkflow?.status === 'waiting_approval';

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">AI Multi-Agent Workflow Visualizer</h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time React Flow state graph with checkpoints, retry monitoring, and recruiter approval controls.
          </p>
        </div>

        {/* Workflow Switcher Dropdown */}
        <div className="flex items-center space-x-3">
          <label className="text-xs text-slate-400 font-semibold uppercase">Candidate Run:</label>
          <select
            value={selectedWorkflowId || ''}
            onChange={(e) => setSelectedWorkflowId(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500 font-medium"
          >
            {workflows.map((wf) => (
              <option key={wf._id} value={wf._id}>
                {wf.candidate_id?.name || 'Applicant'} — {wf.job_id?.title || 'Job'} ({wf.status})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Human-in-the-loop Approval Banner */}
      {isWaitingApproval && (
        <div className="p-6 rounded-3xl bg-amber-950/40 border-2 border-amber-500/60 shadow-2xl space-y-4 animate-pulse-slow">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-400">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Human Approval Checkpoint Triggered</h3>
                <p className="text-xs text-amber-300/80 mt-0.5">
                  The Shortlisting Agent evaluated <strong>{activeWorkflow?.candidate_id?.name}</strong> with a match score of{' '}
                  <strong>{activeWorkflow?.candidate_id?.match_score}%</strong>. Your approval is needed to generate the interview pack.
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3 shrink-0">
              <button
                onClick={() => handleApproval('approve')}
                disabled={actionLoading}
                className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all disabled:opacity-60"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Approve & Schedule</span>
              </button>

              <button
                onClick={() => handleApproval('reject')}
                disabled={actionLoading}
                className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 text-xs font-bold transition-all disabled:opacity-60"
              >
                <XCircle className="w-4 h-4" />
                <span>Reject Candidate</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Visualizer & Audit Logs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* React Flow Interactive Graph */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <GitBranch className="w-4 h-4 text-blue-400" />
              <h2 className="text-base font-bold text-white">Execution Canvas</h2>
            </div>
            <div className="flex items-center space-x-3 text-xs">
              <span className="flex items-center space-x-1 text-blue-400">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                <span>Running</span>
              </span>
              <span className="flex items-center space-x-1 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Success</span>
              </span>
              <span className="flex items-center space-x-1 text-amber-400">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>Approval</span>
              </span>
              <span className="flex items-center space-x-1 text-rose-400">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span>Failed</span>
              </span>
            </div>
          </div>

          <WorkflowGraph workflow={activeWorkflow} />
        </div>

        {/* Live Execution Logs Drawer */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4 flex flex-col h-[850px]">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2 text-slate-300 font-bold text-xs uppercase tracking-wider">
              <Terminal className="w-4 h-4 text-blue-400" />
              <span>Workflow Audit Logs</span>
            </div>
            <Badge variant="blue" size="sm">
              {activeWorkflow?.logs?.length || 0} Events
            </Badge>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 font-mono text-[11px] pr-2">
            {(!activeWorkflow?.logs || activeWorkflow.logs.length === 0) ? (
              <div className="text-slate-500 text-center py-8">Waiting for agent execution events...</div>
            ) : (
              activeWorkflow.logs.map((log, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-blue-400 font-bold">{log.agent_name}</span>
                    <span className={`text-[10px] uppercase font-semibold ${log.status === 'success' ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {log.status} ({log.duration_ms}ms)
                    </span>
                  </div>
                  {log.error && (
                    <p className="text-rose-400 text-[10px] break-words">{log.error.message}</p>
                  )}
                  {log.output && (
                    <pre className="text-slate-400 text-[10px] overflow-x-auto p-1 bg-black/40 rounded">
                      {JSON.stringify(log.output, null, 2).substring(0, 150)}...
                    </pre>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
