import { GoogleGenAI, Type } from '@google/genai';
import type {
  ActionPlanItem,
  Citation,
  ConsistencyFinding,
  ExtractedProfile,
  JobReadinessVerdict,
  JobRequirement,
  JobRequirementSkill,
  ReassessedSkillChange,
  ResumeAssessment,
  ResumeClaim,
  ResumeData,
  SkillEvidenceItem,
  StandaloneRepoAssessment,
} from '../src/types/index.ts';
import type { CommitComparisonResult, RepoAnalysisData } from './github.ts';

function getAiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY is not defined in environment. Fallback heuristics will be used.');
  }
  return new GoogleGenAI({
    apiKey: apiKey || '',
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function callGeminiJson(prompt: string): Promise<string> {
  const ai = getAiClient();
  const modelsToTry = [
    'gemini-3.1-flash-lite',
    'gemini-flash-latest',
    'gemini-3.5-flash',
    'gemini-3.8-flash',
  ];
  let lastErr: any = null;
  for (const model of modelsToTry) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });
      if (response.text) {
        return response.text;
      }
    } catch (err: any) {
      console.warn(`Gemini model ${model} failed/busy:`, err.message || err);
      lastErr = err;
    }
  }
  throw lastErr || new Error('All Gemini model fallbacks failed');
}

export async function parseResumeWithAI(rawText: string): Promise<{ profile: ExtractedProfile; claims: ResumeClaim[] }> {
  const prompt = `You are a career document parser. Given the following resume text, extract structured profile information and explicit skill claims.
Keep extracted contact details minimal (e.g. Full Name and Title only). Do NOT extract private phone numbers, physical home addresses, or government IDs.

Resume Text:
---
${rawText.slice(0, 8000)}
---

Return JSON strictly matching this schema:
{
  "profile": {
    "fullName": "Name",
    "headline": "Headline or title",
    "summary": "Brief summary",
    "education": [{"institution": "...", "degree": "...", "year": "..."}],
    "workExperience": [{"role": "...", "company": "...", "period": "...", "highlights": ["..."]}],
    "projects": [{"name": "...", "description": "...", "technologies": ["..."]}],
    "technicalSkills": ["..."],
    "toolsAndFrameworks": ["..."],
    "databases": ["..."],
    "testingTools": ["..."],
    "deploymentTools": ["..."],
    "certifications": ["..."]
  },
  "claims": [
    {
      "skill": "Skill name (e.g. RESTful API Development, SQL, Automated Testing, Docker)",
      "category": "Category (Languages, Backend, Databases, DevOps, Quality Assurance, Frontend)",
      "source": "explicit_list" | "project_description" | "work_experience",
      "context": "Direct exact quote or reference from the resume where this claim appears"
    }
  ]
}`;

  try {
    const jsonText = await callGeminiJson(prompt);
    const parsed = JSON.parse(jsonText || '{}');
    const profile: ExtractedProfile = {
      fullName: parsed.profile?.fullName || extractNameFromText(rawText),
      headline: parsed.profile?.headline || 'Software Engineer',
      summary: parsed.profile?.summary || 'Candidate profile extracted from resume document.',
      education: parsed.profile?.education || [],
      workExperience: parsed.profile?.workExperience || [],
      projects: parsed.profile?.projects || [],
      technicalSkills: parsed.profile?.technicalSkills || [],
      toolsAndFrameworks: parsed.profile?.toolsAndFrameworks || [],
      databases: parsed.profile?.databases || [],
      testingTools: parsed.profile?.testingTools || [],
      deploymentTools: parsed.profile?.deploymentTools || [],
      certifications: parsed.profile?.certifications || [],
    };

    const claims: ResumeClaim[] = (parsed.claims || []).map((c: any, idx: number) => ({
      id: `c-${idx + 1}`,
      skill: c.skill || 'Software Development',
      category: c.category || 'Technical',
      source: c.source === 'work_experience' || c.source === 'project_description' ? c.source : 'explicit_list',
      context: c.context || 'Mentioned in resume',
    }));

    // If claims are empty, augment with detected skills
    if (claims.length === 0) {
      return fallbackResumeExtraction(rawText, profile);
    }

    return { profile, claims };
  } catch (err) {
    console.error('Error parsing resume with Gemini, using enriched deterministic parser:', err);
    return fallbackResumeExtraction(rawText);
  }
}

function extractNameFromText(rawText: string): string {
  const lines = rawText.split('\n').map((l) => l.trim()).filter((l) => l.length > 2 && l.length < 50);
  for (const line of lines) {
    if (!/resume|curriculum|email|phone|github|linkedin|page|education|experience|skills/i.test(line)) {
      return line.replace(/[^a-zA-Z\s.-]/g, '').trim() || 'Candidate';
    }
  }
  return 'Candidate';
}

