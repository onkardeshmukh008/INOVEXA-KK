import React, { useState } from 'react';
import {
  User,
  Mail,
  Moon,
  Sun,
  TrendingUp,
  FolderGit2,
  FileText,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  GitCommit,
  Award,
  Layers,
  Calendar,
  ExternalLink,
  Save,
  Check,
  Zap,
} from 'lucide-react';
import type { AppState } from '../types/index.ts';
import type { PageId } from '../components/Sidebar.tsx';
import type { AuthUser } from './LoginPage.tsx';

interface ProfilePageProps {
  authUser: AuthUser | null;
  onUpdateAuthUser: (user: AuthUser) => void;
  state: AppState;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onRefreshState: () => void;
  onNavigate: (page: PageId) => void;
}

interface TrendPoint {
  id: string;
  label: string;
  commitSha: string;
  date: string;
  evidenceScore: number;
  claimsVerifiedPercent: number;
  architectureScore: number;
  milestone: string;
  description: string;
}

const HISTORICAL_TREND_DATA: TrendPoint[] = [
  {
    id: 't1',
    label: 'Initial Sync',
    commitSha: '1a82f0c',
    date: '3 weeks ago',
    evidenceScore: 42,
    claimsVerifiedPercent: 30,
    architectureScore: 55,
    milestone: 'Repository Connected',
    description: 'Initial repo indexing. Found basic Express route skeleton.',
  },
  {
    id: 't2',
    label: 'Schema Commit',
    commitSha: '3c99e12',
    date: '2 weeks ago',
    evidenceScore: 58,
    claimsVerifiedPercent: 48,
    architectureScore: 68,
    milestone: 'Prisma Relational Models',
    description: 'Added PostgreSQL models with 1-to-many foreign key relations.',
  },
  {
    id: 't3',
    label: 'Validation Update',
    commitSha: '4a10c83',
    date: '10 days ago',
    evidenceScore: 71,
    claimsVerifiedPercent: 62,
    architectureScore: 78,
    milestone: 'Zod Input Schemas',
    description: 'Configured request body validation on POST endpoints.',
  },
  {
    id: 't4',
    label: 'Testing Suite',
    commitSha: '7f991d2',
    date: '4 days ago',
    evidenceScore: 84,
    claimsVerifiedPercent: 78,
    architectureScore: 86,
    milestone: 'Supertest Integration Tests',
    description: 'Added test suite verifying HTTP 200/400 status codes.',
  },
  {
    id: 't5',
    label: 'Current Audit',
    commitSha: '9b441aa',
    date: 'Today',
    evidenceScore: 92,
    claimsVerifiedPercent: 88,
    architectureScore: 94,
    milestone: 'Docker & CI/CD Pipeline',
    description: 'Multi-stage Dockerfile and GitHub Actions workflow active.',
  },
];

const SKILL_COMPETENCIES = [
  { name: 'Backend API Architecture & Middleware', score: 92, change: '+24%', category: 'Backend' },
  { name: 'Database Schema & Relational Integrity', score: 86, change: '+18%', category: 'Databases' },
  { name: 'Automated Testing (Jest / Supertest)', score: 82, change: '+35%', category: 'Testing' },
  { name: 'TypeScript & Static Type Soundness', score: 95, change: '+12%', category: 'Languages' },
  { name: 'DevOps, Docker & CI/CD Pipelines', score: 78, change: '+28%', category: 'DevOps' },
  { name: 'Error Handling & Validation Middleware', score: 88, change: '+15%', category: 'Security' },
];

