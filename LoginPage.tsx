import React, { useState } from 'react';
import {
  Shield,
  CheckCircle2,
  AlertCircle,
  FolderGit2,
  FileText,
  Briefcase,
  Play,
  Sparkles,
  Lock,
  Mail,
  User,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  Target,
  Code2,
} from 'lucide-react';
import { SkillTraceLogo } from '../components/SkillTraceLogo.tsx';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'candidate' | 'student' | 'judge';
}

interface LoginPageProps {
  onLoginSuccess: (user: AuthUser) => void;
  onViewSplash?: () => void;
}

interface RoleWeakTopicsGuide {
  id: string;
  roleName: string;
  headline: string;
  commonStrengths: string[];
  typicalWeakTopics: Array<{
    topic: string;
    gapReason: string;
    severity: 'High' | 'Medium';
    fixSuggestion: string;
  }>;
}

const ROLE_WEAK_TOPICS_GUIDES: RoleWeakTopicsGuide[] = [
  {
    id: 'fullstack',
    roleName: 'Full-Stack Engineer',
    headline: 'Modern Web, React, Node.js & Relational Databases',
    commonStrengths: ['TypeScript & JavaScript', 'RESTful Routing in Express', 'Git Workflow', 'Docker Multi-Stage'],
    typicalWeakTopics: [
      {
        topic: 'Relational Transactions & Isolation',
        gapReason: 'Resumes mention PostgreSQL or MySQL, but repositories lack explicit multi-step transactions, foreign key cascades, or rollback error handlers.',
        severity: 'High',
        fixSuggestion: 'Add an explicit database transaction block (e.g. prisma.$transaction) wrapping relational record creations.',
      },
      {
        topic: 'Automated Integration Testing',
        gapReason: 'Resumes frequently claim high test coverage, but open-source repositories often feature 0 committed test suites.',
        severity: 'High',
        fixSuggestion: 'Create a tests/ directory with Jest/Vitest and Supertest asserting HTTP 200 and 400 validation responses.',
      },
      {
        topic: 'Runtime Request Body Validation',
        gapReason: 'Express routes often pass req.body directly to database queries without schema validation.',
        severity: 'Medium',
        fixSuggestion: 'Introduce Zod or Joi schemas as middleware before passing payloads to ORM controllers.',
      },
    ],
  },
  {
    id: 'backend',
    roleName: 'Backend & Cloud Systems',
    headline: 'APIs, Microservices, Scalability & Databases',
    commonStrengths: ['Python & FastAPI / Go', 'Async I/O', 'Containerization', 'SQL DDL Schemas'],
    typicalWeakTopics: [
      {
        topic: 'Database Schema Migrations & Indexing',
        gapReason: 'ORM models are declared, but version-controlled migration files (Alembic / Prisma) and composite indexes are missing.',
        severity: 'High',
        fixSuggestion: 'Commit schema migration scripts and add query execution plans or indexing to foreign keys.',
      },
      {
        topic: 'Pub/Sub Stream Ingestion & Backpressure',
        gapReason: 'Message brokers (Kafka / Redis) are listed as skills without subscriber error retry queues or dead-letter queues.',
        severity: 'Medium',
        fixSuggestion: 'Implement consumer backpressure logic or retry policies for asynchronous message processing.',
      },
    ],
  },
  {
    id: 'frontend',
    roleName: 'Frontend Specialist',
    headline: 'UI Components, State Management & Accessibility',
    commonStrengths: ['React 18 / Next.js', 'Tailwind CSS', 'Component Modularization', 'Responsive Design'],
    typicalWeakTopics: [
      {
        topic: 'End-to-End Browser Testing',
        gapReason: 'Unit test setups exist, but critical user authentication and checkout flows lack Playwright or Cypress specs.',
        severity: 'High',
        fixSuggestion: 'Add automated E2E tests validating user input, form errors, and state transitions in CI.',
      },
      {
        topic: 'Server-Side Rendering & Edge Caching',
        gapReason: 'Projects rely solely on client-side state without cache-control headers, ISR, or streaming Suspense boundaries.',
        severity: 'Medium',
        fixSuggestion: 'Configure server components or HTTP caching headers for dynamic dashboard queries.',
      },
    ],
  },
  {
    id: 'devops',
    roleName: 'DevOps & Cloud Engineer',
    headline: 'CI/CD Pipelines, Kubernetes, Infrastructure & Security',
    commonStrengths: ['Docker Containerization', 'GitHub Actions CI', 'Linux Shell', 'Cloud Architecture'],
    typicalWeakTopics: [
      {
        topic: 'Secret Management & Least-Privilege IAM',
        gapReason: 'Containers run as root or config files contain default credentials without secret rotation patterns.',
        severity: 'High',
        fixSuggestion: 'Add non-root Docker USER directives and mock KMS/secret environment injection.',
      },
      {
        topic: 'Observability & Automated Rollbacks',
        gapReason: 'Deployment scripts push images without health-check probes, canary validations, or rollback hooks.',
        severity: 'Medium',
        fixSuggestion: 'Define readiness and liveness endpoints with automated failure thresholds in manifests.',
      },
    ],
  },
];

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, onViewSplash }) => {
  const [selectedGuide, setSelectedGuide] = useState<RoleWeakTopicsGuide>(ROLE_WEAK_TOPICS_GUIDES[0]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'candidate' | 'student' | 'judge'>('candidate');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please provide an email address.');
      return;
    }
    const displayName = name.trim() || 'Software Engineer';
    const user: AuthUser = {
      id: `usr-${Date.now()}`,
      name: displayName,
      email: email.trim(),
      role: role,
    };
    try {
      localStorage.setItem('skilltrace_user', JSON.stringify(user));
    } catch {}
    onLoginSuccess(user);
  };

  const handleQuickDeveloperAccess = () => {
    const user: AuthUser = {
      id: 'usr-developer',
      name: name.trim() || 'Developer',
      email: email.trim() || 'developer@example.com',
      role: 'candidate',
    };
    try {
      localStorage.setItem('skilltrace_user', JSON.stringify(user));
    } catch {}
    onLoginSuccess(user);
  };

  return (
    <div className="relative min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between p-4 sm:p-6 lg:p-8 font-sans antialiased overflow-hidden">
      
      {/* Top Bar with Brand and Splash Link */}
      <div className="relative z-10 max-w-6xl w-full mx-auto flex items-center justify-between py-2">
        <button
          onClick={onViewSplash}
          className="flex items-center gap-2.5 text-left group hover:opacity-90 transition-opacity"
        >
          <SkillTraceLogo size={36} variant="badge-only" />
          <div>
            <span
              style={{ fontFamily: 'Georgia, Cambria, "Times New Roman", serif', color: '#885D32' }}
              className="font-bold text-lg tracking-tight dark:text-amber-400"
            >
              SkillTrace<span className="text-amber-700 dark:text-amber-500">.Ai</span>
            </span>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Career Readiness Platform</p>
          </div>
        </button>

        <div className="flex items-center gap-3">
          {onViewSplash && (
            <button
              onClick={onViewSplash}
              className="text-xs font-semibold text-amber-800 dark:text-amber-400 hover:text-amber-950 dark:hover:text-amber-300 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/60 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Splash Screen</span>
            </button>
          )}
          <span className="hidden sm:inline-block text-[11px] font-semibold bg-amber-900/10 dark:bg-amber-950 text-amber-950 dark:text-amber-300 px-2.5 py-1 rounded-full border border-amber-900/15 dark:border-amber-800">
            Evidence-Based Verification
          </span>
        </div>
      </div>

      {/* Main Two-Column Layout: Weak Topics Explorer (Left) + Sign-in Card (Right) */}
      <div className="relative z-10 max-w-6xl w-full mx-auto my-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: ROLE WEAK TOPICS & VERIFICATION GAPS (USER REQUEST) */}
        <div className="lg:col-span-7 bg-white/95 dark:bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-7 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 bg-amber-100/70 dark:bg-amber-950/70 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800">
                Core Verification Architecture
              </span>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1 flex items-center gap-2">
                <Target className="w-5 h-5 text-amber-600" />
                Industry Weak Topics & Evidence Gaps
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Inspect the typical code gaps that SkillTrace diagnoses when contrasting candidate claims against GitHub repositories.
              </p>
            </div>
          </div>

          {/* Role Specialization Switcher */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
              Select Engineering Track to Inspect Weak Topics:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              {ROLE_WEAK_TOPICS_GUIDES.map((guide) => {
                const isSelected = selectedGuide.id === guide.id;
                return (
                  <button
                    key={guide.id}
                    type="button"
                    onClick={() => setSelectedGuide(guide)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-amber-500 bg-amber-50/70 dark:bg-amber-950/70 shadow-2xs font-bold text-amber-950 dark:text-amber-200'
                        : 'border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <p className="text-xs truncate">{guide.roleName}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Role Weak Topics Display */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-900 dark:text-rose-400 flex items-center gap-1.5">
                <TrendingDown className="w-4 h-4 text-rose-600" />
                Common Evidence Gaps in {selectedGuide.roleName}:
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                {selectedGuide.typicalWeakTopics.length} key evaluation vectors
              </span>
            </div>

            <div className="space-y-2.5">
              {selectedGuide.typicalWeakTopics.map((wt, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-rose-50/60 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-900/60 space-y-1.5 text-xs transition-all hover:bg-rose-50 dark:hover:bg-rose-950/60"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                      {wt.topic}
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
                        wt.severity === 'High'
                          ? 'bg-rose-100 dark:bg-rose-900 text-rose-800 dark:text-rose-200 border-rose-200 dark:border-rose-800'
                          : 'bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 border-amber-200 dark:border-amber-800'
                      }`}
                    >
                      {wt.severity} Priority Gap
                    </span>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 text-[11px] leading-relaxed">
                    <strong>Evidence Limitation:</strong> {wt.gapReason}
                  </p>
                  <p className="text-sky-900 dark:text-sky-300 text-[11px] bg-white dark:bg-slate-900 p-2 rounded-lg border border-sky-100 dark:border-slate-800">
                    <strong>Required Code Proof:</strong> {wt.fixSuggestion}
                  </p>
                </div>
              ))}
            </div>

            {/* Demonstrated Strengths for Balance */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-1.5 text-xs text-emerald-800 dark:text-emerald-400 font-semibold mb-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                <span>Frequently Proven Skills in this Track:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {selectedGuide.commonStrengths.map((st, sIdx) => (
                  <span
                    key={sIdx}
                    className="text-[11px] px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-medium"
                  >
                    ✓ {st}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: LOGIN & SIGN IN CARD */}
        <div className="lg:col-span-5 bg-white/95 dark:bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-7 space-y-5">
          <div className="text-center space-y-2">
            <SkillTraceLogo size={52} variant="badge-only" className="mx-auto" />
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                <User className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                <span>Local Workspace Personalization</span>
              </div>
              <h1
                style={{ fontFamily: 'Georgia, Cambria, "Times New Roman", serif', color: '#865A30' }}
                className="text-2xl font-bold tracking-tight dark:text-amber-400"
              >
                Profile & Workspace Setup
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Personalize your coaching experience. Profiles are stored locally in your browser (localStorage) to customize your workspace view.
              </p>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Your Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Aditi Sharma"
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="developer@example.com"
                  required
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Target Role / Track
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="candidate">Software Engineer (Full-Stack / Backend / Frontend)</option>
                <option value="student">Computer Science Student / New Graduate</option>
                <option value="judge">Technical Hiring Manager / Reviewer</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-amber-600 dark:hover:bg-amber-700 text-white font-semibold text-xs sm:text-sm transition-all shadow-sm flex items-center justify-center gap-2"
            >
              <span>Sign In to Workspace</span>
              <ArrowRight className="w-4 h-4 text-amber-400 dark:text-white" />
            </button>
          </form>

          {/* Quick 1-Click Developer Access */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={handleQuickDeveloperAccess}
              className="w-full py-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100/70 dark:hover:bg-amber-900/60 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 font-semibold text-xs transition-colors flex items-center justify-center gap-2"
            >
              <Code2 className="w-4 h-4 text-amber-600" />
              <span>Continue as Developer (Instant Workspace)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 max-w-6xl w-full mx-auto text-center text-xs text-slate-500 dark:text-slate-400 py-2 border-t border-slate-200/60 dark:border-slate-800">
        <p>
          SkillTrace.Ai • Evidence-Driven Technical Portfolio Analysis • Static AST & GitHub Verification
        </p>
      </div>
    </div>
  );
};
