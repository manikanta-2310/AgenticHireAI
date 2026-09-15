'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '../../../lib/api';
import Badge from '../../../components/Badge';
import { Briefcase, MapPin, Clock, ArrowRight, ArrowLeft, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function JobDetailPage({ params }) {
  const unwrappedParams = use(params);
  const jobId = unwrappedParams.jobId;
  const router = useRouter();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadJob = async () => {
      try {
        const res = await api.getJob(jobId);
        if (res.success) setJob(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadJob();
  }, [jobId]);

  if (loading) {
    return <div className="max-w-4xl mx-auto py-20 text-center text-slate-500">Loading opportunity...</div>;
  }

  if (!job) {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Job Not Found</h2>
        <Link href="/" className="text-blue-400 text-xs font-semibold">
          ← Return to job listings
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 space-y-8">
      <Link href="/" className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-white">
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to all jobs</span>
      </Link>

      <div className="glass-panel p-8 rounded-3xl border border-slate-800 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-400 block mb-1">
              {job.department || 'Engineering'}
            </span>
            <h1 className="text-3xl font-extrabold text-white">{job.title}</h1>
            <div className="flex items-center space-x-4 text-xs text-slate-400 mt-2">
              <span className="flex items-center space-x-1">
                <MapPin className="w-3.5 h-3.5" />
                <span>{job.location || 'Remote'}</span>
              </span>
              <span className="flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5" />
                <span>Min {job.min_experience || 2}+ Years Exp</span>
              </span>
            </div>
          </div>

          <Link
            href={`/jobs/${job._id}/apply`}
            className="flex items-center space-x-2 px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-xl shadow-blue-600/30 transition-all self-start md:self-auto"
          >
            <span>Apply For Position</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="space-y-4">
          <h2 className="text-base font-bold text-white uppercase tracking-wider text-xs">Role Overview</h2>
          <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">{job.description}</p>
        </div>

        <div className="space-y-3">
          <h2 className="text-base font-bold text-white uppercase tracking-wider text-xs">Required Technical Skills</h2>
          <div className="flex flex-wrap gap-2">
            {job.required_skills?.map((skill, idx) => (
              <Badge key={idx} variant="blue" size="md">
                {skill}
              </Badge>
            ))}
          </div>
        </div>

        {job.preferred_skills?.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-base font-bold text-white uppercase tracking-wider text-xs">Preferred Qualifications</h2>
            <div className="flex flex-wrap gap-2">
              {job.preferred_skills.map((skill, idx) => (
                <Badge key={idx} variant="default" size="md">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center space-x-3 text-xs text-slate-400">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>
            This role uses automated AI resume parsing & match scoring. You will receive real-time workflow status immediately upon application.
          </span>
        </div>
      </div>
    </div>
  );
}
