'use client';

import { WORK_TYPE_LABELS, PAY_PERIOD_LABELS } from '@tfe/shared';
import type { JobCard as JobCardType } from '@tfe/shared';

interface JobCardProps {
  job: JobCardType;
}

// Deterministic avatar based on employer name
function getAvatarUrl(name: string, type: 'employer') {
  const seed = encodeURIComponent(name);
  return `https://api.dicebear.com/9.x/initials/svg?seed=${seed}&backgroundColor=f87171,fb923c,fbbf24,34d399,60a5fa,a78bfa,f472b6&backgroundType=gradientLinear&fontWeight=600&fontSize=40`;
}

// Category-based gradient colors
const CATEGORY_GRADIENTS: Record<string, string> = {
  Construction: 'from-amber-500 to-orange-600',
  Cooking: 'from-red-500 to-pink-600',
  Driving: 'from-blue-500 to-cyan-600',
  Delivery: 'from-green-500 to-emerald-600',
  Security: 'from-slate-600 to-gray-800',
  Housekeeping: 'from-violet-500 to-purple-600',
  Painting: 'from-yellow-500 to-amber-600',
  Plumbing: 'from-sky-500 to-blue-600',
  Electrical: 'from-yellow-400 to-orange-500',
  'Factory Work': 'from-zinc-500 to-slate-700',
  Warehouse: 'from-stone-500 to-zinc-700',
  Carpentry: 'from-amber-600 to-yellow-800',
  Welding: 'from-orange-600 to-red-700',
  Tailoring: 'from-pink-500 to-rose-600',
  Gardening: 'from-green-500 to-lime-600',
  Retail: 'from-indigo-500 to-blue-600',
  'AC Repair': 'from-cyan-500 to-teal-600',
  Farming: 'from-lime-600 to-green-700',
};

const CATEGORY_ICONS: Record<string, string> = {
  Construction: '\u{1F3D7}\u{FE0F}',
  Cooking: '\u{1F468}\u200D\u{1F373}',
  Driving: '\u{1F698}',
  Delivery: '\u{1F4E6}',
  Security: '\u{1F6E1}\u{FE0F}',
  Housekeeping: '\u{1F9F9}',
  Painting: '\u{1F3A8}',
  Plumbing: '\u{1F527}',
  Electrical: '\u26A1',
  'Factory Work': '\u{1F3ED}',
  Warehouse: '\u{1F4E6}',
  Carpentry: '\u{1FA9A}',
  Welding: '\u{1F525}',
  Tailoring: '\u{1F9F5}',
  Gardening: '\u{1F33F}',
  Retail: '\u{1F6D2}',
  'AC Repair': '\u2744\u{FE0F}',
  Farming: '\u{1F33E}',
};

export default function JobCard({ job }: JobCardProps) {
  const workTypeLabel = WORK_TYPE_LABELS[job.workType]?.en || job.workType;
  const payPeriodLabel = PAY_PERIOD_LABELS[job.payPeriod]?.en || '';
  const gradient = CATEGORY_GRADIENTS[job.categoryName] || 'from-primary-500 to-primary-700';
  const icon = CATEGORY_ICONS[job.categoryName] || '\u{1F4BC}';

  return (
    <div className="bg-white rounded-3xl shadow-xl overflow-hidden min-h-[460px] flex flex-col select-none">
      {/* Hero section with gradient */}
      <div className={`relative h-52 bg-gradient-to-br ${gradient} flex items-center justify-center`}>
        {job.employerPhoto ? (
          <img src={job.employerPhoto} alt={job.employerName} className="w-full h-full object-cover" />
        ) : (
          <div className="flex flex-col items-center">
            <span className="text-7xl mb-1">{icon}</span>
            <span className="text-white/70 text-sm font-medium">{job.categoryName}</span>
          </div>
        )}

        {/* Employer avatar pill */}
        <div className="absolute bottom-3 left-4 flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-full pl-1 pr-3 py-1 shadow-md">
          <img
            src={getAvatarUrl(job.employerName, 'employer')}
            alt={job.employerName}
            className="w-7 h-7 rounded-full"
          />
          <span className="text-xs font-semibold text-gray-800 truncate max-w-[140px]">{job.employerName}</span>
        </div>

        {/* Work type badge */}
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-bold px-3 py-1.5 rounded-full shadow">
          {workTypeLabel}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-5 flex flex-col justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-1 leading-tight">{job.title}</h3>
          {job.description && (
            <p className="text-gray-500 text-sm line-clamp-2 mb-3">{job.description}</p>
          )}
        </div>

        <div className="space-y-3">
          {/* Pay */}
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-green-50 rounded-xl flex items-center justify-center">
              <span className="text-green-600 font-bold text-sm">{'\u20B9'}</span>
            </div>
            <div>
              <p className="text-green-700 font-bold text-base">
                {job.payMin.toLocaleString('en-IN')} - {job.payMax.toLocaleString('en-IN')}
                <span className="text-gray-400 font-normal text-xs ml-1">{payPeriodLabel}</span>
              </p>
            </div>
          </div>

          {/* Distance + Category */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-sm text-gray-500">
              <span className="w-5 h-5 bg-blue-50 rounded-md flex items-center justify-center text-xs">{'\u{1F4CD}'}</span>
              <span>{job.distanceKm} km away</span>
            </div>
            {job.categoryName && (
              <span className="bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full text-xs font-medium">
                {job.categoryName}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