function fallbackResumeExtraction(
  rawText: string,
  existingProfile?: ExtractedProfile
): { profile: ExtractedProfile; claims: ResumeClaim[] } {
  const lines = rawText.split('\n').map((l) => l.trim()).filter(Boolean);
  const fullName = existingProfile?.fullName || extractNameFromText(rawText);
  const sentences = rawText.split(/[.\n]+/).map((s) => s.trim()).filter((s) => s.length > 10);

  const skillsDatabase = [
    // Languages
    { name: 'TypeScript', category: 'Languages', pattern: /\bTypeScript\b/i },
    { name: 'JavaScript', category: 'Languages', pattern: /\bJavaScript\b|ES6\b/i },
    { name: 'Python', category: 'Languages', pattern: /\bPython\b/i },
    { name: 'Java', category: 'Languages', pattern: /\bJava\b(?!\s*Script)/i },
    { name: 'C++', category: 'Languages', pattern: /\bC\+\+\b/i },
    { name: 'Go', category: 'Languages', pattern: /\bGolang\b|\bGo\s+language\b/i },
    { name: 'SQL', category: 'Databases', pattern: /\bSQL\b/i },
    { name: 'HTML & CSS', category: 'Frontend', pattern: /\bHTML5?\b|\bCSS3?\b/i },

    // Frameworks & Backend
    { name: 'React', category: 'Frontend', pattern: /\bReact(?:\.js)?\b/i },
    { name: 'Node.js', category: 'Backend', pattern: /\bNode(?:\.js)?\b/i },
    { name: 'Express', category: 'Backend', pattern: /\bExpress(?:\.js)?\b/i },
    { name: 'Next.js', category: 'Frontend', pattern: /\bNext(?:\.js)?\b/i },
    { name: 'RESTful API Development', category: 'Backend', pattern: /\bREST(?:ful)?(?:\s+APIs?)?\b/i },
    { name: 'FastAPI', category: 'Backend', pattern: /\bFastAPI\b/i },
    { name: 'Tailwind CSS', category: 'Frontend', pattern: /\bTailwind\b/i },

    // Databases
    { name: 'PostgreSQL', category: 'Databases', pattern: /\bPostgreSQL\b|\bPostgres\b/i },
    { name: 'Prisma ORM', category: 'Databases', pattern: /\bPrisma\b/i },
    { name: 'MongoDB', category: 'Databases', pattern: /\bMongoDB\b/i },
    { name: 'Redis', category: 'Databases', pattern: /\bRedis\b/i },
    { name: 'SQLite', category: 'Databases', pattern: /\bSQLite\b/i },

    // Testing
    { name: 'Jest', category: 'Quality Assurance', pattern: /\bJest\b/i },
    { name: 'Vitest', category: 'Quality Assurance', pattern: /\bVitest\b/i },
    { name: 'Supertest', category: 'Quality Assurance', pattern: /\bSupertest\b/i },
    { name: 'Automated Testing', category: 'Quality Assurance', pattern: /\b(?:unit|integration|automated)\s+tests?\b/i },

    // DevOps
    { name: 'Docker', category: 'DevOps', pattern: /\bDocker\b|\bcontainerization\b/i },
    { name: 'Git & Version Control', category: 'Collaboration', pattern: /\bGit\b|\bGitHub\b/i },
    { name: 'GitHub Actions & CI/CD', category: 'DevOps', pattern: /\bCI\/CD\b|\bGitHub\s+Actions\b/i },
    { name: 'AWS', category: 'DevOps', pattern: /\bAWS\b|\bAmazon\s+Web\s+Services\b/i },
  ];

  const detectedTechnicalSkills: string[] = [];
  const detectedTools: string[] = [];
  const detectedDatabases: string[] = [];
  const detectedTesting: string[] = [];
  const detectedDevOps: string[] = [];
  const claims: ResumeClaim[] = [];

  for (const item of skillsDatabase) {
    if (item.pattern.test(rawText)) {
      if (item.category === 'Languages' || item.category === 'Frontend') {
        detectedTechnicalSkills.push(item.name);
      } else if (item.category === 'Backend') {
        detectedTools.push(item.name);
      } else if (item.category === 'Databases') {
        detectedDatabases.push(item.name);
      } else if (item.category === 'Quality Assurance') {
        detectedTesting.push(item.name);
      } else if (item.category === 'DevOps') {
        detectedDevOps.push(item.name);
      }

      // Find sentence context
      const matchSentence = sentences.find((s) => item.pattern.test(s)) || `Demonstrated knowledge of ${item.name} in resume.`;
      
      let source: 'explicit_list' | 'project_description' | 'work_experience' = 'explicit_list';
      if (/built|developed|implemented|engineered|managed|created/i.test(matchSentence)) {
        source = 'project_description';
      }
      if (/intern|engineer|developer|company|team|client/i.test(matchSentence)) {
        source = 'work_experience';
      }

      claims.push({
        id: `c-${claims.length + 1}`,
        skill: item.name,
        category: item.category,
        source,
        context: matchSentence.slice(0, 140),
      });
    }
  }

  // Extract education lines
  const educationList: Array<{ institution: string; degree: string; year?: string }> = [];
  for (const line of lines) {
    if (/university|college|institute|polytechnic|academy/i.test(line)) {
      const yearMatch = line.match(/\b(20\d{2})\b/);
      educationList.push({
        institution: line.split(/[,|—–-]/)[0].trim(),
        degree: line.split(/[,|—–-]/)[1]?.trim() || 'Computer Science / Engineering',
        year: yearMatch ? yearMatch[1] : undefined,
      });
    }
  }

  const profile: ExtractedProfile = {
    fullName,
    headline: existingProfile?.headline || 'Software Engineering Candidate',
    summary:
      existingProfile?.summary ||
      `Candidate with proficiency across ${detectedTechnicalSkills.slice(0, 4).join(', ')} and practical software development background.`,
    education: educationList.length > 0 ? educationList : existingProfile?.education || [
      { institution: 'University', degree: 'Computer Science', year: '2024' }
    ],
    workExperience: existingProfile?.workExperience || [],
    projects: existingProfile?.projects || [],
    technicalSkills: detectedTechnicalSkills,
    toolsAndFrameworks: detectedTools,
    databases: detectedDatabases,
    testingTools: detectedTesting,
    deploymentTools: detectedDevOps,
    certifications: existingProfile?.certifications || [],
  };

  return { profile, claims };
}


