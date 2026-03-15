import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadResumeData, saveResumeData } from '../utils/storage';
import { DEFAULT_RESUME_DATA, TEMPLATES } from '../utils/templates';
import { exportResumeToPDF } from '../utils/pdfExport';
import PersonalInfoSection from '../components/builder/sections/PersonalInfoSection';
import SummarySection from '../components/builder/sections/SummarySection';
import ExperienceSection from '../components/builder/sections/ExperienceSection';
import EducationSection from '../components/builder/sections/EducationSection';
import SkillsSection from '../components/builder/sections/SkillsSection';
import ProjectsSection from '../components/builder/sections/ProjectsSection';
import LivePreview from '../components/builder/LivePreview';
import './Editor.css';

function Editor() {
  const navigate = useNavigate();
  const [resumeData, setResumeData] = useState(DEFAULT_RESUME_DATA);
  const [lastSaved, setLastSaved] = useState(null);
  const [activeSection, setActiveSection] = useState('personal');
  const [isExporting, setIsExporting] = useState(false);
  const [showImportBanner, setShowImportBanner] = useState(false);
  const saveTimer = useRef(null);
  const paperRef = useRef(null);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = loadResumeData();
    if (saved) {
      if (saved.importedResume) {
        setShowImportBanner(true);
        // Clear the flag so it doesn't reappear on refresh
        const { importedResume, ...cleanData } = saved;
        setResumeData(cleanData);
        saveResumeData(cleanData);
      } else {
        setResumeData(saved);
      }
    }
  }, []);

  // Debounced auto-save
  const scheduleAutoSave = useCallback((data) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      saveResumeData(data);
      setLastSaved(new Date());
    }, 2000);
  }, []);

  const updateResumeData = useCallback((updates) => {
    setResumeData(prev => {
      const next = { ...prev, ...updates };
      scheduleAutoSave(next);
      return next;
    });
  }, [scheduleAutoSave]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, []);

  const handleExportPDF = async () => {
    if (!paperRef.current || isExporting) return;
    setIsExporting(true);
    try {
      await exportResumeToPDF(paperRef.current, resumeData.personalInfo.fullName);
    } catch (err) {
      console.error('PDF export failed:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const sections = [
    { id: 'personal', label: 'Personal Info', icon: '👤' },
    { id: 'summary', label: 'Summary', icon: '📝' },
    { id: 'experience', label: 'Experience', icon: '💼' },
    { id: 'education', label: 'Education', icon: '🎓' },
    { id: 'skills', label: 'Skills', icon: '⚡' },
    { id: 'projects', label: 'Projects', icon: '🚀' },
  ];

  const renderSection = () => {
    const props = { resumeData, updateResumeData };
    switch (activeSection) {
      case 'personal': return <PersonalInfoSection {...props} />;
      case 'summary': return <SummarySection {...props} />;
      case 'experience': return <ExperienceSection {...props} />;
      case 'education': return <EducationSection {...props} />;
      case 'skills': return <SkillsSection {...props} />;
      case 'projects': return <ProjectsSection {...props} />;
      default: return <PersonalInfoSection {...props} />;
    }
  };

  return (
    <div className="editor-page">
        {/* Import success banner */}
        {showImportBanner && (
          <div className="editor-import-banner">
            <span>✅ Resume imported! Review your information and use ✨ AI buttons to enhance your content.</span>
            <button className="editor-import-banner-close" onClick={() => setShowImportBanner(false)}>✕</button>
          </div>
        )}
      {/* Editor Header */}
      <div className="editor-header">
        <div className="editor-header-left">
          <button className="editor-back-btn" onClick={() => navigate('/builder')}>← Templates</button>
          <span className="editor-title">Resume Editor</span>
        </div>
        <div className="editor-header-right">
          {lastSaved && (
            <span className="editor-saved-indicator">
              Saved {lastSaved.toLocaleTimeString()}
            </span>
          )}
          <button
            className="editor-export-btn"
            onClick={handleExportPDF}
            disabled={isExporting}
            title="Download as PDF"
          >
            {isExporting ? (
              <><span className="editor-export-spinner" /> Generating…</>
            ) : (
              '⬇ Download PDF'
            )}
          </button>
        </div>
      </div>

      <div className="editor-layout">
        {/* Left Panel: Form */}
        <div className="editor-left">
          {/* Section Nav */}
          <div className="editor-section-nav">
            {sections.map(s => (
              <button
                key={s.id}
                className={`editor-section-tab ${activeSection === s.id ? 'active' : ''}`}
                onClick={() => setActiveSection(s.id)}
              >
                <span className="tab-icon">{s.icon}</span>
                <span className="tab-label">{s.label}</span>
              </button>
            ))}
          </div>

          {/* Section Content */}
          <div className="editor-section-content">
            {renderSection()}
          </div>
        </div>

        {/* Right Panel: Live Preview */}
        <div className="editor-right">
          <div className="editor-preview-header">
            <span>Live Preview</span>
            <div className="template-switcher">
              {TEMPLATES.map(t => {
                const isActive = resumeData.selectedTemplate === t.id;
                return (
                  <button
                    key={t.id}
                    className={`template-switcher-btn${isActive ? ' active' : ''}`}
                    onClick={() => updateResumeData({ selectedTemplate: t.id })}
                    title={t.description}
                    style={isActive ? {
                      borderColor: t.accent,
                      color: t.accent,
                      background: t.accent + '18',
                    } : {}}
                  >
                    <span
                      className="template-switcher-dot"
                      style={{ background: t.accent }}
                    />
                    {t.name}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="editor-preview-body">
            <LivePreview resumeData={resumeData} paperRef={paperRef} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Editor;
