'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { apiFetch } from '@/lib/api';
import BottomNav from '@/components/layout/BottomNav';
import type { JobListing, Match } from '@tfe/shared';

export default function EmployerDashboard() {
  const { token } = useAuth();
  const router = useRouter();
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    Promise.all([
      apiFetch<JobListing[]>('/jobs', { token }),
      apiFetch<Match[]>('/matches', { token }),
    ])
      .then(([j, m]) => { setJobs(j); setMatches(m); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  const activeJobs = jobs.filter(j => j.isActive);

  return (
    <div className="min-h-screen pb-20">
      <header className="px-6 pt-6 pb-4">
        <h1 className="text-2xl font-bold text-primary-600">Dashboard</h1>
      </header>

      <div className="px-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="card text-center py-4">
            <p className="text-2xl font-bold text-primary-600">{activeJobs.length}</p>
            <p className="text-xs text-gray-500">Active Jobs</p>
          </div>
          <div className="card text-center py-4">
            <p className="text-2xl font-bold text-green-600">{matches.length}</p>
            <p className="text-xs text-gray-500">Matches</p>
          </div>
          <div className="card text-center py-4">
            <p className="text-2xl font-bold text-blue-600">{jobs.length}</p>
            <p className="text-xs text-gray-500">Total Jobs</p>
          </div>
        </div>

        {/* Quick actions */}
        <button
          className="btn-primary w-full"
          onClick={() => router.push('/employer/jobs/new')}
        >
          + Post a New Job
        </button>

        {/* Recent matches */}
        <div>
          <h2 className="font-semibold text-lg mb-3">Recent Matches</h2>
          {matches.length === 0 ? (
            <p className="text-gray-400 text-sm">No matches yet. Post a job and start swiping!</p>
          ) : (
            <div className="space-y-2">
              {matches.slice(0, 5).map(match => (
                <button
                  key={match.id}
                  className="w-full card flex items-center gap-3 py-3 cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => router.push(`/chat/${match.id}`)}
                >
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    &#128100;
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-medium text-sm">{match.otherParty.name}</p>
                    <p className="text-xs text-gray-500">{match.job.title}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
