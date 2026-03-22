'use client';

import { WORK_TYPE_LABELS } from '@tfe/shared';
import type { WorkerCard as WorkerCardType } from '@tfe/shared';

interface WorkerCardProps {
  worker: WorkerCardType;
}

// Deterministic avatar using DiceBear
function getAvatarUrl(name: string) {
  const seed = encodeURIComponent(name);
  return `https://api.dicebear.com/9.x/avataaars/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;
}

// Skill-based accent colors
const SKILL_COLORS = [
  'bg-blue-50 text-blue-700',
  'bg-green-50 text-green-700',
  'bg-purple-50 text-purple-700',
  'bg-amber-50 text-amber-700',
  'bg-pink-50 text-pink-700',
  'bg-cyan-50 text-cyan-700',
];

export default function WorkerCard({ worker }: WorkerCardProps) {
  const workTypeLabel = WORK_TYPE_LABELS[worker.preferredWorkType]?.en || 'Any';

  return (
    <div className="bg-white rounded-3xl shadow-xl overflow-hidden min-h-[460px] flex flex-col select-none">
      {/* Avatar hero */}
      <div className="relative h-52 bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400 flex items-center justify-center">
        {worker.photoUrl ? (
          <img src={worker.photoUrl} alt={worker.name} className="w-full h-full object-cover" />
        ) : (
          <img
            src={getAvatarUrl(worker.name)}
            alt={worker.name}
            className="w-36 h-36 rounded-full bg-white/20 p-1 shadow-lg"
          />
        )}

        {/* Availability badge */}
        <div className={`absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full shadow text-xs font-bold ${
          worker.isAvailable
            ? 'bg-green-500 text-white'
            : 'bg-gray-500 text-white'
        }`}>
          <span className={`w-2 h-2 rounded-full ${worker.isAvailable ? 'bg-white animate-pulse' : 'bg-gray-300'}`}></span>
          {worker.isAvailable ? 'Available' : 'Busy'}
        </div>

        {/* Experience badge */}
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-bold px-3 py-1.5 rounded-full shadow">
          {worker.experienceYears}+ yrs exp
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-5 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-xl font-bold text-gray-900">{worker.name}</h3>
          </div>
          <p className="text-gray-500 text-sm mb-3">
            Prefers <span className="font-medium text-gray-700">{workTypeLabel}</span> work
          </p>
        </div>

        <div className="space-y-3">
          {/* Skills */}
          {worker.skills.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {worker.skills.slice(0, 5).map((skill, i) => (
                <span
                  key={i}
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold ${SKILL_COLORS[i % SKILL_COLORS.length]}`}
                >
                  {skill}
                </span>
              ))}
              {worker.skills.length > 5 && (
                <span className="text-gray-400 text-xs flex items-center">+{worker.skills.length - 5}</span>
              )}
            </div>
          )}

          {/* Distance */}
          <div className="flex items-center gap-1.5 text-sm text-gray-500">
            <span className="w-5 h-5 bg-blue-50 rounded-md flex items-center justify-center text-xs">{'\u{1F4CD}'}</span>
            <span>{worker.distanceKm} km away</span>
          </div>
        </div>
      </div>
    </div>
  );
}
