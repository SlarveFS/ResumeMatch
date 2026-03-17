import { useState } from 'react';

const SECTION_OPTIONS = [
  { type: 'internships',   icon: '🏢', label: 'Internships' },
  { type: 'references',    icon: '👥', label: 'References' },
  { type: 'languages',     icon: '🌐', label: 'Languages' },
  { type: 'links',         icon: '🔗', label: 'Links' },
  { type: 'hobbies',       icon: '🎯', label: 'Hobbies' },
  { type: 'certifications',icon: '🏆', label: 'Certifications' },
  { type: 'awards',        icon: '🥇', label: 'Awards' },
  { type: 'courses',       icon: '📚', label: 'Courses / Training' },
  { type: 'volunteering',  icon: '🤝', label: 'Volunteering' },
  { type: 'projects',      icon: '💻', label: 'Projects' },
  { type: 'custom',        icon: '✏️', label: 'Custom Section' },
];

const DEFAULT_SECTION_ORDER = ['summary', 'experience', 'education', 'skills'];

export default function Step6Sections({ data, onChange }) {
  const customSections = data.customSections || [];
  const sectionOrder = data.sectionOrder || DEFAULT_SECTION_ORDER;
  const [showReorder, setShowReorder] = useState(false);
  const [dragIdx, setDragIdx] = useState(null);

  const isActive = (type) => customSections.some(s => s.type === type);

  const toggle = (opt) => {
    if (isActive(opt.type)) {
      // Remove
      const next = customSections.filter(s => s.type !== opt.type);
      const nextOrder = sectionOrder.filter(k => k !== opt.type);
      onChange({ customSections: next, sectionOrder: nextOrder });
    } else {
      // Add
      const newSection = {
        id: crypto.randomUUID(),
        type: opt.type,
        title: opt.label,
        items: [],
      };
      onChange({
        customSections: [...customSections, newSection],
        sectionOrder: [...sectionOrder, opt.type],
      });
    }
  };

  // Reorder drag handlers for sectionOrder
  const handleDragStart = (idx) => setDragIdx(idx);
  const handleDragOver = (e, idx) => {
    e.preventDefault();
    if (dragIdx === null || dragIdx === idx) return;
    const next = [...sectionOrder];
    const [moved] = next.splice(dragIdx, 1);
    next.splice(idx, 0, moved);
    setDragIdx(idx);
    onChange({ sectionOrder: next });
  };
  const handleDragEnd = () => setDragIdx(null);

  const CORE_LABELS = {
    summary: 'Summary',
    experience: 'Experience',
    education: 'Education',
    skills: 'Skills',
    projects: 'Projects',
    certifications: 'Certifications',
  };

  const getSectionLabel = (key) => {
    if (CORE_LABELS[key]) return CORE_LABELS[key];
    const opt = SECTION_OPTIONS.find(o => o.type === key);
    const custom = (data.customSections || []).find(s => s.type === key);
    return custom?.title || opt?.label || key;
  };

  const getSectionIcon = (key) => {
    const opt = SECTION_OPTIONS.find(o => o.type === key);
    return opt?.icon || '📄';
  };

  return (
    <div className="wizard-step">
      <div className="wizard-step-header">
        <h2 className="wizard-step-title">Add Additional Sections</h2>
        <p className="wizard-step-subtitle">
          Add extra sections only if they are relevant to the role you are targeting.
        </p>
      </div>

      {/* Section grid */}
      <div className="sections-grid">
        {SECTION_OPTIONS.map(opt => {
          const active = isActive(opt.type);
          return (
            <button
              key={opt.type}
              type="button"
              className={`section-option-card ${active ? 'active' : ''}`}
              onClick={() => toggle(opt)}
            >
              <span className="section-option-icon">{opt.icon}</span>
              <span className="section-option-label">{opt.label}</span>
              <span className="section-option-toggle">
                {active ? '✓ Added' : '+ Add'}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active sections summary */}
      {customSections.length > 0 && (
        <div className="sections-active-summary">
          <span className="sections-active-label">
            {customSections.length} section{customSections.length !== 1 ? 's' : ''} added
          </span>
          <span className="sections-active-chips">
            {customSections.map(s => (
              <span key={s.id} className="sections-active-chip">
                {SECTION_OPTIONS.find(o => o.type === s.type)?.icon} {s.title}
              </span>
            ))}
          </span>
        </div>
      )}

      {/* Reorder sections */}
      <button
        type="button"
        className="wizard-expand-btn sections-reorder-btn"
        onClick={() => setShowReorder(v => !v)}
      >
        {showReorder ? '▲ Hide section order' : '⇅ Reorder sections'}
      </button>

      {showReorder && (
        <div className="sections-reorder-list">
          <p className="sections-reorder-hint">Drag to change the order sections appear on your resume.</p>
          {sectionOrder.map((key, idx) => (
            <div
              key={key}
              className={`sections-reorder-item ${dragIdx === idx ? 'dragging' : ''}`}
              draggable
              onDragStart={() => handleDragStart(idx)}
              onDragOver={e => handleDragOver(e, idx)}
              onDragEnd={handleDragEnd}
            >
              <span className="sections-reorder-drag">⠿</span>
              <span className="sections-reorder-icon">{getSectionIcon(key)}</span>
              <span className="sections-reorder-label">{getSectionLabel(key)}</span>
              <span className="sections-reorder-num">{idx + 1}</span>
            </div>
          ))}
        </div>
      )}

      <div className="wizard-recruiter-tip" style={{ marginTop: '1.25rem' }}>
        <span className="wizard-tip-icon">💡</span>
        <p>
          <strong>Recruiter tip:</strong> Adding at least one additional section (like Certifications or Projects) increases your resume score by <strong>+5%</strong> and shows depth.
        </p>
      </div>
    </div>
  );
}
