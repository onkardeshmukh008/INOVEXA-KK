import React from 'react';
import {
  Menu,
  X,
  RefreshCw,
  FileText,
  Briefcase,
  Play,
  LogOut,
  Sparkles,
  GitCommit,
  User,
  Sun,
  Moon,
} from 'lucide-react';
import type { AppState } from '../types/index.ts';
import { SkillTraceLogo } from './SkillTraceLogo.tsx';
import type { AuthUser } from '../pages/LoginPage.tsx';

interface NavbarProps {
  state: AppState;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  onCheckUpdates: () => void;
  checkingUpdates: boolean;
  onRunAssessment: () => void;
  isAssessing: boolean;
  authUser: AuthUser | null;
  onLogout: () => void;
  onShowSplash: () => void;
  onNavigateToProfile?: () => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  state,
  mobileMenuOpen,
  setMobileMenuOpen,
  onCheckUpdates,
  checkingUpdates,
  onRunAssessment,
  isAssessing,
  authUser,
  onLogout,
  onShowSplash,
  onNavigateToProfile,
  theme,
  onToggleTheme,
}) => {
  const hasResume = Boolean(state.resume);
  const repoCount = state.repositories.filter((r) => r.selectedForAssessment).length;
  const hasJob = Boolean(state.job);

  return (
    <header className="sticky top-0 z-30 bg-white dark:bg-slate-900/95 border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Tagline with SkillTraceLogo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <button
              onClick={onShowSplash}
              title="Click to view SkillTrace.Ai Splash Screen"
              className="flex items-center gap-2.5 text-left group hover:opacity-90 transition-opacity"
            >
              <SkillTraceLogo size={36} variant="badge-only" />
              <div>
                <div className="flex items-center gap-2">
                  <span
                    style={{ fontFamily: 'Georgia, Cambria, "Times New Roman", serif', color: '#885D32' }}
                    className="font-bold text-lg tracking-tight dark:text-amber-400"
                  >
                    SkillTrace<span className="text-amber-700 dark:text-amber-500">.Ai</span>
                  </span>
                  <span className="hidden sm:inline-block text-[10px] font-semibold uppercase tracking-wider text-amber-900/80 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border border-amber-200/60 dark:border-amber-800/60 px-1.5 py-0.5 rounded">
                    Career Readiness
                  </span>
                  {state.isDemoData && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-800 px-2 py-0.5 rounded-full">
                      Sample Data Mode
                    </span>
                  )}
                </div>
                <p className="hidden md:block text-[11px] text-slate-500 dark:text-slate-400 font-normal">
                  Know what your projects prove. Discover what to improve next.
                </p>
              </div>
            </button>
          </div>

          {/* Quick status indicators & Actions */}
          <div className="flex items-center gap-3">
            {/* Readiness Quick Pill */}
            <div className="hidden lg:flex items-center gap-4 text-xs text-slate-600 dark:text-slate-300 border-r border-slate-200 dark:border-slate-800 pr-4">
              <span className="flex items-center gap-1.5">
                <FileText className={`w-3.5 h-3.5 ${hasResume ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`} />
                {hasResume ? 'Resume Loaded' : 'No Resume'}
              </span>
              <span className="flex items-center gap-1.5">
                <GitCommit className={`w-3.5 h-3.5 ${repoCount > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`} />
                {repoCount} Project{repoCount === 1 ? '' : 's'}
              </span>
              <span className="flex items-center gap-1.5">
                <Briefcase className={`w-3.5 h-3.5 ${hasJob ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`} />
                {hasJob ? state.job?.title?.slice(0, 18) : 'No Job Selected'}
              </span>
            </div>

            {/* Check Updates Button */}
            <button
              onClick={onCheckUpdates}
              disabled={checkingUpdates || state.repositories.length === 0}
              title="Check GitHub for new commits on connected repositories"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-slate-600 dark:text-slate-300 ${checkingUpdates ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">
                {checkingUpdates ? 'Checking Repos...' : 'Check Repos'}
              </span>
            </button>

            {/* Run Assessment CTA */}
            <button
              onClick={onRunAssessment}
              disabled={isAssessing || !hasResume || repoCount === 0 || !hasJob}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-amber-600 dark:hover:bg-amber-700 disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:cursor-not-allowed px-3.5 py-1.5 rounded-lg transition-colors shadow-xs"
            >
              <Play className={`w-3.5 h-3.5 text-amber-400 fill-amber-400 ${isAssessing ? 'animate-pulse' : ''}`} />
              <span>{isAssessing ? 'Analyzing...' : 'Assess Match'}</span>
            </button>

            {/* Quick Dark Mode Switch */}
            {onToggleTheme && (
              <button
                onClick={onToggleTheme}
                title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
              </button>
            )}

            {/* Auth Profile / Logout */}
            {authUser && (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
                <button
                  onClick={onNavigateToProfile}
                  title={`View Profile: ${authUser.name} (${authUser.email})`}
                  className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 font-bold text-xs flex items-center justify-center border border-amber-300 dark:border-amber-700 shadow-2xs hover:scale-105 transition-transform"
                >
                  {authUser.name.charAt(0).toUpperCase()}
                </button>
                <button
                  onClick={onLogout}
                  title="Sign Out"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
