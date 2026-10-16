import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { AppState, JobRequirement, SkillEvidenceItem } from '../src/types/index.ts';
import { computeJobReadinessVerdict } from './ai.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../data');
const DATA_FILE = path.join(DATA_DIR, 'app_state.json');

export const CLEAN_EMPTY_STATE: AppState = {
  resume: null,
  resumeAssessment: null,
  standaloneRepoAssessment: null,
  repositories: [],
  job: null,
  evidenceItems: [],
  consistencyFindings: [],
  verdict: null,
  actionPlan: [],
  history: [],
  settings: {
    autoCheckFrequencyMinutes: 15,
    autoReassessOnCommit: true,
    includePreferredSkillsInVerdict: true,
    minEvidenceConfidence: 'medium',
  },
  isDemoData: false,
};

export function getSampleDemoState(): AppState {
  const sampleJob: JobRequirement = {
    id: 'job-demo-fullstack',
    title: 'Full-Stack Software Engineer (Demo)',
    company: 'Veloce Digital Systems (Demo Posting)',
    sourceUrl: 'https://example.com/careers/fullstack-demo',
    rawDescription:
      'We are hiring a Full-Stack Engineer skilled in TypeScript, Node.js API development, PostgreSQL, automated testing, and Docker containerization.',
    retrievalDate: new Date().toISOString(),
    experienceLevel: 'Entry to Mid Level (1-3 years)',
    overview:
      'Core technical requirements benchmarked against real open-source GitHub code artifacts.',
    skills: [
      {
        id: 'js-demo-1',
        name: 'TypeScript & JavaScript',
        category: 'Languages',
        description: 'Proficiency in typed web architectures.',
        importance: 'required',
        source: 'extracted',
      },
      {
        id: 'js-demo-2',
        name: 'RESTful API Engineering',
        category: 'Backend',
        description: 'Building HTTP endpoints and middleware.',
        importance: 'required',
        source: 'extracted',
      },
      {
        id: 'js-demo-3',
        name: 'Automated Testing',
        category: 'Quality Assurance',
        description: 'Unit and integration test suites.',
        importance: 'required',
        source: 'extracted',
      },
      {
        id: 'js-demo-4',
        name: 'PostgreSQL & Relational DBs',
        category: 'Databases',
        description: 'Relational schema modeling and transactions.',
        importance: 'required',
        source: 'extracted',
      },
      {
        id: 'js-demo-5',
        name: 'Docker & Containerization',
        category: 'DevOps',
        description: 'Dockerfile and container configuration.',
        importance: 'preferred',
        source: 'extracted',
      },
      {
        id: 'js-demo-6',
        name: 'CI/CD Pipelines',
        category: 'DevOps',
        description: 'Automated GitHub Actions workflows.',
        importance: 'preferred',
        source: 'extracted',
      },
    ],
    extractionStatus: 'ai_extracted',
  };

  const sampleEvidence: SkillEvidenceItem[] = [
    {
      id: 'ev-demo-1',
      skillName: 'TypeScript & JavaScript',
      category: 'Languages',
      requirementType: 'required',
      resumeClaimStatus: 'present',
      resumeClaimQuote: 'Built services in TypeScript and JavaScript.',
      evidenceStatus: 'DEMONSTRATED',
      citations: [
        {
          repoUrl: 'https://github.com/expressjs/express',
          repoName: 'express',
          filePath: 'package.json',
          commitSha: 'a419aa7',
          codeExcerpt: '"devDependencies": { "typescript": "^5.0.0" }',
          reason: 'Active TypeScript types and package dependencies in codebase.',
          isVerifiedInCommit: true,
          authorshipDisclaimer: 'Public open-source repository evidence; authorship is not certified.',
        },
      ],
      explanation: 'Relevant implementation evidence was found in the analyzed repository files.',
      confidence: 'high',
      uncertaintyNotes: 'Scoped to analyzed files in expressjs/express repository.',
      recommendedNextStep: 'Expand strict typing in utility modules.',
      lastAssessedCommit: 'a419aa7',
      lastAssessedAt: new Date().toISOString(),
    },
    {
      id: 'ev-demo-2',
      skillName: 'RESTful API Engineering',
      category: 'Backend',
      requirementType: 'required',
      resumeClaimStatus: 'present',
      resumeClaimQuote: 'Designed REST endpoints and route middleware.',
      evidenceStatus: 'DEMONSTRATED',
      citations: [
        {
          repoUrl: 'https://github.com/expressjs/express',
          repoName: 'express',
          filePath: 'lib/router/index.js',
          commitSha: 'a419aa7',
          codeExcerpt: 'proto.route = function route(path) { ... }',
          reason: 'Core HTTP routing implementation.',
          isVerifiedInCommit: true,
          authorshipDisclaimer: 'Public open-source repository evidence; authorship is not certified.',
        },
      ],
      explanation: 'Verified HTTP controller and routing logic in repository codebase.',
      confidence: 'high',
      uncertaintyNotes: 'Sample demonstration evidence.',
      recommendedNextStep: 'Add OpenAPI/Swagger schema documentation.',
      lastAssessedCommit: 'a419aa7',
      lastAssessedAt: new Date().toISOString(),
    },
    {
      id: 'ev-demo-3',
      skillName: 'Automated Testing',
      category: 'Quality Assurance',
      requirementType: 'required',
      resumeClaimStatus: 'present',
      resumeClaimQuote: 'Authored automated unit and integration tests.',
      evidenceStatus: 'PARTIALLY DEMONSTRATED',
      citations: [
        {
          repoUrl: 'https://github.com/expressjs/express',
          repoName: 'express',
          filePath: 'test/Route.js',
          commitSha: 'a419aa7',
          codeExcerpt: 'describe("Route", function () { ... })',
          reason: 'Route unit test suite present in test directory.',
          isVerifiedInCommit: true,
          authorshipDisclaimer: 'Public open-source repository evidence; authorship is not certified.',
        },
      ],
      explanation:
        'Unit tests are present, but end-to-end coverage and CI integration test results were not verified.',
      confidence: 'medium',
      uncertaintyNotes: 'Partial evidence; coverage metrics not fully published.',
      recommendedNextStep: 'Add integration tests for failure cases and error status handling.',
      lastAssessedCommit: 'a419aa7',
      lastAssessedAt: new Date().toISOString(),
    },
    {
      id: 'ev-demo-4',
      skillName: 'PostgreSQL & Relational DBs',
      category: 'Databases',
      requirementType: 'required',
      resumeClaimStatus: 'present',
      resumeClaimQuote: 'Worked with PostgreSQL databases.',
      evidenceStatus: 'NOT ENOUGH EVIDENCE',
      citations: [],
      explanation:
        "Your resume mentions this skill, but we couldn't find enough supporting evidence in the examined project files.",
      confidence: 'low',
      uncertaintyNotes: 'No database migration or SQL model files found in examined files.',
      recommendedNextStep: 'Connect a repository containing Prisma schemas or SQL migration files.',
      lastAssessedCommit: 'a419aa7',
      lastAssessedAt: new Date().toISOString(),
    },
    {
      id: 'ev-demo-5',
      skillName: 'Docker & Containerization',
      category: 'DevOps',
      requirementType: 'preferred',
      resumeClaimStatus: 'absent',
      resumeClaimQuote: 'Not explicitly listed in resume',
      evidenceStatus: 'NOT ENOUGH EVIDENCE',
      citations: [],
      explanation:
        'No Dockerfile or container compose definitions were found in the inspected files.',
      confidence: 'low',
      uncertaintyNotes: 'Docker configuration not present in root directory.',
      recommendedNextStep: 'Add a multi-stage Dockerfile to demonstrate containerization.',
      lastAssessedCommit: 'a419aa7',
      lastAssessedAt: new Date().toISOString(),
    },
    {
      id: 'ev-demo-6',
      skillName: 'CI/CD Pipelines',
      category: 'DevOps',
      requirementType: 'preferred',
      resumeClaimStatus: 'present',
      resumeClaimQuote: 'Configured automated CI workflows.',
      evidenceStatus: 'DEMONSTRATED',
      citations: [
        {
          repoUrl: 'https://github.com/expressjs/express',
          repoName: 'express',
          filePath: '.github/workflows/ci.yml',
          commitSha: 'a419aa7',
          codeExcerpt: 'name: ci\non: [push, pull_request]',
          reason: 'GitHub Actions continuous integration workflow configured.',
          isVerifiedInCommit: true,
          authorshipDisclaimer: 'Public open-source repository evidence; authorship is not certified.',
        },
      ],
      explanation: 'Verified automated CI workflow manifest in .github/workflows directory.',
      confidence: 'high',
      uncertaintyNotes: 'Workflow file verified.',
      recommendedNextStep: 'Add automated coverage reporting to the CI pipeline.',
      lastAssessedCommit: 'a419aa7',
      lastAssessedAt: new Date().toISOString(),
    },
  ];

  // Canonical calculation produces exact truthful percentage without rounding fabrications
  const sampleVerdict = computeJobReadinessVerdict(sampleEvidence, sampleJob);

  return {
    resume: {
      fileName: 'Sample_Candidate_Profile.pdf',
      fileSize: 45000,
      uploadedAt: new Date().toISOString(),
      rawText: 'Sample Demo Candidate. Full-Stack Engineer with Node.js and TypeScript background.',
      profile: {
        fullName: 'Demo Candidate Profile',
        headline: 'Full-Stack Software Engineer (Sample Demonstration)',
        summary:
          'This is sample demonstration data illustrating how SkillTrace.ai verifies real GitHub code against resume claims. Upload your own resume to see personalized results.',
        education: [
          {
            institution: 'Sample University',
            degree: 'B.S. in Computer Science',
            year: '2024',
          },
        ],
        workExperience: [
          {
            role: 'Software Engineering Intern',
            company: 'Tech Demo Corp',
            period: 'Summer 2023',
            highlights: [
              'Developed RESTful endpoints with TypeScript and Express',
              'Collaborated on database query optimizations and testing',
            ],
          },
        ],
        projects: [
          {
            name: 'Web Service Architecture',
            description: 'Modular Node.js and Express server with automated testing.',
            technologies: ['TypeScript', 'Express', 'Jest', 'PostgreSQL'],
          },
        ],
        technicalSkills: ['TypeScript', 'JavaScript', 'Node.js', 'PostgreSQL', 'Jest'],
        toolsAndFrameworks: ['Express', 'Prisma', 'Git'],
        databases: ['PostgreSQL'],
        testingTools: ['Jest', 'Supertest'],
        deploymentTools: ['GitHub Actions', 'Docker'],
        certifications: [],
      },
      claims: [
        {
          id: 'c-demo-1',
          skill: 'TypeScript & JavaScript',
          category: 'Languages',
          source: 'explicit_list',
          context: 'Proficient in TypeScript and JavaScript',
        },
        {
          id: 'c-demo-2',
          skill: 'RESTful API Engineering',
          category: 'Backend',
          source: 'project_description',
          context: 'Designed REST endpoints and route middleware',
        },
        {
          id: 'c-demo-3',
          skill: 'Automated Testing',
          category: 'Quality Assurance',
          source: 'project_description',
          context: 'Authored automated unit and integration tests',
        },
        {
          id: 'c-demo-4',
          skill: 'PostgreSQL & Relational DBs',
          category: 'Databases',
          source: 'explicit_list',
          context: 'Worked with PostgreSQL databases',
        },
        {
          id: 'c-demo-5',
          skill: 'CI/CD Pipelines',
          category: 'DevOps',
          source: 'work_experience',
          context: 'Configured automated CI workflows',
        },
      ],
    },
    resumeAssessment: {
      overallScore: 78,
      rating: 'Solid Profile',
      summary:
        'Sample profile evaluated across 5 technical claims. Shows foundational backend and language evidence, with database and testing areas requiring additional project backing.',
      totalClaimsCount: 5,
      weakTopics: [
        {
          topic: 'PostgreSQL & Relational DBs',
          reason: 'Claimed in resume, but missing schema models or migrations in projects.',
          severity: 'High',
        },
        {
          topic: 'Docker & Containerization',
          reason: 'No Dockerfile or container configuration found in project files.',
          severity: 'Medium',
        },
      ],
      topStrengths: [
        'Core language proficiency in TypeScript and JavaScript',
        'Demonstrated RESTful API routing architecture in Express',
      ],
      recommendedProjectEvidence: [
        'Add PostgreSQL schema definitions or Prisma migrations to a connected repository.',
        'Add containerization manifests (Dockerfile) to complete deployment proof.',
      ],
      claimBreakdown: {
        explicitList: 2,
        projectDescriptions: 2,
        workExperience: 1,
      },
    },
    standaloneRepoAssessment: null,
    repositories: [
      {
        id: 'repo-expressjs-express',
        url: 'https://github.com/expressjs/express',
        owner: 'expressjs',
        repo: 'express',
        defaultBranch: 'master',
        description: 'Fast, unopinionated, minimalist web framework for node.',
        language: 'JavaScript',
        stars: 65000,
        forks: 15000,
        selectedForAssessment: true,
        lastAnalyzedCommit: {
          sha: 'a419aa7',
          message: 'Update dependencies and tests',
          date: new Date().toISOString(),
          author: 'express-maintainer',
        },
        latestCommit: {
          sha: 'a419aa7',
          message: 'Update dependencies and tests',
          date: new Date().toISOString(),
          author: 'express-maintainer',
        },
        hasUpdate: false,
        reassessmentStatus: 'idle',
        analyzedFilesCount: 214,
        fileList: [
          'package.json',
          'lib/application.js',
          'lib/express.js',
          'lib/request.js',
          'lib/response.js',
          'lib/router/index.js',
          'test/Route.js',
          'test/app.js',
          '.github/workflows/ci.yml',
          'Readme.md',
        ],
        sampleFiles: [
          { path: 'test/Route.js', size: 1024, category: 'test' },
          { path: 'package.json', size: 1024, category: 'config' },
          { path: '.github/workflows/ci.yml', size: 1024, category: 'config' },
          { path: 'lib/router/index.js', size: 1024, category: 'code' },
        ],
        analysisScope: {
          examinedFilesCount: 4,
          totalCandidateFilesCount: 10,
          isPartialScope: true,
          branch: 'master',
          commitSha: 'a419aa7',
        },
      },
    ],
    job: sampleJob,
    evidenceItems: sampleEvidence,
    consistencyFindings: [
      {
        id: 'cons-demo-1',
        skill: 'PostgreSQL & Relational DBs',
        findingType: 'not_supported',
        headline: 'Claimed Skill Lacks Repository Implementation',
        explanation:
          'Resume lists PostgreSQL proficiency, but the connected repository contains no relational schemas, SQL scripts, or ORM configurations.',
        resumeCitation: 'Worked with PostgreSQL databases',
      },
      {
        id: 'cons-demo-2',
        skill: 'RESTful API Engineering',
        findingType: 'supported',
        headline: 'Resume Claim Strongly Supported by Code',
        explanation:
          'Project source files demonstrate extensive HTTP route handling and middleware dispatching.',
        resumeCitation: 'Designed REST endpoints and route middleware',
        codeCitation: 'lib/router/index.js at commit a419aa7',
      },
    ],
    verdict: sampleVerdict,
    actionPlan: [
      {
        id: 'act-demo-1',
        skill: 'PostgreSQL & Relational DBs',
        priority: 'high',
        targetJobRelevance: 'Required skill for target backend role.',
        currentEvidenceStatus: 'Missing code proof in connected repositories.',
        practicalExercise:
          'Create a relational schema migration with Prisma or PostgreSQL DDL and commit it.',
        expectedEvidenceToProduce: 'Committed schema.prisma or migration SQL file.',
        checklist: [
          { id: 'ch-d-1', task: 'Define relational entities with foreign keys', completed: false },
          { id: 'ch-d-2', task: 'Add a database migration script', completed: false },
        ],
      },
    ],
    history: [],
    settings: {
      autoCheckFrequencyMinutes: 15,
      autoReassessOnCommit: true,
      includePreferredSkillsInVerdict: true,
      minEvidenceConfidence: 'medium',
    },
    isDemoData: true,
    demoLabel: 'Sample Demonstration Mode (Demo Profile)',
  };
}

export function getAppState(): AppState {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(data) as AppState;
      return parsed;
    }
  } catch (err) {
    console.error('Error reading app state from disk:', err);
  }

  // If no file exists, initialize with clean empty state
  saveAppState(CLEAN_EMPTY_STATE);
  return CLEAN_EMPTY_STATE;
}

export function saveAppState(state: AppState): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    // Safe atomic persistence: write to temp file then rename
    const tmpFile = `${DATA_FILE}.tmp.${Date.now()}`;
    fs.writeFileSync(tmpFile, JSON.stringify(state, null, 2), 'utf-8');
    fs.renameSync(tmpFile, DATA_FILE);
  } catch (err) {
    console.error('Error saving app state to disk:', err);
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(state, null, 2), 'utf-8');
    } catch (fallbackErr) {
      console.error('Fallback save also failed:', fallbackErr);
    }
  }
}

export function resetToSampleState(): AppState {
  const sampleState = getSampleDemoState();
  saveAppState(sampleState);
  return sampleState;
}

export const resetAppStateToDemo = resetToSampleState;

export function clearAppState(): AppState {
  const empty = { ...CLEAN_EMPTY_STATE };
  saveAppState(empty);
  return empty;
}