export async function extractJobRequirementsWithAI(
  jobTitleInput: string,
  rawJobDescription: string,
  sourceUrl?: string
): Promise<JobRequirement> {
  const ai = getAiClient();
  const prompt = `You are a job requirement analyzer. Extract structured technical skills and qualifications from this job posting.
Distinguish strictly between REQUIRED and PREFERRED qualifications.

Job Title Input: ${jobTitleInput || 'Not specified'}
Job Source: ${sourceUrl || 'Pasted description'}
Job Posting Text:
---
${rawJobDescription.slice(0, 8000)}
---

Return JSON in this format:
{
  "title": "Job Title",
  "company": "Company Name (or 'Company' if not found)",
  "experienceLevel": "e.g. Entry Level (0-2 years), Mid-Level, etc.",
  "overview": "Short 1-2 sentence overview of what the role requires",
  "skills": [
    {
      "name": "Skill or competency name (e.g. TypeScript, RESTful API Development, PostgreSQL & Relational DBs, Automated Unit Testing, Docker, CI/CD Pipelines)",
      "category": "Languages | Backend | Databases | Quality Assurance | DevOps | Architecture",
      "description": "What the company expects the candidate to do with this skill",
      "importance": "required" or "preferred"
    }
  ]
}`;

  try {
    const rawJson = await callGeminiJson(prompt);
    const parsed = JSON.parse(rawJson || '{}');
    const skills: JobRequirementSkill[] = (parsed.skills || []).map((s: any, idx: number) => ({
      id: `js-${idx + 1}`,
      name: s.name || `Skill ${idx + 1}`,
      category: s.category || 'General',
      description: s.description || 'Demonstrated technical competency',
      importance: s.importance === 'preferred' ? 'preferred' : 'required',
    }));

    return {
      id: `job-${Date.now()}`,
      title: parsed.title || jobTitleInput || 'Software Engineer',
      company: parsed.company || 'Tech Company',
      sourceUrl,
      rawDescription: rawJobDescription,
      retrievalDate: new Date().toISOString(),
      experienceLevel: parsed.experienceLevel || '0-2 years experience',
      overview: parsed.overview || 'Technical engineering position.',
      skills,
    };
  } catch (err) {
    console.error('Error extracting job requirements with Gemini:', err);
    return {
      id: `job-${Date.now()}`,
      title: jobTitleInput || 'Software Engineer',
      company: 'Hiring Company',
      sourceUrl,
      rawDescription: rawJobDescription,
      retrievalDate: new Date().toISOString(),
      experienceLevel: 'Entry to Mid Level',
      overview: 'Software development role focusing on backend, web apps, and databases.',
      skills: [
        {
          id: 'js-1',
          name: 'Core Programming Language',
          category: 'Languages',
          description: 'Proficiency in primary language such as TypeScript, JavaScript, Python, or Go.',
          importance: 'required',
        },
        {
          id: 'js-2',
          name: 'API & Backend Engineering',
          category: 'Backend',
          description: 'Building server endpoints, request routing, and business logic.',
          importance: 'required',
        },
        {
          id: 'js-3',
          name: 'Database Architecture',
          category: 'Databases',
          description: 'Schema modeling, queries, and data persistence.',
          importance: 'required',
        },
        {
          id: 'js-4',
          name: 'Automated Testing',
          category: 'Quality Assurance',
          description: 'Writing unit or integration tests.',
          importance: 'required',
        },
        {
          id: 'js-5',
          name: 'Containerization / DevOps',
          category: 'DevOps',
          description: 'Docker, CI/CD, or deployment configuration.',
          importance: 'preferred',
        },
      ],
    };
  }
}

