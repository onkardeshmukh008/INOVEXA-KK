import React, { useState } from 'react';
import {
  CheckCircle2,
  Sparkles,
  HelpCircle,
  TrendingUp,
  AlertTriangle,
  FileCode,
  Layers,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Award,
  Check,
  ShieldCheck,
  Zap,
} from 'lucide-react';

export const ResumeProfessionalGuide: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'pillars' | 'checklist' | 'examples'>('pillars');
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({
    item1: true,
    item2: false,
    item3: false,
    item4: true,
    item5: false,
    item6: false,
    item7: false,
  });

  const toggleCheck = (id: string) => {
    setCheckedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const completedCount = Object.values(checkedItems).filter(Boolean).length;
  const totalCount = Object.keys(checkedItems).length;
  const auditPercent = Math.round((completedCount / totalCount) * 100);

  return (
    <div className="bg-white dark:bg-slate-900/90 rounded-2xl border-2 border-amber-900/15 dark:border-amber-800/40 p-6 sm:p-7 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/70 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800">
              Career Readiness Guide
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Industry Standard Guidelines
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mt-1 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            How to Make Your Resume More Professional
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-3xl leading-relaxed">
            Recruiters and engineering hiring managers evaluate hundreds of resumes in seconds. Follow these 6 proven pillars to turn vague statements into credible, evidence-backed qualifications.
          </p>
        </div>

        {/* Audit Progress Badge */}
        <div className="shrink-0 flex items-center gap-2 bg-slate-50 dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Readiness Audit</span>
            <span className="text-sm font-black text-amber-600 dark:text-amber-400">
              {completedCount} of {totalCount} Done ({auditPercent}%)
            </span>
          </div>
          <div className="w-8 h-8 rounded-full border-2 border-amber-500 flex items-center justify-center font-bold text-xs text-amber-700 dark:text-amber-300">
            {auditPercent}%
          </div>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 text-xs">
        <button
          onClick={() => setActiveTab('pillars')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
            activeTab === 'pillars'
              ? 'bg-slate-900 dark:bg-amber-600 text-white'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          6 Core Professional Pillars
        </button>
        <button
          onClick={() => setActiveTab('examples')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
            activeTab === 'examples'
              ? 'bg-slate-900 dark:bg-amber-600 text-white'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Before & After Bullet Rewrites
        </button>
        <button
          onClick={() => setActiveTab('checklist')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
            activeTab === 'checklist'
              ? 'bg-slate-900 dark:bg-amber-600 text-white'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Interactive Self-Audit Checklist ({completedCount}/{totalCount})
        </button>
      </div>

      {/* TAB 1: 6 CORE PILLARS */}
      {activeTab === 'pillars' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          {/* Pillar 1 */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-sm">
              <div className="w-6 h-6 rounded-md bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 flex items-center justify-center text-xs">
                1
              </div>
              <span>Google X-Y-Z Impact Formula</span>
            </div>
            <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
              Structure bullets as: <strong>&quot;Accomplished [X] as measured by [Y], by doing [Z]&quot;</strong>. Replace generic duties with tangible business or engineering results.
            </p>
            <div className="p-2 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-700 dark:text-slate-300">
              <span className="text-rose-600 dark:text-rose-400 font-semibold">Avoid:</span> &quot;Worked on backend APIs.&quot;
              <br />
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Use:</span> &quot;Engineered 14 REST endpoints handling 10k req/min with sub-50ms latency by indexing PostgreSQL queries.&quot;
            </div>
          </div>

          {/* Pillar 2 */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-sm">
              <div className="w-6 h-6 rounded-md bg-sky-100 dark:bg-sky-950/80 text-sky-800 dark:text-sky-300 flex items-center justify-center text-xs">
                2
              </div>
              <span>Link Claims to Verified Code</span>
            </div>
            <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
              Skills listed without project proof are considered unverified claims by hiring managers. Connect your project descriptions to public GitHub repositories with real commits.
            </p>
            <div className="p-2 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-700 dark:text-slate-300">
              <span className="font-semibold text-sky-700 dark:text-sky-400">Pro Tip:</span> Include hyperlinked GitHub repositories for your key portfolio applications right below project titles.
            </div>
          </div>

          {/* Pillar 3 */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-sm">
              <div className="w-6 h-6 rounded-md bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 flex items-center justify-center text-xs">
                3
              </div>
              <span>ATS-Friendly Formatting</span>
            </div>
            <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
              Applicant Tracking Systems (ATS) choke on multi-column layouts, graphics, and tables. Keep a clean, linear, single-column document with standard headings.
            </p>
            <div className="p-2 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-700 dark:text-slate-300">
              <span className="font-semibold text-emerald-700 dark:text-emerald-400">Standard Sections:</span> Education, Experience, Technical Projects, Categorized Skills. Use standard PDF export.
            </div>
          </div>

          {/* Pillar 4 */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-sm">
              <div className="w-6 h-6 rounded-md bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300 flex items-center justify-center text-xs">
                4
              </div>
              <span>Categorize Technical Stack</span>
            </div>
            <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
              Never dump a giant 30-item comma-separated list of keywords. Organize your stack into distinct technical disciplines that make your core focus immediately scannable.
            </p>
            <div className="p-2 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-700 dark:text-slate-300">
              <strong>Categories:</strong> Languages, Frameworks & Backend, Databases & Caching, Quality Assurance & Testing, DevOps & Cloud.
            </div>
          </div>

          {/* Pillar 5 */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-sm">
              <div className="w-6 h-6 rounded-md bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 flex items-center justify-center text-xs">
                5
              </div>
              <span>Highlight Engineering Discipline</span>
            </div>
            <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
              Junior resumes often only mention feature coding. Senior-readiness is proven by testing discipline, containerization, and automated deployment pipelines.
            </p>
            <div className="p-2 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-700 dark:text-slate-300">
              <strong>High-Value Artifacts:</strong> Unit tests (Jest/Vitest), CI/CD pipelines (GitHub Actions), Dockerfiles, and database migration scripts.
            </div>
          </div>

          {/* Pillar 6 */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-sm">
              <div className="w-6 h-6 rounded-md bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 flex items-center justify-center text-xs">
                6
              </div>
              <span>Clean Contact & Privacy Hygiene</span>
            </div>
            <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
              Remove home physical addresses, birthdates, and photos (standard in US/Canada/UK tech). Provide clear professional links: email, LinkedIn, and GitHub.
            </p>
            <div className="p-2 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-700 dark:text-slate-300">
              <strong>Eliminate Rating Bars:</strong> Never use &quot;Java: 80%&quot; or skill progress bars. They cannot be parsed by ATS and invite arbitrary skepticism.
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: BEFORE & AFTER REWRITES */}
      {activeTab === 'examples' && (
        <div className="space-y-3 text-xs">
          <p className="text-slate-500 dark:text-slate-400">
            Compare weak, passive resume bullets with professional, impact-driven statements:
          </p>

          <div className="space-y-3">
            {/* Example 1 */}
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 space-y-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Backend API & Database Performance:
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-2.5 rounded bg-rose-50/60 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900">
                  <span className="text-rose-700 dark:text-rose-300 font-bold block mb-1">❌ Weak & Passive:</span>
                  <p className="text-slate-700 dark:text-slate-300 italic">
                    &quot;Responsible for writing REST APIs and connecting to a PostgreSQL database for a web store.&quot;
                  </p>
                </div>
                <div className="p-2.5 rounded bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900">
                  <span className="text-emerald-700 dark:text-emerald-300 font-bold block mb-1">✅ Professional & Quantified:</span>
                  <p className="text-slate-700 dark:text-slate-300 font-medium">
                    &quot;Architected 18 RESTful Express endpoints and relational Prisma schema with PostgreSQL transactions, reducing checkout API latency by 35% across 4,000 monthly transactions.&quot;
                  </p>
                </div>
              </div>
            </div>

            {/* Example 2 */}
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 space-y-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Testing & Code Quality:
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-2.5 rounded bg-rose-50/60 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900">
                  <span className="text-rose-700 dark:text-rose-300 font-bold block mb-1">❌ Weak & Passive:</span>
                  <p className="text-slate-700 dark:text-slate-300 italic">
                    &quot;Helped with testing and fixing bugs before software release.&quot;
                  </p>
                </div>
                <div className="p-2.5 rounded bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900">
                  <span className="text-emerald-700 dark:text-emerald-300 font-bold block mb-1">✅ Professional & Quantified:</span>
                  <p className="text-slate-700 dark:text-slate-300 font-medium">
                    &quot;Authored 45+ automated unit and integration tests using Vitest and Supertest in a CI pipeline, increasing core coverage to 82% and catching 12 critical regression issues prior to production.&quot;
                  </p>
                </div>
              </div>
            </div>

            {/* Example 3 */}
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 space-y-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Frontend & UI Engineering:
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-2.5 rounded bg-rose-50/60 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900">
                  <span className="text-rose-700 dark:text-rose-300 font-bold block mb-1">❌ Weak & Passive:</span>
                  <p className="text-slate-700 dark:text-slate-300 italic">
                    &quot;Created React components and styled pages with Tailwind CSS.&quot;
                  </p>
                </div>
                <div className="p-2.5 rounded bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900">
                  <span className="text-emerald-700 dark:text-emerald-300 font-bold block mb-1">✅ Professional & Quantified:</span>
                  <p className="text-slate-700 dark:text-slate-300 font-medium">
                    &quot;Built a responsive dashboard in React 19 & TypeScript featuring debounced search and optimistic UI updates, cutting user time-to-action by 40% with zero layout shift (CLS &lt; 0.05).&quot;
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: INTERACTIVE CHECKLIST */}
      {activeTab === 'checklist' && (
        <div className="space-y-3 text-xs">
          <p className="text-slate-500 dark:text-slate-400">
            Check off each requirement to ensure your resume meets high-standard technical hiring benchmarks:
          </p>

          <div className="space-y-2">
            {[
              {
                id: 'item1',
                title: 'Action-First Past-Tense Verbs',
                desc: 'Every bullet begins with strong verbs (Engineered, Architected, Optimized, Containerized, Designed) rather than "Responsible for" or "Worked on".',
              },
              {
                id: 'item2',
                title: 'Quantified Metrics Included',
                desc: 'At least 2-3 bullets feature numbers: latency (ms), request volume (req/sec), users, test coverage (%), or memory optimization.',
              },
              {
                id: 'item3',
                title: 'GitHub Repositories Hyperlinked',
                desc: 'Major projects link directly to accessible GitHub repositories so technical interviewers can verify code structure.',
              },
              {
                id: 'item4',
                title: 'Clean Single-Column Layout',
                desc: 'Document uses a linear, ATS-parsable format with standard font styles and no complex multi-column text tables.',
              },
              {
                id: 'item5',
                title: 'Categorized Technical Stack',
                desc: 'Skills are separated into Core Languages, Frameworks, Databases, Testing, and DevOps rather than one huge keyword lump.',
              },
              {
                id: 'item6',
                title: 'Automated Testing Discipline Highlighted',
                desc: 'Unit testing frameworks (Jest, Vitest, PyTest) and test coverage metrics are explicitly documented.',
              },
              {
                id: 'item7',
                title: 'No Subjective Rating Bars',
                desc: 'Skill bars like "Python 85%" or self-assigned percentage dials have been completely removed.',
              },
            ].map((check) => {
              const isChecked = checkedItems[check.id];
              return (
                <div
                  key={check.id}
                  onClick={() => toggleCheck(check.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-3 select-none ${
                    isChecked
                      ? 'bg-emerald-50/60 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 border ${
                      isChecked
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'border-slate-300 dark:border-slate-600'
                    }`}
                  >
                    {isChecked && <Check className="w-3.5 h-3.5" />}
                  </div>
                  <div>
                    <p className={`font-bold ${isChecked ? 'text-emerald-950 dark:text-emerald-300' : 'text-slate-900 dark:text-white'}`}>
                      {check.title}
                    </p>
                    <p className="text-slate-600 dark:text-slate-400 text-[11px] mt-0.5">{check.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
