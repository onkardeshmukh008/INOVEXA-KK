import React, { useEffect, useState } from 'react';
import { Navbar } from './components/Navbar.tsx';
import { PageId, Sidebar } from './components/Sidebar.tsx';
import { SplashScreen } from './components/SplashScreen.tsx';
import { AppBackground } from './components/AppBackground.tsx';
import { LoginPage, AuthUser } from './pages/LoginPage.tsx';
import { DashboardPage } from './pages/DashboardPage.tsx';
import { ResumePage } from './pages/ResumePage.tsx';
import { ProjectsPage } from './pages/ProjectsPage.tsx';
import { JobMatcherPage } from './pages/JobMatcherPage.tsx';
import { SkillEvidencePage } from './pages/SkillEvidencePage.tsx';
import { ActionPlanPage } from './pages/ActionPlanPage.tsx';
import { ChangeHistoryPage } from './pages/ChangeHistoryPage.tsx';
import { SettingsPage } from './pages/SettingsPage.tsx';
import { ProfilePage } from './pages/ProfilePage.tsx';
import { checkGitHubUpdates, fetchAppState, runAssessment } from './api.ts';
import type { AppState } from './types/index.ts';
import { Loader2, AlertCircle } from 'lucide-react';

export default function App() {
  const [state, setState] = useState<AppState | null>(null);
  const [currentPage, setCurrentPage] = useState<PageId>('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isAssessing, setIsAssessing] = useState(false);
  const [checkingUpdates, setCheckingUpdates] = useState(false);
  const [updateMessage, setUpdateMessage] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Dark Mode Theme State
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem('skilltrace_theme');
      return saved === 'dark' ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const handleToggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    try {
      localStorage.setItem('skilltrace_theme', next);
    } catch {}
  };

  // Splash Screen & Authentication State
  const [showSplash, setShowSplash] = useState<boolean>(true);
  const [authUser, setAuthUser] = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem('skilltrace_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const loadState = async () => {
    try {
      const data = await fetchAppState();
      setState(data);
      setErrorMessage(null);
    } catch (err: any) {
      console.error('Failed to load initial app state:', err);
      setErrorMessage(err.message || 'Failed to connect to SkillTrace server.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadState();
  }, []);

  const handleRunAssessment = async () => {
    if (!state) return;
    if (!state.resume) {
      setCurrentPage('resume');
      return;
    }
    if (state.repositories.filter((r) => r.selectedForAssessment).length === 0) {
      setCurrentPage('projects');
      return;
    }
    if (!state.job) {
      setCurrentPage('job');
      return;
    }

    setIsAssessing(true);
    setErrorMessage(null);

    try {
      await runAssessment();
      await loadState();
      setCurrentPage('evidence');
    } catch (err: any) {
      console.error('Assessment failed:', err);
      setErrorMessage(err.message || 'Assessment failed. Please try again.');
    } finally {
      setIsAssessing(false);
    }
  };

  const handleCheckUpdates = async () => {
    setCheckingUpdates(true);
    setUpdateMessage(null);
    try {
      const res = await checkGitHubUpdates();
      if (res.updated) {
        setUpdateMessage(res.message || 'New commits detected! Skill report updated.');
      } else {
        setUpdateMessage(res.message || 'All repositories are up to date.');
      }
      await loadState();
    } catch (err: any) {
      console.error('Error checking updates:', err);
      setUpdateMessage(err.message || 'Could not reach GitHub API.');
    } finally {
      setCheckingUpdates(false);
    }
  };

  const handleLoginSuccess = (user: AuthUser) => {
    setAuthUser(user);
    setShowSplash(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('skilltrace_user');
    setAuthUser(null);
  };

  // 1. Show Splash Screen first
  if (showSplash) {
    return (
      <SplashScreen
        onFinish={() => setShowSplash(false)}
        autoDismissMs={2600}
      />
    );
  }

  // 2. Show Login Page if user is not authenticated
  if (!authUser) {
    return (
      <LoginPage
        onLoginSuccess={handleLoginSuccess}
        onViewSplash={() => setShowSplash(true)}
      />
    );
  }

  // 3. Loading state for initial state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="flex items-center gap-3 text-slate-800">
          <Loader2 className="w-6 h-6 animate-spin text-amber-600" />
          <span className="font-semibold text-sm">Loading SkillTrace.Ai...</span>
        </div>
      </div>
    );
  }

  // 4. Connection Error state
  if (!state) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-6 rounded-xl border border-slate-200 text-center space-y-4 shadow-sm">
          <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
          <h2 className="text-base font-bold text-slate-900">Connection Error</h2>
          <p className="text-xs text-slate-600">
            {errorMessage || 'Unable to connect to SkillTrace server. Please refresh the page.'}
          </p>
          <button
            onClick={() => {
              setIsLoading(true);
              loadState();
            }}
            className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  // 5. Main Application View
  return (
    <div
      className={`relative min-h-screen ${
        theme === 'dark' ? 'dark bg-[#0b0f19] text-slate-100' : 'bg-slate-50 text-slate-900'
      } flex flex-col font-sans antialiased overflow-x-hidden transition-colors duration-200`}
    >
      {/* Background Picture with Neural Architecture & Ambient Glow */}
      <AppBackground />

      {/* Top Navbar */}
      <Navbar
        state={state}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        onCheckUpdates={handleCheckUpdates}
        checkingUpdates={checkingUpdates}
        onRunAssessment={handleRunAssessment}
        isAssessing={isAssessing}
        authUser={authUser}
        onLogout={handleLogout}
        onShowSplash={() => setShowSplash(true)}
        onNavigateToProfile={() => setCurrentPage('profile')}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      {/* Main Layout: Sidebar + Active Page */}
      <div className="relative z-10 flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar
          currentPage={currentPage}
          onNavigate={(page) => setCurrentPage(page)}
          state={state}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
          authUser={authUser}
          onLogout={handleLogout}
          onShowSplash={() => setShowSplash(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-y-auto">
          {currentPage === 'dashboard' && (
            <DashboardPage
              state={state}
              onNavigate={(page) => setCurrentPage(page)}
              onRunAssessment={handleRunAssessment}
              isAssessing={isAssessing}
              onCheckUpdates={handleCheckUpdates}
              checkingUpdates={checkingUpdates}
              authUser={authUser}
            />
          )}

          {currentPage === 'resume' && (
            <ResumePage
              resume={state.resume}
              resumeAssessment={state.resumeAssessment}
              onRefreshState={loadState}
              onNavigateToProjects={() => setCurrentPage('projects')}
            />
          )}

          {currentPage === 'projects' && (
            <ProjectsPage
              repositories={state.repositories}
              standaloneRepoAssessment={state.standaloneRepoAssessment}
              onRefreshState={loadState}
              onCheckUpdates={handleCheckUpdates}
              checkingUpdates={checkingUpdates}
            />
          )}

          {currentPage === 'job' && (
            <JobMatcherPage
              job={state.job}
              onRefreshState={loadState}
              onRunAssessment={handleRunAssessment}
              isAssessing={isAssessing}
            />
          )}

          {currentPage === 'evidence' && (
            <SkillEvidencePage
              evidenceItems={state.evidenceItems}
              consistencyFindings={state.consistencyFindings}
              verdict={state.verdict}
              onRunAssessment={handleRunAssessment}
              isAssessing={isAssessing}
            />
          )}

          {currentPage === 'action-plan' && (
            <ActionPlanPage
              actionPlan={state.actionPlan}
              onRefreshState={loadState}
              onNavigateToProjects={() => setCurrentPage('projects')}
            />
          )}

          {currentPage === 'history' && (
            <ChangeHistoryPage
              history={state.history}
              repositories={state.repositories}
              onCheckUpdates={handleCheckUpdates}
              checkingUpdates={checkingUpdates}
              updateMessage={updateMessage}
            />
          )}

          {currentPage === 'profile' && (
            <ProfilePage
              authUser={authUser}
              onUpdateAuthUser={(user) => setAuthUser(user)}
              state={state}
              theme={theme}
              onToggleTheme={handleToggleTheme}
              onRefreshState={loadState}
              onNavigate={(page) => setCurrentPage(page)}
            />
          )}

          {currentPage === 'settings' && (
            <SettingsPage
              settings={state.settings}
              onRefreshState={loadState}
              onNavigateToDashboard={() => setCurrentPage('dashboard')}
            />
          )}
        </main>
      </div>
    </div>
  );
}
