import type { AppState } from '../types/index.ts';
import type { AuthUser } from '../pages/LoginPage.tsx';

export interface EmailDigestSettings {
  subscribed: boolean;
  email: string;
  frequency: 'weekly' | 'biweekly' | 'monthly';
  includeWeakTopics: boolean;
  includeSkillGrowth: boolean;
  lastDigestSentAt?: string;
}

export interface DigestEmailContent {
  subject: string;
  recipient: string;
  sentAt: string;
  readinessScore: number;
  verdict: string;
  userName: string;
  weeklyProgressSummary: string;
  topStrengths: string[];
  actionItems: string[];
  unverifiedClaimsCount: number;
}

const STORAGE_KEY = 'skilltrace_email_digest_settings';

export function getEmailDigestSettings(authUser?: AuthUser | null): EmailDigestSettings {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch {}

  return {
    subscribed: true,
    email: authUser?.email || 'developer@example.com',
    frequency: 'weekly',
    includeWeakTopics: true,
    includeSkillGrowth: true,
    lastDigestSentAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  };
}

export function saveEmailDigestSettings(settings: EmailDigestSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save email digest settings:', err);
  }
}

export function generateMockDigestEmail(
  state: AppState,
  settings: EmailDigestSettings,
  authUser?: AuthUser | null
): DigestEmailContent {
  const userName = authUser?.name || state.resume?.profile?.fullName || 'Software Engineer';
  const readinessScore = state.verdict?.matchScore || 82;
  const verdictText = state.verdict?.verdict || 'STRONG EVIDENCE OF MATCH';
  const unverifiedCount = state.evidenceItems.filter((e) => e.evidenceStatus === 'NOT ENOUGH EVIDENCE').length;

  const topStrengths = state.verdict?.demonstratedSkills?.slice(0, 3) || [
    'TypeScript API Routing',
    'Relational Database Modeling',
    'Static AST Evidence Verification',
  ];

  const actionItems = state.actionPlan?.slice(0, 3).map((a) => a.practicalExercise) || [
    'Add automated unit test suite with Jest or Vitest to your repository.',
    'Include Zod request body validation in your API routes.',
  ];

  return {
    subject: `[SkillTrace.Ai Digest] ${userName}'s Weekly Career Readiness — ${readinessScore}% Match Index`,
    recipient: settings.email || 'developer@example.com',
    sentAt: new Date().toLocaleString(),
    readinessScore,
    verdict: verdictText,
    userName,
    weeklyProgressSummary: `This week, SkillTrace verified code commits across ${state.repositories.length} connected GitHub project(s). You have ${unverifiedCount} skill claims awaiting repository proof.`,
    topStrengths,
    actionItems,
    unverifiedClaimsCount: unverifiedCount,
  };
}
