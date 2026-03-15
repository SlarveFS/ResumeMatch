import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { TEMPLATES, DEFAULT_RESUME_DATA } from '../utils/templates';
import { saveResumeData } from '../utils/storage';
import './Builder.css';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

// Merge Claude's extracted data with DEFAULT_RESUME_DATA structure,
// adding UUIDs to array entries that need them.
function mergeExtractedData(extracted) {
  return {
    ...DEFAULT_RESUME_DATA,
    personalInfo: {
      ...DEFAULT_RESUME_DATA.personalInfo,
      ...(extracted.personalInfo || {}),
    },
    summary: extracted.summary || '',
    experience: (extracted.experience || []).map(job => ({
      id: crypto.randomUUID(),
      jobTitle: job.jobTitle || '',
      company: job.company || '',
      location: job.location || '',
      startDate: job.startDate || '',
      endDate: job.endDate || '',
      current: job.current || false,
      bullets: Array.isArray(job.bullets) && job.bullets.length ? job.bullets : [''],
    })),
    education: (extracted.education || []).map(ed => ({
      id: crypto.randomUUID(),
      degree: ed.degree || '',
      school: ed.school || '',
      location: ed.location || '',
      graduationDate: ed.graduationDate || '',
      gpa: ed.gpa || '',
      honors: ed.honors || '',
      coursework: ed.coursework || '',
    })),
    skills: {
      ...DEFAULT_RESUME_DATA.skills,
      ...(extracted.skills || {}),
    },
    projects: (extracted.projects || []).map(proj => ({
      id: crypto.randomUUID(),
      name: proj.name || '',
      description: proj.description || '',
      technologies: Array.isArray(proj.technologies) ? proj.technologies : [],
      link: proj.link || '',
      bullets: Array.isArray(proj.bullets) && proj.bullets.length ? proj.bullets : [''],
    })),
    certifications: extracted.certifications || [],
    customSections: [],
    sectionOrder: DEFAULT_RESUME_DATA.sectionOrder,
    hiddenSections: [],
  };
}

const PROCESSING_STEPS = [
  { icon: '📖', text: 'Reading your resume…' },
  { icon: '🔍', text: 'Extracting your information…' },
  { icon: '✨', text: 'Pre-filling your builder…' },
];

// ── Template preview mockup ─────────────────────────────────────────────

function TemplatePreviewMockup({ template }) {
  return (
    <div className={`mockup mockup-${template.id}`} style={{ '--accent': template.accent }}>
      <div className="mockup-header" style={{ background: template.accent }}></div>
      <div className="mockup-body">
        <div className="mockup-line mockup-line-wide"></div>
        <div className="mockup-line mockup-line-medium"></div>
        <div className="mockup-spacer"></div>
        <div className="mockup-line mockup-line-wide"></div>
        <div className="mockup-line mockup-line-narrow"></div>
        <div className="mockup-line mockup-line-medium"></div>
        <div className="mockup-spacer"></div>
        <div className="mockup-line mockup-line-wide"></div>
        <div className="mockup-line mockup-line-narrow"></div>
        <div className="mockup-line mockup-line-medium"></div>
      </div>
    </div>
  );
}

// ── Main component ──────────────────────────────────────────────────────