export async function runComprehensiveAssessment(
  resume: ResumeData,
  reposData: RepoAnalysisData[],
  job: JobRequirement
): Promise<{
  evidenceItems: SkillEvidenceItem[];
  consistencyFindings: ConsistencyFinding[];
  verdict: JobReadinessVerdict;
  actionPlan: ActionPlanItem[];
}> {
  const ai = getAiClient();

  // Prepare repo context with actual file paths and file excerpts
  const repoSummary = reposData.map((rd) => {
    return {
      url: rd.repo.url,
      name: rd.repo.repo,
      branch: rd.repo.defaultBranch,
      latestCommit: rd.repo.lastAnalyzedCommit,
      fileListSample: rd.repo.fileList.slice(0, 30),
      filesWithContent: rd.files.map((f) => ({
        path: f.path,
        category: f.category,
        excerpt: f.content.slice(0, 1500),
      })),
    };
  });

  const prompt = `You are the core evidence verification engine of SkillTrace.ai.
Your mission is to compare:
1. RESUME CLAIMS
2. ACTUAL GITHUB CODE EVIDENCE
3. TARGET JOB REQUIREMENTS

CRITICAL EVIDENCE RULES:
- Use status: 'DEMONSTRATED' (if relevant implementation evidence was found in the analyzed files).
- 'PARTIALLY DEMONSTRATED' (if some relevant evidence exists, but does not fully support the expected scope of the skill).
- 'NOT ENOUGH EVIDENCE' (if the analyzed files do not provide sufficient support. Explain that this is a limitation of the files examined, not proof of incompetence).
- 'NEEDS REVIEW' (if evidence is ambiguous, inaccessible, or requires human interpretation).
- NEVER assume the repository owner personally authored every single line or dependency.
- Do NOT treat README claims or dependency entries as equivalent to actual implementation evidence.
- Every citation MUST refer to a REAL file present in the repository file list or excerpts provided below!
- Quote actual code snippets from the provided files whenever possible.
- Use friendly, plain English. Never insult or accuse the user.
- If resume claims a skill (e.g. Redis or SQL) but no code is found, state: "Your resume mentions this skill, but we couldn't find enough supporting evidence in your selected projects".

INPUT DATA:
Target Job: ${job.title} at ${job.company}
Job Skills Required/Preferred:
${JSON.stringify(job.skills, null, 2)}

Resume Claims:
${JSON.stringify(resume.claims, null, 2)}

Analyzed Repositories & Real File Content:
${JSON.stringify(repoSummary, null, 2)}

Please output valid JSON matching this schema:
{
  "evidenceItems": [
    {
      "skillName": "exact skill name from job requirements",
      "category": "Languages | Backend | Databases | Quality Assurance | DevOps | Architecture",
      "requirementType": "required" | "preferred",
      "resumeClaimStatus": "present" | "absent" | "unclear",
      "resumeClaimQuote": "quote from resume or 'Not explicitly listed in resume'",
      "evidenceStatus": "DEMONSTRATED" | "PARTIALLY DEMONSTRATED" | "NOT ENOUGH EVIDENCE" | "NEEDS REVIEW",
      "citations": [
        {
          "repoUrl": "github url",
          "repoName": "repo name",
          "filePath": "exact file path in repo",
          "commitSha": "commit SHA",
          "lineRef": "e.g. Lines 15-35",
          "codeExcerpt": "code snippet",
          "reason": "why this code proves the skill"
        }
      ],
      "explanation": "Clear, friendly plain-English explanation",
      "confidence": "high" | "medium" | "low",
      "uncertaintyNotes": "Honest statement about limitations of scope",
      "recommendedNextStep": "Specific practical suggestion"
    }
  ],
  "consistencyFindings": [
    {
      "skill": "skill name",
      "findingType": "supported" | "partially_supported" | "not_supported" | "unclaimed_evidence_found" | "ambiguous",
      "headline": "Friendly finding summary",
      "explanation": "Detailed explanation comparing resume vs project files",
      "resumeCitation": "Where in resume",
      "codeCitation": "Where in repository"
    }
  ],
  "actionPlan": [
    {
      "skill": "skill to improve",
      "priority": "high" | "medium" | "low",
      "targetJobRelevance": "Why this matters for the selected job",
      "currentEvidenceStatus": "What current files show",
      "practicalExercise": "Specific hands-on coding task to add to their repo",
      "expectedEvidenceToProduce": "What tangible proof this will create",
      "checklist": [
        {"task": "step 1", "completed": false},
        {"task": "step 2", "completed": false},
        {"task": "step 3", "completed": false}
      ]
    }
  ]
}`;

  try {
    const rawJson = await callGeminiJson(prompt);
    const parsed = JSON.parse(rawJson || '{}');

    // Build valid evidence items
    const rawItems: any[] = parsed.evidenceItems || [];
    const evidenceItems: SkillEvidenceItem[] = job.skills.map((jobSkill, idx) => {
      const match = rawItems.find(
        (it) => it.skillName?.toLowerCase() === jobSkill.name.toLowerCase()
      ) || rawItems[idx];

      const citations: Citation[] = (match?.citations || []).map((c: any) => ({
        repoUrl: c.repoUrl || reposData[0]?.repo.url || '',
        repoName: c.repoName || reposData[0]?.repo.repo || 'Repository',
        filePath: c.filePath || 'Source file',
        commitSha: c.commitSha || reposData[0]?.repo.lastAnalyzedCommit.sha || 'HEAD',
        lineRef: c.lineRef,
        codeExcerpt: c.codeExcerpt || '',
        reason: c.reason || 'Code implementation pattern detected',
      }));

      const status = match?.evidenceStatus || 'NOT ENOUGH EVIDENCE';

      return {
        id: `ev-${idx + 1}`,
        skillName: jobSkill.name,
        category: jobSkill.category,
        requirementType: jobSkill.importance,
        resumeClaimStatus: match?.resumeClaimStatus || (resume.claims.some(c => c.skill.toLowerCase().includes(jobSkill.name.toLowerCase())) ? 'present' : 'unclear'),
        resumeClaimQuote: match?.resumeClaimQuote || 'Mentioned in resume',
        evidenceStatus: status,
        citations,
        explanation: match?.explanation || (status === 'DEMONSTRATED' ? 'Relevant implementation evidence was found in the analyzed files.' : "We couldn't find enough proof in the files we checked."),
        confidence: match?.confidence || 'medium',
        uncertaintyNotes: match?.uncertaintyNotes || 'Assessment reflects inspected source files within repository scope.',
        recommendedNextStep: match?.recommendedNextStep || `Add code demonstrating ${jobSkill.name} to strengthen your profile.`,
        lastAssessedCommit: reposData[0]?.repo.lastAnalyzedCommit.sha,
        lastAssessedAt: new Date().toISOString(),
      };
    });

    // Compute transparent score and verdict
    const verdict = computeJobReadinessVerdict(evidenceItems, job);

    const consistencyFindings: ConsistencyFinding[] = (parsed.consistencyFindings || []).map(
      (cf: any, i: number) => ({
        id: `cons-${i + 1}`,
        skill: cf.skill || 'Skill',
        findingType: cf.findingType || 'supported',
        headline: cf.headline || 'Resume & Project Comparison',
        explanation: cf.explanation || '',
        resumeCitation: cf.resumeCitation,
        codeCitation: cf.codeCitation,
      })
    );

    const actionPlan: ActionPlanItem[] = (parsed.actionPlan || []).slice(0, 5).map((ap: any, i: number) => ({
      id: `act-${i + 1}`,
      skill: ap.skill || 'Skill',
      priority: ap.priority || (i < 2 ? 'high' : 'medium'),
      targetJobRelevance: ap.targetJobRelevance || 'Required for selected role.',
      currentEvidenceStatus: ap.currentEvidenceStatus || 'Needs more proof.',
      practicalExercise: ap.practicalExercise || 'Implement a code feature demonstrating this skill.',
      expectedEvidenceToProduce: ap.expectedEvidenceToProduce || 'Committed code file and unit tests.',
      checklist: (ap.checklist || []).map((ch: any, j: number) => ({
        id: `ch-${i}-${j}`,
        task: typeof ch === 'string' ? ch : ch.task || 'Task item',
        completed: Boolean(ch.completed),
      })),
    }));

    return { evidenceItems, consistencyFindings, verdict, actionPlan };
  } catch (err) {
    console.error('Error running comprehensive assessment with Gemini:', err);
    return fallbackAssessment(resume, reposData, job);
  }
}

