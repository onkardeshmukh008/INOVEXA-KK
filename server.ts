import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response } from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as pdfParseModule from 'pdf-parse';
const pdfParse: any = (pdfParseModule as any).default || pdfParseModule;
import { createServer as createViteServer } from 'vite';

import {
  extractJobRequirementsWithAI,
  parseResumeWithAI,
  parseResumeImageWithAI,
  generateResumeAssessment,
  assessStandaloneRepoWithAI,
  reassessCommitDiffWithAI,
  runComprehensiveAssessment,
  computeJobReadinessVerdict,
} from './server/ai.ts';
import {
  compareRepoCommits,
  fetchFileContents,
  fetchGitHubRepoDetails,
  parseGitHubUrl,
  type RepoAnalysisData,
} from './server/github.ts';
import {
  clearAppState,
  getAppState,
  resetToSampleState,
  saveAppState,
} from './server/store.ts';
import type {
  AppState,
  ChangeHistoryEntry,
  JobRequirementSkill,
  ResumeClaim,
} from './src/types/index.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '35mb' }));
  app.use(express.urlencoded({ extended: true, limit: '35mb' }));

  // 1. GET FULL APP STATE
  app.get('/api/state', (_req: Request, res: Response) => {
    try {
      const state = getAppState();
      // Ensure resumeAssessment is always present if a resume exists
      if (state.resume && !state.resumeAssessment) {
        state.resumeAssessment = generateResumeAssessment(state.resume);
        saveAppState(state);
      }
      res.json(state);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to get state' });
    }
  });

  // 2. RESUME UPLOAD & PARSING (ACCEPTS ALL FILE TYPES: PDF, DOC, DOCX, TXT, MD, RTF, JSON, PNG, JPG, WEBP, ETC.)
  app.post('/api/resume/upload', async (req: Request, res: Response) => {
    try {
      const { fileName, fileBase64, rawText, fileSize, mimeType } = req.body;
      let textContent = rawText || '';
      const lowerName = (fileName || '').toLowerCase();

      // Check if file is an image (PNG, JPG, JPEG, WEBP, etc.)
      const isImage =
        (mimeType && mimeType.startsWith('image/')) ||
        lowerName.endsWith('.png') ||
        lowerName.endsWith('.jpg') ||
        lowerName.endsWith('.jpeg') ||
        lowerName.endsWith('.webp') ||
        lowerName.endsWith('.bmp');

      let extractedProfileData: any = null;
      let extractedClaimsData: any = null;

      if (fileBase64 && isImage) {
        // Use Gemini Vision OCR and structured parser
        const imageMime = mimeType || (lowerName.endsWith('.png') ? 'image/png' : 'image/jpeg');
        const imgResult = await parseResumeImageWithAI(fileBase64, imageMime);
        extractedProfileData = imgResult.profile;
        extractedClaimsData = imgResult.claims;
        textContent = imgResult.extractedText || 'Extracted from resume image';
      } else if (fileBase64 && (!textContent || textContent.trim().length === 0)) {
        const buffer = Buffer.from(fileBase64, 'base64');
        if (lowerName.endsWith('.pdf')) {
          try {
            const parsedPdf = await pdfParse(buffer);
            textContent = parsedPdf.text || '';
          } catch (pdfErr) {
            console.warn('PDF stream extraction error, using string fallback:', pdfErr);
            // Fallback: extract printable strings
            textContent = buffer.toString('utf-8').replace(/[^\x20-\x7E\t\r\n]/g, ' ');
          }
        } else {
          // Works for all files: TXT, MD, DOCX, DOC, JSON, CSV, RTF, HTML, etc.
          textContent = buffer.toString('utf-8');
          // If binary strings exist (like old .doc), clean printable characters
          if (/[\x00-\x08\x0B\x0C\x0E-\x1F]/.test(textContent)) {
            textContent = textContent.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, ' ').replace(/\s+/g, ' ');
          }
        }
      }

      if (!textContent || textContent.trim().length < 10) {
        textContent = `Resume file uploaded: ${fileName || 'Document'}. Candidate technical background.`;
      }

      // If not already parsed by image vision, parse text
      if (!extractedProfileData || !extractedClaimsData) {
        const parsed = await parseResumeWithAI(textContent);
        extractedProfileData = parsed.profile;
        extractedClaimsData = parsed.claims;
      }

      const state = getAppState();
      state.resume = {
        fileName: fileName || 'Uploaded_Resume_Document',
        fileSize: fileSize || Buffer.byteLength(textContent, 'utf-8'),
        uploadedAt: new Date().toISOString(),
        rawText: textContent,
        profile: extractedProfileData,
        claims: extractedClaimsData,
      };

      // Clear demo flag on genuine user upload
      state.isDemoData = false;
      state.demoLabel = undefined;
      // Generate Resume Assessment & Skill Verification Report in same section
      state.resumeAssessment = generateResumeAssessment(state.resume);

      saveAppState(state);
      res.json({
        success: true,
        resume: state.resume,
        assessment: state.resumeAssessment,
      });
    } catch (err: any) {
      console.error('Resume upload error:', err);
      res.status(500).json({ error: err.message || 'Failed to process resume document' });
    }
  });

  // 3. EDIT RESUME CLAIMS / SKILLS
  app.post('/api/resume/edit-claims', (req: Request, res: Response) => {
    try {
      const { claims, profile } = req.body;
      const state = getAppState();
      if (!state.resume) {
        return res.status(400).json({ error: 'No resume found to edit' });
      }
      if (Array.isArray(claims)) {
        state.resume.claims = claims as ResumeClaim[];
      }
      if (profile) {
        state.resume.profile = { ...state.resume.profile, ...profile };
      }
      // Re-generate resume assessment
      state.resumeAssessment = generateResumeAssessment(state.resume);
      saveAppState(state);
      res.json({ success: true, resume: state.resume, assessment: state.resumeAssessment });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to edit claims' });
    }
  });

  // 4. REMOVE RESUME
  app.delete('/api/resume', (_req: Request, res: Response) => {
    try {
      const state = getAppState();
      state.resume = null;
      state.resumeAssessment = null;
      saveAppState(state);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to remove resume' });
    }
  });

  // 5. ADD GITHUB REPO
  app.post('/api/github/add-repo', async (req: Request, res: Response) => {
    try {
      const { url, account, repoName } = req.body;
      let owner = (account || '').trim();
      let repo = (repoName || '').trim();

      if (url && typeof url === 'string' && (!owner || !repo)) {
        const parsed = parseGitHubUrl(url);
        if (parsed) {
          owner = parsed.owner;
          repo = parsed.repo;
        } else if (url.includes('/') && !url.includes('http')) {
          const parts = url.split('/').map((s) => s.trim()).filter(Boolean);
          if (parts.length >= 2) {
            owner = parts[0];
            repo = parts[1];
          }
        }
      }

      if (owner.includes('/') && !repo) {
        const parts = owner.split('/').map((s: string) => s.trim()).filter(Boolean);
        if (parts.length >= 2) {
          owner = parts[0];
          repo = parts[1];
        }
      }

      if (!owner || !repo) {
        return res.status(400).json({
          error: 'Please provide a valid GitHub repository URL (e.g. https://github.com/expressjs/express) or account and repository name.',
        });
      }

      const repoDetails = await fetchGitHubRepoDetails(owner, repo);
      const state = getAppState();

      // Check if already added
      const existingIdx = state.repositories.findIndex((r) => r.id === repoDetails.id);
      if (existingIdx >= 0) {
        state.repositories[existingIdx] = repoDetails;
      } else {
        state.repositories.push(repoDetails);
      }

      state.isDemoData = false;
      state.demoLabel = undefined;
      saveAppState(state);
      res.json({ success: true, repository: repoDetails, repositories: state.repositories });
    } catch (err: any) {
      console.error('Error adding GitHub repo:', err);
      res.status(400).json({ error: err.message || 'Failed to inspect GitHub repository' });
    }
  });

  // 5b. STANDALONE GITHUB REPO ASSESSMENT (INDEPENDENT OF RESUME OR JOB!)
  app.post('/api/github/assess-standalone', async (req: Request, res: Response) => {
    try {
      const { account, repoName, url } = req.body;
      let owner = (account || '').trim();
      let repo = (repoName || '').trim();

      if (url) {
        const parsed = parseGitHubUrl(url);
        if (parsed) {
          owner = parsed.owner;
          repo = parsed.repo;
        } else if (url.includes('/') && !url.includes('http')) {
          const parts = url.split('/').map((s: string) => s.trim()).filter(Boolean);
          if (parts.length >= 2) {
            owner = parts[0];
            repo = parts[1];
          }
        }
      }

      // If user pasted something like "facebook/react" or full URL in account or repo field
      if (owner.includes('/') && !repo) {
        const parsed = parseGitHubUrl(owner);
        if (parsed) {
          owner = parsed.owner;
          repo = parsed.repo;
        } else {
          const parts = owner.split('/').map((s: string) => s.trim()).filter(Boolean);
          if (parts.length >= 2) {
            owner = parts[0];
            repo = parts[1];
          }
        }
      } else if (repo.includes('/') && !owner) {
        const parsed = parseGitHubUrl(repo);
        if (parsed) {
          owner = parsed.owner;
          repo = parsed.repo;
        }
      }

      if (!owner || !repo) {
        return res.status(400).json({
          error: 'Please enter a GitHub repository URL or both account name and repository name (e.g. "expressjs" and "express").',
        });
      }

      // 1. Fetch repo details
      const repoDetails = await fetchGitHubRepoDetails(owner, repo);

      // 2. Fetch key sample code files
      const priorityPaths = repoDetails.sampleFiles.map((sf) => sf.path);
      const filesWithContent = await fetchFileContents(
        repoDetails.owner,
        repoDetails.repo,
        repoDetails.defaultBranch,
        priorityPaths
      );

      const repoData: RepoAnalysisData = {
        repo: repoDetails,
        files: filesWithContent,
      };

      // 3. Run standalone assessment with AI
      const assessment = await assessStandaloneRepoWithAI(repoData);

      // 4. Update state (independent of resume!)
      const state = getAppState();
      state.standaloneRepoAssessment = assessment;

      const existingIdx = state.repositories.findIndex((r) => r.id === repoDetails.id);
      if (existingIdx >= 0) {
        state.repositories[existingIdx] = repoDetails;
      } else {
        state.repositories.push(repoDetails);
      }

      saveAppState(state);

      res.json({
        success: true,
        assessment,
        repository: repoDetails,
        repositories: state.repositories,
      });
    } catch (err: any) {
      console.error('Error in standalone repo assessment:', err);
      res.status(400).json({ error: err.message || 'Failed to assess GitHub repository' });
    }
  });

  // 6. DELETE GITHUB REPO
  app.delete('/api/github/repo/:id', (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const state = getAppState();
      state.repositories = state.repositories.filter((r) => r.id !== id);
      saveAppState(state);
      res.json({ success: true, repositories: state.repositories });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to remove repository' });
    }
  });

  // 7. TOGGLE REPO INCLUSION FOR ASSESSMENT
  app.patch('/api/github/repo/:id/toggle', (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const state = getAppState();
      const repo = state.repositories.find((r) => r.id === id);
      if (!repo) return res.status(404).json({ error: 'Repository not found' });

      repo.selectedForAssessment = !repo.selectedForAssessment;
      saveAppState(state);
      res.json({ success: true, repository: repo, repositories: state.repositories });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to toggle repository' });
    }
  });

  // 8. PARSE OR SAVE JOB
  app.post('/api/job/parse', async (req: Request, res: Response) => {
    try {
      const { url, description, title } = req.body;
      let rawDescription = description || '';

      if (url && (!rawDescription || rawDescription.trim().length === 0)) {
        try {
          const fetchRes = await fetch(url, {
            headers: {
              'User-Agent':
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
              Accept: 'text/html,application/xhtml+xml,text/plain',
            },
            signal: AbortSignal.timeout(8000),
          });

          if (fetchRes.ok) {
            const html = await fetchRes.text();
            // Basic HTML to text conversion stripping script/style tags
            rawDescription = html
              .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
              .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
              .replace(/<[^>]+>/g, ' ')
              .replace(/\s+/g, ' ')
              .trim();
          } else {
            return res.status(422).json({
              error: `Unable to automatically retrieve job posting from ${url} (HTTP ${fetchRes.status}). Please paste the job description text directly.`,
              needsManualPaste: true,
            });
          }
        } catch (fetchErr: any) {
          return res.status(422).json({
            error: `Unable to access job URL directly due to site restrictions. Please paste the job description below.`,
            needsManualPaste: true,
          });
        }
      }

      if (!rawDescription || rawDescription.trim().length < 20) {
        return res.status(400).json({
          error: 'Please provide the text of the job description or enter a reachable URL.',
        });
      }

      const job = await extractJobRequirementsWithAI(title || '', rawDescription, url);
      const state = getAppState();
      state.job = job;
      state.isDemoData = false;
      state.demoLabel = undefined;
      saveAppState(state);

      res.json({
        success: true,
        job,
        extractionStatus: job.extractionStatus,
        warning:
          job.extractionStatus === 'extraction_failed'
            ? job.extractionError || 'AI extraction failed. Please manually enter or confirm skills.'
            : undefined,
      });
    } catch (err: any) {
      console.error('Job parse error:', err);
      res.status(500).json({ error: err.message || 'Failed to extract job requirements' });
    }
  });

  // 9. UPDATE JOB SKILLS (USER EDIT/CORRECT)
  app.post('/api/job/update-skills', (req: Request, res: Response) => {
    try {
      const { skills, title, company } = req.body;
      const state = getAppState();
      if (!state.job) {
        return res.status(400).json({ error: 'No job selected to update' });
      }

      if (Array.isArray(skills)) {
        state.job.skills = skills as JobRequirementSkill[];
      }
      if (title) state.job.title = title;
      if (company) state.job.company = company;

      saveAppState(state);
      res.json({ success: true, job: state.job });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to update job requirements' });
    }
  });

  // 10. RUN COMPREHENSIVE ASSESSMENT (CORE INTELLIGENCE)
  app.post('/api/assess', async (_req: Request, res: Response) => {
    try {
      const state = getAppState();
      if (!state.resume) {
        return res.status(400).json({ error: 'Please upload a resume first to run the assessment.' });
      }
      if (!state.job) {
        return res.status(400).json({ error: 'Please select or add a target job first.' });
      }

      const selectedRepos = state.repositories.filter((r) => r.selectedForAssessment);
      if (selectedRepos.length === 0) {
        return res.status(400).json({
          error: 'Please add at least one GitHub repository and ensure it is selected for assessment.',
        });
      }

      // Fetch relevant source code files for each selected repo
      const reposData: RepoAnalysisData[] = [];
      for (const repo of selectedRepos) {
        const priorityPaths = repo.sampleFiles.map((sf) => sf.path);
        const filesWithContent = await fetchFileContents(
          repo.owner,
          repo.repo,
          repo.defaultBranch,
          priorityPaths
        );
        reposData.push({
          repo,
          files: filesWithContent,
        });
      }

      const { evidenceItems, consistencyFindings, verdict, actionPlan } =
        await runComprehensiveAssessment(state.resume, reposData, state.job);

      state.evidenceItems = evidenceItems;
      state.consistencyFindings = consistencyFindings;
      state.verdict = verdict;
      state.actionPlan = actionPlan;
      state.isDemoData = false;
      state.demoLabel = undefined;

      saveAppState(state);
      res.json({
        success: true,
        evidenceItems,
        consistencyFindings,
        verdict,
        actionPlan,
      });
    } catch (err: any) {
      console.error('Assessment execution error:', err);
      res.status(500).json({ error: err.message || 'Failed to run skill assessment' });
    }
  });

  // 11. CHECK FOR GITHUB UPDATES & AUTOMATIC REASSESSMENT
  app.post('/api/github/check-updates', async (_req: Request, res: Response) => {
    try {
      const state = getAppState();
      if (state.repositories.length === 0) {
        return res.json({ updated: false, message: 'No repositories connected to check.' });
      }

      let anyUpdatesFound = false;
      let reassessmentSucceededCount = 0;
      let reassessmentFailedCount = 0;
      const historyEntries: ChangeHistoryEntry[] = [];

      for (const repo of state.repositories) {
        // Last successfully assessed commit SHA
        const lastAssessedSha = repo.lastAnalyzedCommit?.sha || 'unknown';
        const comparison = await compareRepoCommits(repo.owner, repo.repo, lastAssessedSha);

        if (!comparison || !comparison.hasNewerCommit) {
          // No newer commits detected
          if (repo.reassessmentStatus !== 'failed') {
            repo.hasUpdate = false;
            repo.reassessmentStatus = 'idle';
          }
          continue;
        }

        anyUpdatesFound = true;
        // Record latest detected commit SHA separately from last assessed commit
        repo.latestCommit = {
          sha: comparison.headCommitSha,
          message: comparison.headCommitMessage,
          date: comparison.headCommitDate,
          author: comparison.headCommitAuthor,
        };
        repo.hasUpdate = true;

        // Prevent duplicate history entries when endpoint runs repeatedly
        const alreadyInHistory = state.history.some(
          (h) => h.repoName === repo.repo && h.newCommitSha === comparison.headCommitSha
        );

        if (state.job && state.evidenceItems.length > 0) {
          try {
            repo.reassessmentStatus = 'pending';
            const reassessment = await reassessCommitDiffWithAI(
              state.job,
              state.evidenceItems,
              comparison,
              repo.repo
            );

            // Reassessment succeeded: advance lastAnalyzedCommit only now!
            repo.lastAnalyzedCommit = repo.latestCommit;
            repo.hasUpdate = false;
            repo.reassessmentStatus = 'success';
            repo.lastReassessmentError = undefined;

            if (reassessment.reassessedSkills.length > 0) {
              state.evidenceItems = reassessment.updatedEvidence;
              state.verdict = computeJobReadinessVerdict(state.evidenceItems, state.job);
            }

            if (!alreadyInHistory) {
              const historyEntry: ChangeHistoryEntry = {
                id: `hist-${Date.now()}-${repo.id}-${comparison.headCommitSha}`,
                timestamp: new Date().toISOString(),
                repoName: repo.repo,
                previousCommitSha: comparison.baseCommitSha,
                newCommitSha: comparison.headCommitSha,
                commitMessage: comparison.headCommitMessage,
                changedFiles: comparison.changedFiles,
                reassessedSkills: reassessment.reassessedSkills,
                unchangedSkills: reassessment.unchangedSkills,
                overallChangeSummary: reassessment.overallSummary,
              };
              historyEntries.push(historyEntry);
              state.history.unshift(historyEntry);
            }
            reassessmentSucceededCount++;
          } catch (reassessErr: any) {
            console.error(
              `Reassessment failed for ${repo.owner}/${repo.repo} commit ${comparison.headCommitSha}:`,
              reassessErr.message
            );
            // Reassessment failed: RETAIN pending update so user can retry!
            // Do NOT mark commit as successfully assessed.
            repo.hasUpdate = true;
            repo.reassessmentStatus = 'failed';
            repo.lastReassessmentError =
              reassessErr.message || 'Automated reassessment failed. Please retry.';
            reassessmentFailedCount++;
          }
        } else {
          // No job / evidence items configured yet; mark as detected needing assessment
          repo.reassessmentStatus = 'manual_review_needed';
          if (!alreadyInHistory) {
            const historyEntry: ChangeHistoryEntry = {
              id: `hist-${Date.now()}-${repo.id}-${comparison.headCommitSha}`,
              timestamp: new Date().toISOString(),
              repoName: repo.repo,
              previousCommitSha: comparison.baseCommitSha,
              newCommitSha: comparison.headCommitSha,
              commitMessage: comparison.headCommitMessage,
              changedFiles: comparison.changedFiles,
              reassessedSkills: [],
              unchangedSkills: [],
              overallChangeSummary: `New commit ${comparison.headCommitSha} detected. Select a target job to assess skill evidence.`,
            };
            historyEntries.push(historyEntry);
            state.history.unshift(historyEntry);
          }
        }
      }

      saveAppState(state);

      let message = 'All connected repositories are up to date with the latest analyzed commits.';
      if (reassessmentFailedCount > 0) {
        message = `New commits detected, but reassessment could not complete for ${reassessmentFailedCount} repository. The update remains pending for retry.`;
      } else if (reassessmentSucceededCount > 0) {
        message = `Detected new commits across your projects! Reassessment completed successfully.`;
      } else if (anyUpdatesFound) {
        message = `New commits detected on GitHub. Run a skill assessment to evaluate them against your target job.`;
      }

      res.json({
        success: true,
        updated: anyUpdatesFound,
        reassessmentSuccess: reassessmentSucceededCount > 0,
        failedCount: reassessmentFailedCount,
        historyEntries,
        state,
        message,
      });
    } catch (err: any) {
      console.error('Check updates error:', err);
      res.status(500).json({ error: err.message || 'Failed to check GitHub updates' });
    }
  });

  // 12. TOGGLE ACTION PLAN CHECKLIST ITEM
  app.post('/api/action-plan/toggle-task', (req: Request, res: Response) => {
    try {
      const { planId, taskId } = req.body;
      const state = getAppState();
      const plan = state.actionPlan.find((p) => p.id === planId);
      if (!plan) return res.status(404).json({ error: 'Plan item not found' });

      const item = plan.checklist.find((c) => c.id === taskId);
      if (!item) return res.status(404).json({ error: 'Checklist task not found' });

      item.completed = !item.completed;
      saveAppState(state);
      res.json({ success: true, actionPlan: state.actionPlan });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to toggle task' });
    }
  });

  // 13. RESET / SEED SAMPLE DATA
  app.post('/api/seed-sample', (_req: Request, res: Response) => {
    try {
      const state = resetToSampleState();
      res.json({ success: true, state });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to seed sample state' });
    }
  });

  app.post('/api/clear-state', (_req: Request, res: Response) => {
    try {
      const state = clearAppState();
      res.json({ success: true, state });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to clear state' });
    }
  });

  // VITE DEV SERVER OR STATIC PROD
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist/index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SkillTrace.ai server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server start error:', err);
  process.exit(1);
});
