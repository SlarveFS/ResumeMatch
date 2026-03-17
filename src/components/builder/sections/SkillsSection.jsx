import { useState } from 'react';
import './Sections.css';

const SKILL_CATEGORIES = [
  { key: 'technical', label: 'Technical Skills' },
  { key: 'soft', label: 'Soft Skills' },
  { key: 'tools', label: 'Tools & Software' },
  { key: 'languages', label: 'Languages' },
  { key: 'certifications', label: 'Certifications' },
];

function SkillCategory({ categoryKey, label, skills, onAdd, onRemove }) {
  const [inputValue, setInputValue] = useState('');

  const handleAdd = () => {
    const trimmed = inputValue.trim();
    if (trimmed && !skills.includes(trimmed)) {
      onAdd(categoryKey, trimmed);
      setInputValue('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className="skill-category">
      <label className="skill-category-label">{label}</label>
      <div className="skill-chips">
        {skills.map(skill => (
          <span key={skill} className="skill-chip">
            {skill}
            <button className="skill-chip-remove" onClick={() => onRemove(categoryKey, skill)}>×</button>
          </span>
        ))}
      </div>
      <div className="skill-input-row">
        <input
          className="form-input skill-input"
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`Add ${label.toLowerCase()}...`}
        />
        <button className="skill-add-btn" onClick={handleAdd} disabled={!inputValue.trim()}>Add</button>
      </div>
    </div>
  );
}

function SkillsSection({ resumeData, updateResumeData }) {
  const { skills } = resumeData;
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [error, setError] = useState('');

  const addSkill = (category, skill) => {
    updateResumeData({
      skills: { ...skills, [category]: [...(skills[category] || []), skill] }
    });
  };

  const removeSkill = (category, skill) => {
    updateResumeData({
      skills: { ...skills, [category]: skills[category].filter(s => s !== skill) }
    });
  };

  const handleSuggestSkills = async () => {
    setLoading(true);
    setError('');
    setSuggestions([]);
    const jobTitle =
      (resumeData.experience?.length > 0 ? resumeData.experience[0].jobTitle : '') ||
      resumeData.personalInfo?.jobTarget ||
      'professional';
    try {
      const res = await fetch('/api/suggest-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section: 'skills',
          jobTitle,
          currentSkills: [
            ...(skills.technical || []),
            ...(skills.tools || []),
            ...(skills.soft || []),
          ],
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setSuggestions(data.skills || []);
    } catch {
      setError('Could not suggest skills. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSuggested = (skill) => {
    if (!(skills.technical || []).includes(skill)) {
      addSkill('technical', skill);
    }
    setSuggestions(prev => prev.filter(s => s !== skill));
  };

  return (
    <div className="section-panel">
      <div className="section-panel-header">
        <h2>Skills</h2>
        <p>Add skills as tags. Press Enter or comma to add each skill.</p>
      </div>
      <div className="skills-container">
        {SKILL_CATEGORIES.map(cat => (
          <SkillCategory
            key={cat.key}
            categoryKey={cat.key}
            label={cat.label}
            skills={skills[cat.key] || []}
            onAdd={addSkill}
            onRemove={removeSkill}
          />
        ))}
      </div>
      <button className="ai-btn" style={{ marginTop: '1rem' }} onClick={handleSuggestSkills} disabled={loading}>
        {loading ? '⏳ Generating…' : '✨ Suggest Skills'}
      </button>
      {error && <p className="ai-error">{error}</p>}
      {suggestions.length > 0 && (
        <div className="skill-suggestions">
          <div className="skill-suggestions-header">Suggested skills — click to add</div>
          <div className="skill-suggestion-chips">
            {suggestions.map((skill, i) => (
              <button key={i} className="skill-suggestion-chip" onClick={() => handleAddSuggested(skill)}>
                + {skill}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default SkillsSection;