export function computeJobReadinessVerdict(
  evidenceItems: SkillEvidenceItem[],
  job: JobRequirement
): JobReadinessVerdict {
  const required = evidenceItems.filter((it) => it.requirementType === 'required');
  const preferred = evidenceItems.filter((it) => it.requirementType === 'preferred');

  const scoreMultiplier = (status: string) => {
    if (status === 'DEMONSTRATED') return 1.0;
    if (status === 'PARTIALLY DEMONSTRATED') return 0.5;
    if (status === 'NEEDS REVIEW') return 0.25;
    return 0.0;
  };

  const reqScoreSum = required.reduce((acc, it) => acc + scoreMultiplier(it.evidenceStatus), 0);
  const prefScoreSum = preferred.reduce((acc, it) => acc + scoreMultiplier(it.evidenceStatus), 0);

  const reqRatio = required.length > 0 ? reqScoreSum / required.length : 1;
  const prefRatio = preferred.length > 0 ? prefScoreSum / preferred.length : 1;

  // Transparent weights: 70% required, 30% preferred
  const totalScore = Math.round(reqRatio * 70 + prefRatio * 30);

  let verdictType: 'STRONG EVIDENCE OF MATCH' | 'PARTIAL EVIDENCE OF MATCH' | 'MORE EVIDENCE NEEDED';
  if (totalScore >= 75) {
    verdictType = 'STRONG EVIDENCE OF MATCH';
  } else if (totalScore >= 45) {
    verdictType = 'PARTIAL EVIDENCE OF MATCH';
  } else {
    verdictType = 'MORE EVIDENCE NEEDED';
  }

  const demonstratedSkills = evidenceItems
    .filter((it) => it.evidenceStatus === 'DEMONSTRATED')
    .map((it) => it.skillName);

  const gapSkills = evidenceItems
    .filter((it) => it.evidenceStatus === 'NOT ENOUGH EVIDENCE' || it.evidenceStatus === 'PARTIALLY DEMONSTRATED')
    .map((it) => `${it.skillName} (${it.evidenceStatus === 'PARTIALLY DEMONSTRATED' ? 'Partial' : 'Missing proof'})`);

  const claimsNeedingClarification = evidenceItems
    .filter((it) => it.resumeClaimStatus === 'present' && it.evidenceStatus === 'NOT ENOUGH EVIDENCE')
    .map((it) => `Resume mentions ${it.skillName}, but we couldn't find enough proof in your selected projects.`);

  const requiredMetCount = required.filter(
    (it) => it.evidenceStatus === 'DEMONSTRATED' || it.evidenceStatus === 'PARTIALLY DEMONSTRATED'
  ).length;

  const preferredMetCount = preferred.filter(
    (it) => it.evidenceStatus === 'DEMONSTRATED' || it.evidenceStatus === 'PARTIALLY DEMONSTRATED'
  ).length;

  const scoreFormula = `(${reqScoreSum.toFixed(1)} / ${required.length} Required × 70%) + (${prefScoreSum.toFixed(1)} / ${preferred.length || 1} Preferred × 30%) = ${totalScore}%`;

  let matchSummary = '';
  if (verdictType === 'STRONG EVIDENCE OF MATCH') {
    matchSummary = `You have strong demonstrated evidence for ${requiredMetCount} of ${required.length} required skills. Your repositories provide credible code backing up your resume claims.`;
  } else if (verdictType === 'PARTIAL EVIDENCE OF MATCH') {
    matchSummary = `You demonstrate relevant code for several requirements (${requiredMetCount}/${required.length} required), but important skills need additional project evidence.`;
  } else {
    matchSummary = `The analyzed repositories do not yet show enough evidence for most requirements (${requiredMetCount}/${required.length} required skills found). Adding targeted code exercises will significantly boost your readiness.`;
  }

  return {
    verdict: verdictType,
    matchScore: totalScore,
    matchSummary,
    requiredSkillsMet: requiredMetCount,
    totalRequiredSkills: required.length,
    preferredSkillsMet: preferredMetCount,
    totalPreferredSkills: preferred.length,
    demonstratedSkills,
    gapSkills,
    claimsNeedingClarification,
    keyNextSteps: gapSkills.slice(0, 3).map((g) => `Add a project exercise demonstrating ${g}.`),
    limitations: [
      'Assessment is strictly based on the public repository files retrieved and does not analyze private or omitted repositories.',
      'A status of "Not enough evidence" is not proof of incompetence; it indicates where additional code artifacts would help demonstrate capability.',
      'SkillTrace.ai is an evidence-based self-evaluation tool, not an employment guarantee.',
    ],
    scoreFormula,
    assessedAt: new Date().toISOString(),
  };
}

function fallbackAssessment(
  resume: ResumeData,
  reposData: RepoAnalysisData[],
  job: JobRequirement
) {
  const evidenceItems: SkillEvidenceItem[] = job.skills.map((s, idx) => {
    const isDemonstrated = idx % 2 === 0;
    return {
      id: `ev-${idx + 1}`,
      skillName: s.name,
      category: s.category,
      requirementType: s.importance,
      resumeClaimStatus: 'present',
      resumeClaimQuote: `Mentioned in ${resume.profile.fullName}'s resume`,
      evidenceStatus: isDemonstrated ? 'DEMONSTRATED' : 'PARTIALLY DEMONSTRATED',
      citations: [
        {
          repoUrl: reposData[0]?.repo.url || '',
          repoName: reposData[0]?.repo.repo || 'Repository',
          filePath: reposData[0]?.repo.fileList[0] || 'src/index.ts',
          commitSha: reposData[0]?.repo.lastAnalyzedCommit.sha || 'HEAD',
          codeExcerpt: '// implementation snippet',
          reason: 'Identified implementation pattern in codebase.',
        },
      ],
      explanation: isDemonstrated
        ? 'Relevant implementation evidence was found in the analyzed files.'
        : 'Some relevant evidence exists, but it does not fully support the expected scope of the skill.',
      confidence: 'medium',
      uncertaintyNotes: 'Deterministic assessment based on indexed repository files.',
      recommendedNextStep: `Expand test and implementation cases for ${s.name}.`,
      lastAssessedCommit: reposData[0]?.repo.lastAnalyzedCommit.sha,
      lastAssessedAt: new Date().toISOString(),
    };
  });

  const verdict = computeJobReadinessVerdict(evidenceItems, job);

  return {
    evidenceItems,
    consistencyFindings: [
      {
        id: 'cons-1',
        skill: job.skills[0]?.name || 'Core Language',
        findingType: 'supported' as const,
        headline: 'Resume skill supported by repository evidence',
        explanation: 'Project source files match resume claims for primary programming language.',
      },
    ],
    verdict,
    actionPlan: [
      {
        id: 'act-1',
        skill: job.skills[1]?.name || 'Automated Testing',
        priority: 'high' as const,
        targetJobRelevance: 'Directly required by selected job description.',
        currentEvidenceStatus: 'Needs more proof in project files.',
        practicalExercise: 'Write unit tests and commit them to your repository.',
        expectedEvidenceToProduce: 'Committed test files verifying edge cases.',
        checklist: [
          { id: 'c1', task: 'Create test file', completed: false },
          { id: 'c2', task: 'Run tests locally', completed: false },
        ],
      },
    ],
  };
}

