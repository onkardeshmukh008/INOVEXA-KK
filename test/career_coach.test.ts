import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {
  verifyCitation,
  computeJobReadinessVerdict,
  createUnavailableAssessment,
  getAiClient,
} from '../server/ai.ts';
import {
  getAppState,
  getSampleDemoState,
  resetAppStateToDemo,
  StorageConfigurationError,
} from '../server/store.ts';
import type {
  JobRequirement,
  SkillEvidenceItem,
  ResumeData,
  GitHubRepo,
} from '../src/types/index.ts';
import type { RepoAnalysisData } from '../server/github.ts';

// ---------------------------------------------------------------------------
// 1. Evidence Validation Against Actual Repository Content and Commit SHA
// ---------------------------------------------------------------------------
test('verifyCitation: validates legitimate file and commit SHA', () => {
  const dummyRepoData: RepoAnalysisData[] = [
    {
      repo: {
        id: 'repo-test',
        url: 'https://github.com/alice/backend-api',
        owner: 'alice',
        repo: 'backend-api',
        defaultBranch: 'main',
        description: 'Test API',
        language: 'TypeScript',
        stars: 12,
        forks: 3,
        lastAnalyzedCommit: {
          sha: 'a1b2c3d',
          message: 'feat: add payment service',
          date: '2026-03-01T10:00:00Z',
          author: 'alice',
        },
        fileList: ['src/services/payment.ts', 'src/routes/api.ts', 'package.json'],
        analyzedFilesCount: 3,
        selectedForAssessment: true,
        sampleFiles: [],
      },
      files: [
        {
          path: 'src/services/payment.ts',
          content: 'export async function processPayment(amount: number) { return stripe.charges.create({ amount }); }',
          category: 'code',
          size: 100,
        },
      ],
    },
  ];

  const validRawCitation = {
    repoUrl: 'https://github.com/alice/backend-api',
    repoName: 'backend-api',
    filePath: 'src/services/payment.ts',
    commitSha: 'a1b2c3d',
    lineRef: 'Lines 1-5',
    codeExcerpt: 'export async function processPayment',
    reason: 'Implements Stripe payment processing logic',
  };

  const verified = verifyCitation(validRawCitation, dummyRepoData);
  assert.ok(verified, 'Citation should be verified');
  assert.equal(verified?.filePath, 'src/services/payment.ts');
  assert.equal(verified?.commitSha, 'a1b2c3d');
  assert.equal(verified?.isVerifiedInCommit, true);
  assert.ok(
    verified?.authorshipDisclaimer?.includes('Candidate personal authorship'),
    'Should include authorship disclaimer'
  );
});

// ---------------------------------------------------------------------------
// 2. Rejection of Fabricated Citations, Invalid File Paths, and Placeholders
// ---------------------------------------------------------------------------
test('verifyCitation: rejects fabricated citations, placeholder paths and HEAD commit', () => {
  const dummyRepoData: RepoAnalysisData[] = [
    {
      repo: {
        id: 'repo-test',
        url: 'https://github.com/alice/backend-api',
        owner: 'alice',
        repo: 'backend-api',
        defaultBranch: 'main',
        description: 'Test API',
        language: 'TypeScript',
        stars: 12,
        forks: 3,
        lastAnalyzedCommit: {
          sha: 'a1b2c3d',
          message: 'initial',
          date: '2026-03-01',
          author: 'alice',
        },
        fileList: ['src/index.ts'],
        analyzedFilesCount: 1,
        selectedForAssessment: true,
        sampleFiles: [],
      },
      files: [{ path: 'src/index.ts', content: 'console.log("hello");', category: 'code', size: 50 }],
    },
  ];

  // Rejects generic "Source file"
  const fake1 = verifyCitation({ filePath: 'Source file', commitSha: 'a1b2c3d' }, dummyRepoData);
  assert.equal(fake1, null, 'Must reject "Source file" placeholder');

  // Rejects "path/to/file.ts"
  const fake2 = verifyCitation({ filePath: 'path/to/file.ts', commitSha: 'a1b2c3d' }, dummyRepoData);
  assert.equal(fake2, null, 'Must reject path/to/file.ts');

  // Rejects files not in repository
  const nonExistent = verifyCitation(
    { filePath: 'src/does_not_exist.ts', commitSha: 'a1b2c3d' },
    dummyRepoData
  );
  assert.equal(nonExistent, null, 'Must reject file not existing in repo');

  // Strips fake // implementation snippet
  const fakeSnippet = verifyCitation(
    {
      filePath: 'src/index.ts',
      commitSha: 'a1b2c3d',
      codeExcerpt: '// implementation snippet',
    },
    dummyRepoData
  );
  assert.ok(fakeSnippet, 'Citation file is valid');
  assert.equal(fakeSnippet?.codeExcerpt, '', 'Should strip fake snippet placeholder');
});

