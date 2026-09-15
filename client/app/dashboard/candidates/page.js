'use client';

import React, { useEffect, useState } from 'react';
import api from '../../../lib/api';
import Badge from '../../../components/Badge';
import {
  Users,
  Search,
  Filter,
  FileText,
  Code2,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Sparkles,
} from 'lucide-react';

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const loadCandidates = async () => {
      try {
        const res = await api.getCandidates();
        if (res.success) setCandidates(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadCandidates();
  }, []);

  const filtered = candidates.filter((c) => {
    return (
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase()) ||
      c.job_id?.title?.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Candidate Evaluation Vault</h1>
          <p className="text-sm text-slate-400 mt-1">
            Browse parsed candidate profiles, AI match scores, and generated technical interview packs.
          </p>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search candidates..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Candidates List Table */}
      <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-500">Loading candidates...</div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-sm">
            No candidates found matching your criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 border-b border-slate-800 text-slate-400 uppercase font-semibold">
                <tr>
                  <th className="px-6 py-4">Candidate Profile</th>
                  <th className="px-6 py-4">Target Role</th>
                  <th className="px-6 py-4">AI Match Score</th>
                  <th className="px-6 py-4">Decision Status</th>
                  <th className="px-6 py-4">Parsed Skills</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {filtered.map((cand) => (
                  <tr key={cand._id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-white text-sm">{cand.name}</div>
                      <div className="text-slate-400 text-xs">{cand.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-slate-200">{cand.job_id?.title || 'Open Role'}</span>
                      <div className="text-slate-500 text-[11px]">{cand.job_id?.department || 'Engineering'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <span className="font-extrabold text-sm text-white">
                          {cand.match_score > 0 ? `${cand.match_score}%` : '—'}
                        </span>
                        {cand.match_score >= 80 ? (
                          <Badge variant="green" size="sm">High Match</Badge>
                        ) : cand.match_score >= 60 ? (
                          <Badge variant="yellow" size="sm">Moderate</Badge>
                        ) : (
                          <Badge variant="red" size="sm">Low</Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
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
                        size="md"
                      >
                        {cand.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {(cand.parsed_resume_json?.skills || []).slice(0, 3).map((s, idx) => (
                          <span key={idx} className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
                            {s}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedCandidate(cand)}
                        className="px-3 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 font-semibold text-xs transition-all inline-flex items-center space-x-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Candidate Inspector Modal */}
      {selectedCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="max-w-3xl w-full max-h-[90vh] overflow-y-auto glass-panel p-8 rounded-3xl border border-slate-700 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-2xl font-extrabold text-white">{selectedCandidate.name}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{selectedCandidate.email} • {selectedCandidate.phone || 'No phone'}</p>
              </div>
              <button
                onClick={() => setSelectedCandidate(null)}
                className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Match Details */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-white">AI Match Summary</span>
                <span className="text-sm font-extrabold text-blue-400">{selectedCandidate.match_score}% Match</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {selectedCandidate.match_details?.rationale || 'Candidate evaluated based on skills, experience, and projects.'}
              </p>
              {selectedCandidate.match_details?.category_scores && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800 text-[11px]">
                  <div>Required Skills: <strong className="text-white">{selectedCandidate.match_details.category_scores.required_skills}%</strong></div>
                  <div>Experience: <strong className="text-white">{selectedCandidate.match_details.category_scores.experience}%</strong></div>
                  <div>Projects: <strong className="text-white">{selectedCandidate.match_details.category_scores.projects}%</strong></div>
                  <div>Education: <strong className="text-white">{selectedCandidate.match_details.category_scores.education}%</strong></div>
                </div>
              )}
            </div>

            {/* Generated Interview Pack */}
            {selectedCandidate.interview_pack && (
              <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 space-y-4">
                <div className="flex items-center space-x-2 text-indigo-400 font-bold text-sm">
                  <Sparkles className="w-4 h-4" />
                  <span>AI Generated Technical Interview Pack</span>
                </div>

                <div className="space-y-3">
                  <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                    Custom Technical Questions
                  </span>
                  {selectedCandidate.interview_pack.technical_questions?.map((q, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                      <span className="text-xs font-semibold text-white block">Q{idx + 1}: {q.question}</span>
                      <span className="text-[11px] text-slate-400 block">Criteria: {q.evaluation_criteria}</span>
                    </div>
                  ))}
                </div>

                {selectedCandidate.interview_pack.coding_challenge && (
                  <div className="pt-3 border-t border-indigo-900/50 space-y-1">
                    <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                      Practical Coding Challenge
                    </span>
                    <h5 className="text-xs font-bold text-indigo-300">
                      {selectedCandidate.interview_pack.coding_challenge.title}
                    </h5>
                    <p className="text-xs text-slate-400">
                      {selectedCandidate.interview_pack.coding_challenge.problem_statement}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