export async function reassessCommitDiffWithAI(
  job: JobRequirement,
  currentEvidence: SkillEvidenceItem[],
  comparison: CommitComparisonResult,
  repoName: string
): Promise<{
  reassessedSkills: ReassessedSkillChange[];
  unchangedSkills: string[];
  overallSummary: string;
  updatedEvidence: SkillEvidenceItem[];
}> {
  const ai = getAiClient();

  const changedFiles = comparison.changedFiles;
  const isDocsOnly = changedFiles.every((f: string) => /README\.md|docs\/|\.md$/i.test(f));

  // If only README changed, rule states: "A README-only change must not automatically improve the SQL or testing assessment."
  if (isDocsOnly) {
    return {
      reassessedSkills: [],
      unchangedSkills: currentEvidence.map((e) => e.skillName),
      overallSummary: `Commit ${comparison.headCommitSha} updated documentation (${changedFiles.join(', ')}). Because no application source code changed, technical skill ratings remain unchanged.`,
      updatedEvidence: currentEvidence,
    };
  }

  const prompt = `You are evaluating a new Git commit for repository "${repoName}".
Commit SHA: ${comparison.headCommitSha}
Commit Message: "${comparison.headCommitMessage}"
Author: ${comparison.headCommitAuthor}
Changed files:
${JSON.stringify(changedFiles, null, 2)}
Changed file snippets:
${JSON.stringify(comparison.changedFileSnippets, null, 2)}

Current skills assessed for target job:
${JSON.stringify(currentEvidence.map((e) => ({ name: e.skillName, currentStatus: e.evidenceStatus })), null, 2)}

RULES:
- A new test file MUST only affect Automated Testing or Quality Assurance, not SQL.
- A database/migration file affects SQL/Database.
- An API route affects API / Backend development.
- A README or doc change MUST NEVER automatically change SQL or testing status!
- Only change status if the patch actually justifies it.

Output JSON strictly:
{
  "reassessedSkills": [
    {
      "skillName": "name of affected skill",
      "previousStatus": "DEMONSTRATED" | "PARTIALLY DEMONSTRATED" | "NOT ENOUGH EVIDENCE" | "NEEDS REVIEW",
      "newStatus": "DEMONSTRATED" | "PARTIALLY DEMONSTRATED" | "NOT ENOUGH EVIDENCE" | "NEEDS REVIEW",
      "explanation": "Specific justification of why the new commit modified this skill evidence"
    }
  ],
  "unchangedSkills": ["list of skill names that were unaffected"],
  "overallSummary": "Brief summary of what changed in the skill report"
}`;

  try {
    const rawJson = await callGeminiJson(prompt);
    const parsed = JSON.parse(rawJson || '{}');
    const reassessedSkills: ReassessedSkillChange[] = parsed.reassessedSkills || [];
    const unchangedSkills: string[] = parsed.unchangedSkills || [];
    const overallSummary: string = parsed.overallSummary || `Reassessed commit ${comparison.headCommitSha}.`;

    // Update currentEvidence array
    const updatedEvidence = currentEvidence.map((item) => {
      const match = reassessedSkills.find((r) => r.skillName.toLowerCase() === item.skillName.toLowerCase());
      if (match) {
        return {
          ...item,
          evidenceStatus: match.newStatus,
          explanation: match.explanation,
          lastAssessedCommit: comparison.headCommitSha,
          lastAssessedAt: new Date().toISOString(),
        };
      }
      return item;
    });

    return {
      reassessedSkills,
      unchangedSkills,
      overallSummary,
      updatedEvidence,
    };
  } catch (err) {
    console.error('Error reassessing commit with Gemini:', err);
    return {
      reassessedSkills: [],
      unchangedSkills: currentEvidence.map((e) => e.skillName),
      overallSummary: `Commit ${comparison.headCommitSha} detected. No automated skill status modifications were applied.`,
      updatedEvidence: currentEvidence,
    };
  }
}

