import React, { useState, useEffect, useCallback } from 'react';
import { IPRecord, IPType, ApplicationStatus } from '../types/ip';
import { fetchRecords, deleteRecord } from '../services/api';
import { TypeIndicator } from '../components/common/TypeIndicator';
import { StatusIndicator } from '../components/common/StatusIndicator';
import { UrgencyIndicator } from '../components/common/UrgencyIndicator';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import {
  Search,
  Filter,
  PlusCircle,
  Eye,
  Edit2,
  Trash2,
  ArrowUpDown,
  RefreshCw,
  FolderOpen
} from 'lucide-react';

interface PortfolioPageProps {
  onOpenNewRecord: () => void;
  onSelectRecord: (recordId: string) => void;
  onEditRecord: (record: IPRecord) => void;
  onNotify: (type: 'success' | 'error', title: string, message?: string) => void;
}

export const PortfolioPage: React.FC<PortfolioPageProps> = ({
  onOpenNewRecord,
  onSelectRecord,
  onEditRecord,
  onNotify
}) => {
  const [records, setRecords] = useState<IPRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedSort, setSelectedSort] = useState<string>('date_desc');

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

  // Handle record deletion
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

  // Calculate days remaining relative to reference date (2026-10-11)
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

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedType('all');
    setSelectedStatus('all');
    setSelectedSort('date_desc');
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Intellectual Property Portfolio
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Search, filter, inspect, and manage university inventions, trademarks, and copyrights
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadRecords}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors"
            title="Refresh Table"
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

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3.5">
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
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          {/* Type Filter Buttons */}
          <div className="md:col-span-4 flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
            {[
              { id: 'all', label: 'All Types' },
              { id: 'Patent', label: 'Patents' },
              { id: 'Trademark', label: 'Trademarks' },
              { id: 'Copyright', label: 'Copyrights' }
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setSelectedType(tab.id);
                  setPage(1);
                }}
                className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  selectedType === tab.id
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
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
                setPage(1);
              }}
              className="w-full px-3 py-2 text-xs border border-slate-200 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
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
            <span>Showing <strong className="text-slate-800 font-mono tabular-nums">{records.length}</strong> of <strong className="text-slate-800 font-mono tabular-nums">{total}</strong> records</span>
            {(searchQuery || selectedType !== 'all' || selectedStatus !== 'all') && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-blue-600 hover:underline text-xs ml-2"
              >
                Clear Filters
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500 text-xs">Sort by:</span>
            <select
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value)}
              className="px-2.5 py-1 text-xs border border-slate-200 bg-white rounded-md focus:outline-none"
            >
              <option value="date_desc">Filing Date (Newest)</option>
              <option value="date_asc">Filing Date (Oldest)</option>
              <option value="title_asc">Title (A to Z)</option>
              <option value="deadline_asc">Upcoming Deadline</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Records Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-slate-500">Retrieving portfolio records...</p>
          </div>
        ) : records.length === 0 ? (
          <div className="py-16 px-4 text-center space-y-3">
            <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-xl flex items-center justify-center mx-auto">
              <FolderOpen className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-slate-800">No Intellectual Property Records Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
              {searchQuery || selectedType !== 'all' || selectedStatus !== 'all'
                ? 'No records match the current search query and filters. Try adjusting your search criteria.'
                : 'Your portfolio currently has no registered IP records. Begin by recording an invention.'}
            </p>
            <div className="pt-2">
              {searchQuery || selectedType !== 'all' || selectedStatus !== 'all' ? (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Reset Search & Filters
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onOpenNewRecord}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Register First Record</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-600 font-semibold">
                  <th className="py-3 px-4">Title & Invention Overview</th>
                  <th className="py-3 px-3">Type</th>
                  <th className="py-3 px-3">Inventor / Owner</th>
                  <th className="py-3 px-3">Application Ref</th>
                  <th className="py-3 px-3">Filing Date</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Next Deadline</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {records.map((record) => {
                  const deadline = calculateDeadline(record.next_deadline);

                  return (
                    <tr key={record.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Title & Description */}
                      <td className="py-3 px-4 max-w-xs sm:max-w-sm">
                        <button
                          type="button"
                          onClick={() => onSelectRecord(record.id)}
                          className="font-semibold text-slate-900 hover:text-blue-600 text-left line-clamp-1 block transition-colors"
                        >
                          {record.title}
                        </button>
                        <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                          {record.description}
                        </p>
                      </td>

                      {/* IP Type */}
                      <td className="py-3 px-3">
                        <TypeIndicator type={record.ip_type} />
                      </td>

                      {/* Inventor / Owner */}
                      <td className="py-3 px-3">
                        <span className="font-medium text-slate-800 block truncate max-w-[150px]">
                          {record.inventor_name}
                        </span>
                        <span className="text-[11px] text-slate-400 block truncate max-w-[150px]">
                          {record.owner_name}
                        </span>
                      </td>

                      {/* Application Number */}
                      <td className="py-3 px-3 font-mono tabular-nums text-slate-700">
                        {record.application_number}
                      </td>

                      {/* Filing Date */}
                      <td className="py-3 px-3 font-mono tabular-nums text-slate-600 whitespace-nowrap">
                        {record.filing_date}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3">
                        <StatusIndicator status={record.application_status} />
                      </td>

                      {/* Next Deadline */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <UrgencyIndicator
                          urgency={deadline.urgency}
                          daysRemaining={deadline.days}
                          dateStr={record.next_deadline}
                          showDate={true}
                        />
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => onSelectRecord(record.id)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Inspect Details & Vault"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onEditRecord(record)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Edit Record"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setRecordToDelete(record)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete Record"
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
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs text-slate-600">
            <span>Page <strong className="font-mono tabular-nums">{page}</strong> of <strong className="font-mono tabular-nums">{totalPages}</strong></span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="px-2.5 py-1 bg-white border border-slate-200 rounded text-slate-700 disabled:opacity-40 hover:bg-slate-50"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                className="px-2.5 py-1 bg-white border border-slate-200 rounded text-slate-700 disabled:opacity-40 hover:bg-slate-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Dialog for Deletion */}
      <ConfirmDialog
        isOpen={Boolean(recordToDelete)}
        onClose={() => setRecordToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Intellectual Property Record"
        message={`Are you sure you want to permanently delete "${recordToDelete?.title}" (${recordToDelete?.application_number})? All associated documents will also be purged from storage. This action cannot be undone.`}
        confirmLabel="Delete Record"
        isDestructive={true}
        isLoading={isDeleting}
      />
    </div>
  );
};
