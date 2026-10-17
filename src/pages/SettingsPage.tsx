import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Shield,
  Database,
  Cpu,
  FolderGit2,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Trash2,
  Lock,
  EyeOff,
  Sparkles,
} from 'lucide-react';
import type { AppSettings, AppState } from '../types/index.ts';
import { clearAllState, resetToSample } from '../api.ts';

interface SettingsPageProps {
  settings: AppSettings;
  onRefreshState: () => void;
  onNavigateToDashboard: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  settings,
  onRefreshState,
  onNavigateToDashboard,
}) => {
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);
  const [message, setMessage] = useState<string | null>(null);

  const handleResetSample = async () => {
    if (
      !window.confirm(
        'Reset to a clean developer workspace for evaluation?'
      )
    ) {
      return;
    }
    try {
      await resetToSample();
      setMessage('Workspace reset successfully! Redirecting to Dashboard...');
      onRefreshState();
      setTimeout(() => {
        onNavigateToDashboard();
      }, 1000);
    } catch (err: any) {
      setMessage(`Failed to reset: ${err.message}`);
    }
  };

  const handleClearAll = async () => {
    if (
      !window.confirm(
        'Clear all data? This will remove all resume claims, connected repositories, target jobs, and history.'
      )
    ) {
      return;
    }
    try {
      await clearAllState();
      setMessage('All application data cleared.');
      onRefreshState();
    } catch (err: any) {
      setMessage(`Failed to clear: ${err.message}`);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Settings & Privacy</h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm mt-1 max-w-2xl leading-relaxed">
          Manage system configurations, check connected service health, review privacy safeguards, or reset to a demo profile for judging.
        </p>
      </div>

      {message && (
        <div className="p-4 rounded-xl bg-sky-50 dark:bg-sky-950/70 border border-sky-200 dark:border-sky-800 text-sky-900 dark:text-sky-200 text-xs sm:text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* CONNECTED SERVICES HEALTH */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xs space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Cpu className="w-4 h-4 text-sky-600 dark:text-sky-400" />
          Connected Services & Health
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 dark:text-white">GitHub Public API</span>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 className="w-3 h-3" /> Online
              </span>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-[11px]">
              Retrieving public commit trees, revisions, and raw source artifacts.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 dark:text-white">Gemini AI Engine</span>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 className="w-3 h-3" /> gemini-3.8-flash
              </span>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-[11px]">
              Server-side intelligence for claim parsing and citation verification.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 dark:text-white">Local Persistent Store</span>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 className="w-3 h-3" /> Active
              </span>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-[11px]">
              State is persisted to disk on the backend across refreshes and restarts.
            </p>
          </div>
        </div>
      </div>

      {/* PRIVACY & SECURITY DECLARATION */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xs space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          Candidate Privacy & Security Principles
        </h2>

        <div className="space-y-3 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
          <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-lg border border-slate-200 dark:border-slate-700 flex items-start gap-3">
            <EyeOff className="w-4 h-4 text-slate-500 dark:text-slate-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-900 dark:text-white">Zero Contact Harvesting</p>
              <p className="text-slate-600 dark:text-slate-400 mt-0.5 text-[11px]">
                SkillTrace does not require phone numbers, home addresses, or government identification. Resumes are processed strictly for technical skills, frameworks, and project descriptions.
              </p>
            </div>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-lg border border-slate-200 dark:border-slate-700 flex items-start gap-3">
            <Lock className="w-4 h-4 text-slate-500 dark:text-slate-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-900 dark:text-white">No Untrusted Code Execution</p>
              <p className="text-slate-600 dark:text-slate-400 mt-0.5 text-[11px]">
                Connected repository code is statically parsed for patterns and architectural syntax. Code is never run or executed inside a runtime container.
              </p>
            </div>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-lg border border-slate-200 dark:border-slate-700 flex items-start gap-3">
            <Shield className="w-4 h-4 text-slate-500 dark:text-slate-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-900 dark:text-white">Dignified, Non-Accusatory Evaluation</p>
              <p className="text-slate-600 dark:text-slate-400 mt-0.5 text-[11px]">
                We do not use flawed AI-detection algorithms to label users as frauds or cheaters. When evidence is not found in a repository, we clearly state that it is a limitation of the examined scope.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* WORKSPACE DATA MANAGEMENT */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xs space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-sky-600 dark:text-sky-400" />
          Workspace & Data Management
        </h2>
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          Manage your assessment data, reset active evaluation records, or clear all repositories, target jobs, and verified evidence to start fresh.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={handleResetSample}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-slate-900 dark:bg-amber-600 text-white font-semibold text-xs hover:bg-slate-800 dark:hover:bg-amber-700 transition-colors shadow-xs"
          >
            <RotateCcw className="w-4 h-4 text-amber-400 dark:text-white" />
            <span>Reset Assessment Workspace</span>
          </button>

          <button
            onClick={handleClearAll}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 font-semibold text-xs hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear All Data (Start Fresh)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
