import React, { useState } from 'react';
import { Mail, CheckCircle2, X, Sparkles, ExternalLink, Send, Copy, Check } from 'lucide-react';
import type { DigestEmailContent } from '../services/emailDigestService.ts';

interface MockEmailPreviewModalProps {
  digest: DigestEmailContent;
  onClose: () => void;
  onNavigateToDashboard?: () => void;
}

export const MockEmailPreviewModal: React.FC<MockEmailPreviewModalProps> = ({
  digest,
  onClose,
  onNavigateToDashboard,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopySubject = () => {
    navigator.clipboard.writeText(digest.subject);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Email Client Top Bar */}
        <div className="p-4 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
            <Mail className="w-4 h-4 text-amber-500" />
            <span>Mock Email Client Inbox Preview</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Email Meta Bar */}
        <div className="p-4 bg-slate-50/80 dark:bg-slate-900/80 border-b border-slate-100 dark:border-slate-800 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 truncate">
              <span className="font-bold text-slate-500 dark:text-slate-400">Subject:</span>
              <span className="font-bold text-slate-900 dark:text-white truncate">{digest.subject}</span>
            </div>
            <button
              onClick={handleCopySubject}
              className="p-1 text-slate-400 hover:text-slate-700 shrink-0"
              title="Copy subject line"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <div>
              <span>From: </span>
              <strong className="text-slate-700 dark:text-slate-300">digest@skilltrace.ai</strong>
            </div>
            <div>
              <span>To: </span>
              <strong className="text-slate-700 dark:text-slate-300">{digest.recipient}</strong>
            </div>
            <div>
              <span>Sent: </span>
              <span>{digest.sentAt}</span>
            </div>
          </div>
        </div>

        {/* HTML Email Body Container */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs bg-slate-50/30 dark:bg-slate-950/30 font-sans">
          {/* Email Template Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-5">
            {/* Template Header */}
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 font-bold flex items-center justify-center border border-amber-300 dark:border-amber-700">
                  ST
                </div>
                <div>
                  <span className="font-bold text-sm text-slate-900 dark:text-white block">
                    SkillTrace.Ai
                  </span>
                  <span className="text-[10px] text-slate-400">Weekly Career Readiness Digest</span>
                </div>
              </div>

              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                Verified Report
              </span>
            </div>

            {/* Welcome & Score */}
            <div className="space-y-3">
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                Hello, {digest.userName}!
              </h2>
              <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">
                Here is your automated weekly career readiness report based on your latest GitHub code commits and resume claims.
              </p>

              {/* Score Banner */}
              <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider block">
                    Current Career Readiness Index
                  </span>
                  <span className="text-2xl font-black text-amber-700 dark:text-amber-400">
                    {digest.readinessScore}% Match Index
                  </span>
                  <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 mt-0.5">
                    Verdict: {digest.verdict}
                  </p>
                </div>

                <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/60 flex items-center justify-center border border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-200 font-extrabold">
                  <Sparkles className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Weekly Progress Summary */}
            <div className="space-y-2">
              <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
                Weekly Code Analysis:
              </h3>
              <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">
                {digest.weeklyProgressSummary}
              </p>
            </div>

            {/* Demonstrated Strengths */}
            <div className="space-y-2">
              <h3 className="font-bold text-emerald-900 dark:text-emerald-400 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Top Verified Code Strengths:
              </h3>
              <ul className="space-y-1.5 text-slate-700 dark:text-slate-300 text-xs">
                {digest.topStrengths.map((st, i) => (
                  <li key={i} className="flex items-center gap-2 p-2 rounded bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span>{st}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* High-Priority Action Items */}
            <div className="space-y-2">
              <h3 className="font-bold text-amber-900 dark:text-amber-400 text-xs uppercase tracking-wider">
                Recommended Action Exercises for Next Week:
              </h3>
              <ul className="space-y-1.5 text-slate-700 dark:text-slate-300 text-xs">
                {digest.actionItems.map((act, i) => (
                  <li key={i} className="p-2.5 rounded-lg bg-amber-50/50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/60">
                    <strong>Step {i + 1}:</strong> {act}
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA Button */}
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onNavigateToDashboard) onNavigateToDashboard();
                }}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-900 dark:bg-amber-600 text-white font-bold text-xs hover:bg-slate-800 dark:hover:bg-amber-700 transition-colors shadow-sm"
              >
                <span>View Live SkillTrace Dashboard</span>
                <ExternalLink className="w-4 h-4 text-amber-400 dark:text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* Footer Controls */}
        <div className="p-4 bg-slate-100 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
          <span className="text-slate-500 dark:text-slate-400">
            Mock email dispatch test completed successfully.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-900 text-white font-semibold hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
};