function Builder() {
  const navigate = useNavigate();

  // Step machine: 'path' | 'upload' | 'processing' | 'template'
  const [step, setStep] = useState('path');
  const [selectedPath, setSelectedPath] = useState(null); // 'scratch' | 'import'
  const [selectedTemplate, setSelectedTemplate] = useState('classic');

  // Upload step state
  const [uploadedFile, setUploadedFile] = useState(null);
  const [pdfText, setPdfText] = useState('');
  const [pasteText, setPasteText] = useState('');
  const [pdfLoading, setPdfLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef(null);

  // Processing step state
  const [processingStepIdx, setProcessingStepIdx] = useState(0);
  const [extractedData, setExtractedData] = useState(null);

  // Advance the visual processing steps while extraction runs
  useEffect(() => {
    if (step !== 'processing') return;
    const t1 = setTimeout(() => setProcessingStepIdx(1), 1100);
    const t2 = setTimeout(() => setProcessingStepIdx(2), 2300);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [step]);

  // ── PDF extraction ────────────────────────────────────────────────────

  const extractPdf = async (file) => {
    setPdfLoading(true);
    setPdfText('');
    setUploadError('');
    try {
      const arrayBuffer = await file.arrayBuffer();
      const doc = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
      let text = '';
      for (let i = 1; i <= doc.numPages; i++) {
        const page = await doc.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map(item => item.str).join(' ') + '\n';
        page.cleanup();
      }
      await doc.destroy();
      setPdfText(text.trim());
    } catch {
      setUploadError('Could not read this PDF. Try pasting your resume text instead.');
      setUploadedFile(null);
    } finally {
      setPdfLoading(false);
    }
  };

  const handleFileSelect = (file) => {
    if (!file) return;
    if (file.type !== 'application/pdf') {
      setUploadError('Only PDF files are supported. Please paste your resume text below instead.');
      return;
    }
    setUploadedFile(file);
    extractPdf(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files[0]);
  };

  const handleDragOver = (e) => { e.preventDefault(); setDragOver(true); };
  const handleDragLeave = () => setDragOver(false);

  const handleZoneClick = () => {
    if (!uploadedFile) fileInputRef.current?.click();
  };

  const handleFileInputChange = (e) => {
    handleFileSelect(e.target.files[0]);
    e.target.value = '';
  };

  const handleClearFile = () => {
    setUploadedFile(null);
    setPdfText('');
  };

  // ── Extraction trigger ────────────────────────────────────────────────

  const handleExtract = async () => {
    const resumeText = pdfText || pasteText.trim();
    if (!resumeText) return;

    setStep('processing');
    setProcessingStepIdx(0);
    setExtractedData(null);

    const [apiResult] = await Promise.all([
      // Run API call
      fetch('/api/extract-resume-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: resumeText }),
      })
        .then(r => r.json())
        .catch(() => null),
      // Minimum 3s so all 3 animation steps are visible
      new Promise(r => setTimeout(r, 3000)),
    ]);

    if (apiResult?.resumeData) {
      setExtractedData(apiResult.resumeData);
    }
    // Always proceed to template selection even if extraction failed
    setStep('template');
  };

  // ── Start building ────────────────────────────────────────────────────

  const handleStartBuilding = () => {
    let baseData;
    if (selectedPath === 'import' && extractedData) {
      baseData = mergeExtractedData(extractedData);
    } else {
      baseData = { ...DEFAULT_RESUME_DATA };
    }

    saveResumeData({
      ...baseData,
      selectedTemplate,
      importedResume: selectedPath === 'import' && !!extractedData,
    });
    navigate('/builder/edit');
  };

  // ── Path selection ────────────────────────────────────────────────────

  if (step === 'path') {
    return (
      <div className="builder-page">
        <div className="builder-page-inner">
          <div className="builder-page-header">
            <h1>Build Your Resume</h1>
            <p>How would you like to get started?</p>
          </div>
          <div className="path-cards">
            <button
              className="path-card"
              onClick={() => { setSelectedPath('scratch'); setStep('template'); }}
            >
              <div className="path-card-icon">✨</div>
              <h2>Start from scratch</h2>
              <p>Fill in your information with AI assistance to craft the perfect resume.</p>
              <span className="path-card-action">Get started →</span>
            </button>
            <button
              className="path-card path-card-import"
              onClick={() => { setSelectedPath('import'); setStep('upload'); }}
            >
              <div className="path-card-icon">📄</div>
              <h2>Import & improve</h2>
              <p>Upload your existing resume — AI extracts your data and pre-fills the builder instantly.</p>
              <span className="path-card-action">Upload resume →</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Upload step ───────────────────────────────────────────────────────

  if (step === 'upload') {
    const hasContent = pdfText || pasteText.trim();

    return (
      <div className="builder-page">
        <div className="builder-page-inner builder-page-inner--narrow">
          <button className="builder-back-btn" onClick={() => setStep('path')}>← Back</button>

          <div className="builder-page-header">
            <h1>Upload Your Resume</h1>
            <p>We'll extract your information and pre-fill the builder so you can improve it with AI.</p>
          </div>

          {/* Drop zone */}
          <div
            className={`import-drop-zone ${dragOver ? 'drag-over' : ''} ${uploadedFile ? 'has-file' : ''}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={handleZoneClick}
            style={{ cursor: uploadedFile ? 'default' : 'pointer' }}
          >
            {pdfLoading ? (
              <div className="import-drop-inner">
                <div className="import-spinner"></div>
                <p>Reading your PDF…</p>
              </div>
            ) : uploadedFile ? (
              <div className="import-drop-inner">
                <div className="import-file-success">
                  <span className="import-file-icon">✅</span>
                  <div>
                    <p className="import-file-name">{uploadedFile.name}</p>
                    <p className="import-file-sub">PDF loaded — {pdfText.length.toLocaleString()} characters extracted</p>
                  </div>
                </div>
                <button
                  className="import-clear-btn"
                  onClick={e => { e.stopPropagation(); handleClearFile(); }}
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="import-drop-inner">
                <div className="import-drop-icon">☁</div>
                <p className="import-drop-title">Drop your resume here</p>
                <p className="import-drop-sub">or click to browse · PDF supported</p>
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            style={{ display: 'none' }}
            onChange={handleFileInputChange}
          />

          {uploadError && (
            <p className="import-error">{uploadError}</p>
          )}

          {/* OR divider */}
          <div className="import-divider"><span>or paste your resume text</span></div>

          {/* Paste fallback */}
          <textarea
            className="import-paste-area"
            value={pasteText}
            onChange={e => setPasteText(e.target.value)}
            placeholder="Paste the full text of your resume here..."
            rows={8}
          />

          {/* Extract button */}
          <button
            className="import-extract-btn"
            onClick={handleExtract}
            disabled={!hasContent || pdfLoading}
          >
            ✨ Extract & Continue
          </button>
        </div>
      </div>
    );
  }

  // ── Processing step ───────────────────────────────────────────────────

  if (step === 'processing') {
    return (
      <div className="builder-page">
        <div className="builder-page-inner builder-page-inner--narrow">
          <div className="processing-screen">
            <div className="processing-spinner-ring"></div>
            <div className="processing-steps">
              {PROCESSING_STEPS.map((s, i) => (
                <div
                  key={i}
                  className={`processing-step ${
                    i < processingStepIdx ? 'done' :
                    i === processingStepIdx ? 'active' : 'pending'
                  }`}
                >
                  <span className="processing-step-icon">
                    {i < processingStepIdx ? '✓' : s.icon}
                  </span>
                  <span className="processing-step-text">{s.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Template selection step ───────────────────────────────────────────

  return (
    <div className="builder-page">
      <div className="builder-page-inner">
        <div className="builder-page-header">
          {selectedPath === 'import' && extractedData && (
            <div className="template-import-success">
              ✅ Resume imported! Now choose a template to display your information.
            </div>
          )}
          {selectedPath === 'import' && !extractedData && (
            <div className="template-import-warning">
              ⚠️ Extraction returned limited data. You can still fill in the editor manually.
            </div>
          )}
          <button className="builder-back-btn" onClick={() => setStep(selectedPath === 'import' ? 'upload' : 'path')}>← Back</button>
          <h1>Choose a Template</h1>
          <p>Select a layout that fits your industry and style.</p>
        </div>

        <div className="template-grid">
          {TEMPLATES.map((tpl) => (
            <button
              key={tpl.id}
              className={`template-card ${selectedTemplate === tpl.id ? 'selected' : ''}`}
              onClick={() => setSelectedTemplate(tpl.id)}
            >
              <div className="template-preview" style={{ borderTop: `4px solid ${tpl.accent}` }}>
                <TemplatePreviewMockup template={tpl} />
              </div>
              <div className="template-card-info">
                <h3>{tpl.name}</h3>
                <p>{tpl.description}</p>
                <div className="template-tags">
                  {tpl.bestFor.map(tag => (
                    <span key={tag} className="template-tag">{tag}</span>
                  ))}
                </div>
              </div>
              {selectedTemplate === tpl.id && (
                <div className="template-selected-check">✓ Selected</div>
              )}
            </button>
          ))}
        </div>

        <div className="builder-page-footer">
          <button className="start-building-btn" onClick={handleStartBuilding}>
            {selectedPath === 'import' && extractedData
              ? 'Open My Resume →'
              : 'Start Building →'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Builder;
