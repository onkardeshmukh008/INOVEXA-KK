import React, { useState } from 'react';
import {
  FolderGit2,
  Plus,
  Trash2,
  RefreshCw,
  ExternalLink,
  GitBranch,
  Star,
  GitFork,
  CheckCircle2,
  AlertCircle,
  FileCode,
  ShieldCheck,
  Check,
  X,
  Code2,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Target,
  ArrowRight,
  Play,
  Layers,
  Terminal,
  Link,
  SlidersHorizontal,
} from 'lucide-react';
import type { GitHubRepo, StandaloneRepoAssessment } from '../types/index.ts';
import {
  addGitHubRepo,
  deleteGitHubRepo,
  toggleRepoAssessment,
  assessStandaloneGitHubRepo,
} from '../api.ts';

interface ProjectsPageProps {
  repositories: GitHubRepo[];
  standaloneRepoAssessment?: StandaloneRepoAssessment | null;
  onRefreshState: () => void;
  onCheckUpdates: () => void;
  checkingUpdates: boolean;
}

const POPULAR_TEST_REPOS = [
  { url: 'https://github.com/expressjs/express', account: 'expressjs', repo: 'express', label: 'Express.js (Node Backend)' },
  { url: 'https://github.com/prisma/prisma-examples', account: 'prisma', repo: 'prisma-examples', label: 'Prisma Examples (TypeScript + Postgres)' },
  { url: 'https://github.com/fastapi/fastapi', account: 'fastapi', repo: 'fastapi', label: 'FastAPI (Python API)' },
  { url: 'https://github.com/facebook/react', account: 'facebook', repo: 'react', label: 'React (Frontend Library)' },
];

