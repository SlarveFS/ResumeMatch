import { useState } from 'react';
import './Sections.css';

const TONE_COLORS = {
  Enthusiastic: '#f59e0b',
  Professional:  '#2563eb',
  Confident:     '#8b5cf6',
};

function SummarySection({ resumeData, updateResumeData }) {
  const charCount = resumeData.summary.length;
  const maxChars = 500;

  const [loading, setLoading]         = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [error, setError]             = useState('');

  // Best-effort job title from experience or a generic fallback
  const jobTitle =
    (resumeData.experience?.length > 0 ? resumeData.experience[0].jobTitle : '') ||
    resumeData.personalInfo?.jobTarget ||
    'professional';

  const experienceSummary = (resumeData.experience || [])
    .slice(0, 2)
    .map(e => `${e.jobTitle || ''}${e.company ? ` at ${e.company}` : ''}`)
    .filter(Boolean)
    .join(', ');

  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    setSuggestions([]);
    try {
      const res = await fetch('/api/suggest-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section: 'summary',
          jobTitle,
          currentContent: resumeData.summary,
          experienceSummary,
          resumeData: {
            experience: (resumeData.experience || []).slice(0, 2).map(e => ({
              jobTitle: e.jobTitle,
              company:  e.company,
              description: (e.bullets || []).join('. ').slice(0, 300),
            })),
            skills: [
              ...(resumeData.skills?.technical || []),
              ...(resumeData.skills?.tools     || []),
            ].slice(0, 8),
          },
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      if (data.summaries) setSuggestions(data.summaries);
    } catch {
      setError('Could not generate suggestions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUse = (text) => {
    updateResumeData({ summary: text });
    setSuggestions([]);
  };

  return (
    <div className="section-panel">
      <div className="section-panel-header">
        <h2>Professional Summary</h2>
        <p>A 2–3 sentence overview of your experience and goals.</p>
      </div>

      <div className="form-field form-field-full">
        <div className="form-field-header">
          <label>Summary</label>
          <span className={`char-count ${charCount > maxChars ? 'over' : ''}`}>
            {charCount}/{maxChars}
          </span>
        </div>
        <textarea
          value={resumeData.summary}
          onChange={e => updateResumeData({ summary: e.target.value })}
          placeholder="Results-driven professional with 5+ years of experience building scalable solutions..."
          className="form-textarea"
          rows={5}
          maxLength={600}
        />
        <button className="ai-btn" onClick={handleGenerate} disabled={loading}>
          {loading ? '⏳ Generating…' : '✨ Write with AI'}
        </button>
        {error && <p className="ai-error">{error}</p>}
      </div>

      {suggestions.length > 0 && (
        <div className="ai-suggestions">
          <div className="ai-suggestions-header">
            <span>AI-generated alternatives</span>
            <button className="ai-regen-btn" onClick={handleGenerate} disabled={loading}>
              ↻ Regenerate
            </button>
          </div>
          {suggestions.map((s, i) => {
            const color = TONE_COLORS[s.tone] || '#64748b';
            return (
              <div key={i} className="ai-suggestion-card">
                <div className="ai-suggestion-top">
                  <span className="ai-tone-tag" style={{ background: `${color}18`, color, borderColor: `${color}50` }}>
                    {s.tone}
                  </span>
                  <button className="ai-use-btn" onClick={() => handleUse(s.text)}>
                    Use this →
                  </button>
                </div>
                <p className="ai-suggestion-text">{s.text}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default SummarySection;
