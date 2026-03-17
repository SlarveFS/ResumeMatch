import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getResumes, getCoverLetterById, saveCoverLetter } from '../utils/storage';
import { exportResumeToPDF } from '../utils/pdfExport';
import { TEMPLATES } from '../utils/templates';
import AILoadingScreen from '../components/common/AILoadingScreen';
import './CoverLetter.css';

// ── Helpers ──────────────────────────────────────────────────────────────────

const TONES = ['Professional', 'Enthusiastic', 'Confident', 'Creative'];

const SECTION_META = [
  { key: 'greeting', label: 'Greeting',  rows: 2,  hint: 'e.g. Dear Hiring Manager,' },
  { key: 'opening',  label: 'Opening',   rows: 4,  hint: 'Introduce yourself and express enthusiasm.' },
  { key: 'body',     label: 'Body',      rows: 6,  hint: 'Highlight your most relevant experience.' },
  { key: 'closing',  label: 'Closing',   rows: 3,  hint: 'Call to action and next steps.' },
  { key: 'signoff',  label: 'Sign-off',  rows: 2,  hint: 'e.g. Sincerely,' },
];

const ACCENT_HEADER_TPLS = new Set(['bold', 'creative', 'vivid', 'developer', 'executive', 'timeline']);

function getTemplateAccent(data) {
  const tpl = TEMPLATES.find(t => t.id === data?.selectedTemplate);
  return data?.design?.accentColor || tpl?.accent || '#2E5A88';
}

function getFontClass(data) {
  const f = data?.design?.fontFamily;
  if (!f || f === 'Inter') return '';
  return `rp-font-${f.toLowerCase().replace(/\s+/g, '-')}`;
}

function buildContactLine(pi) {
  return [pi.email, pi.phone, pi.location, pi.linkedin, pi.github]
    .filter(Boolean).join(' · ');
}

