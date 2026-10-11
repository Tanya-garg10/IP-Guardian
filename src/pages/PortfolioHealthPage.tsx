import React, { useState, useEffect } from 'react';
import { IPRecord, CompletenessBreakdown } from '../types/ip';
import { fetchRecords } from '../services/api';
import { TypeIndicator } from '../components/common/TypeIndicator';
import { StatusIndicator } from '../components/common/StatusIndicator';
import { LegalDisclaimer } from '../components/common/LegalDisclaimer';
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Search,
  ArrowRight,
  Info,
  Check,
  XCircle,
  HelpCircle
} from 'lucide-react';

interface PortfolioHealthPageProps {
  onSelectRecord: (recordId: string) => void;
  onEditRecord: (record: IPRecord) => void;
}

export const PortfolioHealthPage: React.FC<PortfolioHealthPageProps> = ({
  onSelectRecord,
  onEditRecord
}) => {
  const [records, setRecords] = useState<IPRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterScore, setFilterScore] = useState<'all' | 'needs_work' | 'complete'>('all');

  useEffect(() => {
    fetchRecords({ limit: 100 })
      .then(res => setRecords(res.records))
      .finally(() => setIsLoading(false));
  }, []);

  const totalScore = records.reduce((sum, r) => sum + (r.completeness?.score || 0), 0);
  const averageScore = records.length > 0 ? Math.round(totalScore / records.length) : 100;

  const fullyCompleteCount = records.filter(r => (r.completeness?.score || 0) >= 95).length;
  const needsAttentionCount = records.filter(r => (r.completeness?.score || 0) < 80).length;

  const filtered = records.filter(r => {
    const s = r.completeness?.score || 0;
    if (filterScore === 'complete') return s >= 95;
    if (filterScore === 'needs_work') return s < 80;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1E2A49]">
          IP Portfolio Health & Administrative Completeness
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Explainable institutional audit verifying documentation, references, and deadline scheduling
        </p>
      </div>

      {/* Health Overview Strip */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Main Average Score */}
        <div className="p-5 bg-white rounded-2xl border border-[#E7E3D8] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Portfolio Average
            </span>
            <Activity className="w-4 h-4 text-[#12633C]" />
          </div>
          <div className="text-3xl font-bold font-mono text-[#12633C] tabular-nums">
            {averageScore}%
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-[#4563EB] h-full rounded-full transition-all duration-700"
              style={{ width: `${averageScore}%` }}
            />
          </div>
          <span className="text-[11px] text-slate-500 block">
            Across {records.length} institutional assets
          </span>
        </div>

        {/* Fully Audited */}
        <div className="p-5 bg-white rounded-2xl border border-[#E7E3D8] space-y-1">
          <span className="text-[10px] font-bold text-[#12633C] uppercase tracking-wider flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            100% Complete
          </span>
          <div className="text-3xl font-bold font-mono text-[#12633C] tabular-nums">
            {fullyCompleteCount}
          </div>
          <span className="text-[11px] text-slate-500 block">
            All 7 criteria satisfied
          </span>
        </div>

        {/* Missing Elements */}
        <div className="p-5 bg-white rounded-2xl border border-[#E7E3D8] space-y-1">
          <span className="text-[10px] font-bold text-[#9C243E] uppercase tracking-wider flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            Needs Attention (&lt; 80%)
          </span>
          <div className="text-3xl font-bold font-mono text-[#9C243E] tabular-nums">
            {needsAttentionCount}
          </div>
          <span className="text-[11px] text-slate-500 block">
            Missing docs or references
          </span>
        </div>

        {/* Audit Methodology */}
        <div className="p-5 bg-[#EFE8FF]/60 rounded-2xl border border-[#D9C8FF] text-xs space-y-1.5">
          <span className="font-bold text-[#55349E] block flex items-center gap-1">
            <FileCheck className="w-3.5 h-3.5" />
            Audit Criteria
          </span>
          <p className="text-[11px] text-slate-600 leading-tight">
            Scored objectively: Title (15%), Abstract (15%), Inventors (15%), Assignee (15%), Reference code (15%), Deadline scheduled (10%), Vault files (15%).
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 text-xs">
        {[
          { id: 'all' as const, label: `All Assets (${records.length})` },
          { id: 'needs_work' as const, label: `Needs Work (${needsAttentionCount})` },
          { id: 'complete' as const, label: `100% Complete (${fullyCompleteCount})` }
        ].map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setFilterScore(tab.id)}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-colors ${
              filterScore === tab.id
                ? 'bg-[#1E2A49] text-white shadow-2xs'
                : 'bg-white border border-[#E7E3D8] text-slate-600 hover:text-[#1E2A49]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Record Completeness Cards List */}
      <div className="space-y-3">
        {filtered.map(record => {
          const comp = record.completeness;
          const score = comp?.score ?? 0;
          const isHigh = score >= 90;
          const isLow = score < 80;

          return (
            <div
              key={record.id}
              className="bg-white rounded-2xl border border-[#E7E3D8] p-5 shadow-2xs space-y-3 hover:border-slate-300 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <TypeIndicator type={record.ip_type} />
                    <StatusIndicator status={record.application_status} />
                    <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {record.application_number}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-[#1E2A49] truncate">{record.title}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {record.owner_name} · Inventor: {record.inventor_name}
                  </p>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                      Completeness
                    </span>
                    <span className={`text-xl font-bold font-mono ${
                      isHigh ? 'text-[#12633C]' : isLow ? 'text-[#9C243E]' : 'text-amber-600'
                    }`}>
                      {score}%
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onSelectRecord(record.id)}
                    className="px-3.5 py-1.5 text-xs font-semibold bg-[#4563EB] hover:bg-[#344ec7] text-white rounded-xl transition-colors"
                  >
                    Inspect
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    isHigh ? 'bg-[#12633C]' : isLow ? 'bg-[#9C243E]' : 'bg-amber-500'
                  }`}
                  style={{ width: `${score}%` }}
                />
              </div>

              {/* Actionable Missing Items (Click to Fix) */}
              {comp && comp.missing_items.length > 0 && (
                <div className="pt-2 border-t border-slate-100 space-y-1.5">
                  <span className="text-[11px] font-bold text-[#9C243E] block">
                    Action items required to reach 100%:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {comp.missing_items.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 bg-[#F9E2E7]/60 rounded-xl border border-[#F2CAD2] text-xs text-[#9C243E] flex items-center justify-between"
                      >
                        <span className="truncate pr-2">{item.message}</span>
                        <button
                          type="button"
                          onClick={() => {
                            if (item.action_target === 'upload') onSelectRecord(record.id);
                            else onEditRecord(record);
                          }}
                          className="font-bold underline shrink-0 text-[11px]"
                        >
                          Fix &rarr;
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Mandatory Regulatory Disclaimer */}
      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 text-xs space-y-1">
        <h4 className="font-bold flex items-center gap-1.5">
          <HelpCircle className="w-4 h-4 text-amber-700" />
          <span>Non-Legal Nature of the Completeness Score</span>
        </h4>
        <p className="leading-relaxed">
          The IP Portfolio Health score is an internal administrative checklist measure of record completeness (such as verified inventor attribution, reference designations, and vaulted attachments). It does not represent patentability, non-infringement, commercial value, or statutory legal validity.
        </p>
      </div>
    </div>
  );
};