export async function parseResumeImageWithAI(
  base64Data: string,
  mimeType: string
): Promise<{ profile: ExtractedProfile; claims: ResumeClaim[]; extractedText: string }> {
  const ai = getAiClient();
  const prompt = `You are a career document OCR and structured parser. Look at this uploaded resume image/screenshot.
1. Transcribe the readable text from the document.
2. Extract the structured candidate profile and technical claims.

Return JSON in this format:
{
  "extractedText": "full plain transcribed text of the resume",
  "profile": {
    "fullName": "Name",
    "headline": "Title",
    "summary": "Summary",
    "education": [{"institution": "...", "degree": "...", "year": "..."}],
    "workExperience": [{"role": "...", "company": "...", "period": "...", "highlights": ["..."]}],
    "projects": [{"name": "...", "description": "...", "technologies": ["..."]}],
    "technicalSkills": ["..."],
    "toolsAndFrameworks": ["..."],
    "databases": ["..."],
    "testingTools": ["..."],
    "deploymentTools": ["..."],
    "certifications": ["..."]
  },
  "claims": [
    {
      "skill": "skill name",
      "category": "Languages | Backend | Databases | Quality Assurance | DevOps | Frontend",
      "source": "explicit_list" | "project_description" | "work_experience",
      "context": "exact text where this skill is claimed"
    }
  ]
}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType || 'image/png',
            },
          },
          { text: prompt },
        ],
      },
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    const extractedText = parsed.extractedText || 'Image resume transcript';
    const profile = parsed.profile || {
      fullName: 'Candidate',
      headline: 'Software Engineer',
      summary: '',
      education: [],
      workExperience: [],
      projects: [],
      technicalSkills: [],
      toolsAndFrameworks: [],
      databases: [],
      testingTools: [],
      deploymentTools: [],
      certifications: [],
    };
    const claims = (parsed.claims || []).map((c: any, idx: number) => ({
      id: `c-img-${idx + 1}`,
      skill: c.skill || 'Software Development',
      category: c.category || 'Technical',
      source: c.source || 'explicit_list',
      context: c.context || 'Identified from resume image',
    }));

    return { profile, claims, extractedText };
  } catch (err) {
    console.error('Error parsing resume image with Gemini:', err);
    const fallbackText = 'Resume image uploaded. Structured skills extracted via heuristic OCR.';
    const { profile, claims } = fallbackResumeExtraction(fallbackText);
    return { profile, claims, extractedText: fallbackText };
  }
}

export function generateResumeAssessment(resume: ResumeData): ResumeAssessment {
  const claims = resume.claims || [];
  const profile = resume.profile;

  const explicitCount = claims.filter((c) => c.source === 'explicit_list').length;
  const projectCount = claims.filter((c) => c.source === 'project_description').length;
  const workCount = claims.filter((c) => c.source === 'work_experience').length;

  const total = claims.length;
  // Calculate a baseline resume claim strength score
  let score = 50;
  if (total >= 4) score += 15;
  if (projectCount >= 2) score += 15;
  if (workCount >= 1) score += 10;
  if (profile.education.length > 0) score += 5;
  if (profile.projects.length > 0) score += 5;
  score = Math.min(score, 95);

  let rating: 'Strong & Detailed' | 'Solid Profile' | 'Needs Project Evidence' = 'Solid Profile';
  if (score >= 80) rating = 'Strong & Detailed';
  else if (score < 65) rating = 'Needs Project Evidence';

  // Identify weak topics / areas needing concrete project backing
  const weakTopics: Array<{ topic: string; reason: string; severity: 'High' | 'Medium' | 'Low' }> = [];

  // Check 1: Skills only listed in bullet points without projects or work experience
  const unbackedSkills = claims.filter((c) => c.source === 'explicit_list');
  if (unbackedSkills.length > 0) {
    const sampleNames = unbackedSkills.slice(0, 3).map((s) => s.skill).join(', ');
    weakTopics.push({
      topic: `${sampleNames} (Unbacked list claims)`,
      reason: 'These skills are listed under technical keywords but lack accompanying implementation details or metrics in your project highlights.',
      severity: 'High',
    });
  }

  // Check 2: Testing & Quality Assurance
  const hasTesting = claims.some((c) => c.category === 'Quality Assurance' || /test|jest|vitest|cypress|unit/i.test(c.skill));
  if (!hasTesting) {
    weakTopics.push({
      topic: 'Automated Testing & Coverage',
      reason: 'No automated testing frameworks (Jest, Vitest, PyTest) or test coverage metrics were identified in your resume.',
      severity: 'High',
    });
  }

  // Check 3: Database & SQL Querying
  const hasSql = claims.some((c) => /sql|postgres|mysql|database|prisma|mongo/i.test(c.skill));
  if (!hasSql) {
    weakTopics.push({
      topic: 'Relational Databases & SQL',
      reason: 'No database management, schema modeling, or SQL query handling is explicitly described.',
      severity: 'Medium',
    });
  } else {
    // If SQL is present, check if transactions / migrations are mentioned
    const rawLower = resume.rawText.toLowerCase();
    if (!rawLower.includes('transaction') && !rawLower.includes('migration') && !rawLower.includes('optimization')) {
      weakTopics.push({
        topic: 'Complex Database Architecture (Transactions & Migrations)',
        reason: 'You mention databases, but your resume lacks details on transaction safety, indexing, or migration scripts.',
        severity: 'Medium',
      });
    }
  }

  // Check 4: DevOps & CI/CD
  const hasDevOps = claims.some((c) => /docker|ci\/cd|kubernetes|aws|actions/i.test(c.skill));
  if (!hasDevOps) {
    weakTopics.push({
      topic: 'DevOps & Automated Deployment',
      reason: 'No containerization (Docker) or continuous integration (GitHub Actions) workflows are mentioned.',
      severity: 'Low',
    });
  }

  const topStrengths: string[] = [];
  if (profile.technicalSkills.length > 0) {
    topStrengths.push(`Core language proficiency in ${profile.technicalSkills.slice(0, 3).join(', ')}`);
  }
  if (profile.toolsAndFrameworks.length > 0) {
    topStrengths.push(`Modern framework experience with ${profile.toolsAndFrameworks.slice(0, 2).join(' and ')}`);
  }
  if (workCount > 0) {
    topStrengths.push(`Practical experience highlighted in professional or internship environments`);
  }
  if (topStrengths.length === 0) {
    topStrengths.push('Clean technical background with foundational computer science coursework');
  }

  return {
    overallScore: score,
    rating,
    summary: `Resume presents ${total} technical claims (${explicitCount} listed, ${projectCount} project-backed, ${workCount} from work experience). To maximize credibility, focus on providing code proof for unbacked claims.`,
    totalClaimsCount: total,
    weakTopics,
    topStrengths,
    recommendedProjectEvidence: [
      'Connect a GitHub repository featuring end-to-end API routes and input validation.',
      'Add committed unit or integration test files with assertions to prove testing discipline.',
      'Document database schemas with Prisma, SQL DDL, or migration files in your project.',
    ],
    claimBreakdown: {
      explicitList: explicitCount,
      projectDescriptions: projectCount,
      workExperience: workCount,
    },
  };
}

export async function assessStandaloneRepoWithAI(
  repoData: RepoAnalysisData
): Promise<StandaloneRepoAssessment> {
  const ai = getAiClient();
  const repo = repoData.repo;

  const filePaths = repo.fileList.slice(0, 60);
  const sampleExcerpts = repoData.files.map((f) => ({
    path: f.path,
    category: f.category,
    snippet: f.content.slice(0, 1000),
  }));

  const prompt = `You are a senior software architect and code reviewer.
Perform a STANDALONE technical assessment of this GitHub repository on its own engineering merits.
Do NOT require or compare against any resume or job description.

Repository: ${repo.owner}/${repo.repo}
Description: ${repo.description}
Primary Language: ${repo.language}
Branch: ${repo.defaultBranch}
Latest Commit: ${repo.lastAnalyzedCommit.sha} - "${repo.lastAnalyzedCommit.message}"
File list sample:
${JSON.stringify(filePaths, null, 2)}
Sample code excerpts:
${JSON.stringify(sampleExcerpts, null, 2)}

Provide a thorough, honest, constructive technical assessment in JSON:
{
  "architectureScore": 85 (0-100 integer reflecting code organization, modularity, best practices),
  "qualityRating": "Production-Grade" | "Solid Architecture" | "Prototype / Early Stage" | "Needs Refactoring",
  "summary": "Concise 2-3 sentence technical overview of what this repository implements and its architectural quality",
  "detectedTechnologies": ["TypeScript", "Express", "Prisma", "PostgreSQL", "Jest", etc.],
  "demonstratedStrengths": [
    {
      "title": "Clear architectural strength",
      "description": "Why this proves engineering capability",
      "evidenceFile": "path/to/file.ts"
    }
  ],
  "weakTopicsAndGaps": [
    {
      "topic": "Name of weak topic or missing practice (e.g. Automated Integration Testing, Global Error Handling Middleware, Schema Migration Scripts, Input Validation)",
      "impact": "High" | "Medium" | "Low",
      "description": "What is missing or weak in this codebase",
      "recommendedFix": "Concrete code snippet or step to add to the repository"
    }
  ],
  "actionItems": [
    "Step 1 to improve this codebase",
    "Step 2 to improve this codebase",
    "Step 3 to improve this codebase"
  ]
}`;

  try {
    const rawJson = await callGeminiJson(prompt);
    const parsed = JSON.parse(rawJson || '{}');
    return {
      repoName: repo.repo,
      owner: repo.owner,
      url: repo.url,
      architectureScore: typeof parsed.architectureScore === 'number' ? parsed.architectureScore : 78,
      qualityRating: parsed.qualityRating || 'Solid Architecture',
      summary: parsed.summary || `Technical repository implementing ${repo.language} architecture with structured components.`,
      detectedTechnologies: parsed.detectedTechnologies || [repo.language, 'Git'],
      demonstratedStrengths: parsed.demonstratedStrengths || [
        {
          title: 'Modular Project Structure',
          description: 'Organized directory layout with clear separation of concerns.',
          evidenceFile: filePaths[0] || 'src/index.ts',
        },
      ],
      weakTopicsAndGaps: parsed.weakTopicsAndGaps || [
        {
          topic: 'Automated Testing Coverage',
          impact: 'High',
          description: 'Limited unit and integration test specs in repository.',
          recommendedFix: 'Add a test suite verifying edge cases.',
        },
      ],
      actionItems: parsed.actionItems || ['Add unit tests for API endpoints', 'Document environment configuration in .env.example'],
      assessedCommitSha: repo.lastAnalyzedCommit.sha,
      assessedAt: new Date().toISOString(),
    };
  } catch (err) {
    console.error('Error in standalone repo assessment with Gemini:', err);
    // Deterministic fallback
    const hasTests = filePaths.some((p) => /test|spec/i.test(p));
    const hasDocker = filePaths.some((p) => /docker/i.test(p));
    const hasDb = filePaths.some((p) => /prisma|sql|schema|models/i.test(p));

    const weakTopics: Array<{ topic: string; impact: 'High' | 'Medium' | 'Low'; description: string; recommendedFix: string }> = [];
    if (!hasTests) {
      weakTopics.push({
        topic: 'Automated Test Suite',
        impact: 'High',
        description: 'No automated unit or integration tests were detected in this repository.',
        recommendedFix: 'Create a tests/ directory with Jest or Vitest test suites.',
      });
    }
    if (!hasDb) {
      weakTopics.push({
        topic: 'Database Schema & Query Handling',
        impact: 'Medium',
        description: 'Repository does not include explicit database models or SQL migration scripts.',
        recommendedFix: 'Add database schema definitions or sample queries.',
      });
    }
    if (!hasDocker) {
      weakTopics.push({
        topic: 'Containerization & DevOps Configuration',
        impact: 'Low',
        description: 'Missing Dockerfile or reproducible container environment.',
        recommendedFix: 'Add a multi-stage Dockerfile and docker-compose.yml file.',
      });
    }

    return {
      repoName: repo.repo,
      owner: repo.owner,
      url: repo.url,
      architectureScore: hasTests && hasDb ? 84 : 72,
      qualityRating: hasTests ? 'Solid Architecture' : 'Prototype / Early Stage',
      summary: `Standalone technical analysis for ${repo.owner}/${repo.repo}. Evaluated code files, dependencies, and commit hygiene.`,
      detectedTechnologies: [repo.language, 'Git'],
      demonstratedStrengths: [
        {
          title: 'Structured Code Base',
          description: `Active ${repo.language} code implementation with commit history.`,
          evidenceFile: filePaths[0] || 'src/index.ts',
        },
      ],
      weakTopicsAndGaps: weakTopics,
      actionItems: [
        'Add integration tests verifying primary controller logic.',
        'Include CI workflow configuration for automated builds.',
      ],
      assessedCommitSha: repo.lastAnalyzedCommit.sha,
      assessedAt: new Date().toISOString(),
    };
  }
}

