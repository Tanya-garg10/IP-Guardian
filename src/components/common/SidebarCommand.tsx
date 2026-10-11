import React, { useState } from 'react';
import {
  Shield,
  LayoutDashboard,
  FolderArchive,
  Clock,
  Activity,
  Files,
  Sparkles,
  FileSpreadsheet,
  Settings,
  PlusCircle,
  RotateCcw,
  Menu,
  X,
  ExternalLink,
  UserCheck
} from 'lucide-react';
import { UserRole } from '../../types/ip';
import avatarOfficer from '../../assets/images/avatar_officer_1791740136733.jpg';

export type CommandTab =
  | 'dashboard'
  | 'portfolio'
  | 'deadlines'
  | 'health'
  | 'documents'
  | 'ai'
  | 'impact'
  | 'settings';

interface SidebarCommandProps {
  activeTab: CommandTab;
  onSelectTab: (tab: CommandTab) => void;
  onOpenNewRecord: () => void;
  onResetDemo: () => void;
  onReturnLanding: () => void;
  overdueCount?: number;
  totalRecords?: number;
  totalDocs?: number;
  healthScore?: number;
  currentRole: UserRole;
}

export const SidebarCommand: React.FC<SidebarCommandProps> = ({
  activeTab,
  onSelectTab,
  onOpenNewRecord,
  onResetDemo,
  onReturnLanding,
  overdueCount = 0,
  totalRecords = 7,
  totalDocs = 4,
  healthScore = 86,
  currentRole
}) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navItems = [
    {
      id: 'dashboard' as CommandTab,
      label: 'Command Center',
      icon: <LayoutDashboard className="w-4 h-4" />
    },
    {
      id: 'portfolio' as CommandTab,
      label: 'IP Portfolio',
      icon: <FolderArchive className="w-4 h-4" />,
      badge: totalRecords > 0 ? `${totalRecords}` : undefined
    },
    {
      id: 'deadlines' as CommandTab,
      label: 'Deadline Center',
      icon: <Clock className="w-4 h-4" />,
      badge: overdueCount > 0 ? `${overdueCount} Overdue` : undefined,
      isAlert: overdueCount > 0
    },
    {
      id: 'health' as CommandTab,
      label: 'Portfolio Health',
      icon: <Activity className="w-4 h-4" />,
      badge: `${healthScore}%`,
      badgeColor: healthScore >= 80 ? 'bg-[#DDF5E9] text-[#12633C]' : 'bg-amber-100 text-amber-800'
    },
    {
      id: 'documents' as CommandTab,
      label: 'Document Vault',
      icon: <Files className="w-4 h-4" />,
      badge: totalDocs > 0 ? `${totalDocs}` : undefined
    },
    {
      id: 'ai' as CommandTab,
      label: 'AI IP Assistant',
      icon: <Sparkles className="w-4 h-4 text-[#55349E]" />,
      badge: 'Gemini',
      badgeColor: 'bg-[#EFE8FF] text-[#55349E]'
    },
    {
      id: 'impact' as CommandTab,
      label: 'Impact & Reports',
      icon: <FileSpreadsheet className="w-4 h-4" />
    },
    {
      id: 'settings' as CommandTab,
      label: 'Settings & Legal',
      icon: <Settings className="w-4 h-4" />
    }
  ];

  const handleNavClick = (id: CommandTab) => {
    onSelectTab(id);
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Header Bar */}
      <div className="lg:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-[#F8F7F3] border-b border-[#E7E3D8]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#1E2A49] flex items-center justify-center text-white">
            <Shield className="w-4 h-4 text-[#4563EB]" />
          </div>
          <span className="text-xs font-bold text-[#1E2A49]">IP Guardian Command</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenNewRecord}
            className="p-1.5 text-[#4563EB] hover:bg-blue-50 rounded-lg"
            title="Register Record"
          >
            <PlusCircle className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="p-1.5 text-slate-700 hover:bg-slate-200/50 rounded-lg"
            aria-label="Toggle menu"
          >
            {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Main Sidebar Desktop + Offcanvas Drawer */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-40 w-64 bg-[#F8F7F3] border-r border-[#E7E3D8] flex flex-col transition-transform duration-200 lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand & Subtitle */}
        <div className="p-4 border-b border-[#E7E3D8] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#1E2A49] flex items-center justify-center text-white shadow-xs">
              <Shield className="w-4 h-4 text-[#4563EB]" />
            </div>
            <div>
              <span className="text-xs font-bold text-[#1E2A49] tracking-tight block">
                IP Guardian
              </span>
              <span className="text-[10px] text-slate-500 block font-mono">
                Command Center
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onReturnLanding}
            className="text-[10px] text-slate-400 hover:text-slate-700 flex items-center gap-1 font-medium"
            title="View public overview"
          >
            <span className="hidden sm:inline">Portal</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </button>
        </div>

        {/* Quick Add CTA */}
        <div className="p-3">
          <button
            type="button"
            onClick={() => {
              onOpenNewRecord();
              setIsMobileOpen(false);
            }}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold text-white bg-[#4563EB] hover:bg-[#344ec7] rounded-xl shadow-xs transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add IP Record</span>
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-1.5 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-white text-[#1E2A49] font-bold shadow-2xs border border-[#E7E3D8]'
                    : 'text-slate-600 hover:bg-white/60 hover:text-[#1E2A49]'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className={isActive ? 'text-[#4563EB]' : 'text-slate-400'}>
                    {item.icon}
                  </span>
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-semibold ${
                      item.isAlert
                        ? 'bg-[#F9E2E7] text-[#9C243E] border border-[#F2CAD2]'
                        : item.badgeColor || 'bg-slate-200/60 text-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Completeness Mini Meter */}
        <div className="mx-3 mb-2 p-3 rounded-xl bg-white border border-[#E7E3D8] space-y-1.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-semibold text-slate-700">Portfolio Completeness</span>
            <span className="font-mono font-bold text-[#12633C]">{healthScore}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-[#4563EB] h-full rounded-full transition-all duration-500"
              style={{ width: `${healthScore}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-400">
            <span>Administrative audit</span>
            <button
              onClick={() => handleNavClick('health')}
              className="text-[#4563EB] hover:underline font-medium"
            >
              Fix items
            </button>
          </div>
        </div>

        {/* Demo Status & Reset */}
        <div className="mx-3 mb-3 p-2.5 rounded-xl bg-slate-50 border border-[#E7E3D8]/80 text-[10px] text-slate-500 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
            <span>Demo Data Active</span>
          </div>
          <button
            type="button"
            onClick={onResetDemo}
            className="text-slate-600 hover:text-slate-900 font-medium flex items-center gap-1"
            title="Reset to sample records"
          >
            <RotateCcw className="w-2.5 h-2.5 text-slate-400" />
            <span>Reset</span>
          </button>
        </div>

        {/* User Card */}
        <div className="p-3 border-t border-[#E7E3D8] bg-white flex items-center gap-3">
          <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-200 shrink-0">
            <img
              src={avatarOfficer}
              alt="Dr. Sarah Lin"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-[#1E2A49] truncate leading-tight">Dr. Sarah Lin</p>
            <p className="text-[10px] text-[#4563EB] font-medium truncate flex items-center gap-1">
              <UserCheck className="w-2.5 h-2.5" />
              <span>{currentRole}</span>
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
