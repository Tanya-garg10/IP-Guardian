import React, { useState, useEffect } from 'react';
import { IPRecord, DocumentRecord, ActivityRecord, CompletenessBreakdown, ApplicationStatus } from '../../types/ip';
import { fetchRecordById, uploadDocument, deleteDocument, getDocumentDownloadUrl, toggleTaskCompletion } from '../../services/api';
import { TypeIndicator } from '../common/TypeIndicator';
import { StatusIndicator } from '../common/StatusIndicator';
import { UrgencyIndicator } from '../common/UrgencyIndicator';
import { LegalDisclaimer } from '../common/LegalDisclaimer';
import {
  X,
  Edit3,
  Trash2,
  Upload,
  Download,
  Calendar,
  User,
  Building2,
  FileText,
  Clock,
  CheckCircle,
  FileIcon,
  Check,
  Activity,
  History,
  ShieldAlert,
  Sparkles,
  ExternalLink,
  AlertTriangle
} from 'lucide-react';

interface RecordDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  recordId: string | null;
  onEdit: (record: IPRecord) => void;
  onDelete: (record: IPRecord) => void;
  onOpenAiAssistantWithRecord?: (record: IPRecord) => void;
  onRecordUpdated?: () => void;
}

export const RecordDetailDrawer: React.FC<RecordDetailDrawerProps> = ({
  isOpen,
  onClose,
  recordId,
  onEdit,
  onDelete,
  onOpenAiAssistantWithRecord,
  onRecordUpdated
}) => {
  const [record, setRecord] = useState<IPRecord | null>(null);
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [activities, setActivities] = useState<ActivityRecord[]>([]);
  const [completeness, setCompleteness] = useState<CompletenessBreakdown | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Tab inside drawer
  const [drawerTab, setDrawerTab] = useState<'overview' | 'documents' | 'timeline' | 'health'>('overview');

  // Upload state
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadDesc, setUploadDesc] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDeletingDocId, setIsDeletingDocId] = useState<string | null>(null);
  const [isTogglingTask, setIsTogglingTask] = useState(false);

  useEffect(() => {
    if (!recordId || !isOpen) return;

    let mounted = true;
    setIsLoading(true);
    setError(null);

    fetchRecordById(recordId)
      .then((data) => {
        if (mounted) {
          setRecord(data.record);
          setDocuments(data.documents);
          setActivities(data.activities);
          setCompleteness(data.completeness);
        }
      })
      .catch((err) => {
        if (mounted) setError(err.message || 'Failed to load record details');
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [recordId, isOpen]);

  if (!isOpen) return null;

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile || !record) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      const res = await uploadDocument(record.id, uploadFile, uploadDesc);
      setDocuments(prev => [res.document, ...prev]);
      setUploadFile(null);
      setUploadDesc('');
      if (onRecordUpdated) onRecordUpdated();
    } catch (err: any) {
      setUploadError(err.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteDoc = async (docId: string) => {
    setIsDeletingDocId(docId);
    setError(null);
    try {
      await deleteDocument(docId);
      setDocuments(prev => prev.filter(d => d.id !== docId));
      if (onRecordUpdated) onRecordUpdated();
    } catch (err: any) {
      setError(err.message || 'Failed to delete document');
    } finally {
      setIsDeletingDocId(null);
    }
  };

  const handleToggleTask = async () => {
    if (!record) return;
    setIsTogglingTask(true);
    setError(null);
    try {
      const res = await toggleTaskCompletion(record.id);
      setRecord(res.record);
      if (onRecordUpdated) onRecordUpdated();
    } catch (err: any) {
      setError(err.message || 'Failed to toggle task completion');
    } finally {
      setIsTogglingTask(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const calculateDays = (dateStr: string | null) => {
    if (!dateStr) return { days: null, urgency: 'none' as const };
    const today = new Date('2026-10-11T00:00:00.000Z');
    const target = new Date(`${dateStr}T00:00:00.000Z`);
    const diff = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    let urgency: 'overdue' | 'due_soon' | 'upcoming' = 'upcoming';
    if (diff < 0) urgency = 'overdue';
    else if (diff <= 7) urgency = 'due_soon';
    return { days: diff, urgency };
  };

  const deadlineCalc = record ? calculateDays(record.next_deadline) : { days: null, urgency: 'none' as const };
  const stages: ApplicationStatus[] = ['Idea', 'Draft', 'Filed', 'Under Review', 'Approved'];
  const currentStageIndex = record ? stages.indexOf(record.application_status) : -1;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#1E2A49]/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Slide-over Drawer */}
      <div className="relative w-full max-w-2xl bg-[#F8F7F3] border-l border-[#E7E3D8] shadow-2xl z-10 flex flex-col h-full animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-5 bg-white border-b border-[#E7E3D8] flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              {record && <TypeIndicator type={record.ip_type} />}
              {record && <StatusIndicator status={record.application_status} />}
              {record && (
                <span className="text-[11px] font-mono font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                  {record.application_number}
                </span>
              )}
            </div>
            <h2 className="text-base sm:text-lg font-bold text-[#1E2A49] leading-snug truncate">
              {record ? record.title : 'Loading Record...'}
            </h2>
            {record && (
              <p className="text-xs text-slate-500 mt-0.5 truncate">
                {record.owner_name} · Inventor: {record.inventor_name}
              </p>
            )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {record && onOpenAiAssistantWithRecord && (
              <button
                type="button"
                onClick={() => onOpenAiAssistantWithRecord(record)}
                className="p-2 text-[#55349E] bg-[#EFE8FF] hover:bg-[#E4D8FF] rounded-xl transition-colors"
                title="Analyze with AI Assistant"
              >
                <Sparkles className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
              aria-label="Close drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Strip */}
        <div className="px-5 bg-white border-b border-[#E7E3D8] flex gap-4 text-xs font-semibold">
          {[
            { id: 'overview' as const, label: 'Overview & Abstract' },
            { id: 'documents' as const, label: `Vault Files (${documents.length})` },
            { id: 'timeline' as const, label: `Activity Log (${activities.length})` },
            { id: 'health' as const, label: `Completeness (${completeness?.score ?? 0}%)` }
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setDrawerTab(tab.id)}
              className={`py-3 border-b-2 transition-colors ${
                drawerTab === tab.id
                  ? 'border-[#4563EB] text-[#4563EB]'
                  : 'border-transparent text-slate-500 hover:text-[#1E2A49]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {isLoading ? (
            <div className="py-24 flex flex-col items-center justify-center space-y-3">
              <div className="w-6 h-6 border-2 border-[#4563EB] border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-slate-500">Loading asset dossier...</p>
            </div>
          ) : error || !record ? (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs">
              {error || 'Record could not be retrieved.'}
            </div>
          ) : (
            <>
              {/* TAB 1: OVERVIEW */}
              {drawerTab === 'overview' && (
                <div className="space-y-5">
                  {/* Status Progression Tracker */}
                  <div className="p-4 bg-white rounded-2xl border border-[#E7E3D8] space-y-2">
                    <span className="text-xs font-bold text-[#1E2A49] block">
                      Statutory Lifecycle Progression
                    </span>
                    <div className="grid grid-cols-5 gap-1.5 pt-1">
                      {stages.map((stage, idx) => {
                        const isPassed = currentStageIndex >= idx;
                        const isCurrent = record.application_status === stage;
                        const isRejected = record.application_status === 'Rejected';

                        return (
                          <div
                            key={stage}
                            className={`p-2 rounded-xl border text-center transition-colors ${
                              isRejected && idx === currentStageIndex
                                ? 'border-rose-300 bg-[#F9E2E7] text-[#9C243E] font-bold'
                                : isCurrent
                                ? 'border-[#4563EB] bg-blue-50/70 text-[#4563EB] font-bold shadow-2xs'
                                : isPassed
                                ? 'border-slate-200 bg-[#DDF5E9]/50 text-[#12633C] font-medium'
                                : 'border-slate-100 bg-white text-slate-400'
                            }`}
                          >
                            <div className="flex items-center justify-center mb-1">
                              {isCurrent ? (
                                <div className="w-2 h-2 rounded-full bg-[#4563EB]" />
                              ) : isPassed ? (
                                <CheckCircle className="w-3.5 h-3.5 text-[#12633C]" />
                              ) : (
                                <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                              )}
                            </div>
                            <span className="block text-[10px] leading-tight truncate">{stage}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Deadline Quick Card */}
                  <div className="p-4 bg-white rounded-2xl border border-[#E7E3D8] flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-[#4563EB]" />
                        Next Administrative Deadline
                      </span>
                      <UrgencyIndicator
                        urgency={deadlineCalc.urgency}
                        daysRemaining={deadlineCalc.days}
                        dateStr={record.next_deadline}
                        showDate={true}
                      />
                    </div>
                    {record.next_deadline && (
                      <button
                        type="button"
                        onClick={handleToggleTask}
                        disabled={isTogglingTask}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-colors flex items-center gap-1.5 ${
                          record.deadline_completed
                            ? 'bg-[#DDF5E9] text-[#12633C] border-[#BCE8D3]'
                            : 'bg-white hover:bg-slate-50 text-slate-700 border-[#E7E3D8]'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{record.deadline_completed ? 'Marked Completed' : 'Mark as Done'}</span>
                      </button>
                    )}
                  </div>

                  {/* Technical Abstract */}
                  <div className="p-4 bg-white rounded-2xl border border-[#E7E3D8] space-y-2">
                    <span className="text-xs font-bold text-[#1E2A49] block">
                      Technical Abstract & Invention Scope
                    </span>
                    <p className="text-xs text-slate-700 leading-relaxed font-sans">
                      {record.description}
                    </p>
                  </div>

                  {/* Metadata Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3.5 bg-white rounded-xl border border-[#E7E3D8] space-y-1">
                      <span className="text-[10px] text-slate-400 flex items-center gap-1.5 font-semibold">
                        <User className="w-3 h-3 text-[#4563EB]" />
                        Inventor / Author
                      </span>
                      <p className="font-semibold text-[#1E2A49]">{record.inventor_name}</p>
                    </div>

                    <div className="p-3.5 bg-white rounded-xl border border-[#E7E3D8] space-y-1">
                      <span className="text-[10px] text-slate-400 flex items-center gap-1.5 font-semibold">
                        <Building2 className="w-3 h-3 text-[#4563EB]" />
                        Owner / Assignee
                      </span>
                      <p className="font-semibold text-[#1E2A49]">{record.owner_name}</p>
                    </div>

                    <div className="p-3.5 bg-white rounded-xl border border-[#E7E3D8] space-y-1">
                      <span className="text-[10px] text-slate-400 flex items-center gap-1.5 font-semibold">
                        <Calendar className="w-3 h-3 text-[#4563EB]" />
                        Filing Date
                      </span>
                      <p className="font-mono text-[#1E2A49]">{record.filing_date}</p>
                    </div>

                    <div className="p-3.5 bg-white rounded-xl border border-[#E7E3D8] space-y-1">
                      <span className="text-[10px] text-slate-400 flex items-center gap-1.5 font-semibold">
                        <Activity className="w-3 h-3 text-[#4563EB]" />
                        Completeness Score
                      </span>
                      <p className="font-mono font-bold text-[#12633C]">
                        {completeness ? `${completeness.score}%` : 'Auditing...'}
                      </p>
                    </div>
                  </div>

                  {/* Notes */}
                  {record.notes && (
                    <div className="p-4 bg-white rounded-2xl border border-[#E7E3D8] space-y-2">
                      <span className="text-xs font-bold text-[#1E2A49] block">
                        Administrative Notes
                      </span>
                      <p className="text-xs text-slate-600 font-mono leading-relaxed bg-[#F8F7F3] p-3 rounded-xl border border-[#E7E3D8]/80">
                        {record.notes}
                      </p>
                    </div>
                  )}

                  <LegalDisclaimer compact={true} />
                </div>
              )}

              {/* TAB 2: DOCUMENTS */}
              {drawerTab === 'documents' && (
                <div className="space-y-4">
                  {documents.length === 0 ? (
                    <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-[#E7E3D8] text-xs text-slate-500">
                      No files currently vaulted for this record. Attach prior art, claims drafts, or office actions below.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {documents.map(doc => (
                        <div
                          key={doc.id}
                          className="flex items-center justify-between p-3.5 bg-white rounded-xl border border-[#E7E3D8] hover:border-slate-300 transition-colors"
                        >
                          <div className="flex items-start gap-3 min-w-0">
                            <div className="p-2 bg-[#EFE8FF] text-[#55349E] rounded-lg shrink-0 mt-0.5">
                              <FileIcon className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-[#1E2A49] truncate">{doc.filename}</p>
                              <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5 font-mono">
                                <span>{formatFileSize(doc.file_size)}</span>
                                <span>·</span>
                                <span>{new Date(doc.upload_date).toLocaleDateString()}</span>
                              </div>
                              {doc.description && (
                                <p className="text-[11px] text-slate-600 mt-1">{doc.description}</p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0 ml-3">
                            <a
                              href={getDocumentDownloadUrl(doc.id)}
                              download
                              className="p-1.5 text-slate-600 hover:text-[#4563EB] hover:bg-slate-100 rounded-lg transition-colors"
                              title="Download Vaulted File"
                            >
                              <Download className="w-4 h-4" />
                            </a>
                            <button
                              type="button"
                              onClick={() => handleDeleteDoc(doc.id)}
                              disabled={isDeletingDocId === doc.id}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Delete File"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Upload Form */}
                  <form onSubmit={handleUploadSubmit} className="p-4 bg-white rounded-2xl border border-[#E7E3D8] space-y-3">
                    <span className="text-xs font-bold text-[#1E2A49] block">
                      Vault New Supporting Document (Max 10MB)
                    </span>
                    {uploadError && (
                      <p className="text-xs text-rose-600 bg-rose-50 p-2 rounded-lg border border-rose-200">
                        {uploadError}
                      </p>
                    )}
                    <input
                      type="file"
                      onChange={e => setUploadFile(e.target.files?.[0] || null)}
                      className="w-full text-xs text-slate-600 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#EFE8FF] file:text-[#55349E] hover:file:bg-[#E4D8FF] cursor-pointer"
                    />
                    <input
                      type="text"
                      value={uploadDesc}
                      onChange={e => setUploadDesc(e.target.value)}
                      placeholder="File description (e.g. USPTO Claims Draft)"
                      className="w-full px-3 py-1.5 text-xs bg-[#F8F7F3] border border-[#E7E3D8] rounded-xl focus:outline-none"
                    />
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={!uploadFile || isUploading}
                        className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#4563EB] hover:bg-[#344ec7] disabled:opacity-50 rounded-xl transition-colors flex items-center gap-1.5"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>{isUploading ? 'Encrypting & Vaulting...' : 'Upload File'}</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* TAB 3: TIMELINE & ACTIVITY LOG */}
              {drawerTab === 'timeline' && (
                <div className="space-y-4">
                  <div className="p-3 bg-white rounded-2xl border border-[#E7E3D8] text-xs text-slate-500">
                    Comprehensive audit trail tracking stage transitions, file attachments, and administrative remarks.
                  </div>

                  <div className="space-y-3 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#E7E3D8]">
                    {activities.map(act => (
                      <div key={act.id} className="relative pl-8 text-xs">
                        <div className="absolute left-2 top-1.5 w-3 h-3 rounded-full bg-[#4563EB] border-2 border-white ring-1 ring-[#4563EB]/20" />
                        <div className="p-3.5 bg-white rounded-xl border border-[#E7E3D8] space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-[#1E2A49]">{act.action}</span>
                            <span className="text-[10px] font-mono text-slate-400">
                              {new Date(act.timestamp).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-slate-600 text-xs leading-relaxed">{act.description}</p>
                          <div className="text-[10px] text-slate-400 flex items-center gap-1 pt-0.5">
                            <span className="font-medium text-slate-700">{act.user}</span>
                            <span>·</span>
                            <span className="bg-[#EFE8FF] text-[#55349E] px-1.5 py-0.2 rounded font-mono">
                              {act.user_role}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: COMPLETENESS HEALTH AUDIT */}
              {drawerTab === 'health' && completeness && (
                <div className="space-y-4">
                  <div className="p-4 bg-white rounded-2xl border border-[#E7E3D8] space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-[#1E2A49] block">
                          Record Administrative Completeness
                        </span>
                        <p className="text-[11px] text-slate-500">
                          Explainable score based on registry data presence
                        </p>
                      </div>
                      <div className="text-2xl font-bold font-mono text-[#12633C]">
                        {completeness.score}%
                      </div>
                    </div>

                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-[#4563EB] h-full rounded-full transition-all"
                        style={{ width: `${completeness.score}%` }}
                      />
                    </div>
                  </div>

                  {/* Missing Items */}
                  {completeness.missing_items.length > 0 ? (
                    <div className="p-4 bg-white rounded-2xl border border-[#E7E3D8] space-y-2">
                      <span className="text-xs font-bold text-[#9C243E] block flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-[#9C243E]" />
                        <span>Action Items to Reach 100% Completeness</span>
                      </span>
                      <div className="space-y-1.5 pt-1">
                        {completeness.missing_items.map((item, i) => (
                          <div
                            key={i}
                            className="p-2.5 bg-[#F9E2E7]/70 rounded-xl border border-[#F2CAD2] flex items-center justify-between text-xs text-[#9C243E]"
                          >
                            <span>{item.message}</span>
                            <button
                              type="button"
                              onClick={() => {
                                if (item.action_target === 'upload') setDrawerTab('documents');
                                else {
                                  onClose();
                                  onEdit(record);
                                }
                              }}
                              className="text-[11px] font-bold underline shrink-0 ml-2"
                            >
                              Fix now &rarr;
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-[#DDF5E9] rounded-2xl border border-[#BCE8D3] text-xs text-[#12633C] flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-[#12633C] shrink-0" />
                      <span>This record satisfies all institutional administrative completeness criteria!</span>
                    </div>
                  )}

                  {/* Passed Items */}
                  <div className="p-4 bg-white rounded-2xl border border-[#E7E3D8] space-y-2">
                    <span className="text-xs font-bold text-slate-700 block">Verified Criteria</span>
                    <div className="space-y-1 pt-1">
                      {completeness.passed_items.map((item, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-slate-600">
                          <Check className="w-3.5 h-3.5 text-[#12633C] shrink-0" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Actions */}
        {record && (
          <div className="p-4 bg-white border-t border-[#E7E3D8] flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                onClose();
                onDelete(record);
              }}
              className="px-3.5 py-2 text-xs font-semibold text-[#9C243E] bg-[#F9E2E7] hover:bg-[#f3cad2] rounded-xl transition-colors flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Record</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEdit(record);
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#4563EB] hover:bg-[#344ec7] rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Record</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
