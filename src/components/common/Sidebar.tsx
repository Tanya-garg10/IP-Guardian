import React, { useState } from 'react';
import {
  Shield,
  LayoutDashboard,
  FolderArchive,
  Clock,
  Files,
  Settings,
  PlusCircle,
  RotateCcw,
  Menu,
  X,
  ExternalLink
} from 'lucide-react';
import avatarOfficer from '../../assets/images/avatar_officer_1791740136733.jpg';

export type ActiveTab = 'dashboard' | 'portfolio' | 'deadlines' | 'documents' | 'settings';

interface SidebarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onOpenNewRecord: () => void;
  onResetDemo: () => void;
  onReturnLanding: () => void;
  overdueCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  onOpenNewRecord,
  onResetDemo,
  onReturnLanding,
  overdueCount = 0
}) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navItems = [
    {
      id: 'dashboard' as ActiveTab,
      label: 'Overview & Analytics',
      icon: <LayoutDashboard className="w-4 h-4" />
    },
    {
      id: 'portfolio' as ActiveTab,
      label: 'IP Portfolio',
      icon: <FolderArchive className="w-4 h-4" />
    },
    {
      id: 'deadlines' as ActiveTab,
      label: 'Deadline Monitor',
      icon: <Clock className="w-4 h-4" />,
      badge: overdueCount > 0 ? `${overdueCount} Overdue` : undefined
    },
    {
      id: 'documents' as ActiveTab,
      label: 'Document Vault',
      icon: <Files className="w-4 h-4" />
    },
    {
      id: 'settings' as ActiveTab,
      label: 'Settings & Compliance',
      icon: <Settings className="w-4 h-4" />
    }
  ];

  const handleNavClick = (id: ActiveTab) => {
    onSelectTab(id);
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="lg:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white">
            <Shield className="w-4 h-4" />
          </div>
          <span className="text-sm font-bold text-slate-900">IP Guardian</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenNewRecord}
            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
            title="Register Record"
          >
            <PlusCircle className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
            aria-label="Toggle navigation menu"
          >
            {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Backdrop for Mobile */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-xs"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Main Sidebar (Desktop fixed, Mobile off-canvas) */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-40 w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-200 lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <span className="text-sm font-bold text-slate-900 tracking-tight block">
                IP Guardian
              </span>
              <span className="text-[10px] text-slate-500 block">
                LegalTech Innovation Cell
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onReturnLanding}
            className="text-[11px] text-slate-400 hover:text-slate-700 flex items-center gap-1"
            title="Return to public landing"
          >
            <span className="hidden sm:inline">Landing</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>

        {/* Primary Action Button */}
        <div className="p-3">
          <button
            type="button"
            onClick={() => {
              onOpenNewRecord();
              setIsMobileOpen(false);
            }}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Register IP Record</span>
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-800 font-semibold shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className={isActive ? 'text-blue-600' : 'text-slate-400'}>
                    {item.icon}
                  </span>
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] font-mono font-semibold text-rose-600 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Demo Status & Safe Reset */}
        <div className="p-3 mx-3 mb-2 rounded-lg bg-slate-50 border border-slate-200/80">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-semibold text-slate-700">Demo Environment</span>
            <span className="text-[10px] text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded font-medium">
              Active
            </span>
          </div>
          <p className="text-[10px] text-slate-500 leading-tight mb-2">
            Loaded with sample university patents, trademarks, and overdue filings.
          </p>
          <button
            type="button"
            onClick={onResetDemo}
            className="w-full flex items-center justify-center gap-1.5 py-1 px-2 text-[11px] text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded transition-colors"
          >
            <RotateCcw className="w-3 h-3 text-slate-400" />
            <span>Reset Demo Records</span>
          </button>
        </div>

        {/* User Profile Card */}
        <div className="p-3 border-t border-slate-100 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
            <img
              src={avatarOfficer}
              alt="Dr. Sarah Lin"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-slate-900 truncate">Dr. Sarah Lin</p>
            <p className="text-[10px] text-slate-500 truncate">Tech Transfer Lead</p>
          </div>
        </div>
      </aside>
    </>
  );
};
