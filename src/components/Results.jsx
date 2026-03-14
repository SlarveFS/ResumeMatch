function Results({ data }) {
  const getScoreColor = (score) => {
    if (score >= 80) return "#2D7D46";
    if (score >= 60) return "#C27020";
    return "#C0392B";
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return "Strong Match";
    if (score >= 60) return "Moderate Match";
    return "Needs Work";
  };

  return (
    <div className="results">
      <h2 className="results-title">Your Analysis</h2>

      <div className="score-card">
        <div
          className="score-circle"
          style={{ borderColor: getScoreColor(data.matchScore) }}
        >
          <span
            className="score-number"
            style={{ color: getScoreColor(data.matchScore) }}
          >
            {data.matchScore}
          </span>
          <span className="score-percent">%</span>
        </div>
        <div className="score-details">
          <h3
            className="score-label"
            style={{ color: getScoreColor(data.matchScore) }}
          >
            {getScoreLabel(data.matchScore)}
          </h3>
          <p className="score-desc">
            Keyword and qualification alignment with the job description
          </p>
        </div>
      </div>

      {data.strengths && data.strengths.length > 0 && (
        <div className="result-section strengths-section">
          <h3>
            <span className="section-icon">✅</span> What You're Doing Well
          </h3>
          <ul>
            {data.strengths.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {data.missingKeywords && data.missingKeywords.length > 0 && (
        <div className="result-section missing-section">
          <h3>
            <span className="section-icon">🔍</span> Missing Keywords
          </h3>
          <div className="keyword-chips">
            {data.missingKeywords.map((kw, i) => (
              <span key={i} className="chip">
                {kw}
              </span>
            ))}
          </div>
        </div>
      )}

      {data.suggestedBullets && data.suggestedBullets.length > 0 && (
        <div className="result-section suggestions-section">
          <h3>
            <span className="section-icon">💡</span> Suggested Resume Bullets
          </h3>
          <ul className="suggestions-list">
            {data.suggestedBullets.map((bullet, i) => (
              <li key={i}>
                <span className="bullet-text">{bullet}</span>
                <button
                  className="copy-btn"
                  onClick={() => {
                    navigator.clipboard.writeText(bullet);
                  }}
                  title="Copy to clipboard"
                >
                  📋
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default Results;