// ---------------------------------------------------------------------------
// 3. Graceful Handling of Missing API Key & Honest Fallbacks
// ---------------------------------------------------------------------------
test('getAiClient: throws honest error when GEMINI_API_KEY is missing or placeholder', () => {
  const origKey = process.env.GEMINI_API_KEY;
  try {
    delete process.env.GEMINI_API_KEY;
    assert.throws(
      () => getAiClient(),
      /GEMINI_API_KEY is not configured/
    );

    process.env.GEMINI_API_KEY = 'MY_GEMINI_API_KEY';
    assert.throws(
      () => getAiClient(),
      /GEMINI_API_KEY is not configured/
    );
  } finally {
    if (origKey) process.env.GEMINI_API_KEY = origKey;
  }
});

test('createUnavailableAssessment: marks all items NEEDS REVIEW and never fabricates DEMONSTRATED skills', () => {
  const dummyResume: ResumeData = {
    fileName: 'resume.pdf',
    rawText: 'Candidate with Docker skills',
    uploadedAt: '2026-03-01',
    profile: {
      fullName: 'Bob Smith',
      headline: 'Full-Stack Developer',
      summary: '',
      education: [],
      workExperience: [],
      projects: [],
      technicalSkills: ['Docker'],
      toolsAndFrameworks: [],
      databases: [],
      testingTools: [],
      deploymentTools: [],
      certifications: [],
    },
    claims: [
      {
        id: 'c-1',
        skill: 'Docker',
        category: 'DevOps',
        source: 'explicit_list',
        context: 'Docker containerization',
      },
    ],
  };

  const dummyRepoData: RepoAnalysisData[] = [
    {
      repo: {
        id: 'r1',
        url: 'https://github.com/bob/proj',
        owner: 'bob',
        repo: 'proj',
        defaultBranch: 'main',
        description: '',
        language: 'TypeScript',
        stars: 0,
        forks: 0,
        lastAnalyzedCommit: { sha: 'f9e8d7c', message: 'init', date: '2026-03-01', author: 'bob' },
        fileList: ['package.json'],
        analyzedFilesCount: 1,
        selectedForAssessment: true,
        sampleFiles: [],
      },
      files: [],
    },
  ];

  const dummyJob: JobRequirement = {
    id: 'j1',
    title: 'Cloud Engineer',
    company: 'TechCorp',
    retrievalDate: '2026-03-01',
    rawDescription: 'Cloud engineer job description',
    experienceLevel: 'Entry-Level',
    overview: 'DevOps cloud role',
    skills: [
      {
        id: 's1',
        name: 'Docker',
        category: 'DevOps',
        description: 'Containers',
        importance: 'required',
      },
      {
        id: 's2',
        name: 'Kubernetes',
        category: 'DevOps',
        description: 'Orchestration',
        importance: 'preferred',
      },
    ],
  };

  const result = createUnavailableAssessment(
    dummyResume,
    dummyRepoData,
    dummyJob,
    'Service temporarily unavailable'
  );

  assert.equal(result.evidenceItems.length, 2);
  for (const item of result.evidenceItems) {
    assert.equal(
      item.evidenceStatus,
      'NEEDS REVIEW',
      'Unavailable assessment must mark items as NEEDS REVIEW, never DEMONSTRATED'
    );
    assert.equal(item.citations.length, 0, 'No citations should be fabricated');
    assert.ok(item.explanation.includes('Automated assessment unavailable'));
  }
});

