/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { LandingPage } from './pages/LandingPage';
import { DashboardCommandPage } from './pages/DashboardCommandPage';
import { PortfolioVisualPage } from './pages/PortfolioVisualPage';
import { DeadlinesPage } from './pages/DeadlinesPage';
import { PortfolioHealthPage } from './pages/PortfolioHealthPage';
import { DocumentsPage } from './pages/DocumentsPage';
import { ImpactReportsPage } from './pages/ImpactReportsPage';
import { SettingsPage } from './pages/SettingsPage';
import { SidebarCommand, CommandTab } from './components/common/SidebarCommand';
import { HeaderCommandBar } from './components/common/HeaderCommandBar';
import { CommandPaletteModal } from './components/common/CommandPaletteModal';
import { AiAssistantModal } from './components/common/AiAssistantModal';
import { RecordDetailDrawer } from './components/records/RecordDetailDrawer';
import { RecordFormModal } from './components/records/RecordFormModal';
import { ToastContainer, ToastMessage } from './components/common/Toast';
import { ConfirmDialog } from './components/common/ConfirmDialog';
import { IPRecord, UserRole, WorkspaceItem } from './types/ip';
import { fetchRecords, fetchDeadlines, fetchAnalytics, resetDemoData, deleteRecord } from './services/api';

