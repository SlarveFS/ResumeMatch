import { useState, useRef } from 'react';
import RenamableTitle from '../RenamableTitle';
import MonthYearPicker from '../../common/MonthYearPicker';
import LocationAutocomplete from '../../common/LocationAutocomplete';
import '../../common/MonthYearPicker.css';
import '../../common/LocationAutocomplete.css';

const EMPTY_JOB = () => ({
  id: crypto.randomUUID(),
  jobTitle: '',
  company: '',
  location: '',
  startDate: '',
  endDate: '',
  current: false,
  description: '',
  bullets: [''],
});

function CharCount({ text, target = 200 }) {
  const len = (text || '').length;
  const met = len >= target;
  return (
    <span className={`wizard-char-count ${met ? 'met' : ''}`}>
      {len} / {target}+
      {met && <span className="wizard-char-good"> ✓ Good</span>}
    </span>
  );
}

function ExperienceCard({ entry, index, onChange, onDelete, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen);
  const [improving, setImproving] = useState(false);
  const [improveError, setImproveError] = useState('');
  const [bulletSuggestions, setBulletSuggestions] = useState([]);
  const [suggestingBullets, setSuggestingBullets] = useState(false);
  const [bulletSuggestError, setBulletSuggestError] = useState('');
  const [addedBullets, setAddedBullets] = useState(new Set());
  const textareaRef = useRef(null);

  const set = (field, value) => onChange({ ...entry, [field]: value });

  const insertBullet = () => {
    const ta = textareaRef.current;
    if (!ta) return;
    const pos = ta.selectionStart;
    const val = ta.value;
    const before = val.slice(0, pos);
    const after = val.slice(pos);
    const bullet = (before.length === 0 || before.endsWith('\n')) ? '• ' : '\n• ';
    const newVal = before + bullet + after;
    set('description', newVal);
    setTimeout(() => {
      ta.selectionStart = ta.selectionEnd = pos + bullet.length;
      ta.focus();
    }, 0);
  };

  const handleImprove = async () => {
    const desc = entry.description || '';
    if (desc.trim().length < 20) {
      setImproveError('Add more content first (at least a few sentences).');
      return;
    }
    setImproving(true);
    setImproveError('');
    try {
      const res = await fetch('/api/improve-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: desc,
          jobTitle: entry.jobTitle,
          company: entry.company,
        }),
      });
      if (!res.ok) throw new Error('API error');
      const json = await res.json();
      if (json.improved) set('description', json.improved);
    } catch {
      setImproveError('AI improvement unavailable. Try again later.');
    } finally {
      setImproving(false);
    }
  };

  const handleSuggestBullets = async () => {
    setSuggestingBullets(true);
    setBulletSuggestError('');
    setBulletSuggestions([]);
    setAddedBullets(new Set());
    try {
      const res = await fetch('/api/suggest-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section: 'bullets', jobTitle: entry.jobTitle }),
      });
      if (!res.ok) throw new Error('API error');
      const json = await res.json();
      if (json.bullets) setBulletSuggestions(json.bullets);
    } catch {
      setBulletSuggestError('Could not load suggestions. Try again.');
    } finally {
      setSuggestingBullets(false);
    }
  };

  const addSuggestedBullet = (bullet) => {
    const current = entry.description || '';
    const cleanBullet = bullet.startsWith('•') ? bullet : `• ${bullet}`;
    const prefix = current && !current.endsWith('\n') ? '\n' : '';
    set('description', current + prefix + cleanBullet);
    setAddedBullets(prev => new Set([...prev, bullet]));
  };

  const label = entry.jobTitle
    ? `${entry.jobTitle}${entry.company ? ` at ${entry.company}` : ''}`
    : `Job Entry ${index + 1}`;

  return (
    <div className="wizard-card">
      <div className="wizard-card-header" onClick={() => setOpen(v => !v)}>
        <span className="wizard-card-drag">⠿</span>
        <span className="wizard-card-title">{label}</span>
        <button
          type="button"
          className="wizard-card-delete"
          onClick={e => { e.stopPropagation(); onDelete(); }}
          title="Remove entry"
        >
          ✕
        </button>
        <span className="wizard-card-chevron">{open ? '▲' : '▼'}</span>
      </div>

      {open && (
        <div className="wizard-card-body">
          <div className="wizard-field-row">
            <div className="wizard-field">
              <label className="wizard-label">Job Title</label>
              <input
                className="wizard-input"
                placeholder="Software Engineer"
                value={entry.jobTitle}
                onChange={e => set('jobTitle', e.target.value)}
              />
            </div>
            <div className="wizard-field">
              <label className="wizard-label">Company</label>
              <input
                className="wizard-input"
                placeholder="Acme Corp"
                value={entry.company}
                onChange={e => set('company', e.target.value)}
              />
            </div>
          </div>

          <div className="wizard-field-row">
            <div className="wizard-field">
              <label className="wizard-label">Start Date</label>
              <MonthYearPicker
                value={entry.startDate}
                onChange={v => set('startDate', v)}
              />
            </div>
            <div className="wizard-field">
              <label className="wizard-label">End Date</label>
              <MonthYearPicker
                value={entry.current ? 'Present' : entry.endDate}
                onChange={v => {
                  if (v === 'Present') {
                    onChange({ ...entry, current: true, endDate: '' });
                  } else {
                    onChange({ ...entry, current: false, endDate: v });
                  }
                }}
                allowPresent
              />
            </div>
            <div className="wizard-field">
              <label className="wizard-label">Location</label>
              <LocationAutocomplete
                value={entry.location}
                onChange={v => set('location', v)}
                placeholder="New York, NY"
              />
            </div>
          </div>

          {/* Rich text area */}
          <div className="wizard-field wizard-field-full" style={{ marginTop: '1rem' }}>
            <div className="wizard-rte-toolbar">
              <label className="wizard-label" style={{ marginBottom: 0 }}>
                Experience &amp; Achievements
              </label>
              <div className="wizard-rte-toolbar-actions">
                <button
                  type="button"
                  className="wizard-rte-btn"
                  onClick={insertBullet}
                  title="Add bullet point"
                >
                  • Add bullet
                </button>
                {entry.jobTitle && (
                  <button
                    type="button"
                    className="wizard-ai-btn wizard-suggest-bullets-btn"
                    onClick={handleSuggestBullets}
                    disabled={suggestingBullets}
                  >
                    {suggestingBullets ? '⏳ Loading…' : '✨ Suggest bullets'}
                  </button>
                )}
              </div>
            </div>
            <textarea
              ref={textareaRef}
              className="wizard-textarea"
              rows={6}
              placeholder={`• Led a team of 5 engineers to deliver a new feature 2 weeks ahead of schedule\n• Increased API response time by 40% through caching improvements\n• Collaborated with design to ship a redesigned onboarding flow`}
              value={entry.description}
              onChange={e => set('description', e.target.value)}
            />
            <div className="wizard-textarea-meta">
              <CharCount text={entry.description} target={200} />
              <div className="wizard-textarea-actions">
                {improveError && <span className="wizard-improve-error">{improveError}</span>}
                <button
                  type="button"
                  className="wizard-ai-btn"
                  onClick={handleImprove}
                  disabled={improving}
                >
                  {improving ? '⏳ Improving…' : '✨ Improve with AI'}
                </button>
              </div>
            </div>

            {/* AI Bullet Suggestions Panel */}
            {(bulletSuggestError || bulletSuggestions.length > 0) && (
              <div className="wizard-bullet-suggestions">
                <div className="wizard-bullet-suggestions-header">
                  <span className="wizard-suggestions-label">
                    Suggested for <em style={{ textTransform: 'none', fontStyle: 'italic' }}>{entry.jobTitle}</em>
                  </span>
                  <button
                    type="button"
                    className="wizard-suggestions-refresh"
                    onClick={handleSuggestBullets}
                    disabled={suggestingBullets}
                  >
                    {suggestingBullets ? '⏳' : '↻ Refresh'}
                  </button>
                </div>
                {bulletSuggestError && (
                  <p className="wizard-improve-error" style={{ margin: '0.25rem 0 0.5rem' }}>
                    {bulletSuggestError}
                  </p>
                )}
                <div className="wizard-bullet-cards">
                  {bulletSuggestions.map((bullet, i) => {
                    const isAdded = addedBullets.has(bullet);
                    return (
                      <div key={i} className={`wizard-bullet-card ${isAdded ? 'added' : ''}`}>
                        <span className="wizard-bullet-card-text">
                          {bullet.startsWith('•') ? bullet : `• ${bullet}`}
                        </span>
                        <button
                          type="button"
                          className="wizard-bullet-card-add"
                          onClick={() => addSuggestedBullet(bullet)}
                          disabled={isAdded}
                        >
                          {isAdded ? '✓ Added' : '+ Add'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <p className="wizard-rte-tip">
              💡 <strong>Recruiter tip:</strong> Write 200+ characters to increase interview chances. Use bullet points starting with action verbs — numbers and metrics stand out.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Step2Experience({ data, onChange, sectionTitles, onRename }) {
  const entries = data.experience && data.experience.length > 0
    ? data.experience
    : [EMPTY_JOB()];

  if (data.experience && data.experience.length === 0) {
    onChange({ experience: [EMPTY_JOB()] });
  }

  const update = (idx, updated) => {
    const next = entries.map((e, i) => i === idx ? updated : e);
    onChange({ experience: next });
  };

  const remove = (idx) => {
    if (entries.length === 1) return;
    onChange({ experience: entries.filter((_, i) => i !== idx) });
  };

  const addEntry = () => {
    onChange({ experience: [...entries, EMPTY_JOB()] });
  };

  return (
    <div className="wizard-step">
      <div className="wizard-step-header">
        <RenamableTitle
          value={(sectionTitles || {}).experience}
          defaultValue="Employment History"
          onChange={v => onRename && onRename('experience', v)}
        />
        <p className="wizard-step-subtitle">
          Show your relevant experience (last 10 years). Use bullet points to note your achievements — use numbers and facts (Achieved X, measured by Y, by doing Z).
        </p>
      </div>

      <div className="wizard-entries">
        {entries.map((entry, idx) => (
          <ExperienceCard
            key={entry.id}
            entry={entry}
            index={idx}
            defaultOpen={idx === 0}
            onChange={updated => update(idx, updated)}
            onDelete={() => remove(idx)}
          />
        ))}
      </div>

      <button type="button" className="wizard-add-entry-btn" onClick={addEntry}>
        + Add one more employment
      </button>
    </div>
  );
}