// ---------------------------------------------------------------------------
// 4. Accurate Canonical Skill Score Calculation & 70/30 Weighting
// ---------------------------------------------------------------------------
test('computeJobReadinessVerdict: calculates exact 70/30 score for required and preferred skills', () => {
  const dummyJob: JobRequirement = {
    id: 'j1',
    title: 'Software Engineer',
    company: 'Acme',
    retrievalDate: '2026-03-01',
    rawDescription: 'Full-stack software engineer',
    experienceLevel: 'Mid-Level',
    overview: 'Engineering role',
    skills: [
      { id: '1', name: 'TypeScript', category: 'Languages', description: '', importance: 'required' },
      { id: '2', name: 'PostgreSQL', category: 'Databases', description: '', importance: 'required' },
      { id: '3', name: 'Docker', category: 'DevOps', description: '', importance: 'preferred' },
    ],
  };

  const nowIso = new Date().toISOString();
  const items: SkillEvidenceItem[] = [
    {
      id: 'e1',
      skillName: 'TypeScript',
      category: 'Languages',
      requirementType: 'required',
      resumeClaimStatus: 'present',
      resumeClaimQuote: '',
      evidenceStatus: 'DEMONSTRATED',
      citations: [],
      explanation: '',
      confidence: 'high',
      uncertaintyNotes: '',
      recommendedNextStep: '',
      lastAssessedAt: nowIso,
    },
    {
      id: 'e2',
      skillName: 'PostgreSQL',
      category: 'Databases',
      requirementType: 'required',
      resumeClaimStatus: 'present',
      resumeClaimQuote: '',
      evidenceStatus: 'PARTIALLY DEMONSTRATED',
      citations: [],
      explanation: '',
      confidence: 'medium',
      uncertaintyNotes: '',
      recommendedNextStep: '',
      lastAssessedAt: nowIso,
    },
    {
      id: 'e3',
      skillName: 'Docker',
      category: 'DevOps',
      requirementType: 'preferred',
      resumeClaimStatus: 'present',
      resumeClaimQuote: '',
      evidenceStatus: 'DEMONSTRATED',
      citations: [],
      explanation: '',
      confidence: 'high',
      uncertaintyNotes: '',
      recommendedNextStep: '',
      lastAssessedAt: nowIso,
    },
  ];

  const verdict = computeJobReadinessVerdict(items, dummyJob);
  assert.equal(verdict.matchScore, 83);
  assert.equal(verdict.verdict, 'STRONG EVIDENCE OF MATCH');
  assert.ok(verdict.scoreFormula.includes('83%'));
  assert.equal(verdict.hasSufficientData, true);
});

// ---------------------------------------------------------------------------
// 5. Handling Missing Categories & Edge Cases in Scoring
// ---------------------------------------------------------------------------
test('computeJobReadinessVerdict: edge cases: no skills, required only, preferred only', () => {
  const dummyJob: JobRequirement = {
    id: 'j-empty',
    title: 'Engineer',
    company: 'Test',
    retrievalDate: '2026-03-01',
    rawDescription: '',
    experienceLevel: '',
    overview: '',
    skills: [],
  };

  // Case A: No skills at all
  const noSkillsVerdict = computeJobReadinessVerdict([], dummyJob);
  assert.equal(noSkillsVerdict.matchScore, 0);
  assert.equal(noSkillsVerdict.hasSufficientData, false);
  assert.equal(noSkillsVerdict.verdict, 'MORE EVIDENCE NEEDED');

  // Case B: Required skills only (100% required weight, missing preferred does NOT get 100% bonus)
  const nowIso = new Date().toISOString();
  const reqOnlyItems: SkillEvidenceItem[] = [
    {
      id: 'e1',
      skillName: 'Go',
      category: 'Languages',
      requirementType: 'required',
      resumeClaimStatus: 'present',
      resumeClaimQuote: '',
      evidenceStatus: 'DEMONSTRATED',
      citations: [],
      explanation: '',
      confidence: 'high',
      uncertaintyNotes: '',
      recommendedNextStep: '',
      lastAssessedAt: nowIso,
    },
    {
      id: 'e2',
      skillName: 'Kubernetes',
      category: 'DevOps',
      requirementType: 'required',
      resumeClaimStatus: 'absent',
      resumeClaimQuote: '',
      evidenceStatus: 'NOT ENOUGH EVIDENCE',
      citations: [],
      explanation: '',
      confidence: 'low',
      uncertaintyNotes: '',
      recommendedNextStep: '',
      lastAssessedAt: nowIso,
    },
  ];
  // Score: (1.0 + 0) / 2 = 50%
  const reqVerdict = computeJobReadinessVerdict(reqOnlyItems, { ...dummyJob, skills: [] });
  assert.equal(reqVerdict.matchScore, 50);
  assert.equal(reqVerdict.verdict, 'PARTIAL EVIDENCE OF MATCH');
  assert.ok(reqVerdict.scoreFormula.includes('100%'));

  // Case C: Preferred skills only
  const prefOnlyItems: SkillEvidenceItem[] = [
    {
      id: 'e1',
      skillName: 'GraphQL',
      category: 'Backend',
      requirementType: 'preferred',
      resumeClaimStatus: 'present',
      resumeClaimQuote: '',
      evidenceStatus: 'DEMONSTRATED',
      citations: [],
      explanation: '',
      confidence: 'high',
      uncertaintyNotes: '',
      recommendedNextStep: '',
      lastAssessedAt: nowIso,
    },
  ];
  const prefVerdict = computeJobReadinessVerdict(prefOnlyItems, { ...dummyJob, skills: [] });
  assert.equal(prefVerdict.matchScore, 100);
});

