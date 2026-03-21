'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { apiFetch } from '@/lib/api';
import BottomNav from '@/components/layout/BottomNav';
import Header from '@/components/layout/Header';
import { WORK_TYPE_LABELS, PAY_PERIOD_LABELS } from '@tfe/shared';
import type { JobListing } from '@tfe/shared';

export default function EmployerJobsPage() {
  const { token } = useAuth();
  const router = useRouter();
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    apiFetch<JobListing[]>('/jobs', { token })
      .then(setJobs)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <div className="min-h-screen pb-20">
      <Header title="My Jobs" />

      <div className="px-6 py-4 space-y-4">
        <button className="btn-primary w-full" onClick={() => router.push('/employer/jobs/new')}>
          + Post New Job
        </button>

        {loading ? (
          <div className="text-center py-8 text-gray-400">Loading jobs...</div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <p>No jobs posted yet</p>
          </div>
        ) : (
          jobs.map(job => (
            <div key={job.id} className="card">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{job.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    &#8377;{job.payMin.toLocaleString('en-IN')}-{job.payMax.toLocaleString('en-IN')}
                    {PAY_PERIOD_LABELS[job.payPeriod]?.en}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {WORK_TYPE_LABELS[job.workType]?.en} | {job.slots} slots | {job.locationText}
                  </p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  job.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                }`}>
                  {job.isActive ? 'Active' : 'Closed'}
                </span>
              </div>
              <div className="flex gap-2 mt-3">
                <button
                  className="text-sm text-primary-500 font-medium"
                  onClick={() => router.push(`/employer/jobs/${job.id}/edit`)}
                >
                  Edit
                </button>
                <button
                  className="text-sm text-blue-500 font-medium"
                  onClick={() => router.push(`/swipe?jobId=${job.id}`)}
                >
                  Find Workers
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <BottomNav />
    </div>
  );
}
