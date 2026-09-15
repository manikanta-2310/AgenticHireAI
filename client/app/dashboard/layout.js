'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../../components/Sidebar';
import { useAuthStore } from '../../store/useAuthStore';

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const { isAuthenticated, isLoading, initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  // If not logged in, auto initialize with demo account for seamless developer testing
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // In local development, we allow automatic demo login or redirect
      const token = localStorage.getItem('agentic_hire_token');
      if (!token) {
        // Redirect to login if user explicitly logged out
      }
    }
  }, [isLoading, isAuthenticated]);

  return (
    <div className="flex min-h-[calc(100vh-61px)]">
      <Sidebar />
      <div className="flex-1 p-6 md:p-8 bg-[#090d16] overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-8">
          {children}
        </div>
      </div>
    </div>
  );
}
