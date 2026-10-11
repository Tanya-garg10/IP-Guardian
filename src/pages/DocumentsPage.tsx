import React, { useState, useEffect, useCallback } from 'react';
import { DocumentRecord, IPRecord } from '../types/ip';
import {
  fetchAllDocuments,
  fetchRecords,
  deleteDocument,
  uploadDocument,
  getDocumentDownloadUrl
} from '../services/api';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { Modal } from '../components/common/Modal';
import { TypeIndicator } from '../components/common/TypeIndicator';
import {
  Files,
  Download,
  Trash2,
  Upload,
  Search,
  FileText,
  FileCode,
  Image as ImageIcon,
  HardDrive,
  RefreshCw,
  FolderOpen,
  Lock,
  Plus,
  Eye,
  CheckCircle2,
  FileCheck
} from 'lucide-react';

interface DocumentsPageProps {
  onSelectRecord: (recordId: string) => void;
  onNotify: (type: 'success' | 'error', title: string, message?: string) => void;
}

export const DocumentsPage: React.FC<DocumentsPageProps> = ({
  onSelectRecord,
  onNotify
}) => {
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [records, setRecords] = useState<IPRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFileType, setSelectedFileType] = useState('all');

  // Deletion modal
  const [docToDelete, setDocToDelete] = useState<DocumentRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Upload modal & progress
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedRecordId, setSelectedRecordId] = useState('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadDesc, setUploadDesc] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Safe Preview Modal
  const [previewDoc, setPreviewDoc] = useState<DocumentRecord | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [docsData, recordsData] = await Promise.all([
        fetchAllDocuments(),
        fetchRecords({ limit: 100 })
      ]);
      setDocuments(docsData.documents);
      setRecords(recordsData.records);
      if (recordsData.records.length > 0 && !selectedRecordId) {
        setSelectedRecordId(recordsData.records[0].id);
      }
    } catch (err: any) {
      onNotify('error', 'Failed to retrieve documents', err.message);
    } finally {
      setIsLoading(false);
    }
  }, [onNotify, selectedRecordId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDeleteDoc = async () => {
    if (!docToDelete) return;
    setIsDeleting(true);
    try {
      await deleteDocument(docToDelete.id);
      onNotify('success', 'Document Purged', `"${docToDelete.filename}" removed from storage.`);
      setDocToDelete(null);
      loadData();
    } catch (err: any) {
      onNotify('error', 'Failed to delete file', err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) {
      setUploadError('Please select a file to upload.');
      return;
    }
    if (!selectedRecordId) {
      setUploadError('Please choose which IP record to attach this file to.');
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    setUploadProgress(25);

    try {
      setUploadProgress(65);
      await uploadDocument(selectedRecordId, uploadFile, uploadDesc);
      setUploadProgress(100);
      onNotify('success', 'File Vaulted', `"${uploadFile.name}" encrypted and associated.`);
      setTimeout(() => {
        setIsUploadOpen(false);
        setUploadFile(null);
        setUploadDesc('');
        setUploadProgress(0);
        loadData();
      }, 300);
    } catch (err: any) {
      setUploadError(err.message || 'File upload failed');
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const totalBytes = documents.reduce((sum, d) => sum + (d.file_size || 0), 0);

  const filtered = documents.filter(doc => {
    if (selectedFileType !== 'all') {
      if (selectedFileType === 'pdf' && !doc.filename.endsWith('.pdf')) return false;
      if (selectedFileType === 'image' && !doc.file_type.startsWith('image/')) return false;
      if (selectedFileType === 'doc' && !doc.filename.match(/\.(doc|docx)$/i)) return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        doc.filename.toLowerCase().includes(q) ||
        (doc.description && doc.description.toLowerCase().includes(q)) ||
        (doc.record_title && doc.record_title.toLowerCase().includes(q)) ||
        (doc.record_application_number && doc.record_application_number.toLowerCase().includes(q))
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
            Smart Document Vault
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Encrypted repository for claims drafts, office actions, power of attorney, and trademark specimens
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadData}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-[#E7E3D8] hover:bg-slate-50 rounded-xl transition-colors shadow-2xs"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
            <span>Refresh</span>
          </button>
          <button
            type="button"
            onClick={() => setIsUploadOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#4563EB] hover:bg-[#344ec7] rounded-xl shadow-xs transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Supporting File</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-[#E7E3D8] space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Vaulted Legal Files
          </span>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-[#1E2A49] tabular-nums">
            {documents.length}
          </div>
          <span className="text-[11px] text-slate-500 block">
            Across {new Set(documents.map(d => d.ip_record)).size} active IP records
          </span>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-[#E7E3D8] space-y-1">
          <span className="text-[10px] font-bold text-[#4563EB] uppercase tracking-wider block">
            Encrypted Volume
          </span>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-[#4563EB] tabular-nums">
            {formatFileSize(totalBytes)}
          </div>
          <span className="text-[11px] text-slate-500 block">
            Isolated local development storage
          </span>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-[#E7E3D8] space-y-1">
          <span className="text-[10px] font-bold text-[#12633C] uppercase tracking-wider block flex items-center gap-1">
            <Lock className="w-3 h-3 text-[#12633C]" />
            Privacy Protection
          </span>
          <div className="text-sm font-bold text-[#12633C] pt-1">
            Authenticated Streaming
          </div>
          <span className="text-[11px] text-slate-500 block">
            No public directory exposure
          </span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl border border-[#E7E3D8] p-4 space-y-3 shadow-2xs">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-8 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search documents by filename, description, or IP asset..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-[#E7E3D8] bg-[#F8F7F3] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4563EB]/20"
            />
          </div>

          <div className="md:col-span-4 flex items-center gap-1 p-1 bg-[#F8F7F3] rounded-xl border border-[#E7E3D8]/80">
            {[
              { id: 'all', label: 'All Files' },
              { id: 'pdf', label: 'PDFs' },
              { id: 'image', label: 'Images' },
              { id: 'doc', label: 'Office' }
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedFileType(tab.id)}
                className={`flex-1 py-1 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                  selectedFileType === tab.id
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

      {/* Documents Table */}
      <div className="bg-white rounded-2xl border border-[#E7E3D8] overflow-hidden shadow-2xs">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <div className="w-6 h-6 border-2 border-[#4563EB] border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-slate-500 font-mono">Querying secure document storage...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-12 h-12 bg-[#F8F7F3] text-slate-400 rounded-2xl flex items-center justify-center mx-auto border border-[#E7E3D8]">
              <FolderOpen className="w-6 h-6 text-[#4563EB]" />
            </div>
            <h3 className="text-sm font-bold text-[#1E2A49]">No Documents Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
              No files matched your search. Upload office actions, patent claims, or trademark specimens.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setIsUploadOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#4563EB] hover:bg-[#344ec7] rounded-xl shadow-xs transition-colors"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload First Document</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#E7E3D8] bg-[#F8F7F3] text-slate-600 font-semibold">
                  <th className="py-3 px-4">Filename & Description</th>
                  <th className="py-3 px-3">Associated IP Record</th>
                  <th className="py-3 px-3">Format</th>
                  <th className="py-3 px-3">Size</th>
                  <th className="py-3 px-3">Upload Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filtered.map((doc) => (
                  <tr key={doc.id} className="hover:bg-[#F8F7F3]/70 transition-colors">
                    <td className="py-3 px-4 max-w-xs">
                      <div className="flex items-start gap-2.5">
                        <div className="p-2 bg-[#EFE8FF] text-[#55349E] rounded-xl shrink-0 mt-0.5">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <span className="font-bold text-[#1E2A49] block truncate">
                            {doc.filename}
                          </span>
                          {doc.description && (
                            <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                              {doc.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3 max-w-[200px]">
                      <button
                        type="button"
                        onClick={() => onSelectRecord(doc.ip_record)}
                        className="font-semibold text-[#4563EB] hover:underline text-left block truncate"
                        title={doc.record_title}
                      >
                        {doc.record_title || 'Attached Record'}
                      </button>
                      <span className="text-[11px] font-mono text-slate-400 block tabular-nums">
                        {doc.record_application_number}
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      <span className="text-slate-600 font-mono text-[11px] bg-slate-100 px-1.5 py-0.5 rounded">
                        {doc.file_type.split('/')[1] || doc.file_type}
                      </span>
                    </td>

                    <td className="py-3 px-3 font-mono text-slate-700 whitespace-nowrap">
                      {formatFileSize(doc.file_size)}
                    </td>

                    <td className="py-3 px-3 font-mono text-slate-500 whitespace-nowrap">
                      {new Date(doc.upload_date).toLocaleDateString()}
                    </td>

                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setPreviewDoc(doc)}
                          className="p-1.5 text-slate-500 hover:text-[#4563EB] hover:bg-slate-100 rounded-lg transition-colors"
                          title="Safe Preview"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <a
                          href={getDocumentDownloadUrl(doc.id)}
                          download
                          className="p-1.5 text-slate-500 hover:text-[#4563EB] hover:bg-slate-100 rounded-lg transition-colors inline-flex items-center"
                          title="Download Decrypted File"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </a>
                        <button
                          type="button"
                          onClick={() => setDocToDelete(doc)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Purge File"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Safe Preview Modal */}
      {previewDoc && (
        <Modal
          isOpen={Boolean(previewDoc)}
          onClose={() => setPreviewDoc(null)}
          title={`File Dossier: ${previewDoc.filename}`}
          subtitle={`Attached to ${previewDoc.record_title || previewDoc.ip_record}`}
          maxWidth="md"
        >
          <div className="space-y-4">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">MIME Type:</span>
                <span className="font-mono font-semibold text-slate-800">{previewDoc.file_type}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">File Size:</span>
                <span className="font-mono text-slate-800">{formatFileSize(previewDoc.file_size)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Upload Date:</span>
                <span className="font-mono text-slate-800">{new Date(previewDoc.upload_date).toLocaleString()}</span>
              </div>
              {previewDoc.description && (
                <div className="pt-2 border-t border-slate-200">
                  <span className="text-slate-500 block text-[11px]">Purpose / Description:</span>
                  <p className="text-slate-800 font-medium mt-0.5">{previewDoc.description}</p>
                </div>
              )}
            </div>

            <div className="p-3 rounded-xl bg-[#EFE8FF]/60 border border-[#D9C8FF] text-[11px] text-[#55349E]">
              <strong>Security Protocol:</strong> File is held in isolated server storage. Direct browser streaming is permitted only through authenticated session tokens.
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <a
                href={getDocumentDownloadUrl(previewDoc.id)}
                download
                className="px-4 py-2 bg-[#4563EB] hover:bg-[#344ec7] text-white text-xs font-semibold rounded-xl flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Secure File</span>
              </a>
            </div>
          </div>
        </Modal>
      )}

      {/* Upload Modal with Progress */}
      <Modal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        title="Vault Supporting IP Document"
        subtitle="Attach official office actions, claims drafts, or trademark specimens to an IP record"
        maxWidth="md"
      >
        <form onSubmit={handleUploadSubmit} className="space-y-4">
          {uploadError && (
            <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-xl">
              {uploadError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Associated Intellectual Property Record *
            </label>
            <select
              value={selectedRecordId}
              onChange={(e) => setSelectedRecordId(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-[#E7E3D8] bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4563EB]/20"
            >
              {records.map(r => (
                <option key={r.id} value={r.id}>
                  [{r.ip_type}] {r.title} ({r.application_number})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select File to Vault * <span className="text-slate-400 font-normal">(Max 10MB)</span>
            </label>
            <input
              type="file"
              onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
              className="w-full text-xs text-slate-600 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#EFE8FF] file:text-[#55349E] hover:file:bg-[#E4D8FF] cursor-pointer"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Supported formats: PDF, DOCX, TXT, CSV, PNG, JPG
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Document Description / Legal Purpose
            </label>
            <input
              type="text"
              value={uploadDesc}
              onChange={(e) => setUploadDesc(e.target.value)}
              placeholder="e.g. USPTO Non-Final Office Action Claims Amendment"
              className="w-full px-3 py-2 text-xs border border-[#E7E3D8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4563EB]/20"
            />
          </div>

          {/* Progress bar during upload */}
          {isUploading && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                <span>Encrypting & writing to disk...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-[#4563EB] h-full rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsUploadOpen(false)}
              disabled={isUploading}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading || !uploadFile}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#4563EB] hover:bg-[#344ec7] rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
            >
              {isUploading && (
                <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              )}
              <span>Upload Document</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(docToDelete)}
        onClose={() => setDocToDelete(null)}
        onConfirm={handleDeleteDoc}
        title="Purge Document from Vault"
        message={`Are you sure you want to permanently delete "${docToDelete?.filename}"? The file will be immediately erased from secure disk storage.`}
        confirmLabel="Purge Document"
        isDestructive={true}
        isLoading={isDeleting}
      />
    </div>
  );
};
