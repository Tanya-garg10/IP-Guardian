import React, { useState, useEffect } from 'react';
import { IPRecord, DocumentRecord, ApplicationStatus } from '../../types/ip';
import { Modal } from '../common/Modal';
import { StatusIndicator } from '../common/StatusIndicator';
import { TypeIndicator } from '../common/TypeIndicator';
import { UrgencyIndicator } from '../common/UrgencyIndicator';
import { LegalDisclaimer } from '../common/LegalDisclaimer';
import {
  fetchRecordById,
  uploadDocument,
  deleteDocument,
  getDocumentDownloadUrl
} from '../../services/api';
import {
  Edit3,
  Trash2,
  Upload,
  Download,
  FileText,
  Calendar,
  User,
  Building2,
  Hash,
  Clock,
  CheckCircle,
  FileIcon,
  X
} from 'lucide-react';

interface RecordDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  recordId: string | null;
  onEdit: (record: IPRecord) => void;
  onDelete: (record: IPRecord) => void;
  onRecordUpdated?: () => void;
}

export const RecordDetailModal: React.FC<RecordDetailModalProps> = ({
  isOpen,
  onClose,
  recordId,
  onEdit,
  onDelete,
  onRecordUpdated
}) => {
  const [record, setRecord] = useState<IPRecord | null>(null);
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Upload state
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadDesc, setUploadDesc] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDeletingDocId, setIsDeletingDocId] = useState<string | null>(null);

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

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  // Calculate days remaining relative to reference date (2026-10-11)
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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={record ? record.title : 'Loading Record...'}
      subtitle={record ? `Reference: ${record.application_number}` : ''}
      maxWidth="2xl"
    >
      {isLoading ? (
        <div className="py-12 flex flex-col items-center justify-center space-y-3">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-500">Loading intellectual property record...</p>
        </div>
      ) : error || !record ? (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs">
          {error || 'Record could not be retrieved.'}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Top Banner Actions & Meta */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center gap-4 text-xs">
              <TypeIndicator type={record.ip_type} />
              <span className="text-slate-300" aria-hidden="true">·</span>
              <StatusIndicator status={record.application_status} />
              <span className="text-slate-300" aria-hidden="true">·</span>
              <span className="text-slate-500 font-mono tabular-nums">{record.application_number}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEdit(record);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Record</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onDelete(record);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-700 bg-white border border-rose-200 hover:bg-rose-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </div>
          </div>

          {/* Lifecycle Status Progress Tracker */}
          <div>
            <h4 className="text-xs font-semibold text-slate-700 mb-2">Lifecycle Stage Progression</h4>
            <div className="grid grid-cols-5 gap-1.5">
              {stages.map((stage, idx) => {
                const isPassed = currentStageIndex >= idx;
                const isCurrent = record.application_status === stage;
                const isRejected = record.application_status === 'Rejected';

                return (
                  <div
                    key={stage}
                    className={`p-2 rounded-lg border text-center transition-colors ${
                      isRejected && idx === currentStageIndex
                        ? 'border-rose-300 bg-rose-50 text-rose-800'
                        : isCurrent
                        ? 'border-blue-500 bg-blue-50/80 text-blue-900 font-semibold shadow-xs'
                        : isPassed
                        ? 'border-slate-200 bg-slate-50 text-slate-700'
                        : 'border-slate-100 bg-white text-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-center mb-1">
                      {isCurrent ? (
                        <div className="w-2 h-2 rounded-full bg-blue-600" />
                      ) : isPassed ? (
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                      )}
                    </div>
                    <span className="block text-[11px] leading-tight truncate">{stage}</span>
                  </div>
                );
              })}
            </div>
            {record.application_status === 'Rejected' && (
              <p className="text-[11px] text-rose-600 font-medium mt-1.5">
                Note: Application status is currently marked as Rejected / Refused by office action.
              </p>
            )}
          </div>

          {/* Description & Abstract */}
          <div>
            <h4 className="text-xs font-semibold text-slate-700 mb-1.5">Abstract & Scope</h4>
            <div className="p-3.5 bg-white rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed">
              {record.description}
            </div>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-200 space-y-1">
              <span className="text-[11px] text-slate-500 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                Inventor / Author
              </span>
              <p className="font-medium text-slate-900">{record.inventor_name}</p>
            </div>

            <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-200 space-y-1">
              <span className="text-[11px] text-slate-500 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                Owner / Assignee
              </span>
              <p className="font-medium text-slate-900">{record.owner_name}</p>
            </div>

            <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-200 space-y-1">
              <span className="text-[11px] text-slate-500 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Filing Date
              </span>
              <p className="font-mono tabular-nums text-slate-900">{record.filing_date}</p>
            </div>

            <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-200 space-y-1">
              <span className="text-[11px] text-slate-500 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Next Administrative Deadline
              </span>
              <div>
                <UrgencyIndicator
                  urgency={deadlineCalc.urgency}
                  daysRemaining={deadlineCalc.days}
                  dateStr={record.next_deadline}
                  showDate={true}
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          {record.notes && (
            <div>
              <h4 className="text-xs font-semibold text-slate-700 mb-1.5">Administrative Notes</h4>
              <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-200 text-xs text-slate-600 leading-relaxed font-mono">
                {record.notes}
              </div>
            </div>
          )}

          {/* Attached Supporting Documents */}
          <div className="space-y-3 pt-2 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-semibold text-slate-900">
                  Supporting Documents ({documents.length})
                </h4>
                <p className="text-[11px] text-slate-500">
                  Securely vaulted filings, office action responses, claims drafts, and specimens
                </p>
              </div>
            </div>

            {/* Documents List */}
            {documents.length === 0 ? (
              <div className="p-4 text-center border border-dashed border-slate-200 rounded-xl text-slate-500 text-xs">
                No supporting documents attached yet. Upload office actions, claims, or specimens below.
              </div>
            ) : (
              <div className="space-y-2">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200 hover:border-slate-300 transition-colors"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="p-2 bg-slate-100 text-slate-600 rounded-lg shrink-0 mt-0.5">
                        <FileIcon className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-slate-900 truncate">
                          {doc.filename}
                        </p>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                          <span className="font-mono tabular-nums">{formatFileSize(doc.file_size)}</span>
                          <span aria-hidden="true">·</span>
                          <span>Uploaded {new Date(doc.upload_date).toLocaleDateString()}</span>
                        </div>
                        {doc.description && (
                          <p className="text-[11px] text-slate-600 mt-1">{doc.description}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 ml-3">
                      <a
                        href={getDocumentDownloadUrl(doc.id)}
                        download
                        className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Download Document"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                      <button
                        type="button"
                        onClick={() => handleDeleteDoc(doc.id)}
                        disabled={isDeletingDocId === doc.id}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Remove Document"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Upload Box */}
            <form onSubmit={handleUploadSubmit} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <span className="block text-xs font-medium text-slate-800">
                Attach Supporting Document (Max 10MB)
              </span>

              {uploadError && (
                <p className="text-xs text-rose-600 bg-rose-50 p-2 rounded-lg border border-rose-200">
                  {uploadError}
                </p>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <input
                    type="file"
                    onChange={e => setUploadFile(e.target.files?.[0] || null)}
                    className="w-full text-xs text-slate-600 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    value={uploadDesc}
                    onChange={e => setUploadDesc(e.target.value)}
                    placeholder="Document description (e.g. Claims draft)"
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!uploadFile || isUploading}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg transition-colors"
                >
                  {isUploading ? (
                    <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Upload className="w-3.5 h-3.5" />
                  )}
                  <span>Upload & Vault File</span>
                </button>
              </div>
            </form>
          </div>

          {/* Legal notice in details */}
          <LegalDisclaimer compact={true} />

          {/* Timestamps footer */}
          <div className="text-[11px] text-slate-400 font-mono flex items-center justify-between pt-2 border-t border-slate-100">
            <span>Created: {new Date(record.created_at).toLocaleString()}</span>
            <span>Last Modified: {new Date(record.updated_at).toLocaleString()}</span>
          </div>
        </div>
      )}
    </Modal>
  );
};