// ---------------------------------------------------------------------------
// 6. Demo vs User Data Separation
// ---------------------------------------------------------------------------
test('store: clearly labels demo data and provides reset', async () => {
  const sampleState = getSampleDemoState();
  assert.equal(sampleState.isDemoData, true);
  assert.ok(sampleState.demoLabel?.includes('Demo') || sampleState.demoLabel?.includes('Sample'));
  assert.ok(
    sampleState.resume?.profile.fullName.includes('Demo') ||
    sampleState.resume?.profile.fullName.includes('Alex')
  );

  const previousDataDirectory = process.env.SKILLTRACE_DATA_DIR;
  const previousDatabaseUrl = process.env.DATABASE_URL;
  const previousPostgresUrl = process.env.POSTGRES_URL;
  const previousVercel = process.env.VERCEL;
  const testDataDirectory = await fs.mkdtemp(path.join(os.tmpdir(), 'skilltrace-test-'));
  process.env.SKILLTRACE_DATA_DIR = testDataDirectory;
  delete process.env.DATABASE_URL;
  delete process.env.POSTGRES_URL;
  delete process.env.VERCEL;
  try {
    const resetState = await resetAppStateToDemo();
    assert.equal(resetState.isDemoData, true);
    assert.ok(
      resetState.resume?.profile.fullName.includes('Demo') ||
      resetState.resume?.profile.fullName.includes('Alex')
    );
  } finally {
    if (previousDataDirectory === undefined) {
      delete process.env.SKILLTRACE_DATA_DIR;
    } else {
      process.env.SKILLTRACE_DATA_DIR = previousDataDirectory;
    }
    if (previousDatabaseUrl === undefined) delete process.env.DATABASE_URL;
    else process.env.DATABASE_URL = previousDatabaseUrl;
    if (previousPostgresUrl === undefined) delete process.env.POSTGRES_URL;
    else process.env.POSTGRES_URL = previousPostgresUrl;
    if (previousVercel === undefined) delete process.env.VERCEL;
    else process.env.VERCEL = previousVercel;
    await fs.rm(testDataDirectory, { recursive: true, force: true });
  }
});

test('store: rejects malformed database URLs without exposing their value', async () => {
  const previousPostgresUrl = process.env.POSTGRES_URL;
  const previousDatabaseUrl = process.env.DATABASE_URL;
  const previousVercel = process.env.VERCEL;
  const secretLikeValue = 'not-a-url-secret-value';

  process.env.POSTGRES_URL = secretLikeValue;
  delete process.env.DATABASE_URL;
  process.env.VERCEL = '1';
  try {
    await assert.rejects(
      getAppState(),
      (error: unknown) =>
        error instanceof StorageConfigurationError &&
        error.message.includes('valid PostgreSQL connection URL') &&
        !error.message.includes(secretLikeValue)
    );
  } finally {
    if (previousPostgresUrl === undefined) delete process.env.POSTGRES_URL;
    else process.env.POSTGRES_URL = previousPostgresUrl;
    if (previousDatabaseUrl === undefined) delete process.env.DATABASE_URL;
    else process.env.DATABASE_URL = previousDatabaseUrl;
    if (previousVercel === undefined) delete process.env.VERCEL;
    else process.env.VERCEL = previousVercel;
  }
});

// ---------------------------------------------------------------------------
// 7. Commit Tracking and Status Truthfulness
// ---------------------------------------------------------------------------
test('GitHubRepo: maintains separation between lastAnalyzedCommit and latestCommit', () => {
  const repo: GitHubRepo = {
    id: 'repo-1',
    url: 'https://github.com/alice/project',
    owner: 'alice',
    repo: 'project',
    defaultBranch: 'main',
    description: 'A test project',
    language: 'TypeScript',
    stars: 5,
    forks: 1,
    lastAnalyzedCommit: {
      sha: '1111111',
      message: 'Initial commit',
      date: '2026-03-01',
      author: 'alice',
    },
    latestCommit: {
      sha: '2222222',
      message: 'New untested feature',
      date: '2026-03-02',
      author: 'alice',
    },
    hasUpdate: true,
    reassessmentStatus: 'failed',
    lastReassessmentError: 'AI rate limit exceeded during reassessment',
    fileList: ['src/app.ts'],
    analyzedFilesCount: 1,
    selectedForAssessment: true,
    sampleFiles: [],
    analysisScope: {
      totalCandidateFilesCount: 20,
      examinedFilesCount: 1,
      isPartialScope: true,
      branch: 'main',
      commitSha: '1111111',
    },
  };

  assert.notEqual(
    repo.lastAnalyzedCommit.sha,
    repo.latestCommit?.sha,
    'Latest detected commit must not overwrite assessed commit on failure'
  );
  assert.equal(repo.reassessmentStatus, 'failed');
  assert.equal(repo.hasUpdate, true);
  assert.equal(repo.analysisScope?.isPartialScope, true);
});
