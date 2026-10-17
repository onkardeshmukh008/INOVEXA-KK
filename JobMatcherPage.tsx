import React, { useState } from 'react';
import {
  Briefcase,
  Link as LinkIcon,
  FileText,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Play,
  ArrowRight,
  Edit2,
  Check,
  X,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';
import type { JobRequirement, JobRequirementSkill } from '../types/index.ts';
import { parseOrSaveJob, updateJobSkills } from '../api.ts';
import { RequirementBadge } from '../components/StatusBadges.tsx';

interface JobMatcherPageProps {
  job: JobRequirement | null;
  onRefreshState: () => void;
  onRunAssessment: () => void;
  isAssessing: boolean;
}

export const JobMatcherPage: React.FC<JobMatcherPageProps> = ({
  job,
  onRefreshState,
  onRunAssessment,
  isAssessing,
}) => {
  const [activeTab, setActiveTab] = useState<'url' | 'paste'>('paste');
  const [jobUrl, setJobUrl] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Skill editing state
  const [editingSkillId, setEditingSkillId] = useState<string | null>(null);
  const [editSkillName, setEditSkillName] = useState('');
  const [editSkillCategory, setEditSkillCategory] = useState('');
  const [editSkillImportance, setEditSkillImportance] = useState<'required' | 'preferred'>('required');

  // Add new skill
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillCategory, setNewSkillCategory] = useState('Backend');
  const [newSkillImportance, setNewSkillImportance] = useState<'required' | 'preferred'>('required');
  const [showAddSkill, setShowAddSkill] = useState(false);

  const handleExtractJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsExtracting(true);

    try {
      if (activeTab === 'url') {
        if (!jobUrl.trim()) {
          setErrorMessage('Please enter a job URL');
          setIsExtracting(false);
          return;
        }
        await parseOrSaveJob({ url: jobUrl.trim(), title: jobTitle.trim() });
      } else {
        if (!jobDescription.trim() || jobDescription.length < 20) {
          setErrorMessage('Please paste at least a paragraph of the job description.');
          setIsExtracting(false);
          return;
        }
        await parseOrSaveJob({ description: jobDescription.trim(), title: jobTitle.trim() });
      }

      setIsExtracting(false);
      setSuccessMessage('Job requirements extracted successfully! You can review and edit them below.');
      onRefreshState();
    } catch (err: any) {
      setIsExtracting(false);
      if (err.needsManualPaste) {
        setActiveTab('paste');
        setErrorMessage(
          err.message ||
            'Unable to scrape this job posting directly due to anti-bot protection. Please paste the job description below.'
        );
      } else {
        setErrorMessage(err.message || 'Failed to analyze job requirements.');
      }
    }
  };

  const handleDeleteSkill = async (id: string) => {
    if (!job) return;
    const updated = job.skills.filter((s) => s.id !== id);
    try {
      await updateJobSkills({ skills: updated });
      onRefreshState();
    } catch (err: any) {
      setErrorMessage(err.message);
    }
  };

  const handleSaveSkillEdit = async (id: string) => {
    if (!job) return;
    const updated = job.skills.map((s) => {
      if (s.id === id) {
        return {
          ...s,
          name: editSkillName,
          category: editSkillCategory,
          importance: editSkillImportance,
        };
      }
      return s;
    });
    try {
      await updateJobSkills({ skills: updated });
      setEditingSkillId(null);
      onRefreshState();
    } catch (err: any) {
      setErrorMessage(err.message);
    }
  };

  const handleAddSkill = async () => {
    if (!job || !newSkillName.trim()) return;
    const newSkill: JobRequirementSkill = {
      id: `js-${Date.now()}`,
      name: newSkillName.trim(),
      category: newSkillCategory,
      description: 'Manually specified qualification requirement.',
      importance: newSkillImportance,
    };
    try {
      await updateJobSkills({ skills: [...job.skills, newSkill] });
      setNewSkillName('');
      setShowAddSkill(false);
      onRefreshState();
    } catch (err: any) {
      setErrorMessage(err.message);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Job Matcher</h1>
          <p className="text-slate-600 text-sm mt-1 max-w-2xl leading-relaxed">
            Enter a real job or internship opportunity. We will extract required vs preferred qualifications and compare them against your code.
          </p>
        </div>

        {job && (
          <button
            onClick={onRunAssessment}
            disabled={isAssessing}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors shadow-xs"
          >
            <Play className="w-3.5 h-3.5 text-sky-400 fill-sky-400" />
            <span>{isAssessing ? 'Assessing Match...' : 'Run Skill Assessment'}</span>
          </button>
        )}
      </div>

      {/* Notifications */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">Notice</p>
            <p className="mt-0.5">{errorMessage}</p>
          </div>
          <button onClick={() => setErrorMessage(null)} className="text-rose-500 hover:text-rose-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <p className="flex-1 font-medium">{successMessage}</p>
          <button onClick={() => setSuccessMessage(null)} className="text-emerald-500 hover:text-emerald-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* INPUT FORM (URL OR PASTE) */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4">
        {/* Tab switcher */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
          <button
            onClick={() => setActiveTab('paste')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              activeTab === 'paste'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" /> Paste Job Description
          </button>
          <button
            onClick={() => setActiveTab('url')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              activeTab === 'url'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <LinkIcon className="w-3.5 h-3.5" /> Job Posting URL
          </button>
        </div>

        <form onSubmit={handleExtractJob} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Job Title & Company (Optional preview label)
            </label>
            <input
              type="text"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="e.g. Junior Full-Stack Developer at Veloce Digital"
              className="w-full p-2.5 rounded-lg border border-slate-300 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          {activeTab === 'url' ? (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Job Posting URL
              </label>
              <input
                type="url"
                value={jobUrl}
                onChange={(e) => setJobUrl(e.target.value)}
                placeholder="https://company.careers/jobs/frontend-engineer"
                className="w-full p-2.5 rounded-lg border border-slate-300 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Sites with strong login walls or Cloudflare protections may require pasting text directly.
              </p>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Job Description Text
              </label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                rows={6}
                placeholder="Paste the full job requirements, responsibilities, and qualifications here..."
                className="w-full p-3 rounded-lg border border-slate-300 text-xs text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isExtracting}
              className="px-5 py-2.5 rounded-lg bg-sky-600 text-white font-semibold text-xs sm:text-sm hover:bg-sky-500 disabled:opacity-50 transition-colors shadow-xs"
            >
              {isExtracting ? 'Analyzing Requirements...' : 'Extract & Save Requirements'}
            </button>
          </div>
        </form>
      </div>

      {/* ACTIVE JOB DETAILS & EDITABLE REQUIREMENTS */}
      {job ? (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-800 font-semibold border border-sky-100">
                  Target Job Selected
                </span>
                <h2 className="text-xl font-extrabold text-slate-900 mt-1">{job.title}</h2>
                <p className="text-xs text-slate-600 font-medium">
                  {job.company} • {job.experienceLevel}
                </p>
              </div>

              {job.sourceUrl && (
                <a
                  href={job.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-sky-700 hover:text-sky-900 flex items-center gap-1 font-medium"
                >
                  <LinkIcon className="w-3.5 h-3.5" /> Source Link
                </a>
              )}
            </div>

            <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
              {job.overview}
            </p>
          </div>

          {job.extractionStatus === 'extraction_failed' && (
            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold text-sm">Automated Extraction Unavailable</p>
                <p className="leading-relaxed">
                  {job.extractionError ||
                    'Automated skill extraction was unavailable. In accordance with SkillTrace evidence integrity standards, no generic fallback skills were fabricated.'}
                </p>
                <p className="font-semibold text-amber-800 dark:text-amber-300">
                  Please use the &quot;+ Add Requirement&quot; button below to manually enter the skills from your target job posting.
                </p>
              </div>
            </div>
          )}

          {/* REQUIREMENTS TABLE (REQUIRED VS PREFERRED) */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Extracted Job Requirements ({job.skills.length})
                </h3>
                <p className="text-xs text-slate-500">
                  Review and correct requirements before testing your project code. Required skills are weighted heavily in your match score.
                </p>
              </div>

              <button
                onClick={() => setShowAddSkill(true)}
                className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200"
              >
                <Plus className="w-3.5 h-3.5" /> Add Requirement
              </button>
            </div>

            {/* Inline Add Skill */}
            {showAddSkill && (
              <div className="p-4 bg-sky-50/60 rounded-xl border border-sky-200 space-y-3 text-xs">
                <p className="font-bold text-sky-950">Add a custom requirement</p>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <input
                    type="text"
                    value={newSkillName}
                    onChange={(e) => setNewSkillName(e.target.value)}
                    placeholder="Skill name (e.g. Docker, GraphQL, Jest)"
                    className="p-2 rounded border border-slate-300 bg-white"
                  />
                  <select
                    value={newSkillCategory}
                    onChange={(e) => setNewSkillCategory(e.target.value)}
                    className="p-2 rounded border border-slate-300 bg-white"
                  >
                    <option value="Languages">Languages</option>
                    <option value="Backend">Backend</option>
                    <option value="Databases">Databases</option>
                    <option value="Quality Assurance">Quality Assurance</option>
                    <option value="DevOps">DevOps</option>
                    <option value="Collaboration">Collaboration</option>
                  </select>
                  <select
                    value={newSkillImportance}
                    onChange={(e) => setNewSkillImportance(e.target.value as any)}
                    className="p-2 rounded border border-slate-300 bg-white"
                  >
                    <option value="required">Required</option>
                    <option value="preferred">Preferred</option>
                  </select>
                  <div className="flex gap-2">
                    <button
                      onClick={handleAddSkill}
                      className="px-3 py-2 rounded bg-sky-600 text-white font-semibold hover:bg-sky-500 flex-1"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setShowAddSkill(false)}
                      className="px-3 py-2 rounded border border-slate-300 text-slate-600 hover:bg-white"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Skills list */}
            <div className="divide-y divide-slate-100">
              {job.skills.map((skill) => {
                const isEditing = editingSkillId === skill.id;

                if (isEditing) {
                  return (
                    <div key={skill.id} className="py-3 bg-slate-50 p-3 rounded-lg space-y-2 text-xs">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <input
                          type="text"
                          value={editSkillName}
                          onChange={(e) => setEditSkillName(e.target.value)}
                          className="p-2 rounded border border-slate-300 bg-white"
                        />
                        <select
                          value={editSkillCategory}
                          onChange={(e) => setEditSkillCategory(e.target.value)}
                          className="p-2 rounded border border-slate-300 bg-white"
                        >
                          <option value="Languages">Languages</option>
                          <option value="Backend">Backend</option>
                          <option value="Databases">Databases</option>
                          <option value="Quality Assurance">Quality Assurance</option>
                          <option value="DevOps">DevOps</option>
                        </select>
                        <select
                          value={editSkillImportance}
                          onChange={(e) => setEditSkillImportance(e.target.value as any)}
                          className="p-2 rounded border border-slate-300 bg-white"
                        >
                          <option value="required">Required</option>
                          <option value="preferred">Preferred</option>
                        </select>
                      </div>
                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          onClick={() => handleSaveSkillEdit(skill.id)}
                          className="px-3 py-1 rounded bg-emerald-600 text-white flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" /> Save
                        </button>
                        <button
                          onClick={() => setEditingSkillId(null)}
                          className="px-3 py-1 rounded border border-slate-300 text-slate-600"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={skill.id} className="py-3 flex items-start justify-between gap-4 text-xs">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-white">{skill.name}</span>
                        <RequirementBadge type={skill.importance} />
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                          {skill.category}
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded font-semibold border ${
                            skill.source === 'user_confirmed' || skill.source === 'manual'
                              ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                              : 'bg-sky-50 dark:bg-sky-950 text-sky-800 dark:text-sky-300 border-sky-200 dark:border-sky-800'
                          }`}
                        >
                          {skill.source === 'user_confirmed'
                            ? '✓ User Confirmed'
                            : skill.source === 'manual'
                            ? 'User Added'
                            : 'AI Extracted'}
                        </span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-400">{skill.description}</p>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => {
                          setEditingSkillId(skill.id);
                          setEditSkillName(skill.name);
                          setEditSkillCategory(skill.category);
                          setEditSkillImportance(skill.importance);
                        }}
                        className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded hover:bg-slate-100 dark:hover:bg-slate-700"
                        title="Edit requirement"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteSkill(skill.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded hover:bg-slate-100 dark:hover:bg-slate-700"
                        title="Remove requirement"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-slate-50 rounded-xl border border-slate-200 p-8 text-center text-slate-500 text-xs">
          <p className="font-medium text-slate-700 text-sm">No target job selected.</p>
          <p className="mt-1">
            Paste a job description or provide a URL above so we can extract employer expectations.
          </p>
        </div>
      )}
    </div>
  );
};
