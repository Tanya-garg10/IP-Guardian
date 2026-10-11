import React, { useState, useEffect } from 'react';
import { AnalyticsSummary, IPRecord } from '../types/ip';
import { fetchAnalytics } from '../services/api';
import { TypeIndicator } from '../components/common/TypeIndicator';
import { StatusIndicator } from '../components/common/StatusIndicator';
import { UrgencyIndicator } from '../components/common/UrgencyIndicator';
import { LegalDisclaimer } from '../components/common/LegalDisclaimer';
import {
  Shield,
  Lightbulb,
  Bookmark,
  FileText,
  AlertTriangle,
  Clock,
  PlusCircle,
  ArrowRight,
  RefreshCw,
  FolderOpen
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip
} from 'recharts';

interface DashboardPageProps {
  onOpenNewRecord: () => void;
  onNavigateToPortfolio: () => void;
  onNavigateToDeadlines: () => void;
  onSelectRecord: (recordId: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onOpenNewRecord,
  onNavigateToPortfolio,
  onNavigateToDeadlines,
  onSelectRecord
}) => {
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const summary = await fetchAnalytics();
      setData(summary);
    } catch (err: any) {
      setError(err.message || 'Failed to load live analytics');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-500">Calculating real-time IP metrics from database...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6">
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center justify-between">
          <span>{error || 'Unable to retrieve dashboard analytics.'}</span>
          <button
            onClick={loadData}
            className="px-3 py-1 bg-white border border-rose-200 rounded text-rose-800 text-xs font-medium"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // IP Type Chart Data
  const typeChartData = [
    { name: 'Patents', value: data.by_type.patents, color: '#2563eb' },
    { name: 'Trademarks', value: data.by_type.trademarks, color: '#0d9488' },
    { name: 'Copyrights', value: data.by_type.copyrights, color: '#6366f1' }
  ].filter(d => d.value > 0);

  // Status Chart Data
  const statusChartData = [
    { name: 'Idea', count: data.by_status.idea, fill: '#818cf8' },
    { name: 'Draft', count: data.by_status.draft, fill: '#94a3b8' },
    { name: 'Filed', count: data.by_status.filed, fill: '#0d9488' },
    { name: 'Under Review', count: data.by_status.under_review, fill: '#2563eb' },
    { name: 'Approved', count: data.by_status.approved, fill: '#10b981' },
    { name: 'Rejected', count: data.by_status.rejected, fill: '#f43f5e' }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Executive IP Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time portfolio metrics derived directly from verified institutional database records
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadData}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors"
            title="Refresh database metrics"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
            <span>Refresh</span>
          </button>
          <button
            type="button"
            onClick={onOpenNewRecord}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Register IP</span>
          </button>
        </div>
      </div>

      {/* Critical Overdue Banner (if any) */}
      {data.deadlines.overdue > 0 && (
        <div className="flex items-center justify-between p-4 rounded-xl border border-rose-200 bg-rose-50/70 text-rose-900">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-100 text-rose-700 rounded-lg shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-semibold text-rose-950">
                Action Required: {data.deadlines.overdue} Overdue Office Action / Statutory Task{data.deadlines.overdue > 1 ? 's' : ''}
              </p>
              <p className="text-xs text-rose-700 mt-0.5">
                Statutory filing responses or renewal dates have elapsed. Review them immediately to avoid application abandonment.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onNavigateToDeadlines}
            className="px-3 py-1.5 text-xs font-semibold text-rose-800 bg-white border border-rose-200 hover:bg-rose-100 rounded-lg transition-colors whitespace-nowrap ml-4 shrink-0"
          >
            Inspect Deadlines
          </button>
        </div>
      )}

      {/* Live Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {/* Card 1: Total Records */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-1">
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
            Total IP Assets
          </span>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 tabular-nums">
            {data.total_records}
          </div>
          <span className="text-[11px] text-slate-500 block">
            Across all categories
          </span>
        </div>

        {/* Card 2: Patents */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-1">
          <span className="text-[11px] font-medium text-blue-600 uppercase tracking-wider block flex items-center gap-1">
            <Lightbulb className="w-3 h-3" />
            Patents
          </span>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-blue-900 tabular-nums">
            {data.by_type.patents}
          </div>
          <span className="text-[11px] text-slate-500 block">
            Novel utility & designs
          </span>
        </div>

        {/* Card 3: Trademarks */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-1">
          <span className="text-[11px] font-medium text-teal-600 uppercase tracking-wider block flex items-center gap-1">
            <Bookmark className="w-3 h-3" />
            Trademarks
          </span>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-teal-900 tabular-nums">
            {data.by_type.trademarks}
          </div>
          <span className="text-[11px] text-slate-500 block">
            Registered brands & marks
          </span>
        </div>

        {/* Card 4: Copyrights */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-1">
          <span className="text-[11px] font-medium text-indigo-600 uppercase tracking-wider block flex items-center gap-1">
            <FileText className="w-3 h-3" />
            Copyrights
          </span>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-indigo-900 tabular-nums">
            {data.by_type.copyrights}
          </div>
          <span className="text-[11px] text-slate-500 block">
            Code & courseware
          </span>
        </div>

        {/* Card 5: Deadlines Due Soon */}
        <div className="col-span-2 lg:col-span-1 p-4 bg-white rounded-xl border border-slate-200 space-y-1">
          <span className="text-[11px] font-medium text-amber-600 uppercase tracking-wider block flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Due Soon (&le; 7d)
          </span>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-amber-800 tabular-nums">
            {data.deadlines.due_soon}
          </div>
          <span className="text-[11px] text-slate-500 block">
            {data.deadlines.overdue} currently overdue
          </span>
        </div>
      </div>

      {/* Visual Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Application Status Distribution */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Application Pipeline by Status</h2>
              <p className="text-xs text-slate-500">Distribution across active legal review stages</p>
            </div>
            <span className="text-xs font-mono text-slate-500 tabular-nums">
              {data.total_records} Active Filings
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <RechartsTooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="p-2.5 bg-slate-900 text-white rounded-lg shadow-lg text-xs space-y-1">
                          <p className="font-semibold">{payload[0].payload.name}</p>
                          <p className="text-slate-300 font-mono tabular-nums">Count: {payload[0].value}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: IP Categories Composition */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Portfolio Breakdown</h2>
              <p className="text-xs text-slate-500">Patents vs Trademarks vs Copyrights</p>
            </div>
          </div>

          <div className="h-48 w-full flex items-center justify-center">
            {typeChartData.length === 0 ? (
              <p className="text-xs text-slate-400">No records to display</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={typeChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={48}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {typeChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="p-2.5 bg-slate-900 text-white rounded-lg shadow-lg text-xs">
                            <p className="font-semibold">{payload[0].name}</p>
                            <p className="text-slate-300 font-mono tabular-nums">Count: {payload[0].value}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Clean custom legend */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-xs">
            <div className="text-center">
              <span className="block text-[11px] text-slate-500">Patents</span>
              <span className="font-mono font-semibold text-blue-700 tabular-nums">{data.by_type.patents}</span>
            </div>
            <div className="text-center">
              <span className="block text-[11px] text-slate-500">Trademarks</span>
              <span className="font-mono font-semibold text-teal-700 tabular-nums">{data.by_type.trademarks}</span>
            </div>
            <div className="text-center">
              <span className="block text-[11px] text-slate-500">Copyrights</span>
              <span className="font-mono font-semibold text-indigo-700 tabular-nums">{data.by_type.copyrights}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recently Added Records Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Recently Registered IP Records</h2>
            <p className="text-xs text-slate-500">Most recent inventions, marks, and deposits entered into the database</p>
          </div>
          <button
            type="button"
            onClick={onNavigateToPortfolio}
            className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
          >
            <span>View Full Portfolio</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {data.recent_records.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            No records have been saved yet. Use the "Register IP" button to record your first invention.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60 text-slate-600 font-semibold">
                  <th className="py-2.5 px-4">Title & Description</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Inventor / Owner</th>
                  <th className="py-2.5 px-3">Reference #</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {data.recent_records.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 max-w-xs">
                      <button
                        type="button"
                        onClick={() => onSelectRecord(record.id)}
                        className="font-medium text-slate-900 hover:text-blue-600 text-left line-clamp-1 block transition-colors"
                      >
                        {record.title}
                      </button>
                      <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{record.description}</p>
                    </td>
                    <td className="py-3 px-3">
                      <TypeIndicator type={record.ip_type} />
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-medium text-slate-800 block truncate max-w-[160px]">
                        {record.inventor_name}
                      </span>
                      <span className="text-[11px] text-slate-400 block truncate max-w-[160px]">
                        {record.owner_name}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono tabular-nums text-slate-600">
                      {record.application_number}
                    </td>
                    <td className="py-3 px-3">
                      <StatusIndicator status={record.application_status} />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => onSelectRecord(record.id)}
                        className="px-2.5 py-1 text-[11px] font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                      >
                        Inspect Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Compliance Disclaimer Notice */}
      <LegalDisclaimer compact={true} />
    </div>
  );
};
