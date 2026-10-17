import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { AppState } from '../src/types/index.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../data');
const DATA_FILE = path.join(DATA_DIR, 'app_state.json');

const INITIAL_SAMPLE_STATE: AppState = {
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
};

export function getAppState(): AppState {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(data) as AppState;
      // Ensure Alex Chen or legacy sample resume does not linger
      if (parsed.resume && parsed.resume.profile && parsed.resume.profile.fullName === 'Alex Chen') {
        parsed.resume = null;
        parsed.resumeAssessment = null;
        saveAppState(parsed);
      }
      return parsed;
    }
  } catch (err) {
    console.error('Error reading app state from disk:', err);
  }

  // If file doesn't exist, seed with clean initial state
  saveAppState(INITIAL_SAMPLE_STATE);
  return INITIAL_SAMPLE_STATE;
}

export function saveAppState(state: AppState): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(state, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving app state to disk:', err);
  }
}

export function resetToSampleState(): AppState {
  saveAppState(INITIAL_SAMPLE_STATE);
  return INITIAL_SAMPLE_STATE;
}

export function clearAppState(): AppState {
  const emptyState: AppState = {
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
  };
  saveAppState(emptyState);
  return emptyState;
}
