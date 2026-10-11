import React, { useState } from 'react';
import { IPRecord, AiAssistantResponse } from '../../types/ip';
import { callAiAssistant } from '../../services/api';
import { Modal } from './Modal';
import {
  Sparkles,
  FileText,
  Calendar,
  CheckSquare,
  HelpCircle,
  Copy,
  Check,
  KeyRound,
  ShieldAlert,
  Send,
  RefreshCw,
  ArrowRight
} from 'lucide-react';

interface AiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeRecord?: IPRecord | null;
  onApplyExtracted?: (data: { next_deadline?: string; notes?: string }) => void;
}

export const AiAssistantModal: React.FC<AiAssistantModalProps> = ({
  isOpen,
  onClose,
  activeRecord,
  onApplyExtracted
}) => {
  const [selectedAction, setSelectedAction] = useState<'summarize' | 'extract' | 'checklist' | 'explain_field'>('summarize');
  const [customText, setCustomText] = useState('');
  const [fieldName, setFieldName] = useState('application_status');
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<AiAssistantResponse | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleRunAssistant = async () => {
    setIsLoading(true);
    try {
      const res = await callAiAssistant({
        action: selectedAction,
        text: customText.trim() ? customText : undefined,
        record_id: activeRecord ? activeRecord.id : undefined,
        field_name: selectedAction === 'explain_field' ? fieldName : undefined
      });
      setResponse(res);
    } catch (err: any) {
      setResponse({
        ai_mode: 'error_fallback',
        notice: `Error: ${err.message}`,
        disclaimer: 'Administrative guidance only.',
        result: 'Failed to complete assistant request. Please verify connection and try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (response?.result) {
      navigator.clipboard.writeText(response.result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="AI IP Administrative Assistant"
      subtitle="Summarization, entity extraction, and administrative checklist drafting"
      maxWidth="xl"
    >
      <div className="space-y-4">
        {/* Action Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 bg-slate-100 rounded-xl">
          {[
            { id: 'summarize' as const, label: 'Summarize', icon: <FileText className="w-3.5 h-3.5" /> },
            { id: 'extract' as const, label: 'Extract Entities', icon: <Calendar className="w-3.5 h-3.5" /> },
            { id: 'checklist' as const, label: 'Audit Checklist', icon: <CheckSquare className="w-3.5 h-3.5" /> },
            { id: 'explain_field' as const, label: 'Explain Terms', icon: <HelpCircle className="w-3.5 h-3.5" /> }
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setSelectedAction(tab.id);
                setResponse(null);
              }}
              className={`flex items-center justify-center gap-1.5 py-1.5 px-2 text-xs font-semibold rounded-lg transition-colors ${
                selectedAction === tab.id
                  ? 'bg-white text-[#1E2A49] shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.icon}
              <span className="truncate">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Record Context Indicator */}
        {activeRecord ? (
          <div className="p-2.5 bg-[#EFE8FF]/70 border border-[#D9C8FF] rounded-xl text-xs flex items-center justify-between">
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-bold text-[#55349E] tracking-wider block">
                Analyzing Active IP Asset:
              </span>
              <p className="font-semibold text-[#1E2A49] truncate">{activeRecord.title}</p>
              <span className="text-[11px] text-slate-500 font-mono">
                Ref: {activeRecord.application_number} · Status: {activeRecord.application_status}
              </span>
            </div>
            <span className="text-[10px] bg-[#EFE8FF] text-[#55349E] px-2 py-0.5 rounded font-mono shrink-0 ml-2">
              Auto-linked
            </span>
          </div>
        ) : (
          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600">
            Paste patent claims, office action text, or trademark notes below to generate administrative insights.
          </div>
        )}

        {/* Explain Field dropdown if selected */}
        {selectedAction === 'explain_field' && (
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select LegalTech or Registry Concept:
            </label>
            <select
              value={fieldName}
              onChange={e => setFieldName(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-[#E7E3D8] bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4563EB]/20"
            >
              <option value="Non-Final Office Action">Non-Final Office Action (Examiner rejection/clarification)</option>
              <option value="Statement of Use">Statement of Use & Specimen (Trademark commerce proof)</option>
              <option value="PCT National Phase">PCT National Phase Entry (International patent filing deadline)</option>
              <option value="Prior Art 102 Rejection">Prior Art Rejection (Novelty challenge under 35 U.S.C. 102)</option>
              <option value="Deposit Copy Requirements">Deposit Copy (Copyright Office mandatory submission)</option>
              <option value="Assignment Deed">Assignment Deed (Transfer from student inventor to university)</option>
            </select>
          </div>
        )}

        {/* Input Text Box */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            {selectedAction === 'explain_field'
              ? 'Additional Context or Custom Question (Optional):'
              : 'Document Text / Claims Excerpt (Leave empty to use record abstract):'}
          </label>
          <textarea
            rows={3}
            value={customText}
            onChange={e => setCustomText(e.target.value)}
            placeholder={
              selectedAction === 'extract'
                ? 'Paste paragraph from office action letter, declaration, or examiner correspondence...'
                : 'Enter excerpt or leave blank to analyze the currently selected IP record...'
            }
            className="w-full px-3 py-2 text-xs border border-[#E7E3D8] bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4563EB]/20 placeholder-slate-400"
          />
        </div>

        {/* Run Button */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleRunAssistant}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-[#4563EB] hover:bg-[#344ec7] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors disabled:opacity-60"
          >
            {isLoading ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5" />
            )}
            <span>{isLoading ? 'Analyzing with Gemini...' : 'Generate Analysis'}</span>
          </button>
        </div>

        {/* Results Area */}
        {response && (
          <div className="p-4 bg-white rounded-xl border border-[#E7E3D8] space-y-3 mt-3 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                  response.ai_mode === 'live_gemini'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-amber-50 text-amber-800 border border-amber-200'
                }`}>
                  {response.ai_mode === 'live_gemini' ? 'Gemini 3.8 Flash (Live API)' : 'Administrative Fallback Engine'}
                </span>
                {response.notice && (
                  <span className="text-[10px] text-slate-400 hidden sm:inline">
                    {response.notice}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-800 transition-colors"
                title="Copy generated text"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            {/* Structured Output */}
            <div className="text-xs text-slate-800 leading-relaxed whitespace-pre-wrap font-sans bg-[#F8F7F3] p-3 rounded-lg border border-[#E7E3D8]/80">
              {response.result}
            </div>

            {/* Non-Legal Mandatory Disclaimer */}
            <div className="p-2.5 rounded-lg bg-amber-50/60 border border-amber-200 text-amber-950 text-[11px] flex items-start gap-2">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
              <p>
                <strong>Administrative Notice:</strong> {response.disclaimer} Always verify patentability, claim scope, and statutory dates with authorized patent attorneys and official registries.
              </p>
            </div>
          </div>
        )}

        {/* API Key info footer */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600 space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-slate-800">
            <KeyRound className="w-3.5 h-3.5 text-[#4563EB]" />
            <span>AI Architecture & Runtime Transparency</span>
          </div>
          <p className="leading-relaxed">
            This module calls Google's latest <code className="font-mono text-slate-800">@google/genai</code> SDK with model <code className="font-mono text-slate-800">gemini-3.8-flash</code> via the backend server proxy (`/api/ai/assistant`). All prompts enforce non-legal administrative constraints to safeguard research novelty.
          </p>
        </div>
      </div>
    </Modal>
  );
};
