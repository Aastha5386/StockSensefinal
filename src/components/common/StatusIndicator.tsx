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
  showBar = true,
}) => {
  const norm = (status || '').toUpperCase() as OperationalStatus;

  let barColor = '#9C9382'; // Draft
  let textColor = 'text-secondary';

  switch (norm) {
    case 'WAITING':
      barColor = '#B98424';
      textColor = 'text-[#B98424] dark:text-[#d4a03c]';
      break;
    case 'READY':
      barColor = '#A8501E';
      textColor = 'text-primary-container dark:text-primary';
      break;
    case 'DONE':
      barColor = '#3F6B4A';
      textColor = 'text-[#3F6B4A] dark:text-[#68a377]';
      break;
    case 'LATE':
    case 'CANCELLED':
      barColor = '#7A2E22';
      textColor = 'text-error';
      break;
    case 'DRAFT':
    default:
      barColor = '#9C9382';
      textColor = 'text-secondary';
      break;
  }

  return (
    <div className={`inline-flex items-center gap-[6px] ${className}`}>
      {showBar && (
        <span
          className="w-[3px] h-[12px] inline-block shrink-0"
          style={{ backgroundColor: barColor }}
        />
      )}
      <span className={`font-label-md text-label-md tracking-wider uppercase font-semibold ${textColor}`}>
        {norm}
      </span>
    </div>
  );
};
