import React from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  XCircle,
  Clock,
  Sparkles,
} from 'lucide-react';
import type { EvidenceStatus } from '../types/index.ts';

interface StatusBadgeProps {
  status: EvidenceStatus;
  size?: 'sm' | 'md' | 'lg';
}

export const EvidenceBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const isSm = size === 'sm';
  const sizeClasses = isSm ? 'text-xs px-2 py-0.5 gap-1' : 'text-xs font-semibold px-2.5 py-1 gap-1.5';

  switch (status) {
    case 'DEMONSTRATED':
      return (
        <span
          className={`inline-flex items-center rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 ${sizeClasses}`}
        >
          <CheckCircle2 className={isSm ? 'w-3 h-3 text-emerald-600' : 'w-3.5 h-3.5 text-emerald-600'} />
          Demonstrated
        </span>
      );
    case 'PARTIALLY DEMONSTRATED':
      return (
        <span
          className={`inline-flex items-center rounded-md bg-amber-50 text-amber-900 border border-amber-200 ${sizeClasses}`}
        >
          <Clock className={isSm ? 'w-3 h-3 text-amber-600' : 'w-3.5 h-3.5 text-amber-600'} />
          Partially Demonstrated
        </span>
      );
    case 'NOT ENOUGH EVIDENCE':
      return (
        <span
          className={`inline-flex items-center rounded-md bg-slate-100 text-slate-700 border border-slate-300 ${sizeClasses}`}
        >
          <XCircle className={isSm ? 'w-3 h-3 text-slate-500' : 'w-3.5 h-3.5 text-slate-500'} />
          Not Enough Evidence
        </span>
      );
    case 'NEEDS REVIEW':
      return (
        <span
          className={`inline-flex items-center rounded-md bg-sky-50 text-sky-800 border border-sky-200 ${sizeClasses}`}
        >
          <HelpCircle className={isSm ? 'w-3 h-3 text-sky-600' : 'w-3.5 h-3.5 text-sky-600'} />
          Needs Review
        </span>
      );
    default:
      return null;
  }
};

export const RequirementBadge: React.FC<{ type: 'required' | 'preferred' }> = ({ type }) => {
  if (type === 'required') {
    return (
      <span className="inline-flex items-center rounded px-2 py-0.5 text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
        Required
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded px-2 py-0.5 text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
      Preferred
    </span>
  );
};

export const VerdictPill: React.FC<{ verdict: string; score: number }> = ({ verdict, score }) => {
  let bg = 'bg-slate-100 text-slate-800 border-slate-300';
  let dotColor = 'bg-slate-400';

  if (verdict === 'STRONG EVIDENCE OF MATCH') {
    bg = 'bg-emerald-50 text-emerald-900 border-emerald-200';
    dotColor = 'bg-emerald-500';
  } else if (verdict === 'PARTIAL EVIDENCE OF MATCH') {
    bg = 'bg-amber-50 text-amber-900 border-amber-200';
    dotColor = 'bg-amber-500';
  } else if (verdict === 'MORE EVIDENCE NEEDED') {
    bg = 'bg-sky-50 text-sky-900 border-sky-200';
    dotColor = 'bg-sky-500';
  }

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border font-medium ${bg}`}>
      <span className={`w-2.5 h-2.5 rounded-full ${dotColor}`} />
      <span className="text-sm font-semibold tracking-wide">{verdict}</span>
      <span className="text-xs px-2 py-0.5 rounded bg-white/70 border border-current/20 font-bold ml-1">
        {score}% Match
      </span>
    </div>
  );
};
