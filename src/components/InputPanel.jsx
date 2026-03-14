function InputPanel({
  jobDescription,
  setJobDescription,
  resume,
  setResume,
  onAnalyze,
  loading,
}) {
  return (
    <div className="input-panel">
      <div className="input-group">
        <label htmlFor="job-desc">
          <span className="label-icon">📋</span> Job Description
        </label>
        <textarea
          id="job-desc"
          placeholder="Paste the full job description here..."
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          rows={10}
        />
        <span className="char-count">
          {jobDescription.length} characters
        </span>
      </div>

      <div className="input-group">
        <label htmlFor="resume">
          <span className="label-icon">📄</span> Your Resume
        </label>
        <textarea
          id="resume"
          placeholder="Paste your resume text here..."
          value={resume}
          onChange={(e) => setResume(e.target.value)}
          rows={10}
        />
        <span className="char-count">{resume.length} characters</span>
      </div>

      <button
        className="analyze-btn"
        onClick={onAnalyze}
        disabled={loading}
      >
        {loading ? (
          <span className="loading-text">
            <span className="spinner"></span> Analyzing...
          </span>
        ) : (
          "Analyze My Resume"
        )}
      </button>
    </div>
  );
}

export default InputPanel;
