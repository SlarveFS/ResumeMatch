import { useState } from 'react';
import RenamableTitle from '../RenamableTitle';
import MonthYearPicker from '../../common/MonthYearPicker';
import LocationAutocomplete from '../../common/LocationAutocomplete';
import '../../common/MonthYearPicker.css';
import '../../common/LocationAutocomplete.css';

const EMPTY_EDU = () => ({
  id: crypto.randomUUID(),
  degree: '',
  school: '',
  location: '',
  startDate: '',
  graduationDate: '',
  gpa: '',
  honors: '',
  description: '',
});

function EducationCard({ entry, index, onChange, onDelete, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen);

  const set = (field, value) => onChange({ ...entry, [field]: value });

  const label = entry.school
    ? `${entry.degree ? `${entry.degree} — ` : ''}${entry.school}`
    : `Education Entry ${index + 1}`;

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
              <label className="wizard-label">Institution</label>
              <input
                className="wizard-input"
                placeholder="University of California, Berkeley"
                value={entry.school}
                onChange={e => set('school', e.target.value)}
              />
            </div>
            <div className="wizard-field">
              <label className="wizard-label">Degree / Field of Study</label>
              <input
                className="wizard-input"
                placeholder="B.S. Computer Science"
                value={entry.degree}
                onChange={e => set('degree', e.target.value)}
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
              <label className="wizard-label">Graduation Date</label>
              <MonthYearPicker
                value={entry.graduationDate}
                onChange={v => set('graduationDate', v)}
              />
            </div>
            <div className="wizard-field">
              <label className="wizard-label">Location</label>
              <LocationAutocomplete
                value={entry.location}
                onChange={v => set('location', v)}
                placeholder="Berkeley, CA"
              />
            </div>
          </div>

          <div className="wizard-field-row">
            <div className="wizard-field">
              <label className="wizard-label">GPA (optional)</label>
              <input
                className="wizard-input"
                placeholder="3.8"
                value={entry.gpa}
                onChange={e => set('gpa', e.target.value)}
              />
            </div>
            <div className="wizard-field">
              <label className="wizard-label">Honors / Awards (optional)</label>
              <input
                className="wizard-input"
                placeholder="Magna Cum Laude, Dean's List"
                value={entry.honors}
                onChange={e => set('honors', e.target.value)}
              />
            </div>
          </div>

          <div className="wizard-field wizard-field-full">
            <label className="wizard-label">Description (optional)</label>
            <textarea
              className="wizard-textarea"
              rows={3}
              placeholder="Relevant coursework, thesis, extracurriculars, or achievements..."
              value={entry.description}
              onChange={e => set('description', e.target.value)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default function Step3Education({ data, onChange, sectionTitles, onRename }) {
  const entries = data.education && data.education.length > 0
    ? data.education
    : [EMPTY_EDU()];

  if (data.education && data.education.length === 0) {
    onChange({ education: [EMPTY_EDU()] });
  }

  const update = (idx, updated) => {
    onChange({ education: entries.map((e, i) => i === idx ? updated : e) });
  };

  const remove = (idx) => {
    if (entries.length === 1) return;
    onChange({ education: entries.filter((_, i) => i !== idx) });
  };

  const addEntry = () => {
    onChange({ education: [...entries, EMPTY_EDU()] });
  };

  return (
    <div className="wizard-step">
      <div className="wizard-step-header">
        <RenamableTitle
          value={(sectionTitles || {}).education}
          defaultValue="Education"
          onChange={v => onRename && onRename('education', v)}
        />
        <p className="wizard-step-subtitle">
          Add your education. Include relevant courses or other details if they support the role.
        </p>
      </div>

      <div className="wizard-entries">
        {entries.map((entry, idx) => (
          <EducationCard
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
        + Add one more education
      </button>
    </div>
  );
}
