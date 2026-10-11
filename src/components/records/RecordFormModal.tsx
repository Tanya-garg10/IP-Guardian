import React, { useState, useEffect } from 'react';
import { IPRecord, IPType, ApplicationStatus } from '../../types/ip';
import { Modal } from '../common/Modal';
import { createRecord, updateRecord } from '../../services/api';
import { Lightbulb, Bookmark, FileText } from 'lucide-react';

interface RecordFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  recordToEdit?: IPRecord | null;
  onSuccess: (savedRecord: IPRecord, isNew: boolean) => void;
}

export const RecordFormModal: React.FC<RecordFormModalProps> = ({
  isOpen,
  onClose,
  recordToEdit,
  onSuccess
}) => {
  const isEditing = Boolean(recordToEdit);

  const [title, setTitle] = useState('');
  const [ipType, setIpType] = useState<IPType>('Patent');
  const [description, setDescription] = useState('');
  const [inventorName, setInventorName] = useState('');
  const [ownerName, setOwnerName] = useState('Apex University Tech Transfer Office');
  const [applicationNumber, setApplicationNumber] = useState('');
  const [filingDate, setFilingDate] = useState('2026-10-11');
  const [applicationStatus, setApplicationStatus] = useState<ApplicationStatus>('Draft');
  const [nextDeadline, setNextDeadline] = useState('');
  const [notes, setNotes] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    if (recordToEdit) {
      setTitle(recordToEdit.title);
      setIpType(recordToEdit.ip_type);
      setDescription(recordToEdit.description);
      setInventorName(recordToEdit.inventor_name);
      setOwnerName(recordToEdit.owner_name);
      setApplicationNumber(recordToEdit.application_number);
      setFilingDate(recordToEdit.filing_date);
      setApplicationStatus(recordToEdit.application_status);
      setNextDeadline(recordToEdit.next_deadline || '');
      setNotes(recordToEdit.notes || '');
    } else {
      // Default new record
      setTitle('');
      setIpType('Patent');
      setDescription('');
      setInventorName('');
      setOwnerName('Apex University Tech Transfer Office');
      setApplicationNumber(`PAT-2026-${Math.floor(1000 + Math.random() * 9000)}`);
      setFilingDate('2026-10-11');
      setApplicationStatus('Draft');
      setNextDeadline('');
      setNotes('');
    }
    setErrors({});
    setServerError(null);
  }, [recordToEdit, isOpen]);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!title.trim()) {
      errs.title = 'Title is required (min 3 characters)';
    } else if (title.trim().length < 3) {
      errs.title = 'Title must be at least 3 characters long.';
    }

    if (!description.trim()) {
      errs.description = 'Please provide an invention or trademark description.';
    }

    if (!inventorName.trim()) {
      errs.inventorName = 'Inventor or author name is required.';
    }

    if (!ownerName.trim()) {
      errs.ownerName = 'Owner organisation or cell is required.';
    }

    if (!applicationNumber.trim()) {
      errs.applicationNumber = 'Application or reference number is required.';
    }

    if (!filingDate) {
      errs.filingDate = 'Filing date is required.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setServerError(null);

    try {
      const payload = {
        title: title.trim(),
        ip_type: ipType,
        description: description.trim(),
        inventor_name: inventorName.trim(),
        owner_name: ownerName.trim(),
        application_number: applicationNumber.trim(),
        filing_date: filingDate,
        application_status: applicationStatus,
        next_deadline: nextDeadline.trim() !== '' ? nextDeadline : null,
        notes: notes.trim()
      };

      if (isEditing && recordToEdit) {
        const response = await updateRecord(recordToEdit.id, payload);
        onSuccess(response.record, false);
      } else {
        const response = await createRecord(payload);
        onSuccess(response.record, true);
      }
      onClose();
    } catch (err: any) {
      setServerError(err.message || 'An error occurred while saving the record.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Intellectual Property Record' : 'Register New Intellectual Property'}
      subtitle={isEditing ? `Ref: ${recordToEdit?.application_number}` : 'Record novel patents, trademarks, or copyrights in the institutional portfolio'}
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {serverError && (
          <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-lg">
            {serverError}
          </div>
        )}

        {/* IP Type Selector */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1.5">
            Intellectual Property Classification *
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { type: 'Patent' as IPType, icon: <Lightbulb className="w-4 h-4" />, label: 'Patent' },
              { type: 'Trademark' as IPType, icon: <Bookmark className="w-4 h-4" />, label: 'Trademark' },
              { type: 'Copyright' as IPType, icon: <FileText className="w-4 h-4" />, label: 'Copyright' }
            ].map(item => (
              <button
                key={item.type}
                type="button"
                onClick={() => setIpType(item.type)}
                className={`flex items-center justify-center gap-2 p-2.5 rounded-lg border text-xs font-medium transition-colors ${
                  ipType === item.type
                    ? 'border-blue-600 bg-blue-50/70 text-blue-900 shadow-sm ring-1 ring-blue-600'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Invention / Mark Title *
          </label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="e.g. Microfluidic Point-of-Care Biosensor for Rapid Sepsis Detection"
            className={`w-full px-3 py-2 text-xs border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
              errors.title ? 'border-rose-300 bg-rose-50/30' : 'border-slate-200'
            }`}
          />
          {errors.title && <p className="text-[11px] text-rose-600 mt-1">{errors.title}</p>}
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Technical Abstract or IP Description *
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Summarize the inventive claims, scope of trademark classes, or copyright protected elements..."
            className={`w-full px-3 py-2 text-xs border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
              errors.description ? 'border-rose-300 bg-rose-50/30' : 'border-slate-200'
            }`}
          />
          {errors.description && <p className="text-[11px] text-rose-600 mt-1">{errors.description}</p>}
        </div>

        {/* Row: Inventor & Owner */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Inventor / Creator Name(s) *
            </label>
            <input
              type="text"
              value={inventorName}
              onChange={e => setInventorName(e.target.value)}
              placeholder="e.g. Dr. Elena Rostova & Marcus Vance"
              className={`w-full px-3 py-2 text-xs border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                errors.inventorName ? 'border-rose-300' : 'border-slate-200'
              }`}
            />
            {errors.inventorName && <p className="text-[11px] text-rose-600 mt-1">{errors.inventorName}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Owner / Assignee Organisation *
            </label>
            <input
              type="text"
              value={ownerName}
              onChange={e => setOwnerName(e.target.value)}
              placeholder="e.g. Apex University Tech Transfer Office"
              className={`w-full px-3 py-2 text-xs border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                errors.ownerName ? 'border-rose-300' : 'border-slate-200'
              }`}
            />
            {errors.ownerName && <p className="text-[11px] text-rose-600 mt-1">{errors.ownerName}</p>}
          </div>
        </div>

        {/* Row: Reference Number & Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Application / Reference Number *
            </label>
            <input
              type="text"
              value={applicationNumber}
              onChange={e => setApplicationNumber(e.target.value)}
              placeholder="e.g. US-2026-094182-A1"
              className={`w-full px-3 py-2 text-xs font-mono border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                errors.applicationNumber ? 'border-rose-300' : 'border-slate-200'
              }`}
            />
            {errors.applicationNumber && <p className="text-[11px] text-rose-600 mt-1">{errors.applicationNumber}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Application Status *
            </label>
            <select
              value={applicationStatus}
              onChange={e => setApplicationStatus(e.target.value as ApplicationStatus)}
              className="w-full px-3 py-2 text-xs border border-slate-200 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="Idea">Idea (Early Concept)</option>
              <option value="Draft">Draft (Internal Preparation)</option>
              <option value="Filed">Filed (Formally Lodged)</option>
              <option value="Under Review">Under Review (Examination / Office Action)</option>
              <option value="Approved">Approved (Granted / Registered)</option>
              <option value="Rejected">Rejected (Refused / Withdrawn)</option>
            </select>
          </div>
        </div>

        {/* Row: Filing Date & Next Deadline */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Filing / Lodging Date *
            </label>
            <input
              type="date"
              value={filingDate}
              onChange={e => setFilingDate(e.target.value)}
              className={`w-full px-3 py-2 text-xs font-mono border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                errors.filingDate ? 'border-rose-300' : 'border-slate-200'
              }`}
            />
            {errors.filingDate && <p className="text-[11px] text-rose-600 mt-1">{errors.filingDate}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Next Critical Deadline <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <input
              type="date"
              value={nextDeadline}
              onChange={e => setNextDeadline(e.target.value)}
              className="w-full px-3 py-2 text-xs font-mono border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
            <p className="text-[10px] text-slate-400 mt-0.5">Office action response, fee renewal, or filing target</p>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Administrative & Legal Notes <span className="text-slate-400 font-normal">(Optional)</span>
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="e.g. Prior art search completed by external patent attorneys on Sept 14. Response to USPTO examiner pending."
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
          >
            {isSubmitting && (
              <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            )}
            <span>{isEditing ? 'Save Changes' : 'Register Record'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
