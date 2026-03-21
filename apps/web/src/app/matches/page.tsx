'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { apiFetch } from '@/lib/api';
import BottomNav from '@/components/layout/BottomNav';
import Header from '@/components/layout/Header';
import type { Match } from '@tfe/shared';

export default function MatchesPage() {
  const { token } = useAuth();
  const router = useRouter();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    apiFetch<Match[]>('/matches', { token })
      .then(setMatches)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <div className="min-h-screen pb-20">
      <Header title="Matches" />

      <div className="px-6 py-4">
        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading matches...</div>
        ) : matches.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-4 opacity-50">&#128149;</div>
            <p className="text-gray-500">No matches yet</p>
            <p className="text-gray-400 text-sm mt-1">Keep swiping to find your match!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {matches.map(match => (
              <button
                key={match.id}
                className="w-full card flex items-center gap-4 hover:shadow-xl transition-shadow cursor-pointer"
                onClick={() => router.push(`/chat/${match.id}`)}
              >
                <div className="w-14 h-14 bg-primary-100 rounded-full flex items-center justify-center text-xl flex-shrink-0">
                  {match.otherParty.photoUrl ? (
                    <img src={match.otherParty.photoUrl} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <span>&#128100;</span>
                  )}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">{match.otherParty.name}</h3>
                  <p className="text-sm text-gray-500 truncate">{match.job.title}</p>
                  {match.lastMessage && (
                    <p className="text-xs text-gray-400 truncate mt-0.5">{match.lastMessage.body}</p>
                  )}
                </div>
                <span className="text-xs text-gray-400 flex-shrink-0">
                  {new Date(match.matchedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
