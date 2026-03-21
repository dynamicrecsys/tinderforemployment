'use client';

import { WORK_TYPE_LABELS, PAY_PERIOD_LABELS } from '@tfe/shared';
import type { JobCard as JobCardType } from '@tfe/shared';

interface JobCardProps {
  job: JobCardType;
}

export default function JobCard({ job }: JobCardProps) {
  const workTypeLabel = WORK_TYPE_LABELS[job.workType]?.en || job.workType;
  const payPeriodLabel = PAY_PERIOD_LABELS[job.payPeriod]?.en || '';

  return (
    <div className="card min-h-[420px] flex flex-col justify-between select-none">
      {/* Employer photo / placeholder */}
      <div className="w-full h-48 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl mb-4 flex items-center justify-center">
        {job.employerPhoto ? (
          <img src={job.employerPhoto} alt={job.employerName} className="w-full h-full object-cover rounded-xl" />
        ) : (
          <span className="text-6xl opacity-50">&#127970;</span>
        )}
      </div>

      {/* Job info */}
      <div className="flex-1">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-xl font-bold text-gray-900">{job.title}</h3>
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium whitespace-nowrap ml-2">
            {workTypeLabel}
          </span>
        </div>

        <p className="text-gray-500 text-sm mb-3">{job.employerName}</p>

        <div className="flex items-center gap-4 mb-3">
          <div className="flex items-center gap-1 text-green-600 font-semibold">
            <span>&#8377;</span>
            <span>{job.payMin.toLocaleString('en-IN')}-{job.payMax.toLocaleString('en-IN')}</span>
            <span className="text-gray-400 font-normal text-sm">{payPeriodLabel}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <span>&#128205;</span> {job.distanceKm} km away
          </span>
          {job.categoryName && (
            <span className="bg-gray-100 px-2 py-0.5 rounded-full text-xs">
              {job.categoryName}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
