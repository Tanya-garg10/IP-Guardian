import React, { useState, useEffect, useCallback } from 'react';
import { IPRecord, IPType, ApplicationStatus } from '../types/ip';
import { fetchRecords, deleteRecord, getPortfolioExportCsvUrl } from '../services/api';
import { TypeIndicator } from '../components/common/TypeIndicator';
import { StatusIndicator } from '../components/common/StatusIndicator';
import { UrgencyIndicator } from '../components/common/UrgencyIndicator';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import {
  Search,
  LayoutGrid,
  List,
  Plus,
  Eye,
  Edit3,
  Trash2,
  FileSpreadsheet,
  RefreshCw,
  FolderOpen,
  Calendar,
  User,
  Building2,
  Clock,
  ArrowUpDown,
  Filter,
  CheckSquare,
  Square,
  SlidersHorizontal,
  Sparkles
} from 'lucide-react';

interface PortfolioVisualPageProps {
  onOpenNewRecord: () => void;
  onSelectRecord: (recordId: string) => void;
  onEditRecord: (record: IPRecord) => void;
  onNotify: (type: 'success' | 'error', title: string, message?: string) => void;
}

export const PortfolioVisualPage: React.FC<PortfolioVisualPageProps> = ({
  onOpenNewRecord,
  onSelectRecord,
  onEditRecord,
  onNotify
}) => {
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [records, setRecords] = useState<IPRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedSort, setSelectedSort] = useState<string>('updated_desc');
  const [activePreset, setActivePreset] = useState<string>('all');

  // Bulk Selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Deletion modal state
  const [recordToDelete, setRecordToDelete] = useState<IPRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadRecords = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchRecords({
        search: searchQuery,
        type: selectedType,
        status: selectedStatus,
        sort: selectedSort,
        page,
        limit: 15
      });
      setRecords(data.records);
      setTotal(data.total);
      setTotalPages(data.total_pages);
    } catch (err: any) {
      onNotify('error', 'Failed to load IP records', err.message);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, selectedType, selectedStatus, selectedSort, page, onNotify]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  // Handle preset filters
  const applyPreset = (preset: string) => {
    setActivePreset(preset);
    setPage(1);
    if (preset === 'all') {
      setSelectedType('all');
      setSelectedStatus('all');
      setSelectedSort('updated_desc');
    } else if (preset === 'attention') {
      setSelectedType('all');
      setSelectedStatus('Under Review');
      setSelectedSort('deadline_asc');
    } else if (preset === 'patents_review') {
      setSelectedType('Patent');
      setSelectedStatus('all');
      setSelectedSort('date_desc');
    } else if (preset === 'approved') {
      setSelectedType('all');
      setSelectedStatus('Approved');
      setSelectedSort('date_desc');
    }
  };

  const handleConfirmDelete = async () => {
    if (!recordToDelete) return;
    setIsDeleting(true);
    try {
      await deleteRecord(recordToDelete.id);
      onNotify('success', 'Record Deleted', `"${recordToDelete.title}" and its documents have been removed.`);
      setRecordToDelete(null);
      loadRecords();
    } catch (err: any) {
      onNotify('error', 'Deletion Failed', err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleSelectAll = () => {
    if (selectedIds.size === records.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(records.map(r => r.id)));
    }
  };

  const handleToggleSelectOne = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const calculateDeadline = (dateStr: string | null) => {
    if (!dateStr) return { days: null, urgency: 'none' as const };
    const today = new Date('2026-10-11T00:00:00.000Z');
    const target = new Date(`${dateStr}T00:00:00.000Z`);
    const diff = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    let urgency: 'overdue' | 'due_soon' | 'upcoming' = 'upcoming';
    if (diff < 0) urgency = 'overdue';
    else if (diff <= 7) urgency = 'due_soon';
    return { days: diff, urgency };
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Top Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1E2A49]">
            Intellectual Property Portfolio
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Switchable visual dossier and structured registry table for university disclosures
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Switcher */}
          <div className="flex items-center p-1 bg-white border border-[#E7E3D8] rounded-xl shadow-2xs">
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                viewMode === 'cards'
                  ? 'bg-[#1E2A49] text-white shadow-xs'
                  : 'text-slate-600 hover:text-[#1E2A49]'
              }`}
              title="Card Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cards</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                viewMode === 'table'
                  ? 'bg-[#1E2A49] text-white shadow-xs'
                  : 'text-slate-600 hover:text-[#1E2A49]'
              }`}
              title="Table View"
            >
              <List className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Table</span>
            </button>
          </div>

          {/* Export CSV */}
          <a
            href={getPortfolioExportCsvUrl()}
            download
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-[#E7E3D8] hover:bg-slate-50 rounded-xl transition-colors shadow-2xs"
            title="Download CSV Portfolio Export"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-[#12633C]" />
            <span className="hidden sm:inline">Export CSV</span>
          </a>

          {/* Add Record */}
          <button
            type="button"
            onClick={onOpenNewRecord}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#4563EB] hover:bg-[#344ec7] rounded-xl shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Record</span>
          </button>
        </div>
      </div>

      {/* Filter Presets Strip */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 mr-1">
          <SlidersHorizontal className="w-3 h-3" />
          Presets:
        </span>
        {[
          { id: 'all', label: `All Assets (${total})` },
          { id: 'attention', label: 'Needs Immediate Attention' },
          { id: 'patents_review', label: 'Patents Portfolio' },
          { id: 'approved', label: 'Approved & Granted Assets' }
        ].map(p => (
          <button
            key={p.id}
            type="button"
            onClick={() => applyPreset(p.id)}
            className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
              activePreset === p.id
                ? 'bg-[#1E2A49] text-white shadow-2xs'
                : 'bg-white border border-[#E7E3D8] text-slate-600 hover:border-slate-300 hover:text-[#1E2A49]'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Search & Dynamic Filter Controls */}
      <div className="bg-white rounded-2xl border border-[#E7E3D8] p-4 space-y-3 shadow-2xs">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search Box */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search by title, inventor, owner, or application #..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-[#E7E3D8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4563EB]/20 bg-[#F8F7F3]"
            />
          </div>

          {/* Type Segmented Filter */}
          <div className="md:col-span-4 flex items-center gap-1 p-1 bg-[#F8F7F3] rounded-xl border border-[#E7E3D8]/80">
            {[
              { id: 'all', label: 'All' },
              { id: 'Patent', label: 'Patents' },
              { id: 'Trademark', label: 'Trademarks' },
              { id: 'Copyright', label: 'Copyrights' }
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setSelectedType(tab.id);
                  setActivePreset('');
                  setPage(1);
                }}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                  selectedType === tab.id
                    ? 'bg-white text-[#1E2A49] shadow-2xs'
                    : 'text-slate-500 hover:text-[#1E2A49]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Status Dropdown */}
          <div className="md:col-span-3 flex items-center gap-2">
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setActivePreset('');
                setPage(1);
              }}
              className="w-full px-3 py-2 text-xs border border-[#E7E3D8] bg-[#F8F7F3] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4563EB]/20 font-medium"
            >
              <option value="all">All Lifecycle Statuses</option>
              <option value="Idea">Idea</option>
              <option value="Draft">Draft</option>
              <option value="Filed">Filed</option>
              <option value="Under Review">Under Review</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Second Row: Sort & Active Counter */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-2 text-slate-500">
            <span>Showing <strong className="text-[#1E2A49] font-mono">{records.length}</strong> of <strong className="text-[#1E2A49] font-mono">{total}</strong> records</span>
            {(searchQuery || selectedType !== 'all' || selectedStatus !== 'all') && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedType('all');
                  setSelectedStatus('all');
                  setSelectedSort('updated_desc');
                  setActivePreset('all');
                  setPage(1);
                }}
                className="text-[#4563EB] hover:underline font-semibold ml-2"
              >
                Clear Filters
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500 text-xs">Sort:</span>
            <select
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value)}
              className="px-2.5 py-1 text-xs border border-[#E7E3D8] bg-white rounded-lg focus:outline-none font-medium"
            >
              <option value="updated_desc">Recently Updated</option>
              <option value="date_desc">Filing Date (Newest)</option>
              <option value="deadline_asc">Upcoming Deadline</option>
              <option value="title_asc">Title (A to Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content: Card View OR Table View */}
      {isLoading ? (
        <div className="py-24 flex flex-col items-center justify-center space-y-3">
          <div className="w-8 h-8 border-2 border-[#4563EB] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-500 font-mono">Querying institutional records...</p>
        </div>
      ) : records.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E7E3D8] p-12 text-center space-y-3">
          <div className="w-12 h-12 bg-[#F8F7F3] text-slate-400 rounded-2xl flex items-center justify-center mx-auto border border-[#E7E3D8]">
            <FolderOpen className="w-6 h-6 text-[#4563EB]" />
          </div>
          <h3 className="text-sm font-bold text-[#1E2A49]">No Intellectual Property Records Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
            No records matched your search query and filters. Adjust your criteria or register a new invention disclosure.
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={onOpenNewRecord}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#4563EB] hover:bg-[#344ec7] rounded-xl shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Register New IP Asset</span>
            </button>
          </div>
        </div>
      ) : viewMode === 'cards' ? (
        /* VISUAL CARD GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {records.map((record) => {
            const deadline = calculateDeadline(record.next_deadline);
            const isPatent = record.ip_type === 'Patent';
            const isTrademark = record.ip_type === 'Trademark';

            return (
              <div
                key={record.id}
                className="bg-white rounded-2xl border border-[#E7E3D8] hover:border-[#4563EB]/40 hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
              >
                {/* Card Top Banner with IP Category Color Accent */}
                <div className={`h-1.5 w-full ${
                  isPatent ? 'bg-[#4563EB]' : isTrademark ? 'bg-[#12633C]' : 'bg-[#55349E]'
                }`} />

                <div className="p-5 space-y-3.5 flex-1">
                  {/* Category & Status Row */}
                  <div className="flex items-center justify-between">
                    <TypeIndicator type={record.ip_type} />
                    <StatusIndicator status={record.application_status} />
                  </div>

                  {/* Title & Reference */}
                  <div>
                    <button
                      type="button"
                      onClick={() => onSelectRecord(record.id)}
                      className="text-left font-bold text-sm text-[#1E2A49] group-hover:text-[#4563EB] transition-colors line-clamp-2 block leading-snug"
                    >
                      {record.title}
                    </button>
                    <span className="text-[11px] font-mono text-slate-500 block mt-1">
                      {record.application_number}
                    </span>
                  </div>

                  {/* Abstract Snippet */}
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {record.description}
                  </p>

                  {/* Ownership & Inventor */}
                  <div className="pt-2 border-t border-slate-100 space-y-1 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-600 truncate">
                      <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{record.inventor_name}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-500 text-[11px] truncate">
                      <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{record.owner_name}</span>
                    </div>
                  </div>

                  {/* Deadline Notice */}
                  <div className="p-2.5 bg-[#F8F7F3] rounded-xl border border-[#E7E3D8]/80 text-xs">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                      Statutory Deadline
                    </span>
                    <UrgencyIndicator
                      urgency={deadline.urgency}
                      daysRemaining={deadline.days}
                      dateStr={record.next_deadline}
                      showDate={true}
                    />
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="p-3 bg-[#F8F7F3]/60 border-t border-[#E7E3D8] flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-mono">
                    Updated {new Date(record.updated_at).toLocaleDateString()}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => onSelectRecord(record.id)}
                      className="px-2.5 py-1 text-xs font-semibold text-[#4563EB] hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      Inspect
                    </button>
                    <button
                      type="button"
                      onClick={() => onEditRecord(record)}
                      className="p-1.5 text-slate-400 hover:text-[#1E2A49] rounded-lg transition-colors"
                      title="Edit Record"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setRecordToDelete(record)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                      title="Delete Record"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* STRUCTURED TABLE VIEW */
        <div className="bg-white rounded-2xl border border-[#E7E3D8] overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#E7E3D8] bg-[#F8F7F3] text-slate-600 font-semibold">
                  <th className="py-3 px-4 w-8">
                    <input
                      type="checkbox"
                      checked={selectedIds.size === records.length && records.length > 0}
                      onChange={handleToggleSelectAll}
                      className="rounded text-[#4563EB]"
                    />
                  </th>
                  <th className="py-3 px-3">Title & Summary</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Inventor / Owner</th>
                  <th className="py-3 px-3">Reference #</th>
                  <th className="py-3 px-3">Filing Date</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Next Deadline</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {records.map((record) => {
                  const deadline = calculateDeadline(record.next_deadline);
                  const isChecked = selectedIds.has(record.id);

                  return (
                    <tr
                      key={record.id}
                      className={`hover:bg-[#F8F7F3]/80 transition-colors ${isChecked ? 'bg-blue-50/40' : ''}`}
                    >
                      <td className="py-3 px-4">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleSelectOne(record.id)}
                          className="rounded text-[#4563EB]"
                        />
                      </td>

                      <td className="py-3 px-3 max-w-xs">
                        <button
                          type="button"
                          onClick={() => onSelectRecord(record.id)}
                          className="font-bold text-[#1E2A49] hover:text-[#4563EB] text-left line-clamp-1 block transition-colors"
                        >
                          {record.title}
                        </button>
                        <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{record.description}</p>
                      </td>

                      <td className="py-3 px-3">
                        <TypeIndicator type={record.ip_type} />
                      </td>

                      <td className="py-3 px-3">
                        <span className="font-semibold text-[#1E2A49] block truncate max-w-[140px]">
                          {record.inventor_name}
                        </span>
                        <span className="text-[11px] text-slate-400 block truncate max-w-[140px]">
                          {record.owner_name}
                        </span>
                      </td>

                      <td className="py-3 px-3 font-mono text-[#1E2A49]">
                        {record.application_number}
                      </td>

                      <td className="py-3 px-3 font-mono text-slate-600 whitespace-nowrap">
                        {record.filing_date}
                      </td>

                      <td className="py-3 px-3">
                        <StatusIndicator status={record.application_status} />
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap">
                        <UrgencyIndicator
                          urgency={deadline.urgency}
                          daysRemaining={deadline.days}
                          dateStr={record.next_deadline}
                          showDate={true}
                        />
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => onSelectRecord(record.id)}
                            className="p-1.5 text-slate-400 hover:text-[#4563EB] rounded-lg transition-colors"
                            title="Inspect Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onEditRecord(record)}
                            className="p-1.5 text-slate-400 hover:text-[#1E2A49] rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setRecordToDelete(record)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="p-3.5 bg-white rounded-2xl border border-[#E7E3D8] flex items-center justify-between text-xs text-slate-600 shadow-2xs">
          <span>Page <strong className="font-mono text-[#1E2A49]">{page}</strong> of <strong className="font-mono text-[#1E2A49]">{totalPages}</strong></span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              className="px-3 py-1 bg-[#F8F7F3] border border-[#E7E3D8] rounded-xl text-slate-700 disabled:opacity-40 hover:bg-slate-100 font-semibold"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              className="px-3 py-1 bg-[#F8F7F3] border border-[#E7E3D8] rounded-xl text-slate-700 disabled:opacity-40 hover:bg-slate-100 font-semibold"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(recordToDelete)}
        onClose={() => setRecordToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Intellectual Property Record"
        message={`Are you sure you want to permanently delete "${recordToDelete?.title}" (${recordToDelete?.application_number})? All supporting documents in the vault will be purged.`}
        confirmLabel="Delete Record"
        isDestructive={true}
        isLoading={isDeleting}
      />
    </div>
  );
};
