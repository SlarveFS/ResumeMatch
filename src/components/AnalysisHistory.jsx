import { useState, useEffect } from "react";
import Results from "./Results";

const STORAGE_KEY = "resumematch_history";

function getScoreColor(score) {
  if (score >= 80) return "#2D7D46";
  if (score >= 60) return "#C27020";
  return "#C0392B";
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function AnalysisHistory({ refreshKey }) {
  const [history, setHistory] = useState([]);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      setHistory(raw ? JSON.parse(raw) : []);
    } catch {
      setHistory([]);
    }
  }, [refreshKey]);

  const handleClearAll = () => {
    if (window.confirm("Clear all analysis history? This cannot be undone.")) {
      localStorage.removeItem(STORAGE_KEY);
      setHistory([]);
      setExpandedId(null);
    }
  };

  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <section className="history-section">
      <div className="history-header">
        <h2 className="history-title">Past Analyses</h2>
        {history.length > 0 && (
          <button className="clear-history-btn" onClick={handleClearAll}>
            Clear All History
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <p className="history-empty">
          No analyses yet. Run your first analysis above!
        </p>
      ) : (
        <div className="history-list">
          {history.map((entry) => (
            <div key={entry.id} className="history-card">
              <div className="history-card-main">
                <div
                  className="history-score-badge"
                  style={{ borderColor: getScoreColor(entry.matchScore), color: getScoreColor(entry.matchScore) }}
                >
                  {entry.matchScore}%
                </div>
                <div className="history-card-info">
                  <p className="history-card-title">
                    {entry.jobTitle
                      ? entry.jobTitle.slice(0, 40) + (entry.jobTitle.length > 40 ? "…" : "")
                      : "Untitled"}
                  </p>
                  <p className="history-card-date">{formatDate(entry.timestamp)}</p>
                </div>
                <button
                  className="history-view-btn"
                  onClick={() => toggleExpand(entry.id)}
                >
                  {expandedId === entry.id ? "Hide" : "View"}
                </button>
              </div>

              {expandedId === entry.id && (
                <div className="history-card-expanded">
                  <Results data={entry.fullResults} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default AnalysisHistory;
