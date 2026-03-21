'use client';

import { WORK_TYPE_LABELS } from '@tfe/shared';
import type { WorkerCard as WorkerCardType } from '@tfe/shared';

interface WorkerCardProps {
  worker: WorkerCardType;
}

export default function WorkerCard({ worker }: WorkerCardProps) {
  const workTypeLabel = WORK_TYPE_LABELS[worker.preferredWorkType]?.en || 'Any';

  return (
    <div className="card min-h-[420px] flex flex-col justify-between select-none">
      {/* Worker photo / placeholder */}
      <div className="w-full h-48 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl mb-4 flex items-center justify-center">
        {worker.photoUrl ? (
          <img src={worker.photoUrl} alt={worker.name} className="w-full h-full object-cover rounded-xl" />
        ) : (
          <span className="text-6xl opacity-50">&#128119;</span>
        )}
      </div>

      {/* Worker info */}
      <div className="flex-1">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-xl font-bold text-gray-900">{worker.name}</h3>
          <div className="flex items-center gap-1">
            {worker.isAvailable && (
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            )}
            <span className="text-xs text-gray-500">
              {worker.isAvailable ? 'Available' : 'Busy'}
            </span>
          </div>
        </div>

        <p className="text-gray-500 text-sm mb-3">
          {worker.experienceYears} years experience | Prefers {workTypeLabel}
        </p>

        <div className="flex flex-wrap gap-1.5 mb-3">
          {worker.skills.slice(0, 5).map((skill, i) => (
            <span key={i} className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full text-xs font-medium">
              {skill}
            </span>
          ))}
          {worker.skills.length > 5 && (
            <span className="text-gray-400 text-xs">+{worker.skills.length - 5} more</span>
          )}
        </div>

        <div className="text-sm text-gray-500 flex items-center gap-1">
          <span>&#128205;</span> {worker.distanceKm} km away
        </div>
      </div>
    </div>
  );
}
