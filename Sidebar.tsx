import React from 'react';
import {
  LayoutDashboard,
  FileText,
  FolderGit2,
  Briefcase,
  ShieldCheck,
  CheckSquare,
  History,
  Settings,
  AlertCircle,
  Sparkles,
  LogOut,
  User,
} from 'lucide-react';
import type { AppState } from '../types/index.ts';
import type { AuthUser } from '../pages/LoginPage.tsx';

export type PageId =
  | 'dashboard'
  | 'resume'
  | 'projects'
  | 'job'
  | 'evidence'
  | 'action-plan'
  | 'history'
  | 'settings'
  | 'profile';

interface SidebarProps {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
  state: AppState;
  mobileMenuOpen?: boolean;
  setMobileMenuOpen?: (open: boolean) => void;
  authUser?: AuthUser | null;
  onLogout?: () => void;
  onShowSplash?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onNavigate,
  state,
  mobileMenuOpen,
  setMobileMenuOpen,
  authUser,
  onLogout,
  onShowSplash,
}) => {
  const navItems: Array<{
    id: PageId;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string | number;
    badgeColor?: string;
  }> = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    {
      id: 'resume',
      label: 'My Resume',
      icon: FileText,
      badge: state.resume ? `${state.resume.claims.length} Claims` : undefined,
      badgeColor: 'bg-emerald-100 text-emerald-800',
    },
    {
      id: 'projects',
      label: 'My Projects',
      icon: FolderGit2,
      badge: state.repositories.length > 0 ? state.repositories.length : undefined,
      badgeColor: 'bg-sky-100 text-sky-800',
    },
    {
      id: 'job',
      label: 'Job Matcher',
      icon: Briefcase,
      badge: state.job ? 'Active' : undefined,
      badgeColor: 'bg-slate-200 text-slate-800',
    },
    {
      id: 'evidence',
      label: 'Skill Evidence',
      icon: ShieldCheck,
      badge: state.evidenceItems.length > 0 ? state.evidenceItems.length : undefined,
      badgeColor: 'bg-indigo-100 text-indigo-800',
    },
    {
      id: 'action-plan',
      label: 'My Action Plan',
      icon: CheckSquare,
      badge: state.actionPlan.length > 0 ? state.actionPlan.length : undefined,
      badgeColor: 'bg-amber-100 text-amber-900',
    },
    {
      id: 'history',
      label: 'Change History',
      icon: History,
      badge: state.history.length > 0 ? state.history.length : undefined,
      badgeColor: 'bg-slate-200 text-slate-700',
    },
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleSelect = (page: PageId) => {
    onNavigate(page);
    if (setMobileMenuOpen) {
      setMobileMenuOpen(false);
    }
  };

  const content = (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900/95 border-r border-slate-200 dark:border-slate-800 p-4 justify-between transition-colors">
      <div className="space-y-1">
        <p className="px-3 text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
          Navigation
        </p>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleSelect(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-slate-900 dark:bg-amber-600 text-white shadow-xs'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400 dark:text-amber-200' : 'text-slate-500 dark:text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                    isActive ? 'bg-slate-800 dark:bg-amber-700 text-amber-300 dark:text-amber-100' : item.badgeColor || 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom Section: Active Job Snapshot + User Session Card */}
      <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
        {state.job && (
          <div className="p-3 bg-white dark:bg-slate-800/80 rounded-lg border border-slate-200 dark:border-slate-700 text-xs shadow-2xs">
            <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider mb-1">
              Active Target Job
            </p>
            <p className="font-semibold text-slate-900 dark:text-white truncate" title={state.job.title}>
              {state.job.title}
            </p>
            <p className="text-slate-500 dark:text-slate-400 truncate">{state.job.company}</p>
          </div>
        )}

        {/* User Card */}
        {authUser && (
          <div className="p-3 bg-white dark:bg-slate-800/90 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs space-y-2">
            <div
              onClick={() => handleSelect('profile')}
              className="flex items-center justify-between cursor-pointer group"
              title="View Profile & Skill Trend Chart"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 font-bold text-xs flex items-center justify-center shrink-0 border border-amber-300 dark:border-amber-700 group-hover:scale-105 transition-transform">
                  {authUser.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-amber-600 transition-colors">
                    {authUser.name}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{authUser.email}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-700 text-[11px]">
              <button
                onClick={() => handleSelect('profile')}
                className="text-amber-800 dark:text-amber-400 hover:text-amber-950 dark:hover:text-amber-300 font-medium flex items-center gap-1"
              >
                <User className="w-3 h-3" /> Profile
              </button>
              {onLogout && (
                <button
                  onClick={onLogout}
                  className="text-rose-600 dark:text-rose-400 hover:text-rose-800 font-medium flex items-center gap-1"
                >
                  <LogOut className="w-3 h-3" /> Log Out
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 shrink-0 h-[calc(100vh-4rem)] sticky top-16">
        {content}
      </aside>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen && setMobileMenuOpen(false)}
          />
          <div className="relative w-64 max-w-xs bg-slate-50 shadow-xl z-50 h-full">
            {content}
          </div>
        </div>
      )}
    </>
  );
};