function extractOwnerAndRepo(input: string, fallbackAccount = '', fallbackRepo = ''): { owner: string; repo: string } {
  const clean = input.trim().replace(/^(https?:\/\/)?(www\.)?github\.com\//i, '').replace(/^git@github\.com:/i, '').split('?')[0].split('#')[0].replace(/\.git$/i, '');
  const parts = clean.split('/').map((s) => s.trim()).filter(Boolean);
  if (parts.length >= 2) {
    return { owner: parts[0], repo: parts[1] };
  }
  return {
    owner: fallbackAccount.trim() || parts[0] || '',
    repo: fallbackRepo.trim() || '',
  };
}

export const ProjectsPage: React.FC<ProjectsPageProps> = ({
  repositories,
  standaloneRepoAssessment,
  onRefreshState,
  onCheckUpdates,
  checkingUpdates,
}) => {
  // Input states
  const [repoLink, setRepoLink] = useState('https://github.com/expressjs/express');
  const [gitAccount, setGitAccount] = useState('expressjs');
  const [gitRepoName, setGitRepoName] = useState('express');
  const [showAdvancedInputs, setShowAdvancedInputs] = useState(false);

  // Assessment & action state
  const [isStandaloneAssessing, setIsStandaloneAssessing] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [statusSuccess, setStatusSuccess] = useState<string | null>(null);
  const [liveAssessment, setLiveAssessment] = useState<StandaloneRepoAssessment | null>(
    standaloneRepoAssessment || null
  );
  const [expandedRepoId, setExpandedRepoId] = useState<string | null>(null);

  // Sync with prop updates
  React.useEffect(() => {
    if (standaloneRepoAssessment) {
      setLiveAssessment(standaloneRepoAssessment);
    }
  }, [standaloneRepoAssessment]);

  // Real-time extracted target
  const detectedTarget = extractOwnerAndRepo(repoLink, gitAccount, gitRepoName);

  const handleSelectPreset = (preset: typeof POPULAR_TEST_REPOS[0]) => {
    setRepoLink(preset.url);
    setGitAccount(preset.account);
    setGitRepoName(preset.repo);
    setStatusError(null);
  };

  // 1. STANDALONE REPO ASSESSMENT (NO RESUME REQUIRED!)
  const handleAssessStandaloneRepo = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const { owner, repo } = extractOwnerAndRepo(repoLink, gitAccount, gitRepoName);

    if (!owner || !repo) {
      setStatusError('Please provide a valid GitHub repository link (e.g. https://github.com/expressjs/express) or account and repository name.');
      return;
    }

    setStatusError(null);
    setStatusSuccess(null);
    setIsStandaloneAssessing(true);

    try {
      const res = await assessStandaloneGitHubRepo({
        url: repoLink.trim(),
        account: owner,
        repoName: repo,
      });
      setIsStandaloneAssessing(false);
      setLiveAssessment(res.assessment);
      setStatusSuccess(
        `Successfully assessed repository "${res.repository.owner}/${res.repository.repo}"! Code architecture and weak topics report generated below.`
      );
      onRefreshState();
    } catch (err: any) {
      setIsStandaloneAssessing(false);
      setStatusError(err.message || 'Failed to inspect and assess repository.');
    }
  };

  // 2. CONNECT TO WORKSPACE PROJECTS
  const handleConnectProject = async () => {
    const { owner, repo } = extractOwnerAndRepo(repoLink, gitAccount, gitRepoName);

    if (!owner || !repo) {
      setStatusError('Please provide a valid GitHub repository link or owner/repo.');
      return;
    }

    setStatusError(null);
    setStatusSuccess(null);
    setIsConnecting(true);

    try {
      const targetUrl = repoLink.trim().startsWith('http')
        ? repoLink.trim()
        : `https://github.com/${owner}/${repo}`;
      const res = await addGitHubRepo(targetUrl);
      setIsConnecting(false);
      setStatusSuccess(
        `Repository "${res.repository.owner}/${res.repository.repo}" connected and indexed into workspace!`
      );
      onRefreshState();
    } catch (err: any) {
      setIsConnecting(false);
      setStatusError(err.message || 'Failed to connect GitHub repository.');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Remove repository "${name}" from SkillTrace?`)) return;
    try {
      await deleteGitHubRepo(id);
      setStatusSuccess(`Repository removed from workspace.`);
      onRefreshState();
    } catch (err: any) {
      setStatusError(err.message || 'Failed to remove repository.');
    }
  };

  const handleToggle = async (id: string) => {
    try {
      await toggleRepoAssessment(id);
      onRefreshState();
    } catch (err: any) {
      setStatusError(err.message);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border bg-sky-50 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 border-sky-200 dark:border-sky-800">
              Code Evidence & Static Analysis
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Independent Assessment Engine
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            My Projects & Git Repository Assessment
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-1 max-w-2xl leading-relaxed">
            Inspect any public or personal GitHub repository directly without requiring a resume. Assess code architecture, quality ratings, weak topics, and engineering strengths.
          </p>
        </div>

        <button
          onClick={onCheckUpdates}
          disabled={checkingUpdates || repositories.length === 0}
          className="self-start sm:self-auto inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:border-amber-400 dark:hover:border-amber-500 transition-colors shadow-2xs disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-slate-500 dark:text-slate-400 ${checkingUpdates ? 'animate-spin' : ''}`} />
          <span>{checkingUpdates ? 'Checking for commits...' : 'Refresh repository data'}</span>
        </button>
      </div>

      {/* STANDALONE GITHUB REPOSITORY LINK & ASSESSMENT SECTION */}
      <div className="bg-white dark:bg-slate-800/90 rounded-2xl border-2 border-amber-900/15 dark:border-amber-800/30 p-6 sm:p-7 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-900/10 dark:border-slate-700 pb-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800">
              Git Repository Link & Code Analyzer
            </span>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-1 flex items-center gap-2">
              <FolderGit2 className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              Assess GitHub Repository Directly (No Resume Needed)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Paste ANY repository link (e.g. https://github.com/owner/repo) or enter account and repo name. Works with all public and custom repositories.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowAdvancedInputs(!showAdvancedInputs)}
            className="self-start sm:self-auto text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white flex items-center gap-1 font-medium transition-colors"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>{showAdvancedInputs ? 'Single URL Mode' : 'Split Account & Repo Fields'}</span>
          </button>
        </div>

        {statusError && (
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{statusError}</span>
          </div>
        )}

        {statusSuccess && (
          <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{statusSuccess}</span>
          </div>
        )}

        {/* 1-Click Popular Preset Repositories */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            1-Click Popular Repositories to Test:
          </span>
          <div className="flex flex-wrap gap-2 text-xs">
            {POPULAR_TEST_REPOS.map((pr, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectPreset(pr)}
                className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-amber-100/70 dark:hover:bg-amber-950/60 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-[11px] font-medium transition-colors"
              >
                {pr.label}
              </button>
            ))}
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleAssessStandaloneRepo} className="space-y-4">
          {!showAdvancedInputs ? (
            /* Single Repo Link Input */
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 text-xs mb-1">
                GitHub Repository Link / URL
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Link className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={repoLink}
                  onChange={(e) => {
                    setRepoLink(e.target.value);
                    const det = extractOwnerAndRepo(e.target.value);
                    if (det.owner) setGitAccount(det.owner);
                    if (det.repo) setGitRepoName(det.repo);
                  }}
                  placeholder="e.g. https://github.com/expressjs/express or owner/repository"
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700/60 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>
          ) : (
            /* Split Account & Repo Name Inputs */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  GitHub Account / Username / Organization
                </label>
                <input
                  type="text"
                  value={gitAccount}
                  onChange={(e) => {
                    setGitAccount(e.target.value);
                    if (e.target.value.includes('/')) {
                      const det = extractOwnerAndRepo(e.target.value);
                      if (det.owner) setGitAccount(det.owner);
                      if (det.repo) setGitRepoName(det.repo);
                    }
                  }}
                  placeholder="e.g. prisma or expressjs"
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700/60 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Repository Name
                </label>
                <input
                  type="text"
                  value={gitRepoName}
                  onChange={(e) => {
                    setGitRepoName(e.target.value);
                    if (e.target.value.includes('/')) {
                      const det = extractOwnerAndRepo(e.target.value);
                      if (det.owner) setGitAccount(det.owner);
                      if (det.repo) setGitRepoName(det.repo);
                    }
                  }}
                  placeholder="e.g. prisma-examples or express"
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700/60 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>
          )}

          {/* Real-time Target Confirmation Badge */}
          {detectedTarget.owner && detectedTarget.repo && (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-[11px] text-slate-500 dark:text-slate-400">Target Codebase:</span>
              <span className="inline-flex items-center gap-1 font-mono text-[11px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-600 font-bold">
                <FolderGit2 className="w-3 h-3 text-amber-500" />
                {detectedTarget.owner} / {detectedTarget.repo}
              </span>
            </div>
          )}

          {/* Action Buttons: 1) Assess Directly + 2) Connect to Workspace */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleConnectProject}
              disabled={isConnecting || isStandaloneAssessing || !detectedTarget.owner || !detectedTarget.repo}
              className="px-5 py-2.5 rounded-xl bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-800 dark:text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-2xs disabled:opacity-50"
            >
              <Plus className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              <span>{isConnecting ? 'Connecting...' : 'Connect to Workspace'}</span>
            </button>

            <button
              type="submit"
              disabled={isStandaloneAssessing || isConnecting || !detectedTarget.owner || !detectedTarget.repo}
              className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-amber-600 dark:hover:bg-amber-700 text-white font-bold text-xs sm:text-sm transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-amber-400 dark:text-white" />
              <span>
                {isStandaloneAssessing
                  ? 'Analyzing GitHub Code Architecture...'
                  : 'Assess Repository Directly'}
              </span>
            </button>
          </div>
        </form>

        {/* STANDALONE GITHUB ASSESSMENT REPORT - SHOWN DIRECTLY BELOW IN SAME SECTION */}
        {liveAssessment && (
          <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700 space-y-5 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-700 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                    Repository Assessment Report
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Commit {liveAssessment.assessedCommitSha}
                  </span>
                </div>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
                  {liveAssessment.owner}/{liveAssessment.repoName}
                </h3>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Architecture Score
                  </span>
                  <span className="text-2xl font-black text-amber-600 dark:text-amber-400">
                    {liveAssessment.architectureScore}
                    <span className="text-xs text-slate-400 font-normal">/100</span>
                  </span>
                </div>
                <span
                  className={`text-xs font-bold px-3 py-1.5 rounded-xl border ${
                    liveAssessment.qualityRating === 'Production-Grade'
                      ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700'
                      : 'bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700'
                  }`}
                >
                  {liveAssessment.qualityRating}
                </span>
              </div>
            </div>

            {/* SUMMARY */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              <strong>Code Evaluation:</strong> {liveAssessment.summary}
            </div>

            {/* DETECTED TECHNOLOGIES */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" /> Detected Technologies & Frameworks:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {liveAssessment.detectedTechnologies.map((tech, idx) => (
                  <span
                    key={idx}
                    className="text-xs px-2.5 py-1 rounded-lg bg-sky-50 dark:bg-sky-950 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-800 font-semibold"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* WEAK TOPICS & ARCHITECTURAL GAPS */}
            <div className="space-y-2.5 pt-2">
              <span className="text-xs font-bold text-rose-900 dark:text-rose-400 flex items-center gap-1.5 uppercase tracking-wider">
                <TrendingDown className="w-4 h-4 text-rose-600" />
                Weak Topics & Architectural Gaps in Repository:
              </span>
              <div className="space-y-2.5">
                {liveAssessment.weakTopicsAndGaps.map((wt, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-rose-50/70 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 space-y-1.5 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-rose-950 dark:text-rose-200">{wt.topic}</span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
                          wt.impact === 'High'
                            ? 'bg-rose-100 dark:bg-rose-900 text-rose-800 dark:text-rose-200 border-rose-300'
                            : 'bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 border-amber-300'
                        }`}
                      >
                        {wt.impact} Impact Gap
                      </span>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 text-[11px] leading-relaxed">
                      <strong>Limitation:</strong> {wt.description}
                    </p>
                    <p className="text-sky-900 dark:text-sky-300 text-[11px] bg-white dark:bg-slate-900 p-2 rounded-lg border border-sky-100 dark:border-slate-700">
                      <strong>Recommended Code Fix:</strong> {wt.recommendedFix}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* DEMONSTRATED STRENGTHS */}
            <div className="space-y-2.5 pt-2">
              <span className="text-xs font-bold text-emerald-900 dark:text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                Demonstrated Engineering Strengths:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {liveAssessment.demonstratedStrengths.map((ds, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 space-y-1 text-xs"
                  >
                    <span className="font-bold text-emerald-950 dark:text-emerald-200 block">{ds.title}</span>
                    <p className="text-slate-700 dark:text-slate-300 text-[11px]">{ds.description}</p>
                    <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400 block truncate">
                      File: {ds.evidenceFile}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* ACTION ITEMS */}
            {liveAssessment.actionItems && liveAssessment.actionItems.length > 0 && (
              <div className="p-4 rounded-xl bg-slate-900 dark:bg-slate-950 text-white space-y-2 text-xs border border-slate-800">
                <span className="font-bold text-amber-400 flex items-center gap-1.5">
                  <Terminal className="w-4 h-4" /> Recommended Engineering Next Steps:
                </span>
                <ul className="list-disc list-inside space-y-1 text-slate-200 text-[11px]">
                  {liveAssessment.actionItems.map((act, idx) => (
                    <li key={idx}>{act}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* CONNECTED REPOSITORIES LIST */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Connected Workspace Repositories ({repositories.length})
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Included in overall target job assessment
          </span>
        </div>

        {repositories.length > 0 ? (
          <div className="space-y-4">
            {repositories.map((repo) => {
              const isExpanded = expandedRepoId === repo.id;

              return (
                <div
                  key={repo.id}
                  className={`bg-white dark:bg-slate-800/90 rounded-xl border transition-all shadow-2xs ${
                    repo.selectedForAssessment
                      ? 'border-slate-300 dark:border-slate-600'
                      : 'border-slate-200 dark:border-slate-700 opacity-75'
                  }`}
                >
                  <div className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-1.5">
                          <FolderGit2 className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                          {repo.owner}/{repo.repo}
                        </span>
                        <a
                          href={repo.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-0.5"
                        >
                          <span>github.com</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                        <span className="text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium">
                          {repo.language}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center gap-1">
                          <GitBranch className="w-3 h-3" /> {repo.defaultBranch}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{repo.description}</p>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1 font-mono text-[11px]">
                          commit {repo.lastAnalyzedCommit.sha}
                        </span>
                        <span>
                          &quot;{repo.lastAnalyzedCommit.message}&quot;
                        </span>
                        <span>
                          by {repo.lastAnalyzedCommit.author}
                        </span>
                        <span>
                          • {repo.analyzedFilesCount} indexed files
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      <label className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 cursor-pointer select-none mr-2">
                        <input
                          type="checkbox"
                          checked={repo.selectedForAssessment}
                          onChange={() => handleToggle(repo.id)}
                          className="rounded text-amber-600 focus:ring-amber-500"
                        />
                        <span>Include in audit</span>
                      </label>

                      <button
                        onClick={() => setExpandedRepoId(isExpanded ? null : repo.id)}
                        className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                      >
                        {isExpanded ? 'Hide Files' : 'View Indexed Files'}
                      </button>

                      <button
                        onClick={() => handleDelete(repo.id, repo.repo)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded hover:bg-slate-50 dark:hover:bg-slate-700"
                        title="Remove repository"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Expanded File Tree & Indexed Sample Files */}
                  {isExpanded && (
                    <div className="p-5 border-t border-slate-100 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-900/60 rounded-b-xl space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          Analyzed Files Prioritized for Evidence
                        </span>
                        <span className="text-slate-500 dark:text-slate-400">
                          {repo.sampleFiles.length} key source artifacts examined
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs">
                        {repo.sampleFiles.map((sf, idx) => (
                          <div
                            key={idx}
                            className="p-2 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between"
                          >
                            <div className="flex items-center gap-2 truncate">
                              <FileCode className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0" />
                              <span className="font-mono text-[11px] text-slate-800 dark:text-slate-200 truncate" title={sf.path}>
                                {sf.path}
                              </span>
                            </div>
                            <span className="text-[10px] px-1.5 py-0.5 rounded uppercase font-semibold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                              {sf.category}
                            </span>
                          </div>
                        ))}
                      </div>

                      <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                        Files are prioritized for backend routes, database schemas, integration tests, and deployment configs. Binaries and generated lockfiles are excluded.
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 p-8 text-center text-slate-500 dark:text-slate-400 text-xs">
            <p className="font-medium text-slate-700 dark:text-slate-300 text-sm">
              No connected repositories yet.
            </p>
            <p className="mt-1">
              Enter any public or personal GitHub project URL above and click &quot;Connect to Workspace&quot; or &quot;Assess Repository Directly&quot;.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
