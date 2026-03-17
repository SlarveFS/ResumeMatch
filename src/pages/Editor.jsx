import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { loadResumeData, saveResumeData, addResumeToStore } from '../utils/storage';
import { DEFAULT_RESUME_DATA, TEMPLATES } from '../utils/templates';
import { exportResumeToPDF } from '../utils/pdfExport';
import PersonalInfoSection from '../components/builder/sections/PersonalInfoSection';
import SummarySection from '../components/builder/sections/SummarySection';
import ExperienceSection from '../components/builder/sections/ExperienceSection';
import EducationSection from '../components/builder/sections/EducationSection';
import SkillsSection from '../components/builder/sections/SkillsSection';
import ProjectsSection from '../components/builder/sections/ProjectsSection';
import LivePreview from '../components/builder/LivePreview';
import CustomizePanel from '../components/customize/CustomizePanel';
import TailorPanel from '../components/tailoring/TailorPanel';
import TemplateThumbnail from '../components/common/TemplateThumbnail';
import './Editor.css';

function Editor() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [resumeData, setResumeData] = useState(DEFAULT_RESUME_DATA);
  const [lastSaved, setLastSaved] = useState(null);
  const [activeSection, setActiveSection] = useState('personal');
  const [panelMode, setPanelMode] = useState('edit'); // 'edit' | 'customize'
  const [isExporting, setIsExporting] = useState(false);
  const [showImportBanner, setShowImportBanner] = useState(false);
  const [showTailor, setShowTailor] = useState(false);
  const [tailorToast, setTailorToast] = useState('');
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
    if (searchParams.get('tailor') === '1') {
      setShowTailor(true);
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

  const handleTailorApply = useCallback((tailoredData) => {
    updateResumeData(tailoredData);
    setShowTailor(false);
  }, [updateResumeData]);

  const handleSaveVersion = useCallback((tailoredData) => {
    const name = (tailoredData.personalInfo?.fullName || 'Resume') + ' (Tailored)';
    addResumeToStore(tailoredData, name);
    setTailorToast('Saved as new version in your dashboard!');
    setTimeout(() => setTailorToast(''), 3500);
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
      {showTailor && (
        <TailorPanel
          resumeData={resumeData}
          onApply={handleTailorApply}
          onSaveVersion={handleSaveVersion}
          onClose={() => setShowTailor(false)}
        />
      )}
      {tailorToast && (
        <div className="editor-tailor-toast">{tailorToast}</div>
      )}
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
            className="editor-tailor-btn"
            onClick={() => setShowTailor(true)}
            title="Tailor resume to a job description"
          >
            ✨ Tailor
          </button>
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
        {/* Left Panel: Form or Customize */}
        <div className="editor-left">
          {/* Edit / Customize toggle */}
          <div className="editor-panel-toggle">
            <button
              className={`editor-panel-btn ${panelMode === 'edit' ? 'active' : ''}`}
              onClick={() => setPanelMode('edit')}
            >
              Edit Content
            </button>
            <button
              className={`editor-panel-btn ${panelMode === 'customize' ? 'active' : ''}`}
              onClick={() => setPanelMode('customize')}
            >
              Customize Design
            </button>
          </div>

          {panelMode === 'edit' ? (
            <>
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
            </>
          ) : (
            <CustomizePanel
              resumeData={resumeData}
              onChange={updateResumeData}
            />
          )}
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
                    style={isActive ? {
                      borderColor: t.accent,
                      color: t.accent,
                      background: t.accent + '18',
                    } : {}}
                  >
                    <span className="template-switcher-dot" style={{ background: t.accent }} />
                    {t.name}
                    <div className="ts-thumb-popup">
                      <TemplateThumbnail template={t} />
                    </div>
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
