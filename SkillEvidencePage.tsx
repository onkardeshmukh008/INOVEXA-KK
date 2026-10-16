import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  XCircle,
  FileCode,
  GitCommit,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Filter,
  Sparkles,
  Info,
  Scale,
  Compass,
} from 'lucide-react';
import type {
  ConsistencyFinding,
  EvidenceStatus,
  JobReadinessVerdict,
  SkillEvidenceItem,
} from '../types/index.ts';
import { EvidenceBadge, RequirementBadge, VerdictPill } from '../components/StatusBadges.tsx';

interface SkillEvidencePageProps {
  evidenceItems: SkillEvidenceItem[];
  consistencyFindings: ConsistencyFinding[];
  verdict: JobReadinessVerdict | null;
  onRunAssessment: () => void;
  isAssessing: boolean;
}

export const SkillEvidencePage: React.FC<SkillEvidencePageProps> = ({
  evidenceItems,
  consistencyFindings,
  verdict,
  onRunAssessment,
  isAssessing,
}) => {
  const [filterTab, setFilterTab] = useState<
    'all' | 'required' | 'preferred' | 'demonstrated' | 'gaps' | 'consistency'
  >('all');
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);

  // Filter items
  const filteredItems = evidenceItems.filter((item) => {
    if (filterTab === 'required') return item.requirementType === 'required';
    if (filterTab === 'preferred') return item.requirementType === 'preferred';
    if (filterTab === 'demonstrated') return item.evidenceStatus === 'DEMONSTRATED';
    if (filterTab === 'gaps')
      return (
        item.evidenceStatus === 'NOT ENOUGH EVIDENCE' ||
        item.evidenceStatus === 'PARTIALLY DEMONSTRATED'
      );
    return true;
  });

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Skill Evidence & Verification
          </h1>
          <p className="text-slate-600 text-sm mt-1 max-w-2xl leading-relaxed">
            Every finding links directly to real code files, commit revisions, and clear reasoning. We never invent evidence to fill missing fields.
          </p>
        </div>

        <button
          onClick={onRunAssessment}
          disabled={isAssessing}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 disabled:opacity-50 transition-colors shadow-2xs"
        >
          <Sparkles className="w-3.5 h-3.5 text-sky-400" />
          <span>{isAssessing ? 'Re-evaluating Evidence...' : 'Re-assess Evidence'}</span>
        </button>
      </div>

      {/* FINAL VERDICT SUMMARY CARD */}
      {verdict && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Official Assessment Result
              </span>
              <div className="mt-1">
                <VerdictPill verdict={verdict.verdict} score={verdict.matchScore} />
              </div>
            </div>

            <div className="text-left sm:text-right text-xs text-slate-500 dark:text-slate-400">
              <p>Assessed on {new Date(verdict.assessedAt).toLocaleString()}</p>
              <p className="font-mono text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                Formula: {verdict.scoreFormula}
              </p>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
            {verdict.matchSummary}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/40 rounded-lg border border-emerald-100 dark:border-emerald-800 text-xs space-y-1">
              <p className="font-bold text-emerald-900 dark:text-emerald-300">Demonstrated Skills ({verdict.demonstratedSkills.length})</p>
              <p className="text-emerald-800 dark:text-emerald-400 text-[11px]">
                {verdict.demonstratedSkills.join(', ') || 'None verified yet'}
              </p>
            </div>

            <div className="p-3 bg-amber-50/50 dark:bg-amber-950/40 rounded-lg border border-amber-100 dark:border-amber-800 text-xs space-y-1">
              <p className="font-bold text-amber-900 dark:text-amber-300">Key Gaps & Opportunities ({verdict.gapSkills.length})</p>
              <p className="text-amber-800 dark:text-amber-400 text-[11px]">
                {verdict.gapSkills.join(', ') || 'No critical gaps identified'}
              </p>
            </div>
          </div>

          {/* Transparent Repository Analysis Scope Disclosure */}
          <div className="p-3.5 rounded-lg bg-sky-50/50 dark:bg-sky-950/30 border border-sky-100 dark:border-sky-900/60 text-[11px] space-y-1 text-sky-950 dark:text-sky-300">
            <div className="flex items-center gap-1.5 font-bold">
              <Info className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0" />
              <span>Repository Analysis Scope & Verification Standards</span>
            </div>
            <p className="leading-relaxed">
              Assessment examines prioritized repository files (routes, schemas, tests, configurations). We do not claim full codebase coverage unless all files were retrieved. All code citations reflect exact verified commits. Code presence proves implementation patterns in the repository, but does not certify individual authorship in shared public repositories.
            </p>
          </div>

          {/* Assessment limitations statement */}
          <div className="pt-2 text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 space-y-1">
            <p className="font-semibold text-slate-600 dark:text-slate-300">Important Assessment Limitations:</p>
            <ul className="list-disc list-inside space-y-0.5">
              {verdict.limitations.map((lim, idx) => (
                <li key={idx}>{lim}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* FILTER TABS */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setFilterTab('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            filterTab === 'all'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          All Skills ({evidenceItems.length})
        </button>
        <button
          onClick={() => setFilterTab('required')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            filterTab === 'required'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          Required ({evidenceItems.filter((e) => e.requirementType === 'required').length})
        </button>
        <button
          onClick={() => setFilterTab('preferred')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            filterTab === 'preferred'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          Preferred ({evidenceItems.filter((e) => e.requirementType === 'preferred').length})
        </button>
        <button
          onClick={() => setFilterTab('demonstrated')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            filterTab === 'demonstrated'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          Demonstrated ({evidenceItems.filter((e) => e.evidenceStatus === 'DEMONSTRATED').length})
        </button>
        <button
          onClick={() => setFilterTab('gaps')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            filterTab === 'gaps'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          Needs Evidence ({evidenceItems.filter((e) => e.evidenceStatus !== 'DEMONSTRATED').length})
        </button>
        <button
          onClick={() => setFilterTab('consistency')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            filterTab === 'consistency'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          Resume & Project Consistency ({consistencyFindings.length})
        </button>
      </div>

      {/* VIEW 1: RESUME & PROJECT CONSISTENCY */}
      {filterTab === 'consistency' ? (
        <div className="space-y-4">
          <div className="bg-sky-50/60 p-4 rounded-xl border border-sky-200 text-xs text-sky-950 space-y-1">
            <p className="font-bold flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-sky-700" />
              Resume & Project Consistency Evaluation
            </p>
            <p className="leading-relaxed">
              This check identifies differences between what your resume claims and what was found in your connected projects. We never make speculative accusations or claim to definitively detect AI vs human authorship from source code.
            </p>
          </div>

          <div className="space-y-4">
            {consistencyFindings.map((finding) => {
              let badgeColor = 'bg-slate-100 text-slate-800 border-slate-200';
              if (finding.findingType === 'supported') badgeColor = 'bg-emerald-50 text-emerald-800 border-emerald-200';
              if (finding.findingType === 'partially_supported') badgeColor = 'bg-amber-50 text-amber-900 border-amber-200';
              if (finding.findingType === 'not_supported') badgeColor = 'bg-rose-50 text-rose-800 border-rose-200';
              if (finding.findingType === 'unclaimed_evidence_found') badgeColor = 'bg-indigo-50 text-indigo-800 border-indigo-200';

              return (
                <div key={finding.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">{finding.skill}</span>
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${badgeColor}`}>
                        {finding.headline}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed">{finding.explanation}</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                    {finding.resumeCitation && (
                      <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                        <span className="font-bold text-[10px] uppercase text-slate-500 block mb-0.5">
                          Resume Claim:
                        </span>
                        <span className="text-slate-800 italic">"{finding.resumeCitation}"</span>
                      </div>
                    )}
                    {finding.codeCitation && (
                      <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                        <span className="font-bold text-[10px] uppercase text-slate-500 block mb-0.5">
                          Project Evidence:
                        </span>
                        <span className="font-mono text-slate-800 text-[11px]">
                          {finding.codeCitation}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* VIEW 2: SKILL EVIDENCE ITEMS */
        <div className="space-y-4">
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => {
              const isExpanded = expandedItemId === item.id;

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-xl border border-slate-200 transition-all shadow-2xs hover:border-slate-300"
                >
                  <div className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-base text-slate-900">{item.skillName}</span>
                        <RequirementBadge type={item.requirementType} />
                        <span className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                          {item.category}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          Confidence: <strong className="capitalize text-slate-600">{item.confidence}</strong>
                        </span>
                      </div>

                      <p className="text-xs text-slate-700 leading-relaxed">{item.explanation}</p>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-1">
                        <span className="text-[11px]">
                          Resume claim: <strong className="text-slate-700 capitalize">{item.resumeClaimStatus}</strong>
                        </span>
                        {item.citations.length > 0 && (
                          <span className="text-[11px] text-sky-700 font-medium">
                            • {item.citations.length} cited code artifact{item.citations.length > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                      <EvidenceBadge status={item.evidenceStatus} />
                      <button
                        onClick={() => setExpandedItemId(isExpanded ? null : item.id)}
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                        title={isExpanded ? 'Collapse details' : 'Expand citations and next steps'}
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* EXPANDED CITATIONS, CODE EXCERPTS & NEXT STEPS */}
                  {isExpanded && (
                    <div className="p-5 border-t border-slate-100 bg-slate-50/70 rounded-b-xl space-y-4 text-xs">
                      {/* Resume claim reference */}
                      <div className="p-3 rounded bg-white border border-slate-200 space-y-1">
                        <span className="font-bold text-[10px] uppercase text-slate-500">
                          Resume Context
                        </span>
                        <p className="text-slate-800 italic">"{item.resumeClaimQuote}"</p>
                      </div>

                      {/* Code citations */}
                      <div className="space-y-2">
                        <span className="font-bold text-slate-800 block">
                          Verified Code Citations ({item.citations.length})
                        </span>

                        {item.citations.length > 0 ? (
                          item.citations.map((cite, cIdx) => (
                            <div
                              key={cIdx}
                              className="p-3 rounded bg-white border border-slate-200 space-y-2"
                            >
                              <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-600 gap-2">
                                <div className="flex items-center gap-2">
                                  <FileCode className="w-3.5 h-3.5 text-sky-600" />
                                  <span className="font-mono font-semibold text-slate-900">
                                    {cite.filePath}
                                  </span>
                                  {cite.lineRef && (
                                    <span className="text-slate-500">({cite.lineRef})</span>
                                  )}
                                </div>
                                <span className="font-mono text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">
                                  commit {cite.commitSha}
                                </span>
                              </div>

                              {cite.codeExcerpt && (
                                <pre className="p-2.5 rounded bg-slate-900 text-sky-200 text-[11px] font-mono overflow-x-auto leading-relaxed">
                                  <code>{cite.codeExcerpt}</code>
                                </pre>
                              )}

                              <p className="text-[11px] text-slate-600">
                                <strong>Relevance:</strong> {cite.reason}
                              </p>
                              {cite.authorshipDisclaimer && (
                                <p className="text-[10px] text-slate-400 dark:text-slate-500 italic">
                                  {cite.authorshipDisclaimer}
                                </p>
                              )}
                            </div>
                          ))
                        ) : (
                          <div className="p-3 rounded bg-white border border-slate-200 text-slate-500 italic text-[11px]">
                            We couldn't find enough proof in the files we checked. This is a limitation of the files examined in your selected repositories, not proof of incompetence.
                          </div>
                        )}
                      </div>

                      {/* Uncertainty notes & recommended next step */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        <div className="p-3 rounded bg-white border border-slate-200 space-y-1">
                          <span className="font-bold text-[10px] uppercase text-slate-500">
                            Uncertainty & Scope
                          </span>
                          <p className="text-slate-600 text-[11px] leading-relaxed">
                            {item.uncertaintyNotes}
                          </p>
                        </div>

                        <div className="p-3 rounded bg-sky-50/50 border border-sky-100 space-y-1">
                          <span className="font-bold text-[10px] uppercase text-sky-800">
                            Recommended Next Step
                          </span>
                          <p className="text-sky-950 text-[11px] font-medium leading-relaxed">
                            {item.recommendedNextStep}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-8 text-center text-slate-500 text-xs">
              No skills match the current filter.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
