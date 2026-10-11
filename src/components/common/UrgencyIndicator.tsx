import React from 'react';
import { DeadlineUrgency } from '../../types/ip';
import { AlertTriangle, Clock, Calendar, CheckCircle2 } from 'lucide-react';

interface UrgencyIndicatorProps {
  urgency: DeadlineUrgency;
  daysRemaining: number | null;
  dateStr: string | null;
  showDate?: boolean;
}

export const UrgencyIndicator: React.FC<UrgencyIndicatorProps> = ({
  urgency,
  daysRemaining,
  dateStr,
  showDate = false
}) => {
  if (urgency === 'none' || !dateStr) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-slate-400">
        <CheckCircle2 className="w-3.5 h-3.5 text-slate-300" />
        <span>No pending deadline</span>
      </span>
    );
  }

  if (urgency === 'overdue') {
    const overdueDays = daysRemaining !== null ? Math.abs(daysRemaining) : 0;
    return (
      <div className="inline-flex flex-col text-xs text-rose-700">
        <span className="inline-flex items-center gap-1.5 font-semibold text-rose-600">
          <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
          <span>Overdue by {overdueDays} {overdueDays === 1 ? 'day' : 'days'}</span>
        </span>
        {showDate && <span className="text-[11px] text-rose-500 font-mono tabular-nums">{dateStr}</span>}
      </div>
    );
  }

  if (urgency === 'due_soon') {
    return (
      <div className="inline-flex flex-col text-xs text-amber-800">
        <span className="inline-flex items-center gap-1.5 font-semibold text-amber-600">
          <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span>
            {daysRemaining === 0 ? 'Due Today' : `Due in ${daysRemaining} ${daysRemaining === 1 ? 'day' : 'days'}`}
          </span>
        </span>
        {showDate && <span className="text-[11px] text-amber-600 font-mono tabular-nums">{dateStr}</span>}
      </div>
    );
  }

  // Upcoming
  return (
    <div className="inline-flex flex-col text-xs text-slate-600">
      <span className="inline-flex items-center gap-1.5 font-medium text-slate-700">
        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span>In {daysRemaining} days</span>
      </span>
      {showDate && <span className="text-[11px] text-slate-500 font-mono tabular-nums">{dateStr}</span>}
    </div>
  );
};