export default function App() {
  const [viewMode, setViewMode] = useState<'landing' | 'workspace'>('workspace');
  const [activeTab, setActiveTab] = useState<CommandTab>('dashboard');

  // Role and Workspace state
  const [currentRole, setCurrentRole] = useState<UserRole>('Coordinator');
  const [activeWorkspace, setActiveWorkspace] = useState('Apex University Innovation Hub');
  const workspaces: WorkspaceItem[] = [
    { id: 'ws-apex', name: 'Apex University Innovation Hub', role: 'Coordinator' },
    { id: 'ws-stjude', name: 'St. Jude Clinical Tech Transfer', role: 'Reviewer' },
    { id: 'ws-bionexus', name: 'BioNexus Student Incubator', role: 'Inventor' }
  ];

  // Records cache for command palette & metrics
  const [allRecords, setAllRecords] = useState<IPRecord[]>([]);

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [recordToEdit, setRecordToEdit] = useState<IPRecord | null>(null);
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState(false);
  const [activeRecordForAi, setActiveRecordForAi] = useState<IPRecord | null>(null);

  // Global delete confirmation state
  const [recordToDeleteGlobal, setRecordToDeleteGlobal] = useState<IPRecord | null>(null);
  const [isDeletingGlobal, setIsDeletingGlobal] = useState(false);

  // Live Metric badges
  const [overdueCount, setOverdueCount] = useState(0);
  const [dueSoonCount, setDueSoonCount] = useState(0);
  const [totalRecords, setTotalRecords] = useState(7);
  const [totalDocs, setTotalDocs] = useState(4);
  const [healthScore, setHealthScore] = useState(86);

  // Toast feedback state
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  const addToast = (type: 'success' | 'error' | 'info', title: string, message?: string) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Synchronize live overview numbers
  const refreshLiveMetrics = useCallback(async () => {
    try {
      const [analytics, deadlinesData, recordsData] = await Promise.all([
        fetchAnalytics(),
        fetchDeadlines(),
        fetchRecords({ limit: 100 })
      ]);
      setTotalRecords(analytics.total_records);
      setTotalDocs(analytics.total_documents);
      setHealthScore(analytics.overall_completeness);
      setOverdueCount(analytics.deadlines.overdue);
      setDueSoonCount(analytics.deadlines.due_soon);
      setAllRecords(recordsData.records);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    refreshLiveMetrics();
  }, [refreshLiveMetrics, refreshKey]);

  // Global Keyboard Shortcut: Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleOpenNewRecord = () => {
    setRecordToEdit(null);
    setIsFormOpen(true);
  };

  const handleEditRecord = (record: IPRecord) => {
    setRecordToEdit(record);
    setIsFormOpen(true);
  };

  const handleRecordSaved = (savedRecord: IPRecord, isNew: boolean) => {
    addToast(
      'success',
      isNew ? 'Record Registered' : 'Changes Saved',
      `"${savedRecord.title}" has been successfully persisted in the database.`
    );
    setRefreshKey((k) => k + 1);
  };

  const handleResetDemo = async () => {
    try {
      await resetDemoData();
      addToast('success', 'Demo Reset', 'Sample university patents, trademarks, and deadlines restored.');
      setRefreshKey((k) => k + 1);
    } catch (err: any) {
      addToast('error', 'Reset Failed', err.message);
    }
  };

  const handleConfirmDeleteGlobal = async () => {
    if (!recordToDeleteGlobal) return;
    setIsDeletingGlobal(true);
    try {
      await deleteRecord(recordToDeleteGlobal.id);
      addToast(
        'success',
        'Record Deleted',
        `"${recordToDeleteGlobal.title}" was purged from the repository.`
      );
      setRecordToDeleteGlobal(null);
      setSelectedRecordId(null);
      setRefreshKey((k) => k + 1);
    } catch (err: any) {
      addToast('error', 'Delete Failed', err.message);
    } finally {
      setIsDeletingGlobal(false);
    }
  };

  const handleOpenAiAssistant = (record?: IPRecord) => {
    setActiveRecordForAi(record || null);
    setIsAiAssistantOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#F8F7F3] text-[#1E2A49] font-sans antialiased selection:bg-[#EFE8FF] selection:text-[#55349E]">
      {viewMode === 'landing' ? (
        <LandingPage onOpenDashboard={() => setViewMode('workspace')} />
      ) : (
        <div className="flex min-h-screen">
          {/* Elegant Slim Left Navigation Sidebar */}
          <SidebarCommand
            activeTab={activeTab}
            onSelectTab={(tab) => {
              if (tab === 'ai') {
                handleOpenAiAssistant();
              } else {
                setActiveTab(tab);
              }
            }}
            onOpenNewRecord={handleOpenNewRecord}
            onResetDemo={handleResetDemo}
            onReturnLanding={() => setViewMode('landing')}
            overdueCount={overdueCount}
            totalRecords={totalRecords}
            totalDocs={totalDocs}
            healthScore={healthScore}
            currentRole={currentRole}
          />

          {/* Main Workspace Frame */}
          <div className="flex-1 min-w-0 flex flex-col lg:ml-0">
            {/* Top Command Bar — hidden on mobile (SidebarCommand has its own mobile top bar) */}
            <div className="hidden lg:block">
            <HeaderCommandBar
              currentRole={currentRole}
              onRoleChange={(r) => {
                setCurrentRole(r);
                addToast('info', 'Active Role Updated', `Now viewing workspace as ${r}.`);
              }}
              activeWorkspace={activeWorkspace}
              onWorkspaceChange={(ws) => {
                setActiveWorkspace(ws);
                addToast('info', 'Workspace Switched', `Active context: ${ws}`);
              }}
              workspaces={workspaces}
              onOpenNewRecord={handleOpenNewRecord}
              onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
              onOpenAiAssistant={() => handleOpenAiAssistant()}
              overdueCount={overdueCount}
              dueSoonCount={dueSoonCount}
              onNavigateToDeadlines={() => setActiveTab('deadlines')}
              onSelectRecord={(id) => setSelectedRecordId(id)}
            />
            </div>

            {/* Viewport Content */}
            <main className="flex-1 p-3 sm:p-5 lg:p-8 max-w-7xl w-full mx-auto overflow-x-hidden">
              {activeTab === 'dashboard' && (
                <DashboardCommandPage
                  key={`dash-${refreshKey}`}
                  currentRole={currentRole}
                  onOpenNewRecord={handleOpenNewRecord}
                  onNavigateToPortfolio={() => setActiveTab('portfolio')}
                  onNavigateToDeadlines={() => setActiveTab('deadlines')}
                  onNavigateToHealth={() => setActiveTab('health')}
                  onSelectRecord={(id) => setSelectedRecordId(id)}
                  onOpenAiAssistant={() => handleOpenAiAssistant()}
                />
              )}

              {activeTab === 'portfolio' && (
                <PortfolioVisualPage
                  key={`port-${refreshKey}`}
                  onOpenNewRecord={handleOpenNewRecord}
                  onSelectRecord={(id) => setSelectedRecordId(id)}
                  onEditRecord={handleEditRecord}
                  onNotify={addToast}
                />
              )}

              {activeTab === 'deadlines' && (
                <DeadlinesPage
                  key={`dead-${refreshKey}`}
                  onSelectRecord={(id) => setSelectedRecordId(id)}
                  onNotify={addToast}
                />
              )}

              {activeTab === 'health' && (
                <PortfolioHealthPage
                  key={`health-${refreshKey}`}
                  onSelectRecord={(id) => setSelectedRecordId(id)}
                  onEditRecord={handleEditRecord}
                />
              )}

              {activeTab === 'documents' && (
                <DocumentsPage
                  key={`docs-${refreshKey}`}
                  onSelectRecord={(id) => setSelectedRecordId(id)}
                  onNotify={addToast}
                />
              )}

              {activeTab === 'impact' && (
                <ImpactReportsPage key={`impact-${refreshKey}`} />
              )}

              {activeTab === 'settings' && (
                <SettingsPage
                  onNotify={addToast}
                  onRefreshAll={() => setRefreshKey((k) => k + 1)}
                />
              )}
            </main>
          </div>
        </div>
      )}

      {/* Slide-over Record Details Drawer */}
      <RecordDetailDrawer
        isOpen={Boolean(selectedRecordId)}
        onClose={() => setSelectedRecordId(null)}
        recordId={selectedRecordId}
        onEdit={(rec) => {
          setSelectedRecordId(null);
          handleEditRecord(rec);
        }}
        onDelete={(rec) => {
          setRecordToDeleteGlobal(rec);
        }}
        onOpenAiAssistantWithRecord={(rec) => handleOpenAiAssistant(rec)}
        onRecordUpdated={() => setRefreshKey((k) => k + 1)}
      />

      {/* Record Creation & Edit Modal */}
      <RecordFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        recordToEdit={recordToEdit}
        onSuccess={handleRecordSaved}
      />

      {/* Global Command Palette Modal (Cmd+K) */}
      <CommandPaletteModal
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        records={allRecords}
        onSelectRecord={(id) => setSelectedRecordId(id)}
        onNavigateTab={(tab) => {
          if (tab === 'ai') handleOpenAiAssistant();
          else setActiveTab(tab);
        }}
        onOpenNewRecord={handleOpenNewRecord}
        onOpenAiAssistant={() => handleOpenAiAssistant()}
        onExportCsv={() => {
          window.location.href = '/api/records/export/csv';
        }}
      />

      {/* AI IP Assistant Modal */}
      <AiAssistantModal
        isOpen={isAiAssistantOpen}
        onClose={() => setIsAiAssistantOpen(false)}
        activeRecord={activeRecordForAi}
      />

      {/* Confirm Deletion Dialog */}
      <ConfirmDialog
        isOpen={Boolean(recordToDeleteGlobal)}
        onClose={() => setRecordToDeleteGlobal(null)}
        onConfirm={handleConfirmDeleteGlobal}
        title="Confirm Record Deletion"
        message={`Are you sure you want to permanently delete "${recordToDeleteGlobal?.title}" (${recordToDeleteGlobal?.application_number})? All supporting documents in the vault will be purged.`}
        confirmLabel="Delete Record"
        isDestructive={true}
        isLoading={isDeletingGlobal}
      />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
