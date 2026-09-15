'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '../../lib/api';
import Badge from '../../components/Badge';
import { Briefcase, Search, MapPin, Clock, ArrowRight, ArrowLeft } from 'lucide-react';

export default function PublicJobsDirectoryPage() {
  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

  const departments = ['All', ...new Set(jobs.map((j) => j.department || 'Engineering'))];

  const filtered = jobs.filter((j) => {
    const matchesSearch =
      j.title?.toLowerCase().includes(search.toLowerCase()) ||
      j.description?.toLowerCase().includes(search.toLowerCase()) ||
      j.required_skills?.some((s) => s.toLowerCase().includes(search.toLowerCase()));
    const matchesDept = selectedDept === 'All' || j.department === selectedDept;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 space-y-8">
      <Link href="/" className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-white">
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to home</span>
      </Link>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-800 pb-8">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-400 block mb-1">
            Career Opportunities
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            Explore Open Positions
          </h1>
          <p className="text-sm text-slate-400 mt-2 max-w-xl">
            Join our engineering teams. Every application is parsed and matched autonomously by our multi-agent AI pipeline.
          </p>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by role or skill..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center space-x-1 p-1 rounded-xl bg-slate-900 border border-slate-800 self-stretch sm:self-auto">
            {departments.map((dept) => (
              <button
                key={dept}
                onClick={() => setSelectedDept(dept)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedDept === dept
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {dept}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center text-slate-500 text-sm">Loading job openings...</div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center text-slate-500 space-y-2">
          <Briefcase className="w-10 h-10 text-slate-700 mx-auto mb-2" />
          <p className="text-white font-semibold text-base">No open positions found</p>
          <p className="text-xs text-slate-400">Try adjusting your search query or department filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((job) => (
            <div
              key={job._id}
              className="p-6 rounded-3xl glass-card border border-slate-800 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
                    {job.department || 'Engineering'}
                  </span>
                  <Badge variant="blue" size="sm">
                    {job.location || 'Remote'}
                  </Badge>
                </div>
                <h3 className="text-xl font-bold text-white">{job.title}</h3>
                <p className="text-xs text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                  {job.description}
                </p>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  {job.required_skills?.map((s, idx) => (
                    <Badge key={idx} variant="default" size="sm">
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-xs text-slate-500 flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Min {job.min_experience || 2}+ years</span>
                </span>
                <Link
                  href={`/jobs/${job._id}/apply`}
                  className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 transition-all"
                >
                  <span>Apply Now</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
