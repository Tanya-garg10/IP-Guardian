import React, { useState } from 'react';
import {
  Shield,
  Search,
  Bell,
  Sparkles,
  Plus,
  ChevronDown,
  Building2,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Command,
  X
} from 'lucide-react';
import { UserRole, WorkspaceItem } from '../../types/ip';
import avatarOfficer from '../../assets/images/avatar_officer_1791740136733.jpg';

interface HeaderCommandBarProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  activeWorkspace: string;
  onWorkspaceChange: (ws: string) => void;
  workspaces: WorkspaceItem[];
  onOpenNewRecord: () => void;
  onOpenCommandPalette: () => void;
  onOpenAiAssistant: () => void;
  overdueCount: number;
  dueSoonCount: number;
  onNavigateToDeadlines: () => void;
  onSelectRecord: (id: string) => void;
}

export const HeaderCommandBar: React.FC<HeaderCommandBarProps> = ({
  currentRole,
  onRoleChange,
  activeWorkspace,
  onWorkspaceChange,
  workspaces,
  onOpenNewRecord,
  onOpenCommandPalette,
  onOpenAiAssistant,
  overdueCount,
  dueSoonCount,
  onNavigateToDeadlines,
  onSelectRecord
}) => {
  const [isWorkspaceMenuOpen, setIsWorkspaceMenuOpen] = useState(false);
  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const roles: { role: UserRole; label: string; desc: string }[] = [
    { role: 'Coordinator', label: 'Coordinator', desc: 'Full portfolio management & statutory filings' },
    { role: 'Inventor', label: 'Inventor', desc: 'Submit invention disclosures & view own assets' },
    { role: 'Reviewer', label: 'Reviewer', desc: 'Institutional audit, prior art remarks & review' },
    { role: 'Administrator', label: 'Administrator', desc: 'System-wide governance & data export' }
  ];

  return (
    <header className="sticky top-0 z-30 bg-[#F8F7F3]/90 backdrop-blur-md border-b border-[#E7E3D8] px-3 sm:px-6 lg:px-8 py-2.5 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Brand & Workspace Switcher */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#1E2A49] flex items-center justify-center text-white shadow-xs shrink-0">
            <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-[#4563EB]" />
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setIsWorkspaceMenuOpen(!isWorkspaceMenuOpen)}
              className="flex items-center gap-1 text-left group py-1 px-1.5 -ml-1.5 rounded-lg hover:bg-white/80 transition-colors"
            >
              <div className="min-w-0">
                <span className="text-xs font-bold tracking-tight text-[#1E2A49] block truncate">
                  IP Guardian
                </span>
                <span className="text-[11px] text-[#4563EB] font-medium flex items-center gap-1">
                  <span className="truncate max-w-[90px] sm:max-w-[160px] lg:max-w-[220px]">{activeWorkspace}</span>
                  <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-slate-600 shrink-0" />
                </span>
              </div>
            </button>

            {/* Workspace Dropdown */}
            {isWorkspaceMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsWorkspaceMenuOpen(false)}
                />
                <div className="absolute left-0 mt-1 w-64 bg-white rounded-xl shadow-lg border border-[#E7E3D8] py-1.5 z-50">
                  <div className="px-3 py-1.5 border-b border-slate-100">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      Switch Innovation Cell
                    </span>
                  </div>
                  {workspaces.map((ws) => (
                    <button
                      key={ws.id}
                      type="button"
                      onClick={() => {
                        onWorkspaceChange(ws.name);
                        setIsWorkspaceMenuOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition-colors ${
                        activeWorkspace === ws.name
                          ? 'bg-[#EFE8FF] text-[#55349E] font-semibold'
                          : 'text-[#1E2A49] hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{ws.name}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">{ws.role}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Middle: Universal Search Bar / Command Palette Trigger */}
        <div className="hidden md:flex flex-1 max-w-md mx-4">
          <button
            type="button"
            onClick={onOpenCommandPalette}
            className="w-full flex items-center justify-between px-3 py-1.5 bg-white border border-[#E7E3D8] hover:border-[#4563EB]/40 rounded-xl text-xs text-slate-500 shadow-2xs group transition-all"
          >
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#4563EB] transition-colors" />
              <span>Search inventions, trademarks, reference #...</span>
            </div>
            <kbd className="hidden sm:inline-flex items-center gap-0.5 text-[10px] font-mono bg-[#F8F7F3] border border-[#E7E3D8] text-slate-500 px-1.5 py-0.5 rounded">
              <Command className="w-2.5 h-2.5" /> K
            </kbd>
          </button>
        </div>

        {/* Right: Actions, AI Assistant, Notifications & Role */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* AI IP Assistant Trigger */}
          <button
            type="button"
            onClick={onOpenAiAssistant}
            className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 bg-[#EFE8FF] hover:bg-[#E4D8FF] text-[#55349E] text-xs font-semibold rounded-xl border border-[#D9C8FF] transition-colors shadow-2xs"
            title="Open AI IP Assistant"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#55349E]" />
            <span className="hidden sm:inline">AI Assistant</span>
          </button>

          {/* Notifications Popover */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="p-2 bg-white hover:bg-slate-50 border border-[#E7E3D8] rounded-xl text-slate-600 transition-colors relative"
              title="Notifications & Alerts"
            >
              <Bell className="w-4 h-4 text-[#1E2A49]" />
              {overdueCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#9C243E] text-white text-[9px] font-bold flex items-center justify-center font-mono animate-pulse">
                  {overdueCount}
                </span>
              )}
            </button>

            {isNotificationsOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsNotificationsOpen(false)}
                />
                <div className="absolute right-0 mt-1.5 w-80 bg-white rounded-2xl shadow-xl border border-[#E7E3D8] p-4 z-50 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="text-xs font-bold text-[#1E2A49]">Notification Center</span>
                    <span className="text-[10px] text-slate-500 font-mono">Live Sync</span>
                  </div>

                  <div className="space-y-2 max-h-72 overflow-y-auto">
                    {overdueCount > 0 && (
                      <div className="p-2.5 bg-[#F9E2E7] rounded-xl border border-[#F2CAD2] text-xs text-[#9C243E] space-y-1">
                        <div className="flex items-center gap-1.5 font-bold">
                          <AlertTriangle className="w-3.5 h-3.5 text-[#9C243E]" />
                          <span>{overdueCount} Overdue Statutory Task{overdueCount > 1 ? 's' : ''}</span>
                        </div>
                        <p className="text-[11px] leading-relaxed text-[#9C243E]/90">
                          Office action response cutoffs have passed. File extensions or submit declaration immediately.
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setIsNotificationsOpen(false);
                            onNavigateToDeadlines();
                          }}
                          className="text-[11px] font-semibold underline block pt-0.5"
                        >
                          View in Deadline Command Center &rarr;
                        </button>
                      </div>
                    )}

                    {dueSoonCount > 0 && (
                      <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1">
                        <div className="flex items-center gap-1.5 font-bold">
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          <span>{dueSoonCount} Due Soon (&le; 7 Days)</span>
                        </div>
                        <p className="text-[11px] leading-relaxed text-amber-800">
                          Priority review dates approaching for active university disclosures.
                        </p>
                      </div>
                    )}

                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600 flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-slate-800">Local Vault Encrypted</p>
                        <p className="text-[11px] text-slate-500">Repository storage ready for claims & specimens.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Role Switcher */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsRoleMenuOpen(!isRoleMenuOpen)}
              className="flex items-center gap-2 py-1 px-2 bg-white hover:bg-slate-50 border border-[#E7E3D8] rounded-xl transition-colors"
            >
              <div className="w-6 h-6 rounded-full overflow-hidden border border-slate-200 shrink-0">
                <img
                  src={avatarOfficer}
                  alt="Dr. Sarah Lin"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="hidden lg:block text-left">
                <span className="text-[11px] font-semibold text-[#1E2A49] block leading-none">
                  Dr. Sarah Lin
                </span>
                <span className="text-[10px] text-[#4563EB] font-medium leading-none">
                  {currentRole}
                </span>
              </div>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {isRoleMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsRoleMenuOpen(false)}
                />
                <div className="absolute right-0 mt-1.5 w-64 bg-white rounded-2xl shadow-xl border border-[#E7E3D8] p-2 z-50 space-y-1">
                  <div className="px-3 py-1.5 border-b border-slate-100">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                      Active User Role
                    </span>
                    <span className="text-xs text-slate-600">Simulate role-aware collaboration workflow</span>
                  </div>
                  {roles.map((r) => (
                    <button
                      key={r.role}
                      type="button"
                      onClick={() => {
                        onRoleChange(r.role);
                        setIsRoleMenuOpen(false);
                      }}
                      className={`w-full text-left p-2 rounded-xl text-xs transition-colors flex items-start gap-2 ${
                        currentRole === r.role
                          ? 'bg-[#EFE8FF] text-[#55349E] font-semibold'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <UserCheck className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${currentRole === r.role ? 'text-[#55349E]' : 'text-slate-400'}`} />
                      <div>
                        <div className="font-bold">{r.label}</div>
                        <div className="text-[10px] text-slate-500 font-normal leading-tight">{r.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Prominent Action: Add IP Record */}
          <button
            type="button"
            onClick={onOpenNewRecord}
            className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 bg-[#4563EB] hover:bg-[#344ec7] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden xs:inline sm:inline">Add Record</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>
      </div>
    </header>
  );
};
