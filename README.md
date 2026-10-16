SkillTrace.ai

A career-readiness project that connects resume skills with real coding evidence.

We built SkillTrace.ai around a problem many students face: putting skills on a resume is easy, but showing where those skills are actually used in a project can be harder.

The idea is simple. A user uploads their resume, adds their GitHub projects, and selects a job or internship they're interested in. The app compares the skills mentioned in the resume with the job requirements and looks for supporting evidence in the selected repositories.

What we're trying to build

- Resume review: Read a resume and identify the skills and technologies mentioned.
- GitHub analysis: Check selected repositories for relevant code and project evidence.
- Job matching: Compare the user's profile with the requirements of a job or internship.
- Skill report: Show which skills have supporting evidence and which need a closer look.
- Improvement suggestions: Help users decide what to learn or improve in their projects.
- Project updates: Recheck relevant skills when new repository changes are detected.

The goal isn't to judge someone based on a single score. It's to help them understand what their projects show and where they could improve.

How it works

1. Upload a resume.
2. Add GitHub repository links.
3. Enter a job posting URL or paste its description.
4. Review the skills and requirements identified by the app.
5. Check the repository evidence and assessment.
6. Use the results to plan the next improvements.

Technologies

The project currently uses TypeScript, a React-based frontend, and a Node.js server. It is also designed to use the GitHub API and Gemini for repository analysis and skill assessment.

The exact features available depend on the integrations that have been configured and tested.

Running locally

You'll need Node.js and the dependencies required by this project.

1. Clone this repository.
2. Install the dependencies using the package manager supported by the project.
3. Check ".env.example" for the environment variables the app expects.
4. Configure your own credentials locally, where required.
5. Run the development command listed in "package.json".

Keep your API keys and tokens private. Don't upload a real ".env" file to GitHub.

A note about the results

Finding code that relates to a skill is useful evidence, but it doesn't prove who wrote the code or guarantee that someone has mastered the skill. Similarly, not finding evidence in a selected repository doesn't mean the person lacks that skill.

SkillTrace.ai is intended to make these findings easier to understand, not to make unsupported judgments about job seekers.

Project status

This is a student hackathon project, and development is ongoing. We're working toward making the full workflow—from resume upload to GitHub analysis and updated skill assessments—clear and useful.

Why we chose this idea

We wanted to explore how AI could help students connect what they write on their resumes with what they've actually built, and give them a clearer idea of what to work on next.
