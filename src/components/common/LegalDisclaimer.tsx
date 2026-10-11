import React from 'react';
import { ShieldAlert } from 'lucide-react';

interface LegalDisclaimerProps {
  compact?: boolean;
}

export const LegalDisclaimer: React.FC<LegalDisclaimerProps> = ({ compact = false }) => {
  if (compact) {
    return (
      <div className="flex items-start gap-2.5 p-3 rounded-lg bg-amber-50/60 border border-amber-200/80 text-amber-900 text-xs">
        <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="font-semibold">Disclaimer:</strong> IP Guardian supports administrative tracking and does not replace professional legal advice or official deadline verification. Always confirm critical dates with official registries (e.g. USPTO, EPO, WIPO).
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 sm:p-5 text-amber-950">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-amber-100 text-amber-800 rounded-lg shrink-0 mt-0.5">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-semibold tracking-tight text-amber-900">
            Administrative Tracking & Legal Notice
          </h4>
          <p className="text-xs sm:text-sm text-amber-800 leading-relaxed">
            IP Guardian supports administrative tracking and does not replace professional legal advice or official deadline verification. Official filing dates, fee grace periods, and patent or trademark office actions must be audited against authorized national and international intellectual property registries.
          </p>
        </div>
      </div>
    </div>
  );
};
