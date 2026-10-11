import React from 'react';
import { ApplicationStatus } from '../../types/ip';

interface StatusIndicatorProps {
  status: ApplicationStatus;
  showDot?: boolean;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({ status, showDot = true }) => {
  // Unboxed, refined typography with color-coded dot strictly for semantic state
  const config: Record<ApplicationStatus, { dot: string; text: string }> = {
    'Approved': {
      dot: 'bg-emerald-600',
      text: 'text-emerald-700 font-medium'
    },
    'Under Review': {
      dot: 'bg-blue-600',
      text: 'text-blue-700 font-medium'
    },
    'Filed': {
      dot: 'bg-teal-600',
      text: 'text-teal-700 font-medium'
    },
    'Draft': {
      dot: 'bg-slate-400',
      text: 'text-slate-600'
    },
    'Idea': {
      dot: 'bg-indigo-500',
      text: 'text-indigo-600'
    },
    'Rejected': {
      dot: 'bg-rose-600',
      text: 'text-rose-700 font-medium'
    }
  };

  const { dot, text } = config[status] || { dot: 'bg-slate-400', text: 'text-slate-600' };

  return (
    <span className={`inline-flex items-center gap-1.5 text-xs whitespace-nowrap ${text}`}>
      {showDot && <span className={`w-1.5 h-1.5 rounded-full ${dot} shrink-0`} aria-hidden="true" />}
      {status}
    </span>
  );
};
