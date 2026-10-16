SkillTrace.ai — Upskill Your Skills with AI

An AI-Powered Career Coach for Evidence-Based Career Readiness

SkillTrace.ai is an AI-powered career development platform designed to help students and developers understand their technical strengths, identify skill gaps, and improve their readiness for real-world job opportunities.

Traditional resumes often list skills without showing how those skills have been applied in practice. SkillTrace.ai bridges this gap by connecting job requirements with resume information and available GitHub project code to provide a more evidence-based view of a candidate's technical readiness.

Our mission is simple: help individuals move beyond listing skills to demonstrating them through real project evidence.

Problem Statement

Students and early-career developers often struggle to determine whether their current skills and projects meet the requirements of their target roles. Traditional career tools primarily focus on resume keywords and self-reported skills, which may not reflect practical implementation experience.

SkillTrace.ai addresses this challenge by analyzing job requirements alongside available project information and source code, helping users understand what they demonstrate, what needs improvement, and what they should learn next.

Key Features

1. AI-Powered Career Assessment

Analyze a target job description against available resume information and project evidence to understand career readiness.

2. Resume Management

Review resume information and use it as part of the overall career assessment workflow.

3. Intelligent Job Matcher

Compare job requirements with available candidate skills and project evidence to identify areas of alignment and missing capabilities.

4. GitHub Repository Analysis

Inspect supported GitHub repositories and selected source files to find code evidence relevant to the technical skills required by a role.

5. Skill Evidence Tracking

Present skill assessments alongside source references where evidence can be verified, helping users understand why a skill is considered demonstrated or requires further development.

6. Skill Gap Identification

Highlight technical requirements that lack sufficient supporting evidence and identify areas where the candidate could improve.

7. Personalized Action Plan

Generate actionable recommendations to help users strengthen their projects, develop missing skills, and improve their career readiness.

8. Change History

Maintain a history of assessment-related activity and repository updates to help users follow changes over time.

9. Repository Update Checks

Check for new GitHub commits and support reassessment when the necessary job, evidence, and repository information is available.

How SkillTrace.ai Works

The platform is designed around a practical, evidence-based workflow:

1. Choose a target role: Provide a job description containing the relevant technical requirements.
2. Add candidate information: Supply resume information and a supported GitHub repository.
3. Analyze available evidence: Examine selected source files for implementation evidence related to the required skills.
4. Identify skill gaps: Review demonstrated skills, partial evidence, and requirements that need further attention.
5. Build an improvement plan: Use targeted recommendations to strengthen weak areas and improve projects.
6. Track changes: Check repository updates and reassess skills when supported by the available data.

The goal is to turn career preparation into a continuous cycle of assessment, improvement, and evidence-based progress.

What Makes SkillTrace.ai Different?

Most basic career tools focus on matching keywords between resumes and job descriptions. SkillTrace.ai aims to go further by connecting technical requirements with evidence from actual project source code.

Its core principles are:

- Evidence over claims: Look for supporting implementation evidence instead of relying only on listed skills.
- Transparency: Provide source references for assessments when they can be validated.
- Actionable feedback: Identify skill gaps and suggest practical next steps.
- Continuous improvement: Support reassessment as project code evolves.
- Career-focused guidance: Connect technical development activities to the requirements of a target role.

Repository analysis is limited to the source files successfully retrieved and processed. Access to a repository does not establish authorship, and AI-generated assessments should not be treated as definitive proof of competence.

Technology Stack

Technology| Purpose
React| Frontend user interface
TypeScript| Type-safe application development
Vite| Frontend development and build tooling
Node.js| Backend runtime
Express| Backend API server
Google Gemini / Google Gen AI SDK| AI-powered assessment and analysis
GitHub API| Repository and commit information
JSON-based storage| Prototype application-state persistence

Project Structure

The project includes frontend pages, reusable components, backend services, and configuration files.

INOVEXA-KK/
├── src/
│   ├── components/
│   ├── pages/
│   ├── types/
│   ├── App.tsx
│   ├── api.ts
│   └── main.tsx
├── server/
│   ├── ai.ts
│   ├── github.ts
│   └── store.ts
├── server.ts
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── .env.example
├── .gitignore
└── README.md

Note: This is a representative structure. The actual paths in the GitHub repository should be used if they differ from this layout.

Getting Started

Prerequisites

Before running the project, ensure you have:

- Node.js installed
- Bun installed, or another compatible package manager
- A Google Gemini API key
- Internet access for supported AI and GitHub API requests

1. Clone the Repository

git clone https://github.com/onkardeshmukh008/INOVEXA-KK.git
cd INOVEXA-KK

2. Install Dependencies

Using Bun:

bun install

Alternatively, if using npm:

npm install

3. Configure Environment Variables

Create a local ".env" file using ".env.example" as a reference. Configure the environment variables required by the backend.

For example:

GEMINI_API_KEY=your_gemini_api_key

Use the exact variable names expected by the application. Never commit your real API key, passwords, or other secrets to GitHub.

4. Start the Development Server

bun run dev

Follow the local URL printed in the terminal to open the application.

5. Build the Project

bun run build

6. Check TypeScript

bun run lint

The commands above should be confirmed against the scripts defined in "package.json". Successful execution should be verified in the actual project environment.

Responsible Use and Current Limitations

SkillTrace.ai is a career-readiness aid, not a hiring authority. Users should understand the following limitations:

- Repository analysis may examine selected files rather than the complete codebase.
- GitHub API rate limits, network issues, inaccessible repositories, and missing files may affect results.
- AI assessments can be incomplete or inaccurate and require human review.
- Skill evidence should only be considered verified when its source reference and supporting content have been validated.
- Repository access does not prove that a candidate personally authored the code.
- JSON-based persistence and demo-style login are prototype features, not production-grade multi-user security.
- Career-readiness scores are indicative and do not guarantee employment or hiring success.

Future Scope

Potential improvements include:

- More comprehensive source-code analysis
- Stronger validation of evidence and commit-specific references
- More reliable repository change detection and reassessment
- Automated testing of scoring and evidence-validation logic
- Secure authentication and user-specific data storage
- Secure authorization for private repository access
- Expanded career guidance and learning recommendations

Project Vision

SkillTrace.ai aims to help students and developers understand where they stand, identify what they need to improve, and take measurable steps toward their career goals.

By connecting job requirements with project evidence and actionable recommendations, the platform encourages a more transparent and practical approach to career development.

SkillTrace.ai — Upskill Your Skills with AI.
