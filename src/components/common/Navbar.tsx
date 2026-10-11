import React from 'react';
import { Shield } from 'lucide-react';

interface NavbarProps {
  onOpenDashboard: () => void;
  onExploreFeatures?: () => void;
  onWorkflowClick?: () => void;
  onDisclaimerClick?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenDashboard,
  onExploreFeatures,
  onWorkflowClick,
  onDisclaimerClick
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E7E3D8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand wordmark (single text element / brand lockup) */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 rounded-xl bg-[#1E2A49] flex items-center justify-center text-white shadow-xs">
            <Shield className="w-4 h-4 text-[#4563EB]" />
          </div>
          <span className="text-base font-bold tracking-tight text-[#1E2A49] whitespace-nowrap">
            IP Guardian <span className="text-xs font-mono font-medium text-[#4563EB] ml-1">Command Center</span>
          </span>
        </div>

        {/* Zone 2: 4-5 single-line navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-xs font-medium text-slate-600">
          <button
            type="button"
            onClick={onExploreFeatures}
            className="hover:text-[#4563EB] transition-colors whitespace-nowrap shrink-0"
          >
            Features
          </button>
          <button
            type="button"
            onClick={onWorkflowClick}
            className="hover:text-[#4563EB] transition-colors whitespace-nowrap shrink-0"
          >
            How It Works
          </button>
          <button
            type="button"
            onClick={onDisclaimerClick}
            className="hover:text-[#4563EB] transition-colors whitespace-nowrap shrink-0"
          >
            Compliance & Disclaimer
          </button>
          <a
            href="#hackathon-section"
            className="hover:text-[#4563EB] transition-colors whitespace-nowrap shrink-0"
          >
            Hackathon 2026
          </a>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onOpenDashboard}
            className="px-4 py-2 text-xs font-semibold text-white bg-[#4563EB] hover:bg-[#344ec7] rounded-xl transition-colors shadow-xs whitespace-nowrap"
          >
            Open Dashboard
          </button>
        </div>
      </div>
    </header>
  );
};