export const ProfilePage: React.FC<ProfilePageProps> = ({
  authUser,
  onUpdateAuthUser,
  state,
  theme,
  onToggleTheme,
  onRefreshState,
  onNavigate,
}) => {
  const [name, setName] = useState(authUser?.name || 'Developer');
  const [email, setEmail] = useState(authUser?.email || 'developer@example.com');
  const [headline, setHeadline] = useState('Full-Stack Software Engineer');
  const [githubUrl, setGithubUrl] = useState('https://github.com/developer');
  const [bio, setBio] = useState(
    'Software engineer passionate about building reliable web systems, rigorous database modeling, and evidence-proven code architectures.'
  );
  const [isSaved, setIsSaved] = useState(false);
  const [activePoint, setActivePoint] = useState<TrendPoint>(
    HISTORICAL_TREND_DATA[HISTORICAL_TREND_DATA.length - 1]
  );
  const [timeFilter, setTimeFilter] = useState<'commits' | '30days' | 'all'>('commits');

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: AuthUser = {
      id: authUser?.id || 'dev',
      name: name.trim() || 'Developer',
      email: email.trim() || 'developer@example.com',
      role: authUser?.role || 'candidate',
    };
    onUpdateAuthUser(updated);
    try {
      localStorage.setItem('skilltrace_user', JSON.stringify(updated));
    } catch {}
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  // SVG Chart Calculations
  const chartWidth = 600;
  const chartHeight = 220;
  const paddingX = 40;
  const paddingY = 30;
  const graphWidth = chartWidth - paddingX * 2;
  const graphHeight = chartHeight - paddingY * 2;

  const points = HISTORICAL_TREND_DATA;
  const getX = (idx: number) => paddingX + (idx / (points.length - 1)) * graphWidth;
  const getY = (score: number) => chartHeight - paddingY - (score / 100) * graphHeight;

  // Path generators
  const evidencePath = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(p.evidenceScore)}`)
    .join(' ');
  const claimsPath = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(p.claimsVerifiedPercent)}`)
    .join(' ');
  const archPath = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(p.architectureScore)}`)
    .join(' ');

  // Gradient area fill for evidence score
  const areaPath = `${evidencePath} L ${getX(points.length - 1)} ${chartHeight - paddingY} L ${getX(
    0
  )} ${chartHeight - paddingY} Z`;

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800">
              Developer Profile & Analytics
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Personal Workspace Settings
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Engineer Profile & Skill Trajectory
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-1 max-w-2xl leading-relaxed">
            Monitor your skill evidence evolution across repository commits, track competency trends, and customize your workspace theme.
          </p>
        </div>

        {/* Quick Dark Mode Indicator / Switch in Header */}
        <button
          onClick={onToggleTheme}
          className="self-start sm:self-auto inline-flex items-center gap-2.5 px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold shadow-xs hover:border-amber-400 transition-all"
        >
          {theme === 'dark' ? (
            <>
              <Moon className="w-4 h-4 text-amber-400" />
              <span>Theme: Dark Mode</span>
            </>
          ) : (
            <>
              <Sun className="w-4 h-4 text-amber-600" />
              <span>Theme: Light Mode</span>
            </>
          )}
        </button>
      </div>

      {/* Grid: Left Column (Profile & Dark Mode Switch) + Right Column (Skill Trend Chart & Competencies) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: IDENTITY & WORKSPACE PREFERENCES */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* 1. DARK MODE SWITCH CARD (USER REQUEST) */}
          <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-200 dark:border-amber-800">
                  {theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Workspace Theme</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Toggle dark / light appearance</p>
                </div>
              </div>

              {/* The Toggle Switch */}
              <button
                type="button"
                onClick={onToggleTheme}
                role="switch"
                aria-checked={theme === 'dark'}
                className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 ${
                  theme === 'dark' ? 'bg-amber-600' : 'bg-slate-300'
                }`}
              >
                <span className="sr-only">Toggle dark mode</span>
                <span
                  className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out flex items-center justify-center ${
                    theme === 'dark' ? 'translate-x-7' : 'translate-x-0'
                  }`}
                >
                  {theme === 'dark' ? (
                    <Moon className="w-3.5 h-3.5 text-amber-600" />
                  ) : (
                    <Sun className="w-3.5 h-3.5 text-amber-500" />
                  )}
                </span>
              </button>
            </div>

            <div className="text-xs space-y-2 text-slate-600 dark:text-slate-300">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-medium">Active Mode:</span>
                <span className="font-bold text-amber-600 dark:text-amber-400 capitalize">
                  {theme} Mode
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Dark mode provides optimal contrast for reading code excerpts, AST syntax trees, and deep engineering assessments.
              </p>
            </div>
          </div>

          {/* 2. DEVELOPER IDENTITY CARD */}
          <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-xs space-y-5">
            <div className="flex items-center gap-3.5 pb-4 border-b border-slate-100 dark:border-slate-700">
              <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-900 font-extrabold text-xl flex items-center justify-center shadow-sm border-2 border-white dark:border-slate-700">
                {name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <h2 className="text-base font-extrabold text-slate-900 dark:text-white truncate">
                  {name}
                </h2>
                <p className="text-xs text-amber-700 dark:text-amber-400 font-semibold truncate">
                  {headline}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                  {email}
                </p>
              </div>
            </div>

            {/* Edit Profile Form */}
            <form onSubmit={handleSaveProfile} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <User className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your Full Name"
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700/60 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="developer@example.com"
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700/60 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Target Specialization / Headline
                </label>
                <input
                  type="text"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder="e.g. Full-Stack Software Engineer"
                  className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700/60 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  GitHub Profile Link
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <FolderGit2 className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="url"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    placeholder="https://github.com/username"
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700/60 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Professional Bio
                </label>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700/60 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-amber-600 dark:hover:bg-amber-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
              >
                {isSaved ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Profile Saved!</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Update Profile Details</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* 3. SUMMARY STATS */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Connected Repos
              </span>
              <p className="text-xl font-extrabold text-slate-900 dark:text-white">
                {state.repositories.length}
              </p>
              <button
                onClick={() => onNavigate('projects')}
                className="text-[11px] text-sky-600 dark:text-sky-400 font-semibold hover:underline block pt-0.5"
              >
                Manage projects →
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Resume Claims
              </span>
              <p className="text-xl font-extrabold text-slate-900 dark:text-white">
                {state.resume ? state.resume.claims.length : 0}
              </p>
              <button
                onClick={() => onNavigate('resume')}
                className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold hover:underline block pt-0.5"
              >
                View claims →
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: SKILL TREND CHART & COMPETENCIES (USER REQUEST) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* MAIN SKILL TREND CHART CARD */}
          <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-700 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/70 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800">
                  Analytics & Growth
                </span>
                <h2 className="text-lg font-extrabold text-slate-900 dark:text-white mt-1 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-amber-600" />
                  Skill Verification Trend Chart
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Trajectory of demonstrated technical evidence and architecture quality over Git commit milestones.
                </p>
              </div>

              {/* Timeframe Filter */}
              <div className="flex rounded-lg border border-slate-200 dark:border-slate-700 p-0.5 bg-slate-50 dark:bg-slate-900 text-xs">
                <button
                  type="button"
                  onClick={() => setTimeFilter('commits')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                    timeFilter === 'commits'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  By Commits
                </button>
                <button
                  type="button"
                  onClick={() => setTimeFilter('30days')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                    timeFilter === '30days'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  Last 30 Days
                </button>
                <button
                  type="button"
                  onClick={() => setTimeFilter('all')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                    timeFilter === 'all'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  All Time
                </button>
              </div>
            </div>

            {/* Interactive SVG Trend Chart */}
            <div className="relative pt-2">
              {/* Legend */}
              <div className="flex flex-wrap items-center gap-4 text-xs mb-3 text-slate-600 dark:text-slate-300">
                <span className="flex items-center gap-1.5 font-medium">
                  <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
                  Overall Evidence Index ({activePoint.evidenceScore}%)
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
                  Claims Backed ({activePoint.claimsVerifiedPercent}%)
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <span className="w-3 h-3 rounded-full bg-sky-500 inline-block" />
                  Code Architecture ({activePoint.architectureScore}%)
                </span>
              </div>

              {/* Chart Canvas */}
              <div className="w-full overflow-x-auto">
                <svg
                  viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                  className="w-full h-56 select-none"
                >
                  <defs>
                    <linearGradient id="evidenceAreaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal Grid lines */}
                  {[0, 25, 50, 75, 100].map((val) => {
                    const y = getY(val);
                    return (
                      <g key={val}>
                        <line
                          x1={paddingX}
                          y1={y}
                          x2={chartWidth - paddingX}
                          y2={y}
                          stroke={theme === 'dark' ? '#334155' : '#e2e8f0'}
                          strokeDasharray="3 3"
                        />
                        <text
                          x={paddingX - 10}
                          y={y + 4}
                          textAnchor="end"
                          fontSize="9"
                          fill={theme === 'dark' ? '#94a3b8' : '#94a3b8'}
                        >
                          {val}%
                        </text>
                      </g>
                    );
                  })}

                  {/* Evidence Area Fill */}
                  <path d={areaPath} fill="url(#evidenceAreaGrad)" />

                  {/* Lines */}
                  {/* Sky Line: Code Architecture */}
                  <path
                    d={archPath}
                    fill="none"
                    stroke="#0284c7"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* Emerald Line: Claims Verified */}
                  <path
                    d={claimsPath}
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* Amber Line: Overall Evidence Score */}
                  <path
                    d={evidencePath}
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Interactive Nodes */}
                  {points.map((p, idx) => {
                    const cx = getX(idx);
                    const cy = getY(p.evidenceScore);
                    const isSelected = activePoint.id === p.id;
                    return (
                      <g
                        key={p.id}
                        className="cursor-pointer"
                        onClick={() => setActivePoint(p)}
                      >
                        <circle
                          cx={cx}
                          cy={cy}
                          r={isSelected ? 7 : 5}
                          fill={isSelected ? '#d97706' : '#f59e0b'}
                          stroke={theme === 'dark' ? '#1e293b' : '#ffffff'}
                          strokeWidth="2"
                          className="transition-all hover:scale-125"
                        />
                        {/* X-axis labels */}
                        <text
                          x={cx}
                          y={chartHeight - 8}
                          textAnchor="middle"
                          fontSize="10"
                          fontWeight={isSelected ? 'bold' : 'normal'}
                          fill={isSelected ? (theme === 'dark' ? '#fbbf24' : '#b45309') : (theme === 'dark' ? '#94a3b8' : '#64748b')}
                        >
                          {p.label}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* Active Milestone Card (Interactive Details on Click) */}
              <div className="mt-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs animate-in fade-in duration-200">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <GitCommit className="w-3.5 h-3.5 text-amber-500" />
                      Commit {activePoint.commitSha} • {activePoint.milestone}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-semibold">
                      {activePoint.date}
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                    {activePoint.description}
                  </p>
                </div>

                <div className="shrink-0 flex items-center gap-3 bg-white dark:bg-slate-800 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-[11px]">
                  <div>
                    <span className="text-slate-400 block text-[9px] uppercase font-bold">Evidence</span>
                    <span className="font-extrabold text-amber-600 dark:text-amber-400">
                      {activePoint.evidenceScore}%
                    </span>
                  </div>
                  <div className="border-l border-slate-200 dark:border-slate-700 pl-3">
                    <span className="text-slate-400 block text-[9px] uppercase font-bold">Architecture</span>
                    <span className="font-extrabold text-sky-600 dark:text-sky-400">
                      {activePoint.architectureScore}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* DOMAIN COMPETENCY BREAKDOWN PROGRESS BARS */}
            <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5 uppercase tracking-wider">
                  <Layers className="w-4 h-4 text-amber-600" />
                  Competency Mastery by Engineering Domain:
                </span>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                  All metrics backed by code
                </span>
              </div>

              <div className="space-y-3">
                {SKILL_COMPETENCIES.map((sc, idx) => (
                  <div key={idx} className="space-y-1 text-xs">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {sc.name}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-[10px]">
                          {sc.change}
                        </span>
                        <span className="font-bold text-slate-900 dark:text-white">
                          {sc.score}%
                        </span>
                      </div>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-500"
                        style={{ width: `${sc.score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ACTION FOOTER */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <span className="text-slate-500 dark:text-slate-400 text-[11px] italic">
                Trend scores update automatically as you commit code to your connected GitHub repositories.
              </span>
              <button
                onClick={() => onNavigate('projects')}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-white font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
              >
                <FolderGit2 className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                <span>Connect New Repository</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
