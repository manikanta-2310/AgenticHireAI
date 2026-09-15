'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '../../../lib/api';
import Badge from '../../../components/Badge';
import { Briefcase, Plus, ExternalLink, ShieldCheck, Copy, Check } from 'lucide-react';

export default function JobsManagementPage() {
  const [jobs, setJobs] = useState([]);
  const [hiringSpecs, setHiringSpecs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [jobsRes, specsRes] = await Promise.all([
          api.getJobs(),
          api.getHiringSpecs(),
        ]);
        if (jobsRes.success) setJobs(jobsRes.data);
        if (specsRes.success) setHiringSpecs(specsRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleCopy = (jobId) => {
    const applyUrl = `${window.location.origin}/jobs/${jobId}/apply`;
    navigator.clipboard.writeText(applyUrl);
    setCopiedId(jobId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Jobs & Hiring Specs</h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage job postings and their underlying dynamic JSON hiring specifications.
          </p>
        </div>
        <Link
          href="/dashboard/jobs/create"
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 transition-all self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Job</span>
        </Link>
      </div>

      {/* Available Dynamic Hiring Specifications from /specs/hiring */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex items-center space-x-2 text-emerald-400 font-bold text-sm">
          <ShieldCheck className="w-4 h-4" />
          <span>Active Dynamic Hiring Specs in /specs/hiring/</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {hiringSpecs.map((spec) => (
            <div key={spec.id} className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-sm">{spec.role}</span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-400">
                  {spec.filename}
                </span>
              </div>
              <div className="flex flex-wrap gap-1">
                {spec.required_skills?.map((s, idx) => (
                  <Badge key={idx} variant="blue" size="sm">
                    {s}
                  </Badge>
                ))}
              </div>
              <div className="text-[11px] text-slate-400 flex items-center justify-between pt-2 border-t border-slate-800/80">
                <span>Passing: {spec.minimum_score}% | Auto-Advance: {spec.auto_advance_score}%</span>
                <span>{spec.interview_rounds} Interview Rounds</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Posted Jobs */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
        <h2 className="text-lg font-bold text-white">Active Job Postings & Public Application Routes</h2>

        {loading ? (
          <div className="py-8 text-center text-xs text-slate-500">Loading jobs...</div>
        ) : jobs.length === 0 ? (
          <div className="py-8 text-center text-slate-500 text-sm">
            No jobs found. Click "Create New Job" to post your first position.
          </div>
        ) : (
          <div className="divide-y divide-slate-800/60">
            {jobs.map((job) => (
              <div key={job._id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center space-x-3 mb-1">
                    <h3 className="font-bold text-base text-white">{job.title}</h3>
                    <Badge variant={job.status === 'active' ? 'green' : 'yellow'} size="sm">
                      {job.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-400 max-w-xl line-clamp-1">{job.description}</p>
                  <div className="mt-2 flex items-center space-x-3 text-xs text-slate-500">
                    <span>{job.department} • {job.location}</span>
                    <span>Spec: <code className="text-slate-300">{job.hiring_spec_id}</code></span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    onClick={() => handleCopy(job._id)}
                    className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition-all"
                    title="Copy Candidate Apply URL"
                  >
                    {copiedId === job._id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Apply Link</span>
                      </>
                    )}
                  </button>

                  <Link
                    href={`/jobs/${job._id}/apply`}
                    target="_blank"
                    className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 hover:bg-blue-600/30 text-xs font-bold transition-all"
                  >
                    <span>Open Apply Page</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
