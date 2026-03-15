import './Sections.css';

function SummarySection({ resumeData, updateResumeData }) {
  const charCount = resumeData.summary.length;
  const maxChars = 500;

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
          placeholder="Results-driven software engineer with 5+ years of experience building scalable web applications..."
          className="form-textarea"
          rows={5}
          maxLength={600}
        />
        <button className="ai-btn" disabled>
          ✨ Write with AI
          <span className="ai-btn-soon">Coming soon</span>
        </button>
      </div>
    </div>
  );
}

export default SummarySection;
