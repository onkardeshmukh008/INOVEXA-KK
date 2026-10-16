export type EvidenceStatus =
  | 'DEMONSTRATED'
  | 'PARTIALLY DEMONSTRATED'
  | 'NOT ENOUGH EVIDENCE'
  | 'NEEDS REVIEW';

export type ClaimStatus = 'present' | 'absent' | 'unclear';

export interface ResumeClaim {
  id: string;
  skill: string;
  category: string;
  source: 'explicit_list' | 'project_description' | 'work_experience';
  context: string;
}

export interface ExtractedProfile {
  fullName: string;
  headline?: string;
  summary?: string;
  education: Array<{
    institution: string;
    degree: string;
    year?: string;
  }>;
  workExperience: Array<{
    role: string;
    company: string;
    period?: string;
    highlights: string[];
  }>;
  projects: Array<{
    name: string;
    description: string;
    technologies: string[];
  }>;
  technicalSkills: string[];
  toolsAndFrameworks: string[];
  databases: string[];
  testingTools: string[];
  deploymentTools: string[];
  certifications: string[];
}

export interface ResumeData {
  fileName: string;
  fileSize?: number;
  uploadedAt: string;
  rawText: string;
  profile: ExtractedProfile;
  claims: ResumeClaim[];
}

export interface CommitInfo {
  sha: string;
  message: string;
  date: string;
  author: string;
}

export interface GitHubRepo {
  id: string;
  url: string;
  owner: string;
  repo: string;
  defaultBranch: string;
  description: string;
  language: string;
  stars: number;
  forks: number;
  lastAnalyzedCommit: CommitInfo;
  latestCommit?: CommitInfo;
  hasUpdate?: boolean;
  selectedForAssessment: boolean;
  analyzedFilesCount: number;
  fileList: string[];
  sampleFiles: Array<{
    path: string;
    size: number;
    category: 'code' | 'test' | 'config' | 'database' | 'docs' | 'other';
  }>;
}

export interface JobRequirementSkill {
  id: string;
  name: string;
  category: string;
  description: string;
  importance: 'required' | 'preferred';
}

export interface JobRequirement {
  id: string;
  title: string;
  company: string;
  sourceUrl?: string;
  rawDescription: string;
  retrievalDate: string;
  experienceLevel: string;
  overview: string;
  skills: JobRequirementSkill[];
}

export interface Citation {
  repoUrl: string;
  repoName: string;
  filePath: string;
  commitSha: string;
  lineRef?: string;
  codeExcerpt: string;
  reason: string;
}

export interface SkillEvidenceItem {
  id: string;
  skillName: string;
  category: string;
  requirementType: 'required' | 'preferred';
  resumeClaimStatus: ClaimStatus;
  resumeClaimQuote: string;
  evidenceStatus: EvidenceStatus;
  citations: Citation[];
  explanation: string;
  confidence: 'high' | 'medium' | 'low';
  uncertaintyNotes: string;
  recommendedNextStep: string;
  lastAssessedCommit?: string;
  lastAssessedAt: string;
}

export interface ConsistencyFinding {
  id: string;
  skill: string;
  findingType:
    | 'supported'
    | 'partially_supported'
    | 'not_supported'
    | 'unclaimed_evidence_found'
    | 'ambiguous'
    | 'insufficient_data';
  headline: string;
  explanation: string;
  resumeCitation?: string;
  codeCitation?: string;
  experimentalAiAssistanceIndicator?: {
    note: string;
    nonDeterminative: boolean;
  };
}

export interface JobReadinessVerdict {
  verdict: 'STRONG EVIDENCE OF MATCH' | 'PARTIAL EVIDENCE OF MATCH' | 'MORE EVIDENCE NEEDED';
  matchScore: number; // 0 - 100
  matchSummary: string;
  requiredSkillsMet: number;
  totalRequiredSkills: number;
  preferredSkillsMet: number;
  totalPreferredSkills: number;
  demonstratedSkills: string[];
  gapSkills: string[];
  claimsNeedingClarification: string[];
  keyNextSteps: string[];
  limitations: string[];
  scoreFormula: string;
  assessedAt: string;
}

export interface ActionPlanChecklistItem {
  id: string;
  task: string;
  completed: boolean;
}

export interface ActionPlanItem {
  id: string;
  skill: string;
  priority: 'high' | 'medium' | 'low';
  targetJobRelevance: string;
  currentEvidenceStatus: string;
  practicalExercise: string;
  expectedEvidenceToProduce: string;
  checklist: ActionPlanChecklistItem[];
}

export interface ReassessedSkillChange {
  skillName: string;
  previousStatus: EvidenceStatus;
  newStatus: EvidenceStatus;
  explanation: string;
}

export interface ChangeHistoryEntry {
  id: string;
  timestamp: string;
  repoName: string;
  previousCommitSha: string;
  newCommitSha: string;
  commitMessage: string;
  changedFiles: string[];
  reassessedSkills: ReassessedSkillChange[];
  unchangedSkills: string[];
  overallChangeSummary: string;
}

export interface ResumeAssessment {
  overallScore: number;
  rating: 'Strong & Detailed' | 'Solid Profile' | 'Needs Project Evidence';
  summary: string;
  totalClaimsCount: number;
  weakTopics: Array<{
    topic: string;
    reason: string;
    severity: 'High' | 'Medium' | 'Low';
  }>;
  topStrengths: string[];
  recommendedProjectEvidence: string[];
  claimBreakdown: {
    explicitList: number;
    projectDescriptions: number;
    workExperience: number;
  };
}

export interface StandaloneRepoAssessment {
  repoName: string;
  owner: string;
  url: string;
  architectureScore: number;
  qualityRating: 'Production-Grade' | 'Solid Architecture' | 'Prototype / Early Stage' | 'Needs Refactoring';
  summary: string;
  detectedTechnologies: string[];
  demonstratedStrengths: Array<{
    title: string;
    description: string;
    evidenceFile: string;
  }>;
  weakTopicsAndGaps: Array<{
    topic: string;
    impact: 'High' | 'Medium' | 'Low';
    description: string;
    recommendedFix: string;
  }>;
  actionItems: string[];
  assessedCommitSha: string;
  assessedAt: string;
}

export interface AppSettings {
  autoCheckFrequencyMinutes: number;
  autoReassessOnCommit: boolean;
  includePreferredSkillsInVerdict: boolean;
  minEvidenceConfidence: 'low' | 'medium' | 'high';
}

export interface AppState {
  resume: ResumeData | null;
  resumeAssessment?: ResumeAssessment | null;
  repositories: GitHubRepo[];
  standaloneRepoAssessment?: StandaloneRepoAssessment | null;
  job: JobRequirement | null;
  evidenceItems: SkillEvidenceItem[];
  consistencyFindings: ConsistencyFinding[];
  verdict: JobReadinessVerdict | null;
  actionPlan: ActionPlanItem[];
  history: ChangeHistoryEntry[];
  settings: AppSettings;
  isAssessing?: boolean;
}