function todayFormatted() {
  return new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

// ── Cover Letter Paper ───────────────────────────────────────────────────────

function CoverLetterPaper({ resumeData, content, companyName, hiringManagerName, paperRef }) {
  const pi = resumeData?.personalInfo || {};
  const accent = getTemplateAccent(resumeData);
  const fontClass = getFontClass(resumeData);
  const tplId = resumeData?.selectedTemplate || 'classic';
  const useAccentHeader = ACCENT_HEADER_TPLS.has(tplId);
  const contactLine = buildContactLine(pi);

  return (
    <div
      className={`cl-paper ${fontClass}`}
      ref={paperRef}
      style={{ '--rp-accent': accent }}
    >
      {useAccentHeader ? (
        <div className="cl-header cl-header-accent" style={{ background: accent }}>
          {pi.fullName && <h1 className="cl-name cl-name-light">{pi.fullName}</h1>}
          {contactLine && <div className="cl-contact cl-contact-light">{contactLine}</div>}
        </div>
      ) : (
        <div className="cl-header cl-header-classic">
          {pi.fullName && <h1 className="cl-name">{pi.fullName}</h1>}
          {contactLine && <div className="cl-contact">{contactLine}</div>}
          <div className="cl-header-rule" />
        </div>
      )}

      <div className="cl-letter-body">
        <p className="cl-date">{todayFormatted()}</p>

        {(companyName || hiringManagerName) && (
          <div className="cl-recipient">
            {hiringManagerName && <p>{hiringManagerName}</p>}
            {companyName && <p>{companyName}</p>}
          </div>
        )}

        {content.greeting && <p className="cl-greeting">{content.greeting}</p>}
        {content.opening  && <p className="cl-para">{content.opening}</p>}
        {content.body     && <p className="cl-para">{content.body}</p>}
        {content.closing  && <p className="cl-para">{content.closing}</p>}

        <div className="cl-signoff-block">
          <p className="cl-signoff-line">{content.signoff || 'Sincerely,'}</p>
          {pi.fullName && <p className="cl-sig-name">{pi.fullName}</p>}
        </div>
      </div>
    </div>
  );
}

// ── Section Editor ───────────────────────────────────────────────────────────

function SectionEditor({ meta, value, onChange, onRegenerate, regenerating }) {
  return (
    <div className="cl-section-editor">
      <div className="cl-section-header">
        <label className="cl-section-label">{meta.label}</label>
        <button
          className={`cl-regen-btn ${regenerating ? 'loading' : ''}`}
          onClick={() => onRegenerate(meta.key)}
          disabled={regenerating}
        >
          {regenerating ? '…' : '↻ Regenerate'}
        </button>
      </div>
      <textarea
        className="cl-section-textarea"
        rows={meta.rows}
        value={value}
        onChange={e => onChange(meta.key, e.target.value)}
        placeholder={meta.hint}
      />
    </div>
  );
}

// ── Setup Step ───────────────────────────────────────────────────────────────

function SetupStep({ resumes, selectedResumeId, setSelectedResumeId, jobDescription,
  setJobDescription, companyName, setCompanyName, hiringManagerName, setHiringManagerName,
  tone, setTone, onGenerate, generating }) {

  const canGenerate = jobDescription.trim().length > 30;

  return (
    <div className="cl-setup-page">
      <div className="cl-setup-inner">
        <div className="cl-setup-header">
          <h1>Cover Letter Builder</h1>
          <p>AI-generated cover letters that match your resume's style — free and unlimited.</p>
        </div>

        <div className="cl-setup-form">
          <div className="cl-field">
            <label className="cl-label">Resume to draw from</label>
            {resumes.length === 0 ? (
              <p className="cl-field-note">
                No saved resumes yet. <a href="/builder" className="cl-link">Create one first →</a>
              </p>
            ) : (
              <div className="cl-resume-options">
                {resumes.map(r => (
                  <button
                    key={r.id}
                    className={`cl-resume-opt ${selectedResumeId === r.id ? 'selected' : ''}`}
                    onClick={() => setSelectedResumeId(r.id)}
                  >
                    <span className="cl-resume-opt-dot" style={{ background: getTemplateAccent(r.data) }} />
                    <span className="cl-resume-opt-name">{r.name}</span>
                    {selectedResumeId === r.id && <span className="cl-resume-opt-check">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="cl-field-row">
            <div className="cl-field">
              <label className="cl-label">Company <span className="cl-optional">(optional)</span></label>
              <input className="cl-input" value={companyName}
                onChange={e => setCompanyName(e.target.value)} placeholder="e.g. Acme Corp" />
            </div>
            <div className="cl-field">
              <label className="cl-label">Hiring manager <span className="cl-optional">(optional)</span></label>
              <input className="cl-input" value={hiringManagerName}
                onChange={e => setHiringManagerName(e.target.value)} placeholder="e.g. Jane Smith" />
            </div>
          </div>

          <div className="cl-field">
            <label className="cl-label">Tone</label>
            <div className="cl-tone-btns">
              {TONES.map(t => (
                <button
                  key={t}
                  className={`cl-tone-btn ${tone === t ? 'active' : ''}`}
                  onClick={() => setTone(t)}
                >{t}</button>
              ))}
            </div>
          </div>

          <div className="cl-field">
            <label className="cl-label">Job description <span className="cl-required">*</span></label>
            <textarea
              className="cl-textarea"
              rows={10}
              value={jobDescription}
              onChange={e => setJobDescription(e.target.value)}
              placeholder="Paste the full job description here. The more detail you include, the better your cover letter will match the role."
            />
          </div>

          {generating ? (
            <AILoadingScreen message="Generating your cover letter…" />
          ) : (
            <button className="cl-generate-btn" onClick={onGenerate} disabled={!canGenerate}>
              ✨ Generate Cover Letter
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────

export default function CoverLetter() {
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('id');

  const [step, setStep] = useState('setup');
  const [resumes, setResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [hiringManagerName, setHiringManagerName] = useState('');
  const [tone, setTone] = useState('Professional');
  const [content, setContent] = useState({ greeting: '', opening: '', body: '', closing: '', signoff: '' });
  const [generating, setGenerating] = useState(false);
  const [regenerating, setRegenerating] = useState(null);
  const [currentId, setCurrentId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);

  const paperRef = useRef(null);
  const saveTimer = useRef(null);

  useEffect(() => {
    const savedResumes = getResumes();
    setResumes(savedResumes);

    if (editId) {
      const cl = getCoverLetterById(editId);
      if (cl) {
        setSelectedResumeId(cl.resumeId || '');
        setJobDescription(cl.jobDescription || '');
        setCompanyName(cl.companyName || '');
        setHiringManagerName(cl.hiringManagerName || '');
        setTone(cl.tone || 'Professional');
        setContent(cl.content || {});
        setCurrentId(cl.id);
        setStep('builder');
        return;
      }
    }
    if (savedResumes.length > 0) setSelectedResumeId(savedResumes[0].id);
  }, [editId]);

  // Debounced auto-save in builder mode
  useEffect(() => {
    if (step !== 'builder' || !content.opening) return;
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => doSave(true), 3000);
    return () => clearTimeout(saveTimer.current);
  }, [content, step]);

  const selectedResume = resumes.find(r => r.id === selectedResumeId);
  const resumeData = selectedResume?.data || null;

  const doSave = useCallback((silent = false) => {
    if (!silent) setSaving(true);
    const id = currentId || (() => {
      const newId = crypto.randomUUID();
      setCurrentId(newId);
      return newId;
    })();
    saveCoverLetter({
      id,
      name: companyName
        ? `Cover Letter — ${companyName}`
        : `Cover Letter${selectedResume ? ` for ${selectedResume.name}` : ''}`,
      resumeId: selectedResumeId,
      resumeName: selectedResume?.name || '',
      jobDescription,
      companyName,
      hiringManagerName,
      tone,
      content,
    });
    if (!silent) setTimeout(() => setSaving(false), 600);
  }, [currentId, companyName, selectedResumeId, selectedResume, jobDescription, hiringManagerName, tone, content]);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await fetch('/api/generate-cover-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeData, jobDescription, companyName, hiringManagerName, tone }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setContent(data);
      setStep('builder');
    } catch (e) {
      console.error(e);
      alert('Failed to generate. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleRegenerate = async (section) => {
    setRegenerating(section);
    try {
      const res = await fetch('/api/generate-cover-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeData, jobDescription, companyName, hiringManagerName, tone, section, existingContent: content }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setContent(prev => ({ ...prev, ...data }));
    } catch (e) {
      console.error(e);
    } finally {
      setRegenerating(null);
    }
  };

  const handleExport = async () => {
    if (!paperRef.current) return;
    setExporting(true);
    try {
      await exportResumeToPDF(paperRef.current, resumeData?.personalInfo?.fullName || companyName || '', 'cover-letter');
    } catch (e) { console.error(e); }
    finally { setExporting(false); }
  };

  const handleChange = useCallback((key, val) => {
    setContent(prev => ({ ...prev, [key]: val }));
  }, []);

  // ── Setup step ──────────────────────────────────────────────────────────────
  if (step === 'setup') {
    return (
      <SetupStep
        resumes={resumes}
        selectedResumeId={selectedResumeId} setSelectedResumeId={setSelectedResumeId}
        jobDescription={jobDescription} setJobDescription={setJobDescription}
        companyName={companyName} setCompanyName={setCompanyName}
        hiringManagerName={hiringManagerName} setHiringManagerName={setHiringManagerName}
        tone={tone} setTone={setTone}
        onGenerate={handleGenerate} generating={generating}
      />
    );
  }

  // ── Builder step ────────────────────────────────────────────────────────────
  return (
    <div className="cl-builder-layout">
      {/* Left panel */}
      <div className="cl-editor-panel">
        <div className="cl-editor-topbar">
          <button className="cl-back-btn" onClick={() => setStep('setup')}>← Edit Setup</button>
          <div className="cl-tone-pills">
            {TONES.map(t => (
              <button
                key={t}
                className={`cl-tone-pill ${tone === t ? 'active' : ''}`}
                onClick={() => setTone(t)}
              >{t}</button>
            ))}
          </div>
        </div>

        {(companyName || hiringManagerName) && (
          <div className="cl-context-strip">
            {companyName && <span className="cl-ctx-chip">🏢 {companyName}</span>}
            {hiringManagerName && <span className="cl-ctx-chip">👤 {hiringManagerName}</span>}
          </div>
        )}

        <div className="cl-sections">
          {SECTION_META.map(meta => (
            <SectionEditor
              key={meta.key}
              meta={meta}
              value={content[meta.key] || ''}
              onChange={handleChange}
              onRegenerate={handleRegenerate}
              regenerating={regenerating === meta.key}
            />
          ))}
        </div>

        <div className="cl-editor-actions">
          <button className="cl-action-btn cl-save-btn" onClick={() => doSave(false)} disabled={saving}>
            {saving ? 'Saving…' : '💾 Save'}
          </button>
          <button className="cl-action-btn cl-export-btn" onClick={handleExport} disabled={exporting}>
            {exporting ? 'Exporting…' : '↓ Download PDF'}
          </button>
        </div>
      </div>

      {/* Right panel — live preview */}
      <div className="cl-preview-panel">
        <div className="cl-preview-label">Live Preview</div>
        <div className="cl-preview-scroll">
          <CoverLetterPaper
            resumeData={resumeData}
            content={content}
            companyName={companyName}
            hiringManagerName={hiringManagerName}
            paperRef={paperRef}
          />
        </div>
      </div>
    </div>
  );
}
