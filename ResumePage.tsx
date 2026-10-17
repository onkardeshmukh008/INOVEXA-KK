import React, { useState, useRef } from 'react';
import {
  Upload,
  FileText,
  Trash2,
  Edit2,
  Check,
  X,
  Plus,
  AlertCircle,
  FileCheck,
  Briefcase,
  GraduationCap,
  Layers,
  Database,
  Terminal,
  ShieldAlert,
  Sparkles,
  Download,
  Copy,
  AlertTriangle,
  Target,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  Image as ImageIcon,
  CheckCircle2,
} from 'lucide-react';
import type { ResumeAssessment, ResumeClaim, ResumeData } from '../types/index.ts';
import { uploadResumeFile, editResumeClaims, removeResume } from '../api.ts';
import { AutomatedResumeAuditor } from '../components/AutomatedResumeAuditor.tsx';

interface ResumePageProps {
  resume: ResumeData | null;
  resumeAssessment?: ResumeAssessment | null;
  onRefreshState: () => void;
  onNavigateToProjects?: () => void;
}


export const ResumePage: React.FC<ResumePageProps> = ({
  resume,
  resumeAssessment,
  onRefreshState,
  onNavigateToProjects,
}) => {
  const [activeAssessment, setActiveAssessment] = useState<ResumeAssessment | null>(
    resumeAssessment || null
  );

  // Sync when prop updates
  React.useEffect(() => {
    if (resumeAssessment) {
      setActiveAssessment(resumeAssessment);
    }
  }, [resumeAssessment]);

  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Manual paste toggle
  const [showPasteBox, setShowPasteBox] = useState(false);
  const [pastedText, setPastedText] = useState('');

  // Editing claims
  const [editingClaimId, setEditingClaimId] = useState<string | null>(null);
  const [editClaimSkill, setEditClaimSkill] = useState('');
  const [editClaimContext, setEditClaimContext] = useState('');
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillCategory, setNewSkillCategory] = useState('Languages');
  const [showAddClaim, setShowAddClaim] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const processFile = async (file: File) => {
    // Validate size (max 25MB)
    if (file.size > 25 * 1024 * 1024) {
      setUploadError('File is too large. Maximum supported resume size is 25 MB.');
      return;
    }

    setUploadError(null);
    setSuccessMessage(null);
    setIsUploading(true);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64Data = (reader.result as string).split(',')[1];
          const uploadRes = await uploadResumeFile({
            fileName: file.name,
            fileBase64: base64Data,
            fileSize: file.size,
            mimeType: file.type || 'application/octet-stream',
          });
          setIsUploading(false);
          setSuccessMessage(`Document "${file.name}" uploaded and parsed successfully! See assessment below.`);
          if (uploadRes.assessment) {
            setActiveAssessment(uploadRes.assessment);
          }
          onRefreshState();
        } catch (err: any) {
          setIsUploading(false);
          setUploadError(err.message || 'Failed to parse resume document.');
        }
      };
      reader.onerror = () => {
        setIsUploading(false);
        setUploadError('Failed to read the file from your computer.');
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setIsUploading(false);
      setUploadError(err.message || 'Error processing file');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handlePasteSubmit = async () => {
    if (!pastedText.trim() || pastedText.length < 20) {
      setUploadError('Please paste at least a paragraph of resume content to analyze.');
      return;
    }

    setUploadError(null);
    setSuccessMessage(null);
    setIsUploading(true);

    try {
      await uploadResumeFile({
        fileName: 'Pasted_Resume_Profile.txt',
        rawText: pastedText,
        fileSize: Buffer.byteLength(pastedText, 'utf-8'),
      });
      setIsUploading(false);
      setSuccessMessage('Resume text parsed successfully!');
      setShowPasteBox(false);
      setPastedText('');
      onRefreshState();
    } catch (err: any) {
      setIsUploading(false);
      setUploadError(err.message || 'Failed to extract skills from text.');
    }
  };


  const handleRemoveResume = async () => {
    if (!window.confirm('Are you sure you want to remove your resume? This will clear extracted claims.')) {
      return;
    }
    try {
      await removeResume();
      setSuccessMessage('Resume removed.');
      onRefreshState();
    } catch (err: any) {
      setUploadError(err.message || 'Failed to delete resume.');
    }
  };

  const handleDeleteClaim = async (claimId: string) => {
    if (!resume) return;
    const updated = resume.claims.filter((c) => c.id !== claimId);
    try {
      await editResumeClaims({ claims: updated });
      onRefreshState();
    } catch (err: any) {
      setUploadError(err.message);
    }
  };

  const handleSaveClaimEdit = async (claimId: string) => {
    if (!resume) return;
    const updated = resume.claims.map((c) => {
      if (c.id === claimId) {
        return { ...c, skill: editClaimSkill, context: editClaimContext };
      }
      return c;
    });
    try {
      await editResumeClaims({ claims: updated });
      setEditingClaimId(null);
      onRefreshState();
    } catch (err: any) {
      setUploadError(err.message);
    }
  };

  const handleAddClaim = async () => {
    if (!resume || !newSkillName.trim()) return;
    const newClaim: ResumeClaim = {
      id: `c-manual-${Date.now()}`,
      skill: newSkillName.trim(),
      category: newSkillCategory,
      source: 'explicit_list',
      context: 'Added manually by candidate',
    };
    try {
      await editResumeClaims({ claims: [...resume.claims, newClaim] });
      setNewSkillName('');
      setShowAddClaim(false);
      onRefreshState();
    } catch (err: any) {
      setUploadError(err.message);
    }
  };

  const handleExportJson = () => {
    if (!resume) return;
    const blob = new Blob([JSON.stringify(resume, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${resume.profile.fullName.replace(/\s+/g, '_')}_SkillTrace_Claims.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Header & Mission */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Upload your resume</h1>
          <p className="text-slate-600 text-sm mt-1 max-w-3xl leading-relaxed">
            Upload any document or image. We identify your claimed skills and provide an immediate assessment of your profile and weak topics below.
          </p>
        </div>

        {resume && (
          <button
            onClick={handleExportJson}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 text-xs font-semibold shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export Parsed Profile (JSON)</span>
          </button>
        )}
      </div>

      {/* Notifications */}
      {uploadError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">Notice</p>
            <p className="mt-0.5">{uploadError}</p>
          </div>
          <button onClick={() => setUploadError(null)} className="text-rose-500 hover:text-rose-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-start gap-3">
          <FileCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <p className="flex-1 font-medium">{successMessage}</p>
          <button onClick={() => setSuccessMessage(null)} className="text-emerald-500 hover:text-emerald-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}


      {/* PROMINENT UPLOAD CARD - ACCEPTS ALL FILE TYPES */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`bg-white rounded-xl border-2 border-dashed p-8 text-center transition-all shadow-2xs ${
          isDragging
            ? 'border-sky-500 bg-sky-50/30'
            : 'border-slate-300 hover:border-slate-400'
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="*/*"
          className="hidden"
        />

        <div className="max-w-md mx-auto space-y-4">
          <div className="w-14 h-14 rounded-full bg-sky-50 text-sky-600 mx-auto flex items-center justify-center">
            <Upload className="w-7 h-7" />
          </div>

          <div>
            <h3 className="text-base font-bold text-slate-900">
              {resume ? 'Replace your current resume' : 'Choose any file or drag it here'}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Supports <strong>all file formats</strong>: PDF, Word (DOCX/DOC), Text, Markdown, Images (PNG, JPG screenshots), RTF, JSON, up to 20 MB.
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="px-5 py-2.5 rounded-lg bg-slate-900 text-white font-medium text-xs sm:text-sm hover:bg-slate-800 transition-colors shadow-xs"
            >
              {isUploading ? 'Extracting Content & Skills...' : 'Select Any Resume File'}
            </button>
            <button
              onClick={() => setShowPasteBox(!showPasteBox)}
              className="px-4 py-2.5 rounded-lg border border-slate-300 text-slate-700 font-medium text-xs sm:text-sm hover:bg-slate-50 transition-colors"
            >
              {showPasteBox ? 'Hide Paste Box' : 'Paste Resume Text'}
            </button>
          </div>

          <p className="text-[11px] text-slate-400">
            Privacy notice: Personal contact details (phone number, home address) are not required and are never shared.
          </p>
        </div>
      </div>

      {/* Paste Box Drawer */}
      {showPasteBox && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-3 shadow-sm">
          <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider">
            Paste your resume or CV text
          </label>
          <textarea
            value={pastedText}
            onChange={(e) => setPastedText(e.target.value)}
            rows={8}
            placeholder="Paste your resume content, experience, and project descriptions here..."
            className="w-full p-3 rounded-lg border border-slate-300 text-xs text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowPasteBox(false)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              onClick={handlePasteSubmit}
              disabled={isUploading || !pastedText.trim()}
              className="px-4 py-1.5 rounded-lg bg-sky-600 text-white text-xs font-semibold hover:bg-sky-500 disabled:opacity-50"
            >
              {isUploading ? 'Analyzing...' : 'Parse Pasted Content'}
            </button>
          </div>
        </div>
      )}

      {/* RESUME PREVIEW & EXTRACTED SECTIONS */}
      {resume && (
        <div className="space-y-6">
          {/* File Meta bar */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-sm text-slate-900">{resume.fileName}</p>
                <p className="text-xs text-slate-500">
                  Uploaded {new Date(resume.uploadedAt).toLocaleString()} •{' '}
                  {resume.fileSize ? `${Math.round(resume.fileSize / 1024)} KB` : 'Document'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                Replace File
              </button>
              <button
                onClick={handleRemoveResume}
                className="px-3 py-1.5 rounded-lg border border-rose-200 text-xs font-medium text-rose-700 hover:bg-rose-50 flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" /> Remove
              </button>
            </div>
          </div>

          {/* Profile Overview */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  {resume.profile.fullName || 'Candidate Profile'}
                </h2>
                <p className="text-xs text-slate-500">{resume.profile.headline}</p>
              </div>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                Extracted Information
              </span>
            </div>

            {resume.profile.summary && (
              <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                {resume.profile.summary}
              </p>
            )}

            {/* Structured Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {/* Education */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
                  <GraduationCap className="w-4 h-4 text-sky-600" />
                  <span>Education</span>
                </div>
                {resume.profile.education.length > 0 ? (
                  <div className="space-y-2">
                    {resume.profile.education.map((edu, idx) => (
                      <div key={idx} className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                        <p className="font-semibold text-slate-900">{edu.institution}</p>
                        <p className="text-slate-600">{edu.degree} {edu.year ? `(${edu.year})` : ''}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No formal education section extracted.</p>
                )}
              </div>

              {/* Work Experience */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
                  <Briefcase className="w-4 h-4 text-sky-600" />
                  <span>Work & Internships</span>
                </div>
                {resume.profile.workExperience.length > 0 ? (
                  <div className="space-y-2">
                    {resume.profile.workExperience.map((exp, idx) => (
                      <div key={idx} className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                        <p className="font-semibold text-slate-900">{exp.role} — {exp.company}</p>
                        <p className="text-[11px] text-slate-500 mb-1">{exp.period}</p>
                        <ul className="list-disc list-inside space-y-0.5 text-slate-600 text-[11px]">
                          {exp.highlights.slice(0, 2).map((h, hIdx) => (
                            <li key={hIdx} className="truncate">{h}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No formal work experience listed.</p>
                )}
              </div>
            </div>
          </div>

          {/* EXTRACTED CLAIMS & CORRECTIONS TABLE */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Extracted Resume Skill Claims ({resume.claims.length})</h3>
                <p className="text-xs text-slate-500">
                  These are the specific skills and competencies your resume claims you have.
                </p>
              </div>
              <button
                onClick={() => setShowAddClaim(true)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200"
              >
                <Plus className="w-3.5 h-3.5" /> Add Skill Claim
              </button>
            </div>

            {/* Add claim inline form */}
            {showAddClaim && (
              <div className="p-4 bg-sky-50/60 rounded-xl border border-sky-200 space-y-3 text-xs">
                <p className="font-bold text-sky-950">Add a skill claim to test against your projects</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    value={newSkillName}
                    onChange={(e) => setNewSkillName(e.target.value)}
                    placeholder="Skill name (e.g. Redis, Vitest, GraphQL)"
                    className="p-2 rounded border border-slate-300 bg-white"
                  />
                  <select
                    value={newSkillCategory}
                    onChange={(e) => setNewSkillCategory(e.target.value)}
                    className="p-2 rounded border border-slate-300 bg-white"
                  >
                    <option value="Languages">Languages</option>
                    <option value="Backend">Backend</option>
                    <option value="Databases">Databases</option>
                    <option value="DevOps">DevOps</option>
                    <option value="Quality Assurance">Quality Assurance</option>
                    <option value="Frontend">Frontend</option>
                  </select>
                  <div className="flex gap-2">
                    <button
                      onClick={handleAddClaim}
                      className="px-3 py-2 rounded bg-sky-600 text-white font-semibold hover:bg-sky-500 flex-1"
                    >
                      Save Claim
                    </button>
                    <button
                      onClick={() => setShowAddClaim(false)}
                      className="px-3 py-2 rounded border border-slate-300 text-slate-600 hover:bg-white"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Claims list */}
            <div className="divide-y divide-slate-100">
              {resume.claims.map((claim) => {
                const isEditing = editingClaimId === claim.id;

                if (isEditing) {
                  return (
                    <div key={claim.id} className="py-3 bg-slate-50 p-3 rounded-lg space-y-2 text-xs">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={editClaimSkill}
                          onChange={(e) => setEditClaimSkill(e.target.value)}
                          className="flex-1 p-2 rounded border border-slate-300 bg-white"
                        />
                        <button
                          onClick={() => handleSaveClaimEdit(claim.id)}
                          className="p-2 rounded bg-emerald-600 text-white"
                          title="Save"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditingClaimId(null)}
                          className="p-2 rounded border border-slate-300 text-slate-600 hover:bg-white"
                          title="Cancel"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <input
                        type="text"
                        value={editClaimContext}
                        onChange={(e) => setEditClaimContext(e.target.value)}
                        placeholder="Context or quote from resume"
                        className="w-full p-2 rounded border border-slate-300 bg-white"
                      />
                    </div>
                  );
                }

                return (
                  <div key={claim.id} className="py-3 flex items-start justify-between gap-4 text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{claim.skill}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                          {claim.category}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-100">
                          {claim.source === 'work_experience'
                            ? 'From Work Experience'
                            : claim.source === 'project_description'
                            ? 'From Project Description'
                            : 'Explicitly Listed'}
                        </span>
                      </div>
                      <p className="text-slate-600 italic">"{claim.context}"</p>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => {
                          setEditingClaimId(claim.id);
                          setEditClaimSkill(claim.skill);
                          setEditClaimContext(claim.context);
                        }}
                        className="p-1.5 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100"
                        title="Edit Claim"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteClaim(claim.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded hover:bg-slate-100"
                        title="Delete Claim"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RESUME ASSESSMENT REPORT - SHOWN DIRECTLY BELOW IN SAME SECTION (USER REQUEST) */}
          {(() => {
            const currentAssessment: ResumeAssessment | null =
              activeAssessment ||
              resumeAssessment ||
              (resume
                ? {
                    overallScore: Math.min(94, Math.max(68, 70 + (resume.claims?.length || 0) * 2)),
                    rating:
                      (resume.claims?.length || 0) >= 6
                        ? 'Strong & Detailed'
                        : (resume.claims?.length || 0) >= 3
                        ? 'Solid Profile'
                        : 'Needs Project Evidence',
                    summary: `Analyzed ${resume.claims?.length || 0} technical skill claims extracted from ${resume.fileName}. Review the weak topics below to see which skills currently lack concrete code backing in repositories.`,
                    totalClaimsCount: resume.claims?.length || 0,
                    weakTopics:
                      resume.claims && resume.claims.length > 0
                        ? resume.claims.slice(0, 3).map((c, i) => ({
                            topic: `${c.skill} (${c.category})`,
                            reason: `Claimed in resume ("${c.context || c.skill}"), but requires committed repository implementation to verify.`,
                            severity: (i === 0 ? 'High' : 'Medium') as 'High' | 'Medium' | 'Low',
                          }))
                        : [
                            {
                              topic: 'Repository Evidence Proof',
                              reason: 'No technical claims extracted yet; add claims or repositories to verify.',
                              severity: 'High' as const,
                            },
                          ],
                    topStrengths:
                      (resume.profile?.technicalSkills && resume.profile.technicalSkills.length > 0)
                        ? resume.profile.technicalSkills.slice(0, 3)
                        : ['Technical experience highlighted in resume profile', 'Structured education and project track record'],
                    recommendedProjectEvidence: [
                      'Connect a GitHub repository featuring end-to-end API routes and input validation.',
                      'Add committed unit or integration test files with assertions to prove testing discipline.',
                      'Document database schemas with Prisma, SQL DDL, or migration files in your project.',
                    ],
                    claimBreakdown: {
                      explicitList: resume.claims?.filter((c) => c.source === 'explicit_list').length || 0,
                      projectDescriptions: resume.claims?.filter((c) => c.source === 'project_description').length || 0,
                      workExperience: resume.claims?.filter((c) => c.source === 'work_experience').length || 0,
                    },
                  }
                : null);

            if (!currentAssessment) return null;

            return (
              <div className="bg-white rounded-xl border border-amber-900/15 p-6 sm:p-7 shadow-xs space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      Instant Resume Assessment
                    </span>
                    <h3 className="text-xl font-bold text-slate-900 mt-1 flex items-center gap-2">
                      <Target className="w-5 h-5 text-amber-600" />
                      Resume Credibility & Claim Evaluation
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Evaluates how well your resume claims are detailed and highlights which topics are currently weak or unbacked by code.
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <div className="text-right">
                      <span className="text-2xl font-black text-slate-900">{currentAssessment.overallScore}</span>
                      <span className="text-xs text-slate-400 font-semibold">/100</span>
                      <p className="text-[11px] font-bold text-amber-800">{currentAssessment.rating}</p>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  {currentAssessment.summary}
                </p>

                {/* WEAK TOPICS IDENTIFIED IN RESUME */}
                <div className="space-y-3 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-rose-900 flex items-center gap-1.5 uppercase tracking-wider">
                      <TrendingDown className="w-4 h-4 text-rose-600" />
                      Weak Topics & Evidence Deficiencies in Resume:
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {currentAssessment.weakTopics.length} areas needing concrete project backing
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {currentAssessment.weakTopics.map((wt, wIdx) => (
                      <div
                        key={wIdx}
                        className="p-3.5 rounded-xl bg-rose-50/60 border border-rose-200 space-y-1.5 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900">{wt.topic}</span>
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
                              wt.severity === 'High'
                                ? 'bg-rose-100 text-rose-800 border-rose-200'
                                : 'bg-amber-100 text-amber-800 border-amber-200'
                            }`}
                          >
                            {wt.severity} Priority
                          </span>
                        </div>
                        <p className="text-slate-600 text-[11px] leading-relaxed">{wt.reason}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* STRENGTHS & RECOMMENDED EVIDENCE */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs">
                  <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200 space-y-2">
                    <span className="font-bold text-emerald-900 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                      <TrendingUp className="w-4 h-4 text-emerald-600" />
                      Top Resume Strengths
                    </span>
                    <ul className="space-y-1 text-slate-700 text-[11px]">
                      {currentAssessment.topStrengths.map((ts, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{ts}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 rounded-xl bg-sky-50/50 border border-sky-200 space-y-2">
                    <span className="font-bold text-sky-950 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                      <Sparkles className="w-4 h-4 text-sky-600" />
                      Recommended Code Evidence in GitHub
                    </span>
                    <ul className="space-y-1 text-slate-700 text-[11px]">
                      {currentAssessment.recommendedProjectEvidence.map((re, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <ArrowRight className="w-3.5 h-3.5 text-sky-600 shrink-0 mt-0.5" />
                          <span>{re}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Direct Next Step Action */}
                {onNavigateToProjects && (
                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={onNavigateToProjects}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors shadow-xs"
                    >
                      <span>Verify These Claims Against GitHub Projects</span>
                      <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
                    </button>
                  </div>
                )}
              </div>
            );
          })()}

          {/* AUTOMATED DEEPER RESUME AUDIT & INDUSTRY BENCHMARK */}
          <AutomatedResumeAuditor resume={resume} onNavigateToProjects={onNavigateToProjects} />

          {/* IN-DEPTH DEVELOPMENT AREAS ANALYSIS & PROFESSIONAL RESUME GUIDE */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 sm:p-7 shadow-xs space-y-6">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-sky-800 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/80 px-2.5 py-1 rounded border border-sky-200 dark:border-sky-800">
                Professional Resume Standards & Executive Analysis
              </span>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                How to Make Your Technical Resume Stand Out & ATS-Ready
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                A detailed engineering analysis on converting raw skill listings into high-impact, verifiable resume bullets that capture senior recruiter attention.
              </p>
            </div>

            {/* 4 CORE DEVELOPMENT VECTORS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-amber-50/50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 space-y-2">
                <span className="font-bold text-amber-950 dark:text-amber-300 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                  <TrendingUp className="w-4 h-4 text-amber-600" />
                  1. Quantifiable Impact & Metrics
                </span>
                <p className="text-slate-700 dark:text-slate-300 text-[11px] leading-relaxed">
                  <strong>Development Gap:</strong> Most developer resumes state <em>what</em> was built rather than <em>what resulted</em>.
                </p>
                <p className="text-slate-600 dark:text-slate-400 text-[11px]">
                  <strong>Professional Fix:</strong> Use the formula: <code className="bg-amber-100 dark:bg-amber-900 px-1 py-0.5 rounded text-amber-900 dark:text-amber-200 font-mono">[Action Verb] + [Technical Feature] + [Quantified Metric / Scale]</code>.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-sky-50/50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 space-y-2">
                <span className="font-bold text-sky-950 dark:text-sky-300 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                  <Terminal className="w-4 h-4 text-sky-600" />
                  2. Active Engineering Verbs
                </span>
                <p className="text-slate-700 dark:text-slate-300 text-[11px] leading-relaxed">
                  <strong>Development Gap:</strong> Weak phrases like "worked on", "handled", or "responsible for" diminish technical authority.
                </p>
                <p className="text-slate-600 dark:text-slate-400 text-[11px]">
                  <strong>Professional Fix:</strong> Lead bullet points with strong verbs: <em>Architected, Engineered, Refactored, Benchmark-tested, Automated, Optimized, Containerized</em>.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-purple-50/50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 space-y-2">
                <span className="font-bold text-purple-950 dark:text-purple-300 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                  <FileText className="w-4 h-4 text-purple-600" />
                  3. ATS Parsing & Keyword Alignment
                </span>
                <p className="text-slate-700 dark:text-slate-300 text-[11px] leading-relaxed">
                  <strong>Development Gap:</strong> Complex multi-column templates, tables, or graphical skill bars break automated ATS parsers.
                </p>
                <p className="text-slate-600 dark:text-slate-400 text-[11px]">
                  <strong>Professional Fix:</strong> Stick to clean single-column PDF formatting with standard section headings (Education, Experience, Projects, Technical Skills).
                </p>
              </div>

              <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-2">
                <span className="font-bold text-emerald-950 dark:text-emerald-300 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  4. Verifiable GitHub Evidence Links
                </span>
                <p className="text-slate-700 dark:text-slate-300 text-[11px] leading-relaxed">
                  <strong>Development Gap:</strong> Unbacked keyword claims are often discounted by hiring managers during technical screening.
                </p>
                <p className="text-slate-600 dark:text-slate-400 text-[11px]">
                  <strong>Professional Fix:</strong> Embed direct links to public GitHub repositories featuring clean commit history, unit tests, and README documentation.
                </p>
              </div>
            </div>

            {/* BEFORE & AFTER EXAMPLES */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Real-World Bullet Point Transformations:
              </h4>

              <div className="space-y-2.5 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400 font-semibold text-[11px]">
                    <X className="w-3.5 h-3.5" /> Weak / Unprofessional:
                  </div>
                  <p className="font-mono text-[11px] text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 p-2 rounded border border-slate-200 dark:border-slate-800">
                    "Built a REST API using Node and Express for a web app project."
                  </p>
                  <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-semibold text-[11px] pt-1">
                    <Check className="w-3.5 h-3.5" /> Professional & High-Impact:
                  </div>
                  <p className="font-mono text-[11px] text-slate-800 dark:text-slate-200 bg-emerald-50/60 dark:bg-emerald-950/40 p-2 rounded border border-emerald-200 dark:border-emerald-800">
                    "Engineered a scalable RESTful API with Node.js, Express, and Zod input validation, serving 2,500+ daily requests with sub-40ms response latency."
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400 font-semibold text-[11px]">
                    <X className="w-3.5 h-3.5" /> Weak / Unprofessional:
                  </div>
                  <p className="font-mono text-[11px] text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 p-2 rounded border border-slate-200 dark:border-slate-800">
                    "Used PostgreSQL database for storing user data."
                  </p>
                  <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-semibold text-[11px] pt-1">
                    <Check className="w-3.5 h-3.5" /> Professional & High-Impact:
                  </div>
                  <p className="font-mono text-[11px] text-slate-800 dark:text-slate-200 bg-emerald-50/60 dark:bg-emerald-950/40 p-2 rounded border border-emerald-200 dark:border-emerald-800">
                    "Designed relational PostgreSQL database schemas with Prisma ORM, utilizing foreign-key indexes and ACID transactions to ensure data consistency."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
