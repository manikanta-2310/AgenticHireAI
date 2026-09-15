'use client';

import React, { useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  Handle,
  Position,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  FileText,
  Database,
  GitCompare,
  Filter,
  UserCheck,
  Code2,
  Mail,
  CheckCircle2,
  AlertTriangle,
  Clock,
  RotateCw,
} from 'lucide-react';

const NODE_CONFIGS = [
  { id: 'resume_parser', title: 'Resume Parser Agent', desc: 'Extracts skills & experience', icon: FileText },
  { id: 'embedding_agent', title: 'Embedding Agent', desc: 'Vectors into Qdrant store', icon: Database },
  { id: 'matching_agent', title: 'Matching Agent', desc: 'RAG policy & spec comparison', icon: GitCompare },
  { id: 'shortlisting_agent', title: 'Shortlisting Agent', desc: 'Spec threshold evaluation', icon: Filter },
  { id: 'human_approval', title: 'Human Approval', desc: 'Recruiter review checkpoint', icon: UserCheck },
  { id: 'interview_agent', title: 'Interview Agent', desc: 'Generates questions & challenges', icon: Code2 },
  { id: 'email_agent', title: 'Email Agent', desc: 'Dispatches status notifications', icon: Mail },
];

// Custom Node Component
const AgentNode = ({ data }) => {
  const Icon = data.icon || FileText;
  const status = data.status || 'pending';
  const retries = data.retries || 0;

  let statusClass = 'border-slate-800 bg-slate-900/80 text-slate-400';
  let badgeColor = 'bg-slate-800 text-slate-400';
  let statusText = 'Pending';

  if (status === 'running') {
    statusClass = 'node-running bg-blue-950/60 text-blue-200 border-blue-500';
    badgeColor = 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
    statusText = 'Running';
  } else if (status === 'success' || status === 'approved') {
    statusClass = 'node-success bg-emerald-950/50 text-emerald-200 border-emerald-500';
    badgeColor = 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
    statusText = 'Success';
  } else if (status === 'waiting_approval') {
    statusClass = 'node-waiting bg-yellow-950/60 text-yellow-200 border-yellow-500';
    badgeColor = 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30';
    statusText = 'Waiting Approval';
  } else if (status === 'failed' || status === 'rejected') {
    statusClass = 'node-failed bg-red-950/60 text-red-200 border-red-500';
    badgeColor = 'bg-red-500/20 text-red-400 border border-red-500/30';
    statusText = status === 'rejected' ? 'Rejected' : 'Failed';
  } else if (status === 'skipped') {
    statusClass = 'border-slate-800/50 bg-slate-950/40 text-slate-600 opacity-60';
    badgeColor = 'bg-slate-800 text-slate-600';
    statusText = 'Skipped';
  }

  return (
    <div className={`px-4 py-3 rounded-xl border-2 min-w-[240px] shadow-2xl transition-all duration-300 ${statusClass}`}>
      <Handle type="target" position={Position.Top} className="!bg-blue-500 !border-slate-900" />
      
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-white/5">
            <Icon className="w-4 h-4" />
          </div>
          <span className="font-semibold text-sm tracking-tight text-white">{data.label}</span>
        </div>
        {retries > 0 && (
          <span className="flex items-center text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
            <RotateCw className="w-2.5 h-2.5 mr-1 animate-spin" /> {retries} retry
          </span>
        )}
      </div>

      <p className="text-xs text-slate-400 mb-2 leading-relaxed">{data.desc}</p>

      <div className="flex items-center justify-between pt-2 border-t border-white/5">
        <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${badgeColor}`}>
          {statusText}
        </span>
        {status === 'running' && (
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} className="!bg-blue-500 !border-slate-900" />
    </div>
  );
};

const nodeTypes = {
  agentNode: AgentNode,
};

export default function WorkflowGraph({ workflow }) {
  const nodeStates = workflow?.node_states || {};

  const nodes = useMemo(() => {
    return NODE_CONFIGS.map((cfg, index) => {
      const stateObj = nodeStates[cfg.id] || { status: 'pending', retries: 0 };
      
      // Calculate dynamic status
      let status = stateObj.status;
      if (workflow?.status === 'waiting_approval' && cfg.id === 'human_approval') {
        status = 'waiting_approval';
      }

      return {
        id: cfg.id,
        type: 'agentNode',
        position: { x: 250, y: index * 120 },
        data: {
          label: cfg.title,
          desc: cfg.desc,
          icon: cfg.icon,
          status,
          retries: stateObj.retries || 0,
        },
      };
    });
  }, [nodeStates, workflow?.status]);

  const edges = useMemo(() => {
    const list = [];
    for (let i = 0; i < NODE_CONFIGS.length - 1; i++) {
      const source = NODE_CONFIGS[i].id;
      const target = NODE_CONFIGS[i + 1].id;
      const sourceState = nodeStates[source]?.status;
      const isPassed = sourceState === 'success' || sourceState === 'approved';

      list.push({
        id: `e-${source}-${target}`,
        source,
        target,
        animated: sourceState === 'running' || (sourceState === 'success' && nodeStates[target]?.status === 'running'),
        style: {
          stroke: isPassed ? '#10b981' : sourceState === 'running' ? '#3b82f6' : '#334155',
          strokeWidth: 2,
        },
      });
    }
    return list;
  }, [nodeStates]);

  return (
    <div className="w-full h-[850px] rounded-2xl overflow-hidden glass-panel border border-slate-800/80 relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.5}
        maxZoom={1.5}
      >
        <Background color="#1e293b" gap={20} size={1} />
        <Controls className="!bg-slate-900 !border-slate-800 !text-white" />
      </ReactFlow>
    </div>
  );
}
