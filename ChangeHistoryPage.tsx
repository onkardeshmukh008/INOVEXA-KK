import React, { useState } from 'react';
import {
  History,
  GitCommit,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  FileCode,
  Sparkles,
  Clock,
  ShieldCheck,
  X,
} from 'lucide-react';
import type { ChangeHistoryEntry, GitHubRepo } from '../types/index.ts';
import { EvidenceBadge } from '../components/StatusBadges.tsx';

interface ChangeHistoryPageProps {
  history: ChangeHistoryEntry[];
  repositories: GitHubRepo[];
  onCheckUpdates: () => void;
  checkingUpdates: boolean;
  updateMessage?: string | null;
}

export const ChangeHistoryPage: React.FC<ChangeHistoryPageProps> = ({
  history,
  repositories,
  onCheckUpdates,
  checkingUpdates,
  updateMessage,
}) => {
  const [notificationDismissed, setNotificationDismissed] = useState(false);

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Repository Change History & Automatic Reassessment
          </h1>
          <p className="text-slate-600 text-sm mt-1 max-w-2xl leading-relaxed">
            SkillTrace automatically inspects your repository commits. When code changes, affected skills are reassessed while unaffected skills remain stable.
          </p>
        </div>

        <button
          onClick={onCheckUpdates}
          disabled={checkingUpdates || repositories.length === 0}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 disabled:opacity-50 transition-colors shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-sky-400 ${checkingUpdates ? 'animate-spin' : ''}`} />
          <span>{checkingUpdates ? 'Checking for commits...' : 'Check for GitHub Updates Now'}</span>
        </button>
      </div>

      {/* Real-time check notification banner if new commits were checked */}
      {checkingUpdates && (
        <div className="p-4 rounded-xl bg-sky-50 border border-sky-200 text-sky-900 text-xs sm:text-sm flex items-center gap-3">
          <RefreshCw className="w-4 h-4 text-sky-600 animate-spin shrink-0" />
          <p className="font-medium">
            Your GitHub project has changed. We're checking whether the new code adds evidence for your skills.
          </p>
        </div>
      )}

      {updateMessage && !checkingUpdates && !notificationDismissed && (
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs sm:text-sm flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p className="font-medium">{updateMessage}</p>
          </div>
          <button
            onClick={() => setNotificationDismissed(true)}
            className="text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* CONNECTED REPOS COMMIT REVISION STATUS */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Currently Monitored Repositories ({repositories.length})
          </h2>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            Truthful Commit Tracking & Status
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {repositories.map((repo) => {
            const hasPendingUpdate = repo.hasUpdate || (repo.latestCommit && repo.latestCommit.sha !== repo.lastAnalyzedCommit.sha);

            return (
              <div key={repo.id} className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between font-semibold text-slate-900 dark:text-white">
                  <span>{repo.owner}/{repo.repo}</span>
                  <div className="flex items-center gap-1.5 font-mono text-[11px]">
                    <span className="bg-white dark:bg-slate-700 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200" title="Last successfully assessed commit">
                      assessed: {repo.lastAnalyzedCommit.sha}
                    </span>
                    {hasPendingUpdate && repo.latestCommit && (
                      <span className="bg-amber-100 dark:bg-amber-950 px-2 py-0.5 rounded border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-300" title="Latest detected commit">
                        latest: {repo.latestCommit.sha}
                      </span>
                    )}
                  </div>
                </div>

                {/* Status Badge */}
                <div className="flex items-center gap-2">
                  {repo.reassessmentStatus === 'failed' ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 text-rose-600" /> Reassessment Failed (Pending Retry)
                    </span>
                  ) : repo.reassessmentStatus === 'manual_review_needed' ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-600" /> Update Detected (Needs Target Job)
                    </span>
                  ) : hasPendingUpdate ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-800 flex items-center gap-1">
                      <RefreshCw className="w-3 h-3 text-sky-600" /> New Commit Detected
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Assessed & Up-to-Date
                    </span>
                  )}
                </div>

                {repo.lastReassessmentError && (
                  <p className="text-[11px] text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 p-2 rounded border border-rose-200 dark:border-rose-900">
                    {repo.lastReassessmentError}
                  </p>
                )}

                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  &quot;{repo.lastAnalyzedCommit.message}&quot;
                </p>
                <p className="text-[10px] text-slate-400">
                  Author: {repo.lastAnalyzedCommit.author} • {new Date(repo.lastAnalyzedCommit.date).toLocaleDateString()}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* CHANGE AUDIT TRAIL TIMELINE */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">
            Reassessment History Audit Trail ({history.length})
          </h2>
          <span className="text-xs text-slate-500">
            Auditable record of commit diffs and skill rating changes
          </span>
        </div>

        {history.length > 0 ? (
          <div className="space-y-4">
            {history.map((entry) => (
              <div
                key={entry.id}
                className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4"
              >
                {/* Entry header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-slate-900 text-sky-400 flex items-center justify-center font-bold text-xs">
                      <GitCommit className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-sm text-slate-900">{entry.repoName}</span>
                      <p className="text-[11px] text-slate-500">
                        {new Date(entry.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                      {entry.previousCommitSha}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-mono bg-sky-50 text-sky-800 font-semibold px-2 py-0.5 rounded border border-sky-100">
                      {entry.newCommitSha}
                    </span>
                  </div>
                </div>

                {/* Commit message & Overall summary */}
                <div className="space-y-2 text-xs">
                  <p className="font-mono font-medium text-slate-800 bg-slate-50 p-2.5 rounded border border-slate-100">
                    "{entry.commitMessage}"
                  </p>
                  <p className="text-slate-700 leading-relaxed font-normal">
                    {entry.overallChangeSummary}
                  </p>
                </div>

                {/* Changed files list */}
                {entry.changedFiles.length > 0 && (
                  <div className="space-y-1.5 text-xs">
                    <span className="font-bold text-[11px] uppercase text-slate-500 tracking-wider">
                      Changed Files Inspected:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {entry.changedFiles.map((file, fIdx) => (
                        <span
                          key={fIdx}
                          className="font-mono text-[11px] px-2 py-1 rounded bg-slate-100 text-slate-700 border border-slate-200"
                        >
                          {file}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Reassessed Skills Comparison */}
                {entry.reassessedSkills.length > 0 ? (
                  <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                    <span className="font-bold text-slate-900 block">
                      Skills Reassessed by this Commit:
                    </span>
                    <div className="space-y-2">
                      {entry.reassessedSkills.map((change, cIdx) => (
                        <div
                          key={cIdx}
                          className="p-3 rounded-lg bg-sky-50/40 border border-sky-100 space-y-1.5"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="font-bold text-slate-900">{change.skillName}</span>
                            <div className="flex items-center gap-2">
                              <EvidenceBadge status={change.previousStatus} size="sm" />
                              <ArrowRight className="w-3 h-3 text-slate-400" />
                              <EvidenceBadge status={change.newStatus} size="sm" />
                            </div>
                          </div>
                          <p className="text-slate-600 text-[11px] leading-relaxed">
                            {change.explanation}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-3 rounded bg-slate-50 border border-slate-100 text-xs text-slate-500 italic">
                    No technical code skills were modified by this commit (e.g., changes were limited to documentation or non-functional assets).
                  </div>
                )}

                {/* Unchanged skills note */}
                {entry.unchangedSkills && entry.unchangedSkills.length > 0 && (
                  <p className="text-[11px] text-slate-500 pt-1">
                    <strong>Skills that remained unchanged:</strong> {entry.unchangedSkills.join(', ')}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-8 text-center text-slate-500 text-xs">
            <History className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="font-semibold text-slate-800 text-sm">No repository changes recorded yet.</p>
            <p className="mt-1">
              When new commits are pushed to your GitHub projects, click "Check for GitHub Updates Now" to run targeted reassessments.
            </p>
          </div>
        )}
      </div>

      {/* CORE CHANGE DETECTION PRINCIPLE EXPLAINER */}
      <div className="bg-slate-50 rounded-xl border border-slate-200 p-5 text-xs text-slate-600 space-y-2">
        <div className="flex items-center gap-2 font-bold text-slate-900">
          <ShieldCheck className="w-4 h-4 text-sky-600" />
          <span>Evidence Integrity Guarantee</span>
        </div>
        <ul className="list-disc list-inside space-y-1 text-slate-600 text-[11px]">
          <li><strong>No false boosts:</strong> Modifying a README or markdown file will never falsely improve your SQL or Testing rating.</li>
          <li><strong>Domain isolation:</strong> Adding unit test files will only affect testing skills, not unrelated database or cloud infrastructure claims.</li>
          <li><strong>Immutable history:</strong> Previous assessments are preserved so you can demonstrate genuine learning progress over time.</li>
        </ul>
      </div>
    </div>
  );
};
