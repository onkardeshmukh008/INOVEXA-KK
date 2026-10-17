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

/**
 * Universal safe API fetch wrapper with user-friendly error formatting
 * for network errors, rate limits, authentication issues, and server status codes.
 */
async function fetchJson<T = any>(
  url: string,
  options?: RequestInit,
  fallbackErrorMessage = 'API request failed'
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, options);
  } catch (netErr: any) {
    console.error(`Network error requesting ${url}:`, netErr);
    if (!navigator.onLine) {
      throw new Error('You appear to be offline. Please check your internet connection and try again.');
    }
    throw new Error('Unable to connect to SkillTrace server. Please verify your connection or refresh the page.');
  }

  let data: any = {};
  try {
    const text = await response.text();
    if (text) {
      data = JSON.parse(text);
    }
  } catch (parseErr) {
    console.warn(`Non-JSON response from ${url}:`, parseErr);
  }

  if (!response.ok) {
    const status = response.status;
    const serverMessage = data.error || data.message;

    if (status === 429) {
      const err: any = new Error(
        serverMessage || 'GitHub or AI rate limit exceeded. Please wait a moment before trying again.'
      );
      err.status = status;
      throw err;
    }

    if (status === 403) {
      const err: any = new Error(
        serverMessage || 'Access forbidden or rate limit reached. If accessing a repository, ensure it is public.'
      );
      err.status = status;
      throw err;
    }

    if (status === 401) {
      const err: any = new Error(
        serverMessage || 'Authentication session expired. Please sign in again.'
      );
      err.status = status;
      throw err;
    }

    if (status === 404) {
      const err: any = new Error(
        serverMessage || 'The requested resource or repository could not be found.'
      );
      err.status = status;
      throw err;
    }

    if (status >= 500) {
      const err: any = new Error(
        serverMessage || 'Server error encountered. Our services are recovering, please retry.'
      );
      err.status = status;
      throw err;
    }

    const err: any = new Error(serverMessage || fallbackErrorMessage);
    err.status = status;
    err.needsManualPaste = data.needsManualPaste;
    throw err;
  }

  return data as T;
}

export async function fetchAppState(): Promise<AppState> {
  return fetchJson<AppState>('/api/state', undefined, 'Failed to load application state.');
}

export async function uploadResumeFile(params: {
  fileName?: string;
  fileBase64?: string;
  rawText?: string;
  fileSize?: number;
  mimeType?: string;
}): Promise<{ success: boolean; resume: ResumeData; assessment?: ResumeAssessment }> {
  return fetchJson('/api/resume/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  }, 'Failed to parse resume document.');
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
  return fetchJson('/api/github/assess-standalone', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  }, 'Failed to inspect and assess GitHub repository.');
}

export async function editResumeClaims(params: {
  claims?: ResumeClaim[];
  profile?: any;
}): Promise<{ success: boolean; resume: ResumeData }> {
  return fetchJson('/api/resume/edit-claims', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  }, 'Failed to update resume claims.');
}

export async function removeResume(): Promise<{ success: boolean }> {
  return fetchJson('/api/resume', { method: 'DELETE' }, 'Failed to remove resume.');
}

export async function addGitHubRepo(url: string): Promise<{
  success: boolean;
  repository: GitHubRepo;
  repositories: GitHubRepo[];
}> {
  return fetchJson('/api/github/add-repo', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  }, 'Failed to add GitHub repository.');
}

export async function deleteGitHubRepo(
  id: string
): Promise<{ success: boolean; repositories: GitHubRepo[] }> {
  return fetchJson(`/api/github/repo/${id}`, { method: 'DELETE' }, 'Failed to delete repository.');
}

export async function toggleRepoAssessment(
  id: string
): Promise<{ success: boolean; repository: GitHubRepo; repositories: GitHubRepo[] }> {
  return fetchJson(`/api/github/repo/${id}/toggle`, { method: 'PATCH' }, 'Failed to toggle repository selection.');
}

export async function parseOrSaveJob(params: {
  url?: string;
  description?: string;
  title?: string;
}): Promise<{ success: boolean; job: JobRequirement }> {
  return fetchJson('/api/job/parse', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  }, 'Failed to parse job description.');
}

export async function updateJobSkills(params: {
  skills?: JobRequirementSkill[];
  title?: string;
  company?: string;
}): Promise<{ success: boolean; job: JobRequirement }> {
  return fetchJson('/api/job/update-skills', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  }, 'Failed to update job requirements.');
}

export async function runAssessment(): Promise<any> {
  return fetchJson('/api/assess', { method: 'POST' }, 'Failed to run full skill assessment.');
}

export async function checkGitHubUpdates(): Promise<any> {
  return fetchJson('/api/github/check-updates', { method: 'POST' }, 'Failed to check GitHub commit updates.');
}

export async function togglePlanTask(
  planId: string,
  taskId: string
): Promise<{ success: boolean; actionPlan: any[] }> {
  return fetchJson('/api/action-plan/toggle-task', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ planId, taskId }),
  }, 'Failed to update action plan item.');
}

export async function resetToSample(): Promise<{ success: boolean; state: AppState }> {
  return fetchJson('/api/seed-sample', { method: 'POST' }, 'Failed to reset sample state.');
}

export async function clearAllState(): Promise<{ success: boolean; state: AppState }> {
  return fetchJson('/api/clear-state', { method: 'POST' }, 'Failed to clear application state.');
}
