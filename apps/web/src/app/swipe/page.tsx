'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { useLocation } from '@/providers/LocationProvider';
import { apiFetch } from '@/lib/api';
import SwipeDeck from '@/components/swipe/SwipeDeck';
import JobCard from '@/components/swipe/JobCard';
import WorkerCard from '@/components/swipe/WorkerCard';
import BottomNav from '@/components/layout/BottomNav';
import LocationGate from '@/components/layout/LocationGate';
import type { JobCard as JobCardType, WorkerCard as WorkerCardType, SwipeResponse } from '@tfe/shared';

export default function SwipePage() {
  const { user, token } = useAuth();
  const { hasLocation } = useLocation();
  const [jobs, setJobs] = useState<JobCardType[]>([]);
  const [workers, setWorkers] = useState<WorkerCardType[]>([]);
  const [loading, setLoading] = useState(true);
  const [matchPopup, setMatchPopup] = useState<string | null>(null);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  const isWorker = user?.role === 'worker';

  const loadFeed = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      if (isWorker) {
        const feed = await apiFetch<JobCardType[]>('/feed/jobs', { token });
        setJobs(feed);
      } else if (selectedJobId) {
        const feed = await apiFetch<WorkerCardType[]>(`/feed/workers?jobId=${selectedJobId}`, { token });
        setWorkers(feed);
      }
    } catch (err) {
      console.error('Failed to load feed:', err);
    } finally {
      setLoading(false);
    }
  }, [token, isWorker, selectedJobId]);

  useEffect(() => {
    if (hasLocation) loadFeed();
  }, [loadFeed, hasLocation]);

  const handleSwipe = async (item: { id: string }, direction: 'like' | 'pass') => {
    if (!token) return;

    // Optimistically remove from UI
    if (isWorker) {
      setJobs(prev => prev.filter(j => j.id !== item.id));
    } else {
      setWorkers(prev => prev.filter(w => w.id !== item.id));
    }

    try {
      const res = await apiFetch<SwipeResponse>('/swipe', {
        method: 'POST',
        token,
        body: JSON.stringify({
          targetType: isWorker ? 'job' : 'worker',
          targetId: item.id,
          contextJobId: isWorker ? item.id : selectedJobId,
          direction,
        }),
      });

      if (res.matched) {
        setMatchPopup(res.matchId!);
        setTimeout(() => setMatchPopup(null), 3000);
      }
    } catch (err) {
      console.error('Swipe failed:', err);
    }
  };

  if (!hasLocation) return <LocationGate />;

  return (
    <div className="min-h-screen pb-20">
      <header className="px-6 pt-6 pb-2">
        <h1 className="text-2xl font-bold text-primary-600">RozgaarMatch</h1>
        <p className="text-gray-400 text-sm">
          {isWorker ? 'Swipe right on jobs you like' : 'Swipe right on workers you want to hire'}
        </p>
      </header>

      <div className="px-6 pt-4">
        {loading ? (
          <div className="flex items-center justify-center h-[500px]">
            <div className="animate-pulse text-gray-400">Loading...</div>
          </div>
        ) : isWorker ? (
          <SwipeDeck
            items={jobs}
            renderCard={(job) => <JobCard job={job} />}
            onSwipe={handleSwipe}
            emptyMessage="No jobs near you right now"
          />
        ) : (
          <SwipeDeck
            items={workers}
            renderCard={(worker) => <WorkerCard worker={worker} />}
            onSwipe={handleSwipe}
            emptyMessage="No workers nearby for this job"
          />
        )}
      </div>

      {/* Match popup */}
      {matchPopup && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-8 text-center mx-6 animate-bounce">
            <div className="text-6xl mb-4">&#127881;</div>
            <h2 className="text-3xl font-bold text-primary-600 mb-2">It's a Match!</h2>
            <p className="text-gray-500 mb-6">You can now chat with each other</p>
            <button
              className="btn-primary"
              onClick={() => setMatchPopup(null)}
            >
              Continue Swiping
            </button>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
