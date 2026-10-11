import React, { useState, useEffect } from 'react';
import { AnalyticsSummary, IPRecord, UserRole } from '../types/ip';
import { fetchAnalytics, fetchDeadlines, toggleTaskCompletion } from '../services/api';
import { TypeIndicator } from '../components/common/TypeIndicator';
import { StatusIndicator } from '../components/common/StatusIndicator';
import { UrgencyIndicator } from '../components/common/UrgencyIndicator';
import { LegalDisclaimer } from '../components/common/LegalDisclaimer';
import {
  Shield,
  Lightbulb,
  Bookmark,
  FileText,
  Clock,
  AlertTriangle,
  Plus,
  ArrowRight,
  RefreshCw,
  Activity,
  CheckCircle2,
  Sparkles,
  Check,
  Calendar,
  Building2,
  UserCheck
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

interface DashboardCommandPageProps {
  currentRole: UserRole;
  onOpenNewRecord: () => void;
  onNavigateToPortfolio: () => void;
  onNavigateToDeadlines: () => void;
  onNavigateToHealth: () => void;
  onSelectRecord: (recordId: string) => void;
  onOpenAiAssistant: () => void;
}

export const DashboardCommandPage: React.FC<DashboardCommandPageProps> = ({
  currentRole,
  onOpenNewRecord,
  onNavigateToPortfolio,
  onNavigateToDeadlines,
  onNavigateToHealth,
  onSelectRecord,
  onOpenAiAssistant
}) => {
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [deadlines, setDeadlines] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [summary, deadlineData] = await Promise.all([
        fetchAnalytics(),
        fetchDeadlines()
      ]);
      setData(summary);
      setDeadlines(deadlineData.items);
    } catch (err: any) {
      setError(err.message || 'Failed to load live analytics');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleTask = async (recordId: string) => {
    try {
      await toggleTaskCompletion(recordId);
      loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to update task');
    }
  };

  if (isLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 border-2 border-[#4563EB] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-500 font-mono">Synchronizing Command Center metrics...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6">
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs flex items-center justify-between">
          <span>{error || 'Unable to retrieve dashboard analytics.'}</span>
          <button
            onClick={loadData}
            className="px-3 py-1 bg-white border border-rose-200 rounded-lg text-rose-800 text-xs font-semibold"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const typeChartData = [
    { name: 'Patents', value: data.by_type.patents, color: '#4563EB' },
    { name: 'Trademarks', value: data.by_type.trademarks, color: '#106941' },
    { name: 'Copyrights', value: data.by_type.copyrights, color: '#55349E' }
  ].filter(d => d.value > 0);

  const statusChartData = [
    { name: 'Idea', count: data.by_status.idea, fill: '#818cf8' },
    { name: 'Draft', count: data.by_status.draft, fill: '#94a3b8' },
    { name: 'Filed', count: data.by_status.filed, fill: '#12633C' },
    { name: 'Under Review', count: data.by_status.under_review, fill: '#4563EB' },
    { name: 'Approved', count: data.by_status.approved, fill: '#10b981' },
    { name: 'Rejected', count: data.by_status.rejected, fill: '#f43f5e' }
  ];

  const urgentTasks = deadlines.filter(d => (d.urgency === 'overdue' || d.urgency === 'due_soon') && !d.deadline_completed);

  return (
    <div className="space-y-6">
      {/* Personalized Greeting & Workspace Summary Banner */}
      <div className="p-6 rounded-2xl bg-white border border-[#E7E3D8] shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-[#4563EB] bg-[#EFE8FF] px-2 py-0.5 rounded">
              Role: {currentRole}
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs text-slate-500 font-mono">Reference Date: 2026-10-11</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1E2A49]">
            Welcome back, Dr. Sarah Lin
          </h1>
          <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
            The Apex University innovation portfolio currently manages <strong className="text-[#1E2A49] font-mono">{data.total_records} assets</strong>.
            {data.deadlines.overdue > 0 ? (
              <span className="text-[#9C243E] font-semibold"> {data.deadlines.overdue} statutory deadline(s) require prompt attention.</span>
            ) : (
              <span> All office action deadlines are on schedule.</span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onOpenAiAssistant}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#EFE8FF] hover:bg-[#E4D8FF] text-[#55349E] text-xs font-semibold rounded-xl border border-[#D9C8FF] transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Assistant</span>
          </button>
          <button
            type="button"
            onClick={onOpenNewRecord}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#4563EB] hover:bg-[#344ec7] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Register New IP</span>
          </button>
        </div>
      </div>

      {/* Overview Stat Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {/* Total Assets */}
        <div className="p-4 bg-white rounded-2xl border border-[#E7E3D8] space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Total IP Assets
          </span>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-[#1E2A49] tabular-nums">
            {data.total_records}
          </div>
          <span className="text-[11px] text-slate-500 block truncate">
            {data.total_documents} vaulted files
          </span>
        </div>

        {/* Patents */}
        <div className="p-4 bg-white rounded-2xl border border-[#E7E3D8] space-y-1">
          <span className="text-[10px] font-bold text-[#4563EB] uppercase tracking-wider block flex items-center gap-1">
            <Lightbulb className="w-3 h-3" />
            Patents
          </span>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-[#4563EB] tabular-nums">
            {data.by_type.patents}
          </div>
          <span className="text-[11px] text-slate-500 block truncate">
            Novel utility & BCI
          </span>
        </div>

        {/* Trademarks */}
        <div className="p-4 bg-white rounded-2xl border border-[#E7E3D8] space-y-1">
          <span className="text-[10px] font-bold text-[#12633C] uppercase tracking-wider block flex items-center gap-1">
            <Bookmark className="w-3 h-3" />
            Trademarks
          </span>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-[#12633C] tabular-nums">
            {data.by_type.trademarks}
          </div>
          <span className="text-[11px] text-slate-500 block truncate">
            Registered marks
          </span>
        </div>

        {/* Copyrights */}
        <div className="p-4 bg-white rounded-2xl border border-[#E7E3D8] space-y-1">
          <span className="text-[10px] font-bold text-[#55349E] uppercase tracking-wider block flex items-center gap-1">
            <FileText className="w-3 h-3" />
            Copyrights
          </span>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-[#55349E] tabular-nums">
            {data.by_type.copyrights}
          </div>
          <span className="text-[11px] text-slate-500 block truncate">
            Code & courseware
          </span>
        </div>

        {/* Attention / Overdue */}
        <div className="col-span-2 lg:col-span-1 p-4 bg-white rounded-2xl border border-[#E7E3D8] space-y-1">
          <span className="text-[10px] font-bold text-[#9C243E] uppercase tracking-wider block flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Action Cutoffs
          </span>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-[#9C243E] tabular-nums">
            {data.deadlines.overdue + data.deadlines.due_soon}
          </div>
          <span className="text-[11px] text-slate-500 block truncate">
            {data.deadlines.overdue} overdue · {data.deadlines.due_soon} due soon
          </span>
        </div>
      </div>

      {/* Two-Column Asymmetric Layout on Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 of 12 cols): Charts, Pipeline & Tasks Needing Attention */}
        <div className="lg:col-span-8 space-y-6">
          {/* Urgent Tasks That Need Attention */}
          {urgentTasks.length > 0 && (
            <div className="bg-white rounded-2xl border border-[#E7E3D8] p-5 space-y-3.5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-[#1E2A49] flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-[#9C243E]" />
                    <span>Tasks That Need Immediate Attention</span>
                  </h2>
                  <p className="text-xs text-slate-500">
                    Statutory office actions or specimen filing dates within the danger window
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onNavigateToDeadlines}
                  className="text-xs font-semibold text-[#4563EB] hover:underline"
                >
                  View All &rarr;
                </button>
              </div>

              <div className="space-y-2">
                {urgentTasks.slice(0, 3).map((task) => (
                  <div
                    key={task.record_id}
                    className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      task.urgency === 'overdue'
                        ? 'bg-[#F9E2E7]/70 border-[#F2CAD2]'
                        : 'bg-amber-50/70 border-amber-200'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <TypeIndicator type={task.ip_type} />
                        <span className="text-xs font-bold text-[#1E2A49] truncate">
                          {task.title}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 line-clamp-1 font-mono">
                        {task.application_number} · {task.notes || 'Office Action Pending'}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <UrgencyIndicator
                        urgency={task.urgency}
                        daysRemaining={task.days_remaining}
                        dateStr={task.deadline_date}
                        showDate={true}
                      />
                      <button
                        type="button"
                        onClick={() => handleToggleTask(task.record_id)}
                        className="px-2.5 py-1 text-xs font-semibold bg-white border border-[#E7E3D8] hover:bg-slate-50 text-[#1E2A49] rounded-lg transition-colors flex items-center gap-1"
                        title="Mark Completed"
                      >
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span>Done</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onSelectRecord(task.record_id)}
                        className="px-2.5 py-1 text-xs font-semibold bg-[#4563EB] text-white hover:bg-[#344ec7] rounded-lg transition-colors"
                      >
                        Open
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Application Pipeline by Review Stage */}
          <div className="bg-white rounded-2xl border border-[#E7E3D8] p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-[#1E2A49]">Application Pipeline Distribution</h2>
                <p className="text-xs text-slate-500">Filings categorized across active statutory examination stages</p>
              </div>
              <span className="text-xs font-mono font-medium text-slate-500">
                {data.total_records} Active Filings
              </span>
            </div>

            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <RechartsTooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="p-2.5 bg-[#1E2A49] text-white rounded-xl shadow-lg text-xs space-y-1">
                            <p className="font-bold">{payload[0].payload.name}</p>
                            <p className="text-slate-300 font-mono">Count: {payload[0].value}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Visual Deadline Timeline */}
          <div className="bg-white rounded-2xl border border-[#E7E3D8] p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-[#1E2A49] flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#4563EB]" />
                  <span>Chronological Deadline Timeline</span>
                </h2>
                <p className="text-xs text-slate-500">Upcoming office actions, renewal cutoffs & submission targets</p>
              </div>
              <button
                type="button"
                onClick={onNavigateToDeadlines}
                className="text-xs font-semibold text-[#4563EB] hover:underline"
              >
                Inspect All Deadlines
              </button>
            </div>

            <div className="space-y-3">
              {deadlines.filter(d => d.deadline_date).slice(0, 4).map((d) => (
                <div
                  key={d.record_id}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#F8F7F3] border border-[#E7E3D8] hover:border-slate-300 transition-colors"
                >
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-2">
                      <TypeIndicator type={d.ip_type} />
                      <button
                        type="button"
                        onClick={() => onSelectRecord(d.record_id)}
                        className="font-bold text-[#1E2A49] text-xs hover:text-[#4563EB] text-left truncate"
                      >
                        {d.title}
                      </button>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono block mt-0.5">
                      {d.application_number} · Assignee: {d.owner_name}
                    </span>
                  </div>

                  <div className="shrink-0 text-right">
                    <UrgencyIndicator
                      urgency={d.urgency}
                      daysRemaining={d.days_remaining}
                      dateStr={d.deadline_date}
                      showDate={true}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (4 of 12 cols): Health Score, Portfolio Breakdown & Recently Updated */}
        <div className="lg:col-span-4 space-y-6">
          {/* IP Portfolio Health Meter Card */}
          <div className="bg-white rounded-2xl border border-[#E7E3D8] p-5 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-[#1E2A49] flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-[#12633C]" />
                  <span>IP Portfolio Health</span>
                </h2>
                <p className="text-[11px] text-slate-500">Administrative completeness score</p>
              </div>
              <span className="text-2xl font-bold font-mono text-[#12633C]">
                {data.overall_completeness}%
              </span>
            </div>

            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-[#4563EB] h-full rounded-full transition-all duration-700"
                style={{ width: `${data.overall_completeness}%` }}
              />
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Based on completeness of inventor designations, reference codes, vaulted claim drafts, and confirmed deadline dates.
            </p>

            <button
              type="button"
              onClick={onNavigateToHealth}
              className="w-full py-2 px-3 text-xs font-semibold text-[#1E2A49] bg-[#DDF5E9] hover:bg-[#cceedc] rounded-xl transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Audit Portfolio Completeness</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Category Composition Donut */}
          <div className="bg-white rounded-2xl border border-[#E7E3D8] p-5 space-y-3 shadow-2xs">
            <h2 className="text-sm font-bold text-[#1E2A49]">Category Breakdown</h2>
            <div className="h-44 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={typeChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={68}
                    paddingAngle={4}
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
                          <div className="p-2 bg-[#1E2A49] text-white rounded-lg text-xs">
                            <p className="font-bold">{payload[0].name}</p>
                            <p className="font-mono text-slate-300">Count: {payload[0].value}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-xs text-center">
              <div>
                <span className="block text-[10px] text-slate-400 font-semibold uppercase">Patents</span>
                <span className="font-mono font-bold text-[#4563EB]">{data.by_type.patents}</span>
              </div>
              <div>
                <span className="block text-[10px] text-slate-400 font-semibold uppercase">Trademarks</span>
                <span className="font-mono font-bold text-[#12633C]">{data.by_type.trademarks}</span>
              </div>
              <div>
                <span className="block text-[10px] text-slate-400 font-semibold uppercase">Copyrights</span>
                <span className="font-mono font-bold text-[#55349E]">{data.by_type.copyrights}</span>
              </div>
            </div>
          </div>

          {/* Recently Updated IP Records */}
          <div className="bg-white rounded-2xl border border-[#E7E3D8] p-5 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-[#1E2A49]">Recently Updated</h2>
              <button
                type="button"
                onClick={onNavigateToPortfolio}
                className="text-[11px] font-semibold text-[#4563EB] hover:underline"
              >
                Portfolio &rarr;
              </button>
            </div>

            <div className="space-y-2">
              {data.recent_records.slice(0, 4).map((rec) => (
                <button
                  key={rec.id}
                  type="button"
                  onClick={() => onSelectRecord(rec.id)}
                  className="w-full text-left p-2.5 rounded-xl hover:bg-[#F8F7F3] border border-transparent hover:border-[#E7E3D8] transition-all group"
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-xs font-bold text-[#1E2A49] group-hover:text-[#4563EB] truncate">
                      {rec.title}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono shrink-0 ml-2">
                      {new Date(rec.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-500">
                    <TypeIndicator type={rec.ip_type} />
                    <span>·</span>
                    <span className="font-mono">{rec.application_number}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <LegalDisclaimer compact={true} />
    </div>
  );
};
