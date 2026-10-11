import React, { useState, useEffect } from 'react';
import { IPRecord } from '../../types/ip';
import {
  Search,
  LayoutDashboard,
  FolderArchive,
  Clock,
  Files,
  Activity,
  Sparkles,
  Plus,
  FileSpreadsheet,
  X,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { TypeIndicator } from './TypeIndicator';
import { StatusIndicator } from './StatusIndicator';

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  records: IPRecord[];
  onSelectRecord: (recordId: string) => void;
  onNavigateTab: (tab: any) => void;
  onOpenNewRecord: () => void;
  onOpenAiAssistant: () => void;
  onExportCsv: () => void;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  isOpen,
  onClose,
  records,
  onSelectRecord,
  onNavigateTab,
  onOpenNewRecord,
  onOpenAiAssistant,
  onExportCsv
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Trigger open via parent
        }
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredRecords = query.trim()
    ? records.filter(
        r =>
          r.title.toLowerCase().includes(query.toLowerCase()) ||
          r.application_number.toLowerCase().includes(query.toLowerCase()) ||
          r.inventor_name.toLowerCase().includes(query.toLowerCase()) ||
          r.owner_name.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 5)
    : records.slice(0, 4);

  const navigationCommands = [
    { label: 'Command Center Overview', tab: 'dashboard', icon: <LayoutDashboard className="w-4 h-4 text-[#4563EB]" /> },
    { label: 'IP Portfolio (Visual & Table View)', tab: 'portfolio', icon: <FolderArchive className="w-4 h-4 text-[#12633C]" /> },
    { label: 'Deadline Command Center', tab: 'deadlines', icon: <Clock className="w-4 h-4 text-amber-600" /> },
    { label: 'IP Health & Completeness Meter', tab: 'health', icon: <Activity className="w-4 h-4 text-[#55349E]" /> },
    { label: 'Smart Document Vault', tab: 'documents', icon: <Files className="w-4 h-4 text-slate-600" /> },
    { label: 'Social Impact & Reports', tab: 'impact', icon: <FileSpreadsheet className="w-4 h-4 text-emerald-700" /> }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 sm:pt-24">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#1E2A49]/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Palette Container */}
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-[#E7E3D8] overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-100">
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#E7E3D8]">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Type a command or search IP records..."
            className="w-full text-xs text-[#1E2A49] placeholder-slate-400 focus:outline-none bg-transparent"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-slate-600 rounded"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <kbd className="text-[10px] font-mono bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
            ESC
          </kbd>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-2 space-y-3">
          {/* Quick Actions */}
          <div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-2 py-1 block">
              Quick Actions
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 px-1">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenNewRecord();
                }}
                className="flex items-center gap-2 p-2 rounded-xl bg-blue-50/60 hover:bg-blue-50 text-[#4563EB] text-xs font-semibold text-left transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Record</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenAiAssistant();
                }}
                className="flex items-center gap-2 p-2 rounded-xl bg-[#EFE8FF] hover:bg-[#E4D8FF] text-[#55349E] text-xs font-semibold text-left transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Assistant</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onExportCsv();
                }}
                className="flex items-center gap-2 p-2 rounded-xl bg-[#DDF5E9] hover:bg-[#cceedc] text-[#12633C] text-xs font-semibold text-left transition-colors"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* Records Search Matches */}
          <div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-2 py-1 block">
              {query ? 'Matching IP Records' : 'Recent IP Records'}
            </span>
            {filteredRecords.length === 0 ? (
              <div className="p-3 text-center text-xs text-slate-400">
                No IP records found matching "{query}".
              </div>
            ) : (
              <div className="space-y-1">
                {filteredRecords.map(record => (
                  <button
                    key={record.id}
                    type="button"
                    onClick={() => {
                      onClose();
                      onSelectRecord(record.id);
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#F8F7F3] text-left transition-colors group"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center gap-2">
                        <TypeIndicator type={record.ip_type} />
                        <span className="text-xs font-bold text-[#1E2A49] group-hover:text-[#4563EB] truncate">
                          {record.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                        <span className="font-mono tabular-nums">{record.application_number}</span>
                        <span>·</span>
                        <span className="truncate">{record.inventor_name}</span>
                      </div>
                    </div>
                    <div className="shrink-0 flex items-center gap-2">
                      <StatusIndicator status={record.application_status} />
                      <ArrowRight className="w-3 h-3 text-slate-300 group-hover:text-[#4563EB] transition-colors" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Navigation Commands */}
          <div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-2 py-1 block">
              Navigation
            </span>
            <div className="space-y-1">
              {navigationCommands.map(cmd => (
                <button
                  key={cmd.tab}
                  type="button"
                  onClick={() => {
                    onClose();
                    onNavigateTab(cmd.tab);
                  }}
                  className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-[#F8F7F3] text-xs text-slate-700 hover:text-[#1E2A49] transition-colors text-left"
                >
                  <div className="flex items-center gap-2.5">
                    {cmd.icon}
                    <span>{cmd.label}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">Jump</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="p-2.5 bg-[#F8F7F3] border-t border-[#E7E3D8] text-[10px] text-slate-500 flex items-center justify-between">
          <span>Use <strong>↑</strong> <strong>↓</strong> to navigate · <strong>ESC</strong> to dismiss</span>
          <span>IP Guardian Command Center</span>
        </div>
      </div>
    </div>
  );
};
