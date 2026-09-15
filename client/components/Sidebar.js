'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Briefcase,
  Users,
  GitBranch,
  BarChart3,
  PlusCircle,
  ShieldCheck,
  FileCode,
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/jobs', label: 'Jobs & Specs', icon: Briefcase },
  { href: '/dashboard/jobs/create', label: 'Create Job', icon: PlusCircle },
  { href: '/dashboard/candidates', label: 'Candidates', icon: Users },
  { href: '/dashboard/workflows', label: 'Workflows & Graph', icon: GitBranch },
  { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 min-h-[calc(100vh-61px)] glass-panel border-r border-slate-800/80 p-4 flex flex-col justify-between">
      <div className="space-y-6">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 px-3">
            Recruitment Suite
          </span>
          <nav className="mt-2 space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-lg shadow-blue-500/10'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="pt-4 border-t border-slate-800/80">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 px-3">
            System Spec Guard
          </span>
          <div className="mt-2 p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 space-y-2">
            <div className="flex items-center space-x-2 text-emerald-400 font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>Spec-Driven Engine</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-500">
              All scoring formulas, retry backoffs, and prompts are loaded dynamically from <code className="text-slate-300">/specs</code>.
            </p>
          </div>
        </div>
      </div>

      <div className="p-3 rounded-xl bg-gradient-to-br from-blue-950/40 to-indigo-950/40 border border-blue-800/30 text-xs">
        <span className="text-blue-300 font-semibold block mb-1">Local Testing Mode</span>
        <p className="text-[11px] text-slate-400">
          Act as recruiter, candidate, and reviewer in seamless local flow.
        </p>
      </div>
    </aside>
  );
}
