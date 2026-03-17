import { useState } from 'react';
import { TEMPLATES } from '../../utils/templates';
import TemplateThumbnail from '../common/TemplateThumbnail';
import './CustomizePanel.css';

const ATS_SAFE = new Set(['classic', 'minimal', 'academic', 'compact', 'elegant', 'ats-strict', 'federal']);

const COLOR_PRESETS = [
  { label: 'Charcoal', value: '#1a1a1a' },
  { label: 'Blue',     value: '#2563eb' },
  { label: 'Teal',     value: '#0d9488' },
  { label: 'Green',    value: '#16a34a' },
  { label: 'Orange',   value: '#ea580c' },
  { label: 'Red',      value: '#dc2626' },
  { label: 'Purple',   value: '#7c3aed' },
  { label: 'Navy',     value: '#1e3a5f' },
];

const FONT_OPTIONS = [
  { label: 'Inter',        value: 'Inter',        category: 'sans' },
  { label: 'Roboto',       value: 'Roboto',        category: 'sans' },
  { label: 'Arial',        value: 'Arial',         category: 'sans' },
  { label: 'Verdana',      value: 'Verdana',       category: 'sans' },
  { label: 'Calibri',      value: 'Calibri',       category: 'sans' },
  { label: 'Georgia',      value: 'Georgia',       category: 'serif' },
  { label: 'Garamond',     value: 'Garamond',      category: 'serif' },
  { label: 'Merriweather', value: 'Merriweather',  category: 'serif' },
];

const LAYOUT_OPTIONS = [
  { label: 'Left',     value: 'left',     icon: '⬛◻◻' },
  { label: 'Centered', value: 'centered', icon: '◻⬛◻' },
  { label: 'Right',    value: 'right',    icon: '◻◻⬛' },
];

const SPACING_OPTIONS = [
  { label: 'Dense',  value: 'dense',  desc: 'More content per page' },
  { label: 'Normal', value: 'normal', desc: 'Balanced spacing' },
  { label: 'Loose',  value: 'loose',  desc: 'Airy & spacious' },
];

const TABS = ['Styles', 'Layout', 'Fonts', 'Colors'];

export default function CustomizePanel({ resumeData, onChange }) {
  const [activeTab, setActiveTab] = useState('Styles');
  const design = resumeData.design || {};
  const selectedTemplate = resumeData.selectedTemplate || 'classic';

  const updateDesign = (updates) => {
    onChange({ design: { ...design, ...updates } });
  };

  const renderStyles = () => (
    <div className="cp-section">
      <p className="cp-section-desc">Choose a template. ATS-safe templates work best with automated applicant tracking systems.</p>
      <div className="cp-template-grid">
        {TEMPLATES.map(t => {
          const isActive = selectedTemplate === t.id;
          return (
            <button
              key={t.id}
              className={`cp-template-card ${isActive ? 'active' : ''}`}
              onClick={() => onChange({ selectedTemplate: t.id })}
              style={isActive ? { '--card-accent': t.accent } : {}}
            >
              <div className="cp-template-preview" style={{ borderColor: isActive ? t.accent : undefined }}>
                <TemplateThumbnail template={t} />
                {isActive && <div className="cp-thumb-selected-overlay" />}
              </div>
              <div className="cp-template-info">
                <span className="cp-template-name">{t.name}</span>
                {ATS_SAFE.has(t.id) && (
                  <span className="cp-ats-badge" title="ATS-friendly single-column layout">ATS</span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );

  const renderLayout = () => (
    <div className="cp-section">
      <p className="cp-section-desc">Control the alignment of the resume header (name &amp; contact info).</p>
      <div className="cp-layout-options">
        {LAYOUT_OPTIONS.map(opt => {
          const isActive = (design.layout || 'centered') === opt.value;
          return (
            <button
              key={opt.value}
              className={`cp-layout-btn ${isActive ? 'active' : ''}`}
              onClick={() => updateDesign({ layout: opt.value })}
            >
              <span className="cp-layout-icon">{opt.icon}</span>
              <span className="cp-layout-label">{opt.label}</span>
            </button>
          );
        })}
      </div>

      <h3 className="cp-subsection-title" style={{ marginTop: '1.5rem' }}>Line Spacing</h3>
      <p className="cp-section-desc">Adjust the density of content on the page.</p>
      <div className="cp-spacing-options">
        {SPACING_OPTIONS.map(opt => {
          const isActive = (design.spacing || 'normal') === opt.value;
          return (
            <button
              key={opt.value}
              className={`cp-spacing-btn ${isActive ? 'active' : ''}`}
              onClick={() => updateDesign({ spacing: opt.value })}
            >
              <span className="cp-spacing-label">{opt.label}</span>
              <span className="cp-spacing-desc">{opt.desc}</span>
            </button>
          );
        })}
      </div>
    </div>
  );

  const renderFonts = () => (
    <div className="cp-section">
      <p className="cp-section-desc">Pick a font family for your resume text. Sans-serif fonts are generally more ATS-friendly.</p>
      <div className="cp-font-grid">
        {FONT_OPTIONS.map(f => {
          const isActive = (design.fontFamily || 'Inter') === f.value;
          return (
            <button
              key={f.value}
              className={`cp-font-card ${isActive ? 'active' : ''}`}
              onClick={() => updateDesign({ fontFamily: f.value })}
              style={{ fontFamily: `'${f.value}', ${f.category === 'serif' ? 'serif' : 'sans-serif'}` }}
            >
              <span className="cp-font-sample">Aa</span>
              <span className="cp-font-name">{f.label}</span>
              <span className="cp-font-cat">{f.category}</span>
            </button>
          );
        })}
      </div>
    </div>
  );

  const renderColors = () => (
    <div className="cp-section">
      <p className="cp-section-desc">Choose an accent color for headings, borders, and highlights. This overrides the template's default color.</p>
      <div className="cp-color-grid">
        {COLOR_PRESETS.map(c => {
          const isActive = design.accentColor === c.value;
          return (
            <button
              key={c.value}
              className={`cp-color-swatch ${isActive ? 'active' : ''}`}
              style={{ background: c.value }}
              onClick={() => updateDesign({ accentColor: isActive ? '' : c.value })}
              title={c.label}
              aria-label={`${c.label}${isActive ? ' (selected)' : ''}`}
            >
              {isActive && <span className="cp-color-check">✓</span>}
            </button>
          );
        })}
      </div>
      {design.accentColor && (
        <button className="cp-reset-color" onClick={() => updateDesign({ accentColor: '' })}>
          Reset to template default
        </button>
      )}
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'Styles':  return renderStyles();
      case 'Layout':  return renderLayout();
      case 'Fonts':   return renderFonts();
      case 'Colors':  return renderColors();
      default:        return null;
    }
  };

  return (
    <div className="customize-panel">
      <div className="cp-tabs">
        {TABS.map(tab => (
          <button
            key={tab}
            className={`cp-tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>
      <div className="cp-body">
        {renderContent()}
      </div>
    </div>
  );
}
