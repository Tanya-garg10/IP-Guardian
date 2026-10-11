import React, { useState, useEffect } from 'react';
import { AnalyticsSummary, IPRecord } from '../types/ip';
import { fetchAnalytics, fetchRecords, getPortfolioExportCsvUrl } from '../services/api';
import { TypeIndicator } from '../components/common/TypeIndicator';
import { StatusIndicator } from '../components/common/StatusIndicator';
import { LegalDisclaimer } from '../components/common/LegalDisclaimer';
import {
  FileSpreadsheet,
  Printer,
  Download,
  Building2,
  CheckCircle2,
  GraduationCap,
  Activity,
  Layers,
  Clock,
  Shield,
  FileText
} from 'lucide-react';

export const ImpactReportsPage: React.FC = () => {
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [records, setRecords] = useState<IPRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  useEffect(() => {
    Promise.all([fetchAnalytics(), fetchRecords({ limit: 100 })])
      .then(([summary, recs]) => {
        setData(summary);
        setRecords(recs.records);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const handlePrint = () => {
    window.print();
  };

  if (isLoading || !data) {
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 border-2 border-[#4563EB] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-500 font-mono">Compiling portfolio metrics report...</p>
      </div>
    );
  }

  const completedTasks = data.deadlines.completed || 0;
  const pendingTasks = data.deadlines.overdue + data.deadlines.due_soon + data.deadlines.upcoming;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1E2A49]">
            Social Impact & Institutional Reporting
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Empirical metrics tracking university invention protection, student IP disclosures, and administrative velocity
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-[#E7E3D8] hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 shadow-2xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
          <a
            href={getPortfolioExportCsvUrl()}
            download
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#4563EB] hover:bg-[#344ec7] text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Export Full CSV</span>
          </a>
        </div>
      </div>

      {/* Real Empirical Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Assets Organised */}
        <div className="p-5 bg-white rounded-2xl border border-[#E7E3D8] space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            IP Disclosures Organised
          </span>
          <div className="text-3xl font-bold font-mono text-[#1E2A49] tabular-nums">
            {data.total_records}
          </div>
          <span className="text-[11px] text-slate-500 block">
            Patents, trademarks & copyrights
          </span>
        </div>

        {/* Record Completeness */}
        <div className="p-5 bg-white rounded-2xl border border-[#E7E3D8] space-y-1">
          <span className="text-[10px] font-bold text-[#12633C] uppercase tracking-wider block">
            Average Completeness
          </span>
          <div className="text-3xl font-bold font-mono text-[#12633C] tabular-nums">
            {data.overall_completeness}%
          </div>
          <span className="text-[11px] text-slate-500 block">
            Audit criteria satisfaction
          </span>
        </div>

        {/* Tasks Identified & Completed */}
        <div className="p-5 bg-white rounded-2xl border border-[#E7E3D8] space-y-1">
          <span className="text-[10px] font-bold text-[#4563EB] uppercase tracking-wider block">
            Administrative Tasks
          </span>
          <div className="text-3xl font-bold font-mono text-[#4563EB] tabular-nums">
            {completedTasks} / {completedTasks + pendingTasks}
          </div>
          <span className="text-[11px] text-slate-500 block">
            Completed vs pending tasks
          </span>
        </div>

        {/* Supporting Documents Vaulted */}
        <div className="p-5 bg-white rounded-2xl border border-[#E7E3D8] space-y-1">
          <span className="text-[10px] font-bold text-[#55349E] uppercase tracking-wider block">
            Vaulted Legal Files
          </span>
          <div className="text-3xl font-bold font-mono text-[#55349E] tabular-nums">
            {data.total_documents}
          </div>
          <span className="text-[11px] text-slate-500 block">
            Claims briefs, declarations & specimens
          </span>
        </div>
      </div>

      {/* Category & Status Breakdown Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Category Distribution Table */}
        <div className="p-5 bg-white rounded-2xl border border-[#E7E3D8] space-y-3">
          <h2 className="text-sm font-bold text-[#1E2A49]">Assets by Classification Category</h2>
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E7E3D8] text-slate-400 font-semibold">
                <th className="py-2">Category</th>
                <th className="py-2 text-right">Count</th>
                <th className="py-2 text-right">Share</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="py-2.5 font-semibold text-[#4563EB]">Utility & Design Patents</td>
                <td className="py-2.5 text-right font-mono font-bold">{data.by_type.patents}</td>
                <td className="py-2.5 text-right font-mono text-slate-500">
                  {Math.round((data.by_type.patents / (data.total_records || 1)) * 100)}%
                </td>
              </tr>
              <tr>
                <td className="py-2.5 font-semibold text-[#12633C]">Registered Trademarks</td>
                <td className="py-2.5 text-right font-mono font-bold">{data.by_type.trademarks}</td>
                <td className="py-2.5 text-right font-mono text-slate-500">
                  {Math.round((data.by_type.trademarks / (data.total_records || 1)) * 100)}%
                </td>
              </tr>
              <tr>
                <td className="py-2.5 font-semibold text-[#55349E]">Software Copyrights</td>
                <td className="py-2.5 text-right font-mono font-bold">{data.by_type.copyrights}</td>
                <td className="py-2.5 text-right font-mono text-slate-500">
                  {Math.round((data.by_type.copyrights / (data.total_records || 1)) * 100)}%
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Pipeline Stage Distribution Table */}
        <div className="p-5 bg-white rounded-2xl border border-[#E7E3D8] space-y-3">
          <h2 className="text-sm font-bold text-[#1E2A49]">Application Pipeline Stages</h2>
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E7E3D8] text-slate-400 font-semibold">
                <th className="py-2">Lifecycle Stage</th>
                <th className="py-2 text-right">Count</th>
                <th className="py-2 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="py-2 font-medium">Idea (Early Concept)</td>
                <td className="py-2 text-right font-mono font-bold">{data.by_status.idea}</td>
                <td className="py-2 text-right text-slate-400">Pre-filing</td>
              </tr>
              <tr>
                <td className="py-2 font-medium">Draft (Internal Preparation)</td>
                <td className="py-2 text-right font-mono font-bold">{data.by_status.draft}</td>
                <td className="py-2 text-right text-slate-400">Claims drafting</td>
              </tr>
              <tr>
                <td className="py-2 font-medium">Filed (Formally Lodged)</td>
                <td className="py-2 text-right font-mono font-bold">{data.by_status.filed}</td>
                <td className="py-2 text-right text-[#12633C] font-semibold">Active</td>
              </tr>
              <tr>
                <td className="py-2 font-medium">Under Review (Examination)</td>
                <td className="py-2 text-right font-mono font-bold text-[#4563EB]">{data.by_status.under_review}</td>
                <td className="py-2 text-right text-[#4563EB] font-semibold">Priority</td>
              </tr>
              <tr>
                <td className="py-2 font-medium">Approved (Granted / Registered)</td>
                <td className="py-2 text-right font-mono font-bold text-[#10b981]">{data.by_status.approved}</td>
                <td className="py-2 text-right text-emerald-700 font-semibold">Granted</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Printable Portfolio Summary Table */}
      <div className="p-5 bg-white rounded-2xl border border-[#E7E3D8] space-y-4 shadow-2xs">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-[#1E2A49]">Institutional Portfolio Summary Table</h2>
            <p className="text-xs text-slate-500">Printable overview of active intellectual property assets</p>
          </div>
          <span className="text-xs font-mono text-slate-400">As of Oct 11, 2026</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#E7E3D8] bg-[#F8F7F3] text-slate-600 font-semibold">
                <th className="py-2.5 px-3">Title</th>
                <th className="py-2.5 px-2">Type</th>
                <th className="py-2.5 px-2">Reference #</th>
                <th className="py-2.5 px-2">Inventor(s)</th>
                <th className="py-2.5 px-2">Status</th>
                <th className="py-2.5 px-2">Next Deadline</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {records.map(r => (
                <tr key={r.id} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-semibold text-[#1E2A49] max-w-xs truncate">{r.title}</td>
                  <td className="py-2.5 px-2">{r.ip_type}</td>
                  <td className="py-2.5 px-2 font-mono text-[11px]">{r.application_number}</td>
                  <td className="py-2.5 px-2 truncate max-w-[140px]">{r.inventor_name}</td>
                  <td className="py-2.5 px-2"><StatusIndicator status={r.application_status} /></td>
                  <td className="py-2.5 px-2 font-mono text-[11px]">{r.next_deadline || 'None'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <LegalDisclaimer />
    </div>
  );
};
