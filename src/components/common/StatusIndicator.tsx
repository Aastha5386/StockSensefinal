import React from 'react';
import { OperationalStatus } from '../../types';

interface StatusIndicatorProps {
  status: OperationalStatus | string;
  className?: string;
  showBar?: boolean;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  className = '',
}) => {
  const norm = (status || '').toUpperCase() as OperationalStatus;

  let pillClasses = 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-slate-700/60';
  let dotColor = 'bg-slate-400 dark:bg-slate-500';
  let label: string = norm || 'DRAFT';

  switch (norm) {
    case 'WAITING':
      pillClasses = 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200/80 dark:border-amber-900/50';
      dotColor = 'bg-amber-500';
      label = 'Waiting';
      break;
    case 'READY':
      pillClasses = 'bg-[#F0EDFD] dark:bg-[#252040] text-[#6C4CE6] dark:text-[#A78BFA] border-[#6C4CE6]/30 dark:border-[#383256]';
      dotColor = 'bg-[#6C4CE6] dark:bg-[#A78BFA]';
      label = 'Ready';
      break;
    case 'DONE':
      pillClasses = 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-900/50';
      dotColor = 'bg-emerald-500';
      label = 'Completed';
      break;
    case 'LATE':
      pillClasses = 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200/80 dark:border-rose-900/50';
      dotColor = 'bg-rose-500';
      label = 'Overdue';
      break;
    case 'CANCELLED':
      pillClasses = 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-200/80 dark:border-rose-900/50 line-through';
      dotColor = 'bg-rose-400';
      label = 'Cancelled';
      break;
    case 'DRAFT':
    default:
      pillClasses = 'bg-slate-100/70 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border-slate-200/80 dark:border-slate-700/60';
      dotColor = 'bg-slate-400 dark:bg-slate-500';
      label = 'Draft';
      break;
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${pillClasses} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColor}`} />
      <span>{label}</span>
    </span>
  );
};
