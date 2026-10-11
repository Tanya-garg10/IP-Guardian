import React, { useState } from 'react';
import { LegalDisclaimer } from '../components/common/LegalDisclaimer';
import { resetDemoData } from '../services/api';
import {
  Shield,
  RotateCcw,
  User,
  Building2,
  Server,
  Database,
  Lock,
  Code2,
  CheckCircle2,
  BookOpen,
  Info
} from 'lucide-react';
import avatarOfficer from '../assets/images/avatar_officer_1791740136733.jpg';

interface SettingsPageProps {
  onNotify: (type: 'success' | 'error', title: string, message?: string) => void;
  onRefreshAll: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  onNotify,
  onRefreshAll
}) => {
  const [isResetting, setIsResetting] = useState(false);

  const handleReset = async () => {
    setIsResetting(true);
    try {
      await resetDemoData();
      onNotify('success', 'Demo Environment Reset', 'Sample patents, trademarks, and copyrights have been reloaded.');
      onRefreshAll();
    } catch (err: any) {
      onNotify('error', 'Reset Failed', err.message);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1E2A49]">
          Settings, Architecture & Compliance
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Institutional profile settings, system runtime specifications, and legal governance
        </p>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-2xl border border-[#E7E3D8] p-6 shadow-2xs space-y-4">
        <h2 className="text-sm font-semibold text-[#1E2A49] flex items-center gap-2">
          <User className="w-4 h-4 text-[#4563EB]" />
          <span>Institutional Innovation Cell Profile</span>
        </h2>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-1">
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-slate-200 shrink-0">
            <img
              src={avatarOfficer}
              alt="Dr. Sarah Lin"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900">Dr. Sarah Lin, Ph.D.</h3>
            <p className="text-xs text-slate-600">Director of Technology Transfer & Patent Commercialization</p>
            <p className="text-xs text-slate-500 flex items-center gap-1.5 pt-0.5">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <span>Apex University Innovation Cell · Division of Research & Enterprise</span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100 text-xs">
          <div className="p-3 bg-slate-50 rounded-lg">
            <span className="text-slate-400 block text-[11px]">Primary Contact</span>
            <span className="font-medium text-slate-800">director@university-techtransfer.org</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg">
            <span className="text-slate-400 block text-[11px]">Jurisdiction Focus</span>
            <span className="font-medium text-slate-800">USPTO, WIPO (PCT), EUIPO</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg">
            <span className="text-slate-400 block text-[11px]">Role Permissions</span>
            <span className="font-medium text-emerald-700">Administrator (Full CRUD & Vault)</span>
          </div>
        </div>
      </div>

      {/* Demo Environment Controls */}
      <div className="bg-white rounded-2xl border border-[#E7E3D8] p-6 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-semibold text-[#1E2A49]">Demo Environment & Data Management</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Restore the standard fictional dataset with sample patents, overdue trademarks, approved copyrights, and vaulted documents
            </p>
          </div>
          <button
            type="button"
            onClick={handleReset}
            disabled={isResetting}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 bg-[#F8F7F3] hover:bg-[#eceae2] border border-[#E7E3D8] disabled:opacity-50 rounded-xl transition-colors shadow-2xs shrink-0"
          >
            {isResetting ? (
              <span className="w-3.5 h-3.5 border-2 border-slate-400 border-t-[#4563EB] rounded-full animate-spin" />
            ) : (
              <RotateCcw className="w-3.5 h-3.5 text-[#4563EB]" />
            )}
            <span>Reset Demo Records</span>
          </button>
        </div>
      </div>

      {/* Full-Stack Architecture Specifications */}
      <div className="bg-white rounded-2xl border border-[#E7E3D8] p-6 shadow-2xs space-y-4">
        <h2 className="text-sm font-semibold text-[#1E2A49] flex items-center gap-2">
          <Server className="w-4 h-4 text-[#4563EB]" />
          <span>Full-Stack Architecture & Production Roadmap</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
            <h3 className="font-semibold text-slate-900 flex items-center gap-1.5">
              <Database className="w-4 h-4 text-blue-600" />
              <span>Current Runtime (Full-Stack Express + Node.js)</span>
            </h3>
            <ul className="space-y-1 text-slate-600 list-disc list-inside">
              <li><strong>Runtime:</strong> Node.js with Express 4.x REST endpoints mounted on port 3000</li>
              <li><strong>Persistence:</strong> Atomic write JSON database engine (<code className="font-mono text-[11px]">./data/ip_guardian_db.json</code>) with automatic schema verification</li>
              <li><strong>Document Storage:</strong> Secure server disk vault (<code className="font-mono text-[11px]">./data/uploads/</code>) with unique hash suffixes and authenticated streaming</li>
              <li><strong>Analytics Engine:</strong> Real-time in-memory aggregation of lifecycle stages and statutory deadlines</li>
            </ul>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
            <h3 className="font-semibold text-slate-900 flex items-center gap-1.5">
              <Code2 className="w-4 h-4 text-teal-600" />
              <span>Django & PostgreSQL Target Architecture</span>
            </h3>
            <ul className="space-y-1 text-slate-600 list-disc list-inside">
              <li><strong>Target Framework:</strong> Python 3.12 + Django 5.x + Django REST Framework</li>
              <li><strong>Database:</strong> PostgreSQL with relational ForeignKeys (<code className="font-mono text-[11px]">IPRecord</code> 1:N <code className="font-mono text-[11px]">Document</code>)</li>
              <li><strong>Security & RBAC:</strong> Django Session & JWT Auth with row-level ownership checks</li>
              <li><strong>Storage:</strong> S3 / GCS via <code className="font-mono text-[11px]">django-storages</code> for confidential PDF and image attachments</li>
            </ul>
          </div>
        </div>

        {/* REST API Endpoints Table */}
        <div className="pt-2">
          <h4 className="text-xs font-semibold text-slate-800 mb-2">Verified REST API Endpoints</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[11px] font-mono border border-slate-200 rounded-lg overflow-hidden">
              <thead className="bg-slate-100 text-slate-700">
                <tr>
                  <th className="p-2">Method</th>
                  <th className="p-2">Path</th>
                  <th className="p-2 font-sans font-semibold">Purpose</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white text-slate-600">
                <tr>
                  <td className="p-2 font-bold text-blue-600">GET</td>
                  <td className="p-2">/api/records</td>
                  <td className="p-2 font-sans">Search, filter by type/status, sort & paginate records</td>
                </tr>
                <tr>
                  <td className="p-2 font-bold text-emerald-600">POST</td>
                  <td className="p-2">/api/records</td>
                  <td className="p-2 font-sans">Validate & create a new IP record</td>
                </tr>
                <tr>
                  <td className="p-2 font-bold text-amber-600">PUT</td>
                  <td className="p-2">/api/records/:id</td>
                  <td className="p-2 font-sans">Update existing record details & notes</td>
                </tr>
                <tr>
                  <td className="p-2 font-bold text-rose-600">DELETE</td>
                  <td className="p-2">/api/records/:id</td>
                  <td className="p-2 font-sans">Delete record and purge associated vaulted files</td>
                </tr>
                <tr>
                  <td className="p-2 font-bold text-emerald-600">POST</td>
                  <td className="p-2">/api/records/:id/documents</td>
                  <td className="p-2 font-sans">Upload supporting document via Multer with validation</td>
                </tr>
                <tr>
                  <td className="p-2 font-bold text-blue-600">GET</td>
                  <td className="p-2">/api/documents/:id/download</td>
                  <td className="p-2 font-sans">Safe authenticated streaming download</td>
                </tr>
                <tr>
                  <td className="p-2 font-bold text-blue-600">GET</td>
                  <td className="p-2">/api/analytics</td>
                  <td className="p-2 font-sans">Compute live portfolio metrics & status counts</td>
                </tr>
                <tr>
                  <td className="p-2 font-bold text-blue-600">GET</td>
                  <td className="p-2">/api/deadlines</td>
                  <td className="p-2 font-sans">Calculate day countdowns & classify overdue/due-soon tasks</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Privacy and Data Protection Notice */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-2 text-xs text-slate-600">
        <h3 className="font-semibold text-slate-900 flex items-center gap-1.5">
          <Lock className="w-4 h-4 text-blue-600" />
          <span>Confidentiality & Prior Art Protection</span>
        </h3>
        <p className="leading-relaxed">
          Public disclosure of an invention before formal filing can forfeit patentability rights under international novelty rules (35 U.S.C. § 102 and EPC Article 54). IP Guardian ensures unpublished draft disclosures remain strictly confidential within institutional boundaries.
        </p>
      </div>

      {/* Prominent Legal Disclaimer */}
      <LegalDisclaimer />
    </div>
  );
};
