import React, { useState, useEffect } from 'react';
import { DeadlineItem, DeadlineUrgency } from '../types/ip';
import { fetchDeadlines, toggleTaskCompletion } from '../services/api';
import { TypeIndicator } from '../components/common/TypeIndicator';
import { StatusIndicator } from '../components/common/StatusIndicator';
import { UrgencyIndicator } from '../components/common/UrgencyIndicator';
import { LegalDisclaimer } from '../components/common/LegalDisclaimer';
import {
  Clock,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  ShieldAlert,
  Search,
  Check,
  CalendarDays,
  ListOrdered
} from 'lucide-react';

interface DeadlinesPageProps {
  onSelectRecord: (recordId: string) => void;
  onNotify: (type: 'success' | 'error', title: string, message?: string) => void;
}

export const DeadlinesPage: React.FC<DeadlinesPageProps> = ({
  onSelectRecord,
  onNotify
}) => {
  const [items, setItems] = useState<DeadlineItem[]>([]);
  const [referenceDate, setReferenceDate] = useState('2026-10-11');
  const [selectedGroup, setSelectedGroup] = useState<'all' | 'overdue' | 'due_soon' | 'upcoming' | 'completed'>('all');
  const [viewStyle, setViewStyle] = useState<'timeline' | 'table'>('timeline');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const loadDeadlines = async (refDate?: string) => {
    setIsLoading(true);
    try {
      const data = await fetchDeadlines(refDate || referenceDate);
      setItems(data.items);
      setReferenceDate(data.reference_date);
    } catch (err: any) {
      onNotify('error', 'Failed to calculate deadlines', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDeadlines();
  }, []);

  const handleToggleCompleted = async (recordId: string) => {
    try {
      await toggleTaskCompletion(recordId);
      loadDeadlines();
      onNotify('success', 'Task Updated', 'Administrative task status updated.');
    } catch (err: any) {
      onNotify('error', 'Update Failed', err.message);
    }
  };

  const overdueItems = items.filter(i => i.urgency === 'overdue' && !i.deadline_completed);
  const dueSoonItems = items.filter(i => i.urgency === 'due_soon' && !i.deadline_completed);
  const upcomingItems = items.filter(i => i.urgency === 'upcoming' && !i.deadline_completed);
  const completedItems = items.filter(i => i.deadline_completed);

  // Filtered items
  const filtered = items.filter(item => {
    if (selectedGroup === 'completed') {
      if (!item.deadline_completed) return false;
    } else if (selectedGroup !== 'all') {
      if (item.deadline_completed) return false;
      if (item.urgency !== selectedGroup) return false;
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.application_number.toLowerCase().includes(q) ||
        item.owner_name.toLowerCase().includes(q) ||
        item.inventor_name.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1E2A49]">
            Deadline Command Center
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Statutory office action monitoring, renewal countdowns, and administrative compliance tasks
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Reference Date Switcher */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#E7E3D8] rounded-xl text-xs text-slate-600 shadow-2xs">
            <Calendar className="w-3.5 h-3.5 text-[#4563EB]" />
            <span className="text-[11px] text-slate-500">System Date:</span>
            <input
              type="date"
              value={referenceDate}
              onChange={(e) => {
                setReferenceDate(e.target.value);
                loadDeadlines(e.target.value);
              }}
              className="text-xs font-mono font-medium text-[#1E2A49] border-none bg-transparent focus:outline-none"
            />
          </div>

          {/* View Toggle */}
          <div className="flex items-center p-1 bg-white border border-[#E7E3D8] rounded-xl shadow-2xs">
            <button
              type="button"
              onClick={() => setViewStyle('timeline')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 ${
                viewStyle === 'timeline' ? 'bg-[#1E2A49] text-white' : 'text-slate-600'
              }`}
              title="Chronological Timeline"
            >
              <CalendarDays className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewStyle('table')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 ${
                viewStyle === 'table' ? 'bg-[#1E2A49] text-white' : 'text-slate-600'
              }`}
              title="Table Grid"
            >
              <ListOrdered className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => loadDeadlines()}
            className="p-2 text-slate-600 bg-white border border-[#E7E3D8] hover:bg-slate-50 rounded-xl transition-colors shadow-2xs"
            title="Recalculate Deadlines"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Task Group Overview Cards with Muted Coral & Mint accents */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Overdue */}
        <button
          type="button"
          onClick={() => setSelectedGroup('overdue')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            selectedGroup === 'overdue'
              ? 'border-[#F2CAD2] bg-[#F9E2E7] shadow-xs'
              : 'border-[#E7E3D8] bg-white hover:border-[#F2CAD2] hover:bg-[#F9E2E7]/40'
          }`}
        >
          <span className="text-[10px] font-bold text-[#9C243E] uppercase tracking-wider block mb-1 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" />
            Overdue Tasks
          </span>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-[#9C243E] tabular-nums">
            {overdueItems.length}
          </div>
          <p className="text-[11px] text-[#9C243E]/80 mt-0.5 truncate">Requires extension request</p>
        </button>

        {/* Due Soon */}
        <button
          type="button"
          onClick={() => setSelectedGroup('due_soon')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            selectedGroup === 'due_soon'
              ? 'border-amber-300 bg-amber-50 shadow-xs'
              : 'border-[#E7E3D8] bg-white hover:border-amber-200 hover:bg-amber-50/40'
          }`}
        >
          <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block mb-1 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            Due Soon (&le; 7 Days)
          </span>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-amber-900 tabular-nums">
            {dueSoonItems.length}
          </div>
          <p className="text-[11px] text-amber-800/80 mt-0.5 truncate">High priority review</p>
        </button>

        {/* Upcoming */}
        <button
          type="button"
          onClick={() => setSelectedGroup('upcoming')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            selectedGroup === 'upcoming'
              ? 'border-[#D9C8FF] bg-[#EFE8FF] shadow-xs'
              : 'border-[#E7E3D8] bg-white hover:border-[#D9C8FF] hover:bg-[#EFE8FF]/40'
          }`}
        >
          <span className="text-[10px] font-bold text-[#55349E] uppercase tracking-wider block mb-1 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#55349E]" />
            Upcoming Roadmap
          </span>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-[#55349E] tabular-nums">
            {upcomingItems.length}
          </div>
          <p className="text-[11px] text-[#55349E]/80 mt-0.5 truncate">Standard administrative dates</p>
        </button>

        {/* Completed */}
        <button
          type="button"
          onClick={() => setSelectedGroup('completed')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            selectedGroup === 'completed'
              ? 'border-[#BCE8D3] bg-[#DDF5E9] shadow-xs'
              : 'border-[#E7E3D8] bg-white hover:border-[#BCE8D3] hover:bg-[#DDF5E9]/40'
          }`}
        >
          <span className="text-[10px] font-bold text-[#12633C] uppercase tracking-wider block mb-1 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#12633C]" />
            Completed Tasks
          </span>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-[#12633C] tabular-nums">
            {completedItems.length}
          </div>
          <p className="text-[11px] text-[#12633C]/80 mt-0.5 truncate">Marked as resolved by team</p>
        </button>
      </div>

      {/* Search & Filter Strip */}
      <div className="bg-white rounded-2xl border border-[#E7E3D8] p-4 space-y-3 shadow-2xs">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks by invention title, reference #, or inventor..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-[#E7E3D8] bg-[#F8F7F3] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4563EB]/20"
            />
          </div>

          <div className="md:col-span-6 flex items-center gap-1 p-1 bg-[#F8F7F3] rounded-xl border border-[#E7E3D8]/80 overflow-x-auto">
            {[
              { id: 'all', label: `All (${items.length})` },
              { id: 'overdue', label: `Overdue (${overdueItems.length})` },
              { id: 'due_soon', label: `Due Soon (${dueSoonItems.length})` },
              { id: 'upcoming', label: `Upcoming (${upcomingItems.length})` },
              { id: 'completed', label: `Completed (${completedItems.length})` }
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedGroup(tab.id as any)}
                className={`flex-1 py-1 px-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                  selectedGroup === tab.id
                    ? 'bg-white text-[#1E2A49] shadow-2xs'
                    : 'text-slate-500 hover:text-[#1E2A49]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Deadlines Display */}
      {viewStyle === 'timeline' ? (
        /* CHRONOLOGICAL TIMELINE VIEW */
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-[#E7E3D8] text-xs text-slate-500">
              No tasks match the active filter criteria.
            </div>
          ) : (
            filtered.map((item) => {
              const isOverdue = item.urgency === 'overdue' && !item.deadline_completed;
              const isDueSoon = item.urgency === 'due_soon' && !item.deadline_completed;

              return (
                <div
                  key={item.record_id}
                  className={`bg-white rounded-2xl border p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all shadow-2xs hover:border-slate-300 ${
                    isOverdue
                      ? 'border-[#F2CAD2] bg-[#F9E2E7]/25'
                      : isDueSoon
                      ? 'border-amber-200 bg-amber-50/25'
                      : 'border-[#E7E3D8]'
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <button
                      type="button"
                      onClick={() => handleToggleCompleted(item.record_id)}
                      className={`mt-1 w-5 h-5 rounded-lg border flex items-center justify-center transition-colors ${
                        item.deadline_completed
                          ? 'bg-[#12633C] border-[#12633C] text-white'
                          : 'border-slate-300 bg-white hover:border-[#4563EB]'
                      }`}
                      title={item.deadline_completed ? 'Reopen Task' : 'Mark Task Completed'}
                    >
                      {item.deadline_completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </button>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <TypeIndicator type={item.ip_type} />
                        <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded">
                          {item.application_number}
                        </span>
                        <StatusIndicator status={item.application_status} />
                      </div>

                      <button
                        type="button"
                        onClick={() => onSelectRecord(item.record_id)}
                        className={`text-left text-sm font-bold truncate block transition-colors ${
                          item.deadline_completed
                            ? 'line-through text-slate-400'
                            : 'text-[#1E2A49] hover:text-[#4563EB]'
                        }`}
                      >
                        {item.title}
                      </button>

                      <p className="text-xs text-slate-500 mt-0.5 truncate">
                        {item.notes || 'Administrative examination action pending.'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0 justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                    <div className="text-left sm:text-right">
                      <UrgencyIndicator
                        urgency={item.deadline_completed ? 'none' : item.urgency}
                        daysRemaining={item.days_remaining}
                        dateStr={item.deadline_date}
                        showDate={true}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => onSelectRecord(item.record_id)}
                      className="px-3.5 py-1.5 text-xs font-semibold bg-[#4563EB] hover:bg-[#344ec7] text-white rounded-xl transition-colors"
                    >
                      Open
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* TABLE GRID VIEW */
        <div className="bg-white rounded-2xl border border-[#E7E3D8] overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#E7E3D8] bg-[#F8F7F3] text-slate-600 font-semibold">
                  <th className="py-3 px-4 w-10">Status</th>
                  <th className="py-3 px-3">Invention / Asset</th>
                  <th className="py-3 px-3">Type</th>
                  <th className="py-3 px-3">Reference #</th>
                  <th className="py-3 px-3">Deadline Date</th>
                  <th className="py-3 px-3">Urgency Countdown</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filtered.map(item => (
                  <tr key={item.record_id} className="hover:bg-[#F8F7F3]/70">
                    <td className="py-3 px-4">
                      <button
                        type="button"
                        onClick={() => handleToggleCompleted(item.record_id)}
                        className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                          item.deadline_completed
                            ? 'bg-[#12633C] border-[#12633C] text-white'
                            : 'border-slate-300 bg-white'
                        }`}
                      >
                        {item.deadline_completed && <Check className="w-3 h-3 stroke-[3]" />}
                      </button>
                    </td>
                    <td className="py-3 px-3 max-w-xs">
                      <button
                        type="button"
                        onClick={() => onSelectRecord(item.record_id)}
                        className={`font-bold text-left line-clamp-1 block ${
                          item.deadline_completed ? 'line-through text-slate-400' : 'text-[#1E2A49] hover:text-[#4563EB]'
                        }`}
                      >
                        {item.title}
                      </button>
                    </td>
                    <td className="py-3 px-3"><TypeIndicator type={item.ip_type} /></td>
                    <td className="py-3 px-3 font-mono">{item.application_number}</td>
                    <td className="py-3 px-3 font-mono">{item.deadline_date || 'None'}</td>
                    <td className="py-3 px-3">
                      <UrgencyIndicator
                        urgency={item.deadline_completed ? 'none' : item.urgency}
                        daysRemaining={item.days_remaining}
                        dateStr={item.deadline_date}
                        showDate={false}
                      />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => onSelectRecord(item.record_id)}
                        className="px-2.5 py-1 text-xs font-semibold text-[#4563EB] hover:underline"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Mandatory Statutory Disclaimer Notice */}
      <LegalDisclaimer />
    </div>
  );
};
