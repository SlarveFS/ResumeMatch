import { useState, useEffect } from 'react';
import { getSuggestedSkills } from '../../../utils/wizardScore';
import RenamableTitle from '../RenamableTitle';

const LEVELS = ['Novice', 'Beginner', 'Intermediate', 'Advanced', 'Expert'];

const EMPTY_SKILL = (name = '') => ({
  id: crypto.randomUUID(),
  name,
  level: 'Intermediate',
});

export default function Step4Skills({ data, onChange, sectionTitles, onRename }) {
  const skills = data.skillsWithLevel || [];
  const jobTitle = (data.personalInfo || {}).jobTarget || '';
  const [showLevels, setShowLevels] = useState(true);
  const [newSkill, setNewSkill] = useState('');
  const [dragIdx, setDragIdx] = useState(null);

  // AI-powered suggestions
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [suggestionError, setSuggestionError] = useState('');

  const fetchAiSuggestions = async () => {
    setLoadingSuggestions(true);
    setSuggestionError('');
    try {
      const res = await fetch('/api/suggest-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section: 'skills', jobTitle: jobTitle || 'professional' }),
      });
      if (!res.ok) throw new Error('API error');
      const json = await res.json();
      if (json.skills) setAiSuggestions(json.skills);
    } catch {
      // Fall back to local suggestions silently
      setAiSuggestions(getSuggestedSkills(jobTitle, skills));
    } finally {
      setLoadingSuggestions(false);
    }
  };

  // Auto-fetch on mount
  useEffect(() => {
    if (jobTitle) {
      fetchAiSuggestions();
    } else {
      setAiSuggestions(getSuggestedSkills('', []));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateSkills = (next) => {
    onChange({
      skillsWithLevel: next,
      skills: {
        ...(data.skills || {}),
        technical: next.map(s => s.name),
      },
    });
  };

  const addSkill = (name) => {
    if (!name.trim()) return;
    const trimmed = name.trim();
    if (skills.some(s => s.name.toLowerCase() === trimmed.toLowerCase())) return;
    updateSkills([...skills, EMPTY_SKILL(trimmed)]);
  };

  const removeSkill = (id) => {
    updateSkills(skills.filter(s => s.id !== id));
  };

  const updateLevel = (id, level) => {
    updateSkills(skills.map(s => s.id === id ? { ...s, level } : s));
  };

  const handleNewSkillKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addSkill(newSkill);
      setNewSkill('');
    }
  };

  const addFromInput = () => {
    addSkill(newSkill);
    setNewSkill('');
  };

  // Drag-and-drop reordering
  const handleDragStart = (idx) => setDragIdx(idx);
  const handleDragOver = (e, idx) => {
    e.preventDefault();
    if (dragIdx === null || dragIdx === idx) return;
    const next = [...skills];
    const [moved] = next.splice(dragIdx, 1);
    next.splice(idx, 0, moved);
    setDragIdx(idx);
    updateSkills(next);
  };
  const handleDragEnd = () => setDragIdx(null);

  // Filter out already-added skills from suggestions
  const visibleSuggestions = aiSuggestions.filter(
    s => !skills.some(sk => sk.name.toLowerCase() === s.toLowerCase())
  );

  return (
    <div className="wizard-step">
      <div className="wizard-step-header">
        <RenamableTitle
          value={(sectionTitles || {}).skills}
          defaultValue="Areas of Expertise"
          onChange={v => onRename && onRename('skills', v)}
        />
        <p className="wizard-step-subtitle">
          Choose 5 or more important skills that show you fit the position. Make sure they match the key skills mentioned in the job listing.
        </p>
      </div>

      {/* AI-suggested skills */}
      <div className="wizard-suggestions">
        <div className="wizard-suggestions-header">
          <span className="wizard-suggestions-label">
            {jobTitle ? `✨ Suggested for ${jobTitle}` : 'Suggested'}
          </span>
          <button
            type="button"
            className="wizard-suggestions-refresh"
            onClick={fetchAiSuggestions}
            disabled={loadingSuggestions}
          >
            {loadingSuggestions ? '⏳' : '↻ Refresh'}
          </button>
        </div>

        {loadingSuggestions ? (
          <div className="wizard-skills-loading">
            <span className="wizard-skills-loading-dot" />
            <span className="wizard-skills-loading-dot" />
            <span className="wizard-skills-loading-dot" />
          </div>
        ) : visibleSuggestions.length > 0 ? (
          <div className="wizard-chip-row">
            {visibleSuggestions.map(name => (
              <button
                key={name}
                type="button"
                className="wizard-chip-add"
                onClick={() => addSkill(name)}
              >
                + {name}
              </button>
            ))}
          </div>
        ) : (
          <p className="wizard-suggestions-empty">
            All suggestions added! Click ↻ Refresh for more.
          </p>
        )}

        {suggestionError && (
          <p className="wizard-improve-error">{suggestionError}</p>
        )}
      </div>

      {/* Added skills list */}
      {skills.length > 0 && (
        <div className="wizard-skills-list">
          <div className="wizard-skills-list-header">
            <span>Your Skills ({skills.length})</span>
            <label className="wizard-toggle-row">
              <input
                type="checkbox"
                checked={showLevels}
                onChange={e => setShowLevels(e.target.checked)}
              />
              <span>Show experience level</span>
            </label>
          </div>

          {skills.map((skill, idx) => (
            <div
              key={skill.id}
              className={`wizard-skill-row ${dragIdx === idx ? 'dragging' : ''}`}
              draggable
              onDragStart={() => handleDragStart(idx)}
              onDragOver={e => handleDragOver(e, idx)}
              onDragEnd={handleDragEnd}
            >
              <span className="wizard-skill-drag" title="Drag to reorder">⠿</span>
              <span className="wizard-skill-name">{skill.name}</span>

              {showLevels && (
                <select
                  className="wizard-skill-level"
                  value={skill.level}
                  onChange={e => updateLevel(skill.id, e.target.value)}
                >
                  {LEVELS.map(l => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              )}

              <button
                type="button"
                className="wizard-skill-delete"
                onClick={() => removeSkill(skill.id)}
                title="Remove skill"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add skill input */}
      <div className="wizard-skill-input-row">
        <input
          className="wizard-input"
          placeholder="Type a skill and press Enter"
          value={newSkill}
          onChange={e => setNewSkill(e.target.value)}
          onKeyDown={handleNewSkillKeyDown}
        />
        <button
          type="button"
          className="wizard-skill-add-btn"
          onClick={addFromInput}
          disabled={!newSkill.trim()}
        >
          + Add
        </button>
      </div>

      {skills.length < 5 && (
        <p className="wizard-skills-hint">
          💡 Add at least <strong>5 skills</strong> to unlock +10% on your resume score.
        </p>
      )}
    </div>
  );
}
