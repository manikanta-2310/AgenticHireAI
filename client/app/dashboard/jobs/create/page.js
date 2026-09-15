'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../../../lib/api';
import { Briefcase, ArrowLeft, Check, Sparkles, AlertCircle } from 'lucide-react';

export default function CreateJobPage() {
  const router = useRouter();
  const [hiringSpecs, setHiringSpecs] = useState([]);
  const [selectedSpecId, setSelectedSpecId] = useState('frontend-developer');
  const [title, setTitle] = useState('Senior Frontend Developer');
  const [department, setDepartment] = useState('Engineering');
  const [location, setLocation] = useState('Remote');
  const [minExperience, setMinExperience] = useState(3);
  const [requiredSkills, setRequiredSkills] = useState('React, JavaScript, CSS, HTML');
  const [preferredSkills, setPreferredSkills] = useState('Next.js, Tailwind CSS, Zustand');
  const [description, setDescription] = useState('We are seeking an experienced Frontend Developer to lead UI engineering initiatives and build cutting-edge web applications.');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadSpecs = async () => {
      try {
        const res = await api.getHiringSpecs();
        if (res.success && res.data.length > 0) {
          setHiringSpecs(res.data);
        }
      } catch (err) {
        console.error(err);
      }
    };
    loadSpecs();
  }, []);

  const handleSpecSelect = (spec) => {
    setSelectedSpecId(spec.id);
    setTitle(spec.title || spec.role);
    setDepartment(spec.department || 'Engineering');
    setMinExperience(spec.min_experience_years || 3);
    setRequiredSkills((spec.required_skills || []).join(', '));
    setPreferredSkills((spec.preferred_skills || []).join(', '));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload = {
      title,
      description,
      department,
      location,
      min_experience: Number(minExperience),
      required_skills: requiredSkills.split(',').map(s => s.trim()).filter(Boolean),
      preferred_skills: preferredSkills.split(',').map(s => s.trim()).filter(Boolean),
      hiring_spec_id: selectedSpecId,
      workflow_spec_id: 'default-hiring-workflow',
    };

    try {
      const res = await api.createJob(payload);
      if (res.success) {
        router.push('/dashboard/jobs');
      }
    } catch (err) {
      setError(err.message || 'Failed to create job');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Create Job Posting</h1>
          <p className="text-xs text-slate-400 mt-0.5">Link job requirements directly to dynamic /specs hiring rules</p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center space-x-2 text-rose-400 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Spec Template Picker */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-3">
        <div className="flex items-center space-x-2 text-blue-400 font-bold text-xs uppercase tracking-wider">
          <Sparkles className="w-4 h-4" />
          <span>Select Spec-Driven Template</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {hiringSpecs.map((spec) => (
            <button
              key={spec.id}
              type="button"
              onClick={() => handleSpecSelect(spec)}
              className={`p-4 rounded-2xl text-left border transition-all ${
                selectedSpecId === spec.id
                  ? 'bg-blue-600/15 border-blue-500 text-white shadow-lg shadow-blue-500/10'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-white">{spec.role}</span>
                {selectedSpecId === spec.id && <Check className="w-4 h-4 text-blue-400" />}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Threshold: {spec.minimum_score}% • {spec.required_skills?.length} required skills
              </p>
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="glass-panel p-8 rounded-3xl border border-slate-800 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">Job Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-white text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">Department</label>
            <input
              type="text"
              required
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-white text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">Location / Workplace</label>
            <input
              type="text"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-white text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">Minimum Experience (Years)</label>
            <input
              type="number"
              min="0"
              required
              value={minExperience}
              onChange={(e) => setMinExperience(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-white text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">Required Skills (Comma-separated)</label>
          <input
            type="text"
            required
            value={requiredSkills}
            onChange={(e) => setRequiredSkills(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-white text-sm focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">Preferred Skills (Comma-separated)</label>
          <input
            type="text"
            value={preferredSkills}
            onChange={(e) => setPreferredSkills(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-white text-sm focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">Job Description</label>
          <textarea
            rows="4"
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-white text-sm focus:outline-none focus:border-blue-500 leading-relaxed"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-xl shadow-blue-600/30 transition-all disabled:opacity-60"
        >
          {loading ? 'Publishing Job...' : 'Publish Job & Generate Public Apply Route'}
        </button>
      </form>
    </div>
  );
}
