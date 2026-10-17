import React from 'react';
import {
  FileText,
  FolderGit2,
  Briefcase,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  RefreshCw,
  GitCommit,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import type { AppState } from '../types/index.ts';
import type { PageId } from '../components/Sidebar.tsx';
import type { AuthUser } from '../pages/LoginPage.tsx';
import { EvidenceBadge, VerdictPill } from '../components/StatusBadges.tsx';

interface DashboardPageProps {
  state: AppState;
  onNavigate: (page: PageId) => void;
  onRunAssessment: () => void;
  isAssessing: boolean;
  onCheckUpdates: () => void;
  checkingUpdates: boolean;
  authUser?: AuthUser | null;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  state,
  onNavigate,
  onRunAssessment,
  isAssessing,
  onCheckUpdates,
  checkingUpdates,
  authUser,
}) => {
  const { resume, repositories, job, verdict, evidenceItems, history, actionPlan } = state;

  const demonstratedCount = evidenceItems.filter((e) => e.evidenceStatus === 'DEMONSTRATED').length;
  const partialCount = evidenceItems.filter((e) => e.evidenceStatus === 'PARTIALLY DEMONSTRATED').length;
  const needEvidenceCount = evidenceItems.filter((e) => e.evidenceStatus === 'NOT ENOUGH EVIDENCE').length;

  const connectedReposCount = repositories.length;
  const latestHistory = history[0];

  // Derive active user name from authUser state or resume profile
  const userName = authUser?.name?.trim() || resume?.profile?.fullName?.trim() || 'Engineer';

  // Primary next step determination
  let nextStepText = 'Continue my assessment';
  let nextStepAction: () => void = onRunAssessment;
  let nextStepSubtext = 'Evaluate your projects against your target job requirements.';

  if (!resume) {
    nextStepText = 'Upload your resume';
    nextStepAction = () => onNavigate('resume');
    nextStepSubtext = 'Start by uploading your resume so we can extract your claimed skills.';
  } else if (connectedReposCount === 0) {
    nextStepText = 'Add a GitHub project';
    nextStepAction = () => onNavigate('projects');
    nextStepSubtext = 'Connect a public GitHub repository so we can inspect real code evidence.';
  } else if (!job) {
    nextStepText = 'Select or add a job';
    nextStepAction = () => onNavigate('job');
    nextStepSubtext = 'Provide a target job posting or URL to benchmark your code against.';
  } else if (!verdict) {
    nextStepText = 'Run skill assessment';
    nextStepAction = onRunAssessment;
    nextStepSubtext = 'Generate your evidence report and match verdict.';
  } else if (actionPlan.length > 0) {
    nextStepText = 'View your action plan';
    nextStepAction = () => onNavigate('action-plan');
    nextStepSubtext = `You have ${actionPlan.length} practical exercises to close your highest-priority evidence gaps.`;
  }

  // Find biggest gap
  const primaryGap = evidenceItems.find(
    (e) => e.requirementType === 'required' && e.evidenceStatus === 'NOT ENOUGH EVIDENCE'
  ) || evidenceItems.find((e) => e.evidenceStatus === 'NOT ENOUGH EVIDENCE') || evidenceItems.find(
    (e) => e.evidenceStatus === 'PARTIALLY DEMONSTRATED'
  );

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Welcome Hero / Overview Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-sky-50 dark:bg-sky-950/80 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                Career Readiness Overview
              </span>
              {verdict && (
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Last assessed {new Date(verdict.assessedAt).toLocaleDateString()}
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Welcome back, {userName}
            </h1>
            <p className="text-slate-600 text-sm sm:text-base max-w-2xl leading-relaxed">
              Know what your projects prove. Discover what to improve next. We compare your resume with real code in your GitHub repositories against requirements from employers.
            </p>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row lg:flex-col gap-3">
            <button
              onClick={nextStepAction}
              disabled={isAssessing}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-900 text-white font-semibold text-sm hover:bg-slate-800 transition-all shadow-sm hover:shadow"
            >
              <span>{isAssessing ? 'Assessing Match...' : nextStepText}</span>
              <ArrowRight className="w-4 h-4 text-sky-400" />
            </button>
            <p className="text-xs text-slate-500 text-center lg:text-left">{nextStepSubtext}</p>
          </div>
        </div>

        {/* Workflow Stepper */}
        <div className="mt-8 pt-6 border-t border-slate-100">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <button
              onClick={() => onNavigate('resume')}
              className={`p-3 rounded-lg border text-left transition-all ${
                resume
                  ? 'bg-emerald-50/50 border-emerald-200 text-slate-800'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold">1. Resume</span>
                {resume && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
              </div>
              <p className="text-[11px] text-slate-500 truncate">
                {resume ? resume.fileName : 'Upload PDF/text'}
              </p>
            </button>

            <button
              onClick={() => onNavigate('projects')}
              className={`p-3 rounded-lg border text-left transition-all ${
                connectedReposCount > 0
                  ? 'bg-emerald-50/50 border-emerald-200 text-slate-800'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold">2. GitHub Projects</span>
                {connectedReposCount > 0 && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
              </div>
              <p className="text-[11px] text-slate-500">
                {connectedReposCount > 0
                  ? `${connectedReposCount} connected`
                  : 'Add GitHub repo'}
              </p>
            </button>

            <button
              onClick={() => onNavigate('job')}
              className={`p-3 rounded-lg border text-left transition-all ${
                job
                  ? 'bg-emerald-50/50 border-emerald-200 text-slate-800'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold">3. Target Job</span>
                {job && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
              </div>
              <p className="text-[11px] text-slate-500 truncate">
                {job ? job.title : 'Select or paste job'}
              </p>
            </button>

            <button
              onClick={() => onNavigate('evidence')}
              className={`p-3 rounded-lg border text-left transition-all ${
                verdict
                  ? 'bg-emerald-50/50 border-emerald-200 text-slate-800'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold">4. Assessment</span>
                {verdict && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
              </div>
              <p className="text-[11px] text-slate-500">
                {verdict ? `${verdict.matchScore}% Match` : 'Awaiting review'}
              </p>
            </button>
          </div>
        </div>
      </div>

      {/* THREE CORE QUESTIONS CARD SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Question 1: Where do I stand? */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col justify-between shadow-2xs">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Question 1
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-sky-50 text-sky-700 font-medium">
                Current Standing
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">
              Where do I stand for my selected job?
            </h3>

            {verdict ? (
              <div className="space-y-3 mt-4">
                <VerdictPill verdict={verdict.verdict} score={verdict.matchScore} />
                <p className="text-xs text-slate-600 leading-relaxed">
                  {verdict.matchSummary}
                </p>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>Required Skills Met:</span>
                  <span className="font-semibold text-slate-800">
                    {verdict.requiredSkillsMet} / {verdict.totalRequiredSkills}
                  </span>
                </div>
              </div>
            ) : (
              <div className="py-4 text-xs text-slate-500">
                {job
                  ? 'Ready to analyze. Click "Assess Match" above to see where you stand.'
                  : 'Select a target job and connect your projects to calculate your standing.'}
              </div>
            )}
          </div>

          <button
            onClick={() => onNavigate('evidence')}
            className="mt-4 pt-3 border-t border-slate-100 text-xs font-semibold text-sky-700 hover:text-sky-900 flex items-center gap-1"
          >
            Explore Skill Evidence <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Question 2: What is my biggest gap? */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col justify-between shadow-2xs">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Question 2
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-amber-50 text-amber-800 font-medium">
                Evidence Gap
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">
              What is my biggest evidence gap?
            </h3>

            {primaryGap ? (
              <div className="space-y-3 mt-4">
                <div className="p-3 bg-amber-50/60 rounded-lg border border-amber-200">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-amber-950">{primaryGap.skillName}</span>
                    <span className="text-[10px] font-semibold text-amber-800 uppercase">
                      {primaryGap.requirementType}
                    </span>
                  </div>
                  <p className="text-xs text-amber-900 leading-relaxed">
                    {primaryGap.explanation}
                  </p>
                </div>
                <p className="text-xs text-slate-500 italic">
                  Note: This reflects the files examined in your selected repositories, not your personal competence.
                </p>
              </div>
            ) : (
              <div className="py-4 text-xs text-slate-500">
                {evidenceItems.length > 0
                  ? 'No critical gaps identified in the analyzed requirements.'
                  : 'Run an assessment to uncover gaps between your resume and code.'}
              </div>
            )}
          </div>

          <button
            onClick={() => onNavigate('evidence')}
            className="mt-4 pt-3 border-t border-slate-100 text-xs font-semibold text-sky-700 hover:text-sky-900 flex items-center gap-1"
          >
            Review all skill gaps <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Question 3: What should I do next? */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col justify-between shadow-2xs">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Question 3
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-medium">
                Action Plan
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">
              What should I do next?
            </h3>

            {actionPlan.length > 0 ? (
              <div className="space-y-3 mt-4">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-[10px] font-bold uppercase text-slate-500">
                    High Priority Exercise
                  </span>
                  <p className="font-semibold text-xs text-slate-900 mt-0.5">
                    {actionPlan[0].skill}
                  </p>
                  <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                    {actionPlan[0].practicalExercise}
                  </p>
                </div>
                <p className="text-xs text-slate-500">
                  Evidence to produce: {actionPlan[0].expectedEvidenceToProduce}
                </p>
              </div>
            ) : (
              <div className="py-4 text-xs text-slate-500">
                Personalized recommendations will appear here after your assessment is generated.
              </div>
            )}
          </div>

          <button
            onClick={() => onNavigate('action-plan')}
            className="mt-4 pt-3 border-t border-slate-100 text-xs font-semibold text-sky-700 hover:text-sky-900 flex items-center gap-1"
          >
            Open My Action Plan <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* METRIC CARDS GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Resume</p>
          <p className="text-xl font-bold text-slate-900 mt-1">
            {resume ? 'Uploaded' : 'None'}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5 truncate">
            {resume ? resume.claims.length + ' claims' : 'Not added'}
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Projects</p>
          <p className="text-xl font-bold text-slate-900 mt-1">{connectedReposCount}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Connected GitHub</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Target Job</p>
          <p className="text-xl font-bold text-slate-900 mt-1 truncate" title={job?.title || 'None'}>
            {job ? 'Selected' : 'None'}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5 truncate">{job ? job.company : 'Not set'}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Demonstrated</p>
          <p className="text-xl font-bold text-emerald-600 mt-1">{demonstratedCount}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Proven in code</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Need Evidence</p>
          <p className="text-xl font-bold text-amber-600 mt-1">{needEvidenceCount + partialCount}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">To improve</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Latest Update</p>
          <p className="text-xl font-bold text-slate-900 mt-1">
            {latestHistory ? 'Active' : 'Current'}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5 truncate">
            {latestHistory ? latestHistory.repoName : 'Up to date'}
          </p>
        </div>
      </div>

      {/* TWO COLUMN SECTION: Target Job & Skills Findings + Latest Commits */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Demonstrated & Gap Skills */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Important Skill Findings</h2>
              <p className="text-xs text-slate-500">
                Comparing resume claims against actual files in your repositories.
              </p>
            </div>
            <button
              onClick={() => onNavigate('evidence')}
              className="text-xs font-semibold text-sky-700 hover:text-sky-900"
            >
              View All ({evidenceItems.length})
            </button>
          </div>

          {evidenceItems.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {evidenceItems.slice(0, 5).map((item) => (
                <div key={item.id} className="py-3 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-slate-900">{item.skillName}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                        {item.category}
                      </span>
                      {item.requirementType === 'required' && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-100 font-medium">
                          Required
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-1">{item.explanation}</p>
                  </div>
                  <EvidenceBadge status={item.evidenceStatus} size="sm" />
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-slate-500 text-xs">
              No skills assessed yet. Run the assessment to inspect evidence.
            </div>
          )}
        </div>

        {/* Right Col: GitHub Activity & Change Detection Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <GitCommit className="w-4 h-4 text-sky-600" />
                Repository Activity
              </h2>
              <button
                onClick={onCheckUpdates}
                disabled={checkingUpdates}
                className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1"
                title="Poll GitHub for new commits"
              >
                <RefreshCw className={`w-3 h-3 ${checkingUpdates ? 'animate-spin' : ''}`} />
                {checkingUpdates ? 'Checking...' : 'Check'}
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              SkillTrace automatically tracks commit changes across your connected repositories. When code changes, affected skills are reassessed.
            </p>

            {latestHistory ? (
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-500 text-[11px]">
                  <span className="font-semibold text-slate-800">{latestHistory.repoName}</span>
                  <span>{new Date(latestHistory.timestamp).toLocaleDateString()}</span>
                </div>
                <p className="font-mono text-slate-700 bg-white p-1.5 rounded border border-slate-200 text-[11px] truncate">
                  {latestHistory.newCommitSha} — {latestHistory.commitMessage}
                </p>
                <p className="text-slate-600 text-[11px] leading-normal">
                  {latestHistory.overallChangeSummary}
                </p>
              </div>
            ) : (
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-center text-xs text-slate-500">
                No recent commits detected since initial baseline. Push new code or click "Check" to verify.
              </div>
            )}
          </div>

          <button
            onClick={() => onNavigate('history')}
            className="w-full text-center text-xs font-semibold text-sky-700 hover:text-sky-900 pt-3 border-t border-slate-100"
          >
            View Full Change History →
          </button>
        </div>
      </div>

      {/* HELPFUL TERMS / GLOSSARY EXPLAINER */}
      <div className="bg-slate-50/80 rounded-xl border border-slate-200 p-5 text-xs text-slate-600 space-y-3">
        <div className="flex items-center gap-2 text-slate-800 font-semibold">
          <HelpCircle className="w-4 h-4 text-sky-600" />
          <span>New to technical terminology? Quick plain-English guide:</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-2.5 bg-white rounded border border-slate-200">
            <span className="font-bold text-slate-900">GitHub:</span>
            <p className="text-[11px] text-slate-500 mt-0.5">
              An online home for software projects where developers store and share their source code.
            </p>
          </div>
          <div className="p-2.5 bg-white rounded border border-slate-200">
            <span className="font-bold text-slate-900">Repository (Repo):</span>
            <p className="text-[11px] text-slate-500 mt-0.5">
              The project folder containing all the code files, tests, and configuration for an application.
            </p>
          </div>
          <div className="p-2.5 bg-white rounded border border-slate-200">
            <span className="font-bold text-slate-900">Commit:</span>
            <p className="text-[11px] text-slate-500 mt-0.5">
              A saved snapshot of changes you made to your code, like a checkpoint with a descriptive note.
            </p>
          </div>
          <div className="p-2.5 bg-white rounded border border-slate-200">
            <span className="font-bold text-slate-900">SQL & Databases:</span>
            <p className="text-[11px] text-slate-500 mt-0.5">
              The structured way applications store, organize, query, and retrieve information reliably.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
