import type {
  AppState,
  GitHubRepo,
  JobRequirement,
  JobRequirementSkill,
  ResumeClaim,
  ResumeData,
  ResumeAssessment,
  StandaloneRepoAssessment,
} from './types/index.ts';

async function requestJson<T>(endpoint: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(endpoint, init);
  } catch (error) {
    const detail = error instanceof Error ? error.message : 'Network request failed';
    throw new Error(`Could not reach ${endpoint}: ${detail}`);
  }

  let data: unknown;
  try {
    data = await response.json();
  } catch {
    throw new Error(
      `${endpoint} returned HTTP ${response.status} without a JSON response. Check the deployed Vercel API route and function logs.`
    );
  }

  if (!response.ok) {
    const body = typeof data === 'object' && data !== null ? data as Record<string, unknown> : {};
    const message = typeof body.error === 'string'
      ? body.error
      : `Request to ${endpoint} failed with HTTP ${response.status}`;
    const apiError = new Error(message) as Error & { needsManualPaste?: boolean };
    if (typeof body.needsManualPaste === 'boolean') {
      apiError.needsManualPaste = body.needsManualPaste;
    }
    throw apiError;
  }

  return data as T;
}

export async function fetchAppState(): Promise<AppState> {
  return requestJson<AppState>('/api/state');
}

export async function uploadResumeFile(params: {
  fileName?: string;
  fileBase64?: string;
  rawText?: string;
  fileSize?: number;
  mimeType?: string;
}): Promise<{ success: boolean; resume: ResumeData; assessment?: ResumeAssessment }> {
  return requestJson('/api/resume/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
}

export async function assessStandaloneGitHubRepo(params: {
  account?: string;
  repoName?: string;
  url?: string;
}): Promise<{
  success: boolean;
  assessment: StandaloneRepoAssessment;
  repository: GitHubRepo;
  repositories: GitHubRepo[];
}> {
  return requestJson('/api/github/assess-standalone', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
}

export async function editResumeClaims(params: {
  claims?: ResumeClaim[];
  profile?: any;
}): Promise<{ success: boolean; resume: ResumeData }> {
  return requestJson('/api/resume/edit-claims', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
}

export async function removeResume(): Promise<{ success: boolean }> {
  return requestJson('/api/resume', { method: 'DELETE' });
}

export async function addGitHubRepo(url: string): Promise<{
  success: boolean;
  repository: GitHubRepo;
  repositories: GitHubRepo[];
}> {
  return requestJson('/api/github/add-repo', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });
}

export async function deleteGitHubRepo(
  id: string
): Promise<{ success: boolean; repositories: GitHubRepo[] }> {
  return requestJson(`/api/github/repo/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

export async function toggleRepoAssessment(
  id: string
): Promise<{ success: boolean; repository: GitHubRepo; repositories: GitHubRepo[] }> {
  return requestJson(`/api/github/repo/${encodeURIComponent(id)}/toggle`, { method: 'PATCH' });
}

export async function parseOrSaveJob(params: {
  url?: string;
  description?: string;
  title?: string;
}): Promise<{ success: boolean; job: JobRequirement }> {
  return requestJson('/api/job/parse', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
}

export async function updateJobSkills(params: {
  skills?: JobRequirementSkill[];
  title?: string;
  company?: string;
}): Promise<{ success: boolean; job: JobRequirement }> {
  return requestJson('/api/job/update-skills', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
}

export async function runAssessment(): Promise<any> {
  return requestJson('/api/assess', { method: 'POST' });
}

export async function checkGitHubUpdates(): Promise<any> {
  return requestJson('/api/github/check-updates', { method: 'POST' });
}

export async function togglePlanTask(
  planId: string,
  taskId: string
): Promise<{ success: boolean; actionPlan: any[] }> {
  return requestJson('/api/action-plan/toggle-task', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ planId, taskId }),
  });
}

export async function resetToSample(): Promise<{ success: boolean; state: AppState }> {
  return requestJson('/api/seed-sample', { method: 'POST' });
}

export async function clearAllState(): Promise<{ success: boolean; state: AppState }> {
  return requestJson('/api/clear-state', { method: 'POST' });
}
