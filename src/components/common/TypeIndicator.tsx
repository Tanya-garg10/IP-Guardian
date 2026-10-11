import React from 'react';
import { IPType } from '../../types/ip';
import { Lightbulb, Bookmark, FileText } from 'lucide-react';

interface TypeIndicatorProps {
  type: IPType;
  showIcon?: boolean;
}

export const TypeIndicator: React.FC<TypeIndicatorProps> = ({ type, showIcon = true }) => {
  const config: Record<IPType, { label: string; icon: React.ReactNode; color: string }> = {
    'Patent': {
      label: 'Patent',
      icon: <Lightbulb className="w-3.5 h-3.5 text-blue-600" />,
      color: 'text-blue-900 font-medium'
    },
    'Trademark': {
      label: 'Trademark',
      icon: <Bookmark className="w-3.5 h-3.5 text-teal-600" />,
      color: 'text-teal-900 font-medium'
    },
    'Copyright': {
      label: 'Copyright',
      icon: <FileText className="w-3.5 h-3.5 text-indigo-600" />,
      color: 'text-indigo-900 font-medium'
    }
  };

  const item = config[type] || { label: type, icon: null, color: 'text-slate-800' };

  return (
    <span className={`inline-flex items-center gap-1.5 text-xs whitespace-nowrap ${item.color}`}>
      {showIcon && item.icon}
      <span>{item.label}</span>
    </span>
  );
};
