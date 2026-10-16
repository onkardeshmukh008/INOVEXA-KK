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

export async function fetchAppState(): Promise<AppState> {
  const res = await fetch('/api/state');
  if (!res.ok) {
    throw new Error('Failed to load application state');
  }
  return res.json();
}

export async function uploadResumeFile(params: {
  fileName?: string;
  fileBase64?: string;
  rawText?: string;
  fileSize?: number;
  mimeType?: string;
}): Promise<{ success: boolean; resume: ResumeData; assessment?: ResumeAssessment }> {
  const res = await fetch('/api/resume/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to parse resume');
  }
  return data;
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
  const res = await fetch('/api/github/assess-standalone', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to assess repository');
  return data;
}

export async function editResumeClaims(params: {
  claims?: ResumeClaim[];
  profile?: any;
}): Promise<{ success: boolean; resume: ResumeData }> {
  const res = await fetch('/api/resume/edit-claims', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update resume claims');
  return data;
}

export async function removeResume(): Promise<{ success: boolean }> {
  const res = await fetch('/api/resume', { method: 'DELETE' });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to remove resume');
  return data;
}

export async function addGitHubRepo(url: string): Promise<{
  success: boolean;
  repository: GitHubRepo;
  repositories: GitHubRepo[];
}> {
  const res = await fetch('/api/github/add-repo', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to add repository');
  return data;
}

export async function deleteGitHubRepo(
  id: string
): Promise<{ success: boolean; repositories: GitHubRepo[] }> {
  const res = await fetch(`/api/github/repo/${id}`, { method: 'DELETE' });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to delete repository');
  return data;
}

export async function toggleRepoAssessment(
  id: string
): Promise<{ success: boolean; repository: GitHubRepo; repositories: GitHubRepo[] }> {
  const res = await fetch(`/api/github/repo/${id}/toggle`, { method: 'PATCH' });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to toggle repository selection');
  return data;
}

export async function parseOrSaveJob(params: {
  url?: string;
  description?: string;
  title?: string;
}): Promise<{ success: boolean; job: JobRequirement }> {
  const res = await fetch('/api/job/parse', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  const data = await res.json();
  if (!res.ok) {
    const error: any = new Error(data.error || 'Failed to parse job');
    error.needsManualPaste = data.needsManualPaste;
    throw error;
  }
  return data;
}

export async function updateJobSkills(params: {
  skills?: JobRequirementSkill[];
  title?: string;
  company?: string;
}): Promise<{ success: boolean; job: JobRequirement }> {
  const res = await fetch('/api/job/update-skills', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update job skills');
  return data;
}

export async function runAssessment(): Promise<any> {
  const res = await fetch('/api/assess', { method: 'POST' });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to run assessment');
  return data;
}

export async function checkGitHubUpdates(): Promise<any> {
  const res = await fetch('/api/github/check-updates', { method: 'POST' });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to check GitHub updates');
  return data;
}

export async function togglePlanTask(
  planId: string,
  taskId: string
): Promise<{ success: boolean; actionPlan: any[] }> {
  const res = await fetch('/api/action-plan/toggle-task', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ planId, taskId }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to toggle action item');
  return data;
}

export async function resetToSample(): Promise<{ success: boolean; state: AppState }> {
  const res = await fetch('/api/seed-sample', { method: 'POST' });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to reset sample state');
  return data;
}

export async function clearAllState(): Promise<{ success: boolean; state: AppState }> {
  const res = await fetch('/api/clear-state', { method: 'POST' });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to clear state');
  return data;
}
