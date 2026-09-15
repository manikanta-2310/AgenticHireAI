'use client';

import React from 'react';
import Link from 'next/link';
import { useAuthStore } from '../store/useAuthStore';
import { Bot, LogOut, User, Sparkles, Briefcase } from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();

  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-slate-800/80 px-6 py-3.5 flex items-center justify-between">
      <Link href="/" className="flex items-center space-x-3 group">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-cyan-400 p-[1px] shadow-lg shadow-blue-500/20">
          <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center">
            <Bot className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform" />
          </div>
        </div>
        <div>
          <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            AgenticHire<span className="text-blue-500">.AI</span>
          </span>
          <span className="block text-[10px] uppercase font-semibold tracking-wider text-slate-500 -mt-1">
            Spec-Driven Multi-Agent ATS
          </span>
        </div>
      </Link>

      <nav className="flex items-center space-x-4">
        <Link
          href="/jobs"
          className="text-xs font-semibold text-slate-300 hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-800/60 transition-all flex items-center space-x-1.5"
        >
          <Briefcase className="w-3.5 h-3.5 text-blue-400" />
          <span>Explore Jobs</span>
        </Link>

        {isAuthenticated ? (
          <div className="flex items-center space-x-4">
            <Link
              href="/dashboard"
              className="text-xs font-semibold text-slate-300 hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-800/60 transition-all"
            >
              Dashboard
            </Link>
            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800">
              <User className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-medium text-slate-200">{user?.name}</span>
              <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 font-bold">
                {user?.role || 'Recruiter'}
              </span>
            </div>
            <button
              onClick={logout}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-red-400 hover:bg-red-950/40 border border-transparent hover:border-red-900/50 transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center space-x-3">
            <Link
              href="/login"
              className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white rounded-lg hover:bg-slate-800/60 transition-all"
            >
              Recruiter Login
            </Link>
            <Link
              href="/signup"
              className="px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 hover:brightness-110 transition-all"
            >
              Get Started
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}
