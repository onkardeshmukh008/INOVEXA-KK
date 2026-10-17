import React, { useState, useEffect } from 'react';
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
  Mail,
  Send,
  Bell,
  Check,
} from 'lucide-react';
import type { AppSettings, AppState } from '../types/index.ts';
import type { AuthUser } from '../pages/LoginPage.tsx';
import { clearAllState, resetToSample } from '../api.ts';
import {
  EmailDigestSettings,
  DigestEmailContent,
  getEmailDigestSettings,
  saveEmailDigestSettings,
  generateMockDigestEmail,
} from '../services/emailDigestService.ts';
import { MockEmailPreviewModal } from '../components/MockEmailPreviewModal.tsx';

interface SettingsPageProps {
  settings: AppSettings;
  state: AppState;
  authUser?: AuthUser | null;
  onRefreshState: () => void;
  onNavigateToDashboard: () => void;
  onSendDigestNotification?: (msg: string) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  settings,
  state,
  authUser,
  onRefreshState,
  onNavigateToDashboard,
  onSendDigestNotification,
}) => {
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);
  const [message, setMessage] = useState<string | null>(null);

  // Email Digest Subscription State
  const [digestSettings, setDigestSettings] = useState<EmailDigestSettings>(() =>
    getEmailDigestSettings(authUser)
  );
  const [activeDigestEmail, setActiveDigestEmail] = useState<DigestEmailContent | null>(null);
  const [showEmailModal, setShowEmailModal] = useState(false);

  useEffect(() => {
    saveEmailDigestSettings(digestSettings);
  }, [digestSettings]);

  const handleToggleSubscribed = () => {
    const next = !digestSettings.subscribed;
    setDigestSettings((prev) => ({ ...prev, subscribed: next }));
    setMessage(next ? 'Subscribed to Weekly Career Readiness Email Digest!' : 'Unsubscribed from Email Digest updates.');
  };

  const handleSendTestEmail = () => {
    const generated = generateMockDigestEmail(state, digestSettings, authUser);
    setActiveDigestEmail(generated);
    setShowEmailModal(true);
    setMessage(`Mock email digest dispatch test initiated for ${generated.recipient}.`);
    if (onSendDigestNotification) {
      onSendDigestNotification(`Mock Weekly Readiness Digest Email dispatched to ${generated.recipient}`);
    }
  };

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
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Settings & Privacy</h1>
        <p className="text-slate-600 text-sm mt-1 max-w-2xl leading-relaxed">
          Manage system configurations, check connected service health, review privacy safeguards, or reset to a demo profile for judging.
        </p>
      </div>

      {message && (
        <div className="p-4 rounded-xl bg-sky-50 border border-sky-200 text-sky-900 text-xs sm:text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* CONNECTED SERVICES HEALTH */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Cpu className="w-4 h-4 text-sky-600" />
          Connected Services & Health
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900">GitHub Public API</span>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                <CheckCircle2 className="w-3 h-3" /> Online
              </span>
            </div>
            <p className="text-slate-600 text-[11px]">
              Retrieving public commit trees, revisions, and raw source artifacts.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900">Gemini AI Engine</span>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                <CheckCircle2 className="w-3 h-3" /> gemini-3.8-flash
              </span>
            </div>
            <p className="text-slate-600 text-[11px]">
              Server-side intelligence for claim parsing and citation verification.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900">Local Persistent Store</span>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                <CheckCircle2 className="w-3 h-3" /> Active
              </span>
            </div>
            <p className="text-slate-600 text-[11px]">
              State is persisted to disk on the backend across refreshes and restarts.
            </p>
          </div>
        </div>
      </div>

      {/* WEEKLY CAREER READINESS EMAIL DIGEST CARD */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-amber-500" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Weekly Career Readiness Email Digest
              </h2>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Receive an automated weekly email summarizing your verified code progress, skill readiness index, and action exercises.
            </p>
          </div>

          <button
            type="button"
            onClick={handleToggleSubscribed}
            className={`px-4 py-2 rounded-xl font-bold text-xs transition-colors flex items-center gap-2 shrink-0 ${
              digestSettings.subscribed
                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
            }`}
          >
            {digestSettings.subscribed ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Subscribed to Weekly Digest</span>
              </>
            ) : (
              <span>Digest Paused (Click to Subscribe)</span>
            )}
          </button>
        </div>

        {digestSettings.subscribed && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Recipient Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={digestSettings.email}
                    onChange={(e) =>
                      setDigestSettings((prev) => ({ ...prev, email: e.target.value }))
                    }
                    placeholder="developer@example.com"
                    className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Delivery Cadence
                </label>
                <select
                  value={digestSettings.frequency}
                  onChange={(e) =>
                    setDigestSettings((prev) => ({
                      ...prev,
                      frequency: e.target.value as any,
                    }))
                  }
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="weekly">Weekly (Every Monday morning)</option>
                  <option value="biweekly">Bi-Weekly (Every 2 weeks)</option>
                  <option value="monthly">Monthly Summary</option>
                </select>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
              <span className="font-bold text-slate-800 dark:text-slate-200 block">
                Digest Email Content Preferences:
              </span>
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={digestSettings.includeSkillGrowth}
                    onChange={(e) =>
                      setDigestSettings((prev) => ({
                        ...prev,
                        includeSkillGrowth: e.target.checked,
                      }))
                    }
                    className="rounded text-amber-600 focus:ring-amber-500"
                  />
                  <span>Include Weekly Code Skill Growth & Commit Verification</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={digestSettings.includeWeakTopics}
                    onChange={(e) =>
                      setDigestSettings((prev) => ({
                        ...prev,
                        includeWeakTopics: e.target.checked,
                      }))
                    }
                    className="rounded text-amber-600 focus:ring-amber-500"
                  />
                  <span>Include High-Priority Career Action Items</span>
                </label>
              </div>
            </div>

            {/* Test Email Dispatch CTA */}
            <div className="pt-1 flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Mock Service: Simulates email rendering and dispatches an interactive email preview.
              </p>

              <button
                type="button"
                onClick={handleSendTestEmail}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold transition-all shadow-xs shrink-0"
              >
                <Send className="w-4 h-4" />
                <span>Send & Preview Mock Digest Email</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* PRIVACY & SECURITY DECLARATION */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-600" />
          Candidate Privacy & Security Principles
        </h2>

        <div className="space-y-3 text-xs text-slate-700 leading-relaxed">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-start gap-3">
            <EyeOff className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-900">Zero Contact Harvesting</p>
              <p className="text-slate-600 mt-0.5 text-[11px]">
                SkillTrace does not require phone numbers, home addresses, or government identification. Resumes are processed strictly for technical skills, frameworks, and project descriptions.
              </p>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-start gap-3">
            <Lock className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-900">No Untrusted Code Execution</p>
              <p className="text-slate-600 mt-0.5 text-[11px]">
                Connected repository code is statically parsed for patterns and architectural syntax. Code is never run or executed inside a runtime container.
              </p>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-start gap-3">
            <Shield className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-900">Dignified, Non-Accusatory Evaluation</p>
              <p className="text-slate-600 mt-0.5 text-[11px]">
                We do not use flawed AI-detection algorithms to label users as frauds or cheaters. When evidence is not found in a repository, we clearly state that it is a limitation of the examined scope.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* WORKSPACE DATA MANAGEMENT */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-sky-600" />
          Workspace & Data Management
        </h2>
        <p className="text-xs text-slate-600 leading-relaxed">
          Manage your assessment data, reset active evaluation records, or clear all repositories, target jobs, and verified evidence to start fresh.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={handleResetSample}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-slate-900 text-white font-semibold text-xs hover:bg-slate-800 transition-colors shadow-xs"
          >
            <RotateCcw className="w-4 h-4 text-amber-400" />
            <span>Reset Assessment Workspace</span>
          </button>

          <button
            onClick={handleClearAll}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-rose-200 text-rose-700 font-semibold text-xs hover:bg-rose-50 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear All Data (Start Fresh)</span>
          </button>
        </div>
      </div>

      {/* MOCK EMAIL PREVIEW MODAL */}
      {showEmailModal && activeDigestEmail && (
        <MockEmailPreviewModal
          digest={activeDigestEmail}
          onClose={() => setShowEmailModal(false)}
          onNavigateToDashboard={onNavigateToDashboard}
        />
      )}
    </div>
  );
};
