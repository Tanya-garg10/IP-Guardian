import React from 'react';
import { Navbar } from '../components/common/Navbar';
import { LegalDisclaimer } from '../components/common/LegalDisclaimer';
import {
  Shield,
  Lightbulb,
  Bookmark,
  FileText,
  Clock,
  Files,
  ArrowRight,
  CheckCircle2,
  Lock,
  Building,
  GraduationCap,
  Sparkles
} from 'lucide-react';
import heroImage from '../assets/images/hero_ip_guardian_1791740122183.jpg';
import vaultImage from '../assets/images/vault_schematic_1791740155844.jpg';

interface LandingPageProps {
  onOpenDashboard: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenDashboard }) => {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#F8F7F3] text-[#1E2A49] flex flex-col font-sans">
      {/* Top Bar following Top Bar Contract */}
      <Navbar
        onOpenDashboard={onOpenDashboard}
        onExploreFeatures={() => scrollTo('features-section')}
        onWorkflowClick={() => scrollTo('workflow-section')}
        onDisclaimerClick={() => scrollTo('disclaimer-section')}
      />

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden bg-[#F8F7F3] border-b border-[#E7E3D8]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Left Column: Value Proposition */}
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#55349E] bg-[#EFE8FF] border border-[#D9C8FF] px-3 py-1 rounded-xl">
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>IP Guardian — Innovation Command Center</span>
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#1E2A49] leading-[1.12]">
                  Your Intellectual Property, <span className="text-[#4563EB]">Organised.</span>
                </h1>

                <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
                  A unified management system for researchers, student creators, and tech transfer teams to manage patents, trademarks, and copyrights. Track applications, secure supporting documents, and identify upcoming administrative tasks.
                </p>

                <div className="text-xs font-medium text-slate-500 flex items-center gap-4">
                  <span className="font-semibold text-slate-800">Tagline:</span>
                  <span>Protect Ideas · Track Innovation · Never Miss a Deadline</span>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={onOpenDashboard}
                    className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-[#4563EB] hover:bg-[#344ec7] rounded-xl shadow-xs transition-colors"
                  >
                    <span>Open Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => scrollTo('features-section')}
                    className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-[#1E2A49] bg-white border border-[#E7E3D8] hover:bg-[#F8F7F3] rounded-xl transition-colors shadow-2xs"
                  >
                    <span>Explore Features</span>
                  </button>
                </div>

                {/* Trust Proof Points */}
                <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-100 text-slate-600">
                  <div>
                    <div className="text-xl sm:text-2xl font-bold font-mono text-slate-900 tabular-nums">100%</div>
                    <div className="text-xs text-slate-500 mt-0.5">Database Persistence</div>
                  </div>
                  <div>
                    <div className="text-xl sm:text-2xl font-bold font-mono text-slate-900 tabular-nums">&lt; 7 Days</div>
                    <div className="text-xs text-slate-500 mt-0.5">Urgent Due Countdown</div>
                  </div>
                  <div>
                    <div className="text-xl sm:text-2xl font-bold font-mono text-slate-900 tabular-nums">Zero Loss</div>
                    <div className="text-xs text-slate-500 mt-0.5">Secure Document Vault</div>
                  </div>
                </div>
              </div>

              {/* Right Column: Visual Anchor */}
              <div className="lg:col-span-5 relative">
                <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-xl bg-white">
                  <img
                    src={heroImage}
                    alt="Intellectual Property Architectural Blueprint & Patent Schematics"
                    referrerPolicy="no-referrer"
                    className="w-full h-auto object-cover aspect-[16/10]"
                  />
                  <div className="p-4 bg-white border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-slate-900">Official Tech Transfer Registry</p>
                      <p className="text-[11px] text-slate-500">Live synchronization with institutional records</p>
                    </div>
                    <span className="text-[11px] font-mono font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      Demo Verified
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Cards Section */}
        <section id="features-section" className="py-20 bg-white border-b border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                Core Capabilities
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-1.5">
                Engineered for High-Stakes Legal Administration
              </h2>
              <p className="text-sm text-slate-600 mt-2">
                Replace fragmented spreadsheets with a structured, verified system of record designed to prevent abandoned applications.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Feature 1: IP Repository */}
              <div className="p-6 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors space-y-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Shield className="w-5 h-5" />
                </div>
                <h3 className="text-base font-semibold text-slate-900">Unified IP Repository</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Catalog patents, registered trademarks, and software copyrights in one searchable institutional archive with application numbers and ownership records.
                </p>
                <div className="text-[11px] text-blue-600 font-medium pt-1 flex items-center gap-1">
                  <span>Patents · Trademarks · Copyrights</span>
                </div>
              </div>

              {/* Feature 2: Deadline Monitoring */}
              <div className="p-6 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors space-y-3">
                <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
                <h3 className="text-base font-semibold text-slate-900">Deadline Monitor</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Real-time calculations automatically categorize statutory office action deadlines, filing cutoffs, and renewals into Overdue, Due Soon (&le; 7 days), and Upcoming.
                </p>
                <div className="text-[11px] text-amber-600 font-medium pt-1 flex items-center gap-1">
                  <span>Urgency status & day countdowns</span>
                </div>
              </div>

              {/* Feature 3: Application Tracking */}
              <div className="p-6 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors space-y-3">
                <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <h3 className="text-base font-semibold text-slate-900">Application Tracking</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Trace progress across lifecycle stages from early Idea to Draft, Formal Filing, Examination Under Review, and Final Grant or Approval.
                </p>
                <div className="text-[11px] text-teal-600 font-medium pt-1 flex items-center gap-1">
                  <span>6 structured lifecycle phases</span>
                </div>
              </div>

              {/* Feature 4: Document Vault */}
              <div className="p-6 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors space-y-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Files className="w-5 h-5" />
                </div>
                <h3 className="text-base font-semibold text-slate-900">Document Management</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Upload and associate claims drafts, official office action notices, examination briefs, and packaging specimens directly with specific IP records.
                </p>
                <div className="text-[11px] text-indigo-600 font-medium pt-1 flex items-center gap-1">
                  <span>Encrypted development storage</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Workflow Section */}
        <section id="workflow-section" className="py-20 bg-slate-50 border-b border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                Institutional Workflow
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-1.5">
                How IP Guardian Powers Tech Transfer
              </h2>
              <p className="text-sm text-slate-600 mt-2">
                A structured four-step methodology ensuring clarity from invention disclosure through final grant.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                {
                  step: '01',
                  title: 'Record & Classify',
                  desc: 'Document the invention, trademark mark, or software copyright with assigned inventors, ownership cells, and application codes.'
                },
                {
                  step: '02',
                  title: 'Monitor Deadlines',
                  desc: 'Set critical examination and response cutoffs. IP Guardian computes days remaining and alerts staff to impending deadlines.'
                },
                {
                  step: '03',
                  title: 'Vault Supporting Files',
                  desc: 'Attach formal office actions, priority claims, declarations, and photographic specimens directly into the secure local storage.'
                },
                {
                  step: '04',
                  title: 'Audit & Deliver',
                  desc: 'Track metrics across colleges and labs, generating transparent reports for university innovation leaders and founders.'
                }
              ].map((item) => (
                <div key={item.step} className="p-6 bg-white rounded-xl border border-slate-200 space-y-3">
                  <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                    Step {item.step}
                  </span>
                  <h3 className="text-sm font-semibold text-slate-900">{item.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>

            {/* Document Vault Graphic Callout */}
            <div className="mt-14 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 flex flex-col lg:flex-row items-center gap-8 shadow-sm">
              <div className="lg:w-1/2 space-y-4">
                <div className="inline-flex items-center gap-2 text-xs font-semibold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-md">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Secure Records Architecture</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
                  Local Document Vault & Controlled Downloads
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Documents uploaded to IP Guardian are stored in a dedicated local server directory, mapped with sanitized unique references, and served through authenticated download endpoints rather than exposing raw filesystem paths.
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={onOpenDashboard}
                    className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    <span>Inspect Vault in Workspace</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="lg:w-1/2 w-full">
                <div className="rounded-xl overflow-hidden border border-slate-200 shadow-md">
                  <img
                    src={vaultImage}
                    alt="Digital Legal Records Archive Vault"
                    referrerPolicy="no-referrer"
                    className="w-full h-auto object-cover aspect-[4/3]"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Hackathon 2026 Section */}
        <section id="hackathon-section" className="py-16 bg-white border-b border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="p-8 rounded-2xl bg-gradient-to-r from-blue-900 to-slate-900 text-white shadow-xl space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-xs font-mono font-medium text-blue-300">
                    Social Impact Hackathon 2026
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold">
                    Empowering Student Inventors & Grassroots Research
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={onOpenDashboard}
                  className="px-5 py-2.5 text-xs font-bold text-slate-900 bg-white hover:bg-blue-50 rounded-lg transition-colors"
                >
                  Launch Applet Workspace
                </button>
              </div>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed max-w-3xl">
                Every year, hundreds of student innovations and university research patents are abandoned simply due to missed response deadlines or lost office action paperwork. IP Guardian solves this administrative bottleneck by equipping university innovation cells with a zero-cost, robust operating platform.
              </p>
            </div>
          </div>
        </section>

        {/* Disclaimer Section */}
        <section id="disclaimer-section" className="py-12 bg-slate-50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <LegalDisclaimer />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue-600" />
            <span className="font-semibold text-slate-800">IP Guardian</span>
            <span>— Intellectual Property Management System</span>
          </div>
          <div>
            <span>Social Impact Hackathon 2026 · Tech Transfer & LegalTech Edition</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
