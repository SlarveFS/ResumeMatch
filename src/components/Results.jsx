import { useState } from "react";
import { jsPDF } from "jspdf";

function Results({ data, onReset }) {
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [exporting, setExporting] = useState(false);

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

  const getScoreDesc = (score) => {
    if (score >= 80) return "Great alignment with the job description!";
    if (score >= 60) return "Some gaps to address before applying.";
    return "Significant gaps — review suggestions below.";
  };

  const handleCopy = (bullet, index) => {
    navigator.clipboard.writeText(bullet);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleExportPDF = async () => {
    setExporting(true);
    try {
      const doc = new jsPDF({ unit: "pt", format: "letter" });
      const margin = 72;
      const pageWidth = doc.internal.pageSize.getWidth();
      const contentWidth = pageWidth - margin * 2;
      let y = margin;

      const scoreColor = getScoreColor(data.matchScore);
      const hexToRgb = (hex) => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return [r, g, b];
      };

      // Header
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.setTextColor(46, 90, 136);
      doc.text("ResumeMatch Analysis Report", margin, y);
      y += 28;

      // Date
      const today = new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(150, 150, 150);
      doc.text(`Generated on ${today}`, margin, y);
      y += 36;

      // Divider
      doc.setDrawColor(224, 220, 215);
      doc.line(margin, y, pageWidth - margin, y);
      y += 28;

      // Score — large centered
      const [sr, sg, sb] = hexToRgb(scoreColor);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(56);
      doc.setTextColor(sr, sg, sb);
      const scoreText = `${data.matchScore}%`;
      const scoreW = doc.getTextWidth(scoreText);
      doc.text(scoreText, (pageWidth - scoreW) / 2, y);
      y += 16;

      doc.setFontSize(14);
      const labelText = getScoreLabel(data.matchScore);
      const labelW = doc.getTextWidth(labelText);
      doc.text(labelText, (pageWidth - labelW) / 2, y);
      y += 12;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(120, 113, 108);
      const descText = "Keyword and qualification alignment with the job description";
      const descW = doc.getTextWidth(descText);
      doc.text(descText, (pageWidth - descW) / 2, y);
      y += 36;

      doc.setDrawColor(224, 220, 215);
      doc.line(margin, y, pageWidth - margin, y);
      y += 24;

      const addSection = (title, content) => {
        // Check if we need a new page
        if (y > doc.internal.pageSize.getHeight() - 100) {
          doc.addPage();
          y = margin;
        }

        doc.setFont("helvetica", "bold");
        doc.setFontSize(13);
        doc.setTextColor(43, 43, 43);
        doc.text(title, margin, y);
        y += 20;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(68, 64, 60);

        content.forEach((line, i) => {
          const prefix = `${i + 1}. `;
          const wrapped = doc.splitTextToSize(prefix + line, contentWidth);
          wrapped.forEach((wl, wi) => {
            if (y > doc.internal.pageSize.getHeight() - 60) {
              doc.addPage();
              y = margin;
            }
            doc.text(wi === 0 ? wl : "    " + wl.trim(), margin, y);
            y += 15;
          });
          y += 3;
        });

        y += 12;
      };

      const addBulletsSection = (title, items) => {
        if (y > doc.internal.pageSize.getHeight() - 100) {
          doc.addPage();
          y = margin;
        }
        doc.setFont("helvetica", "bold");
        doc.setFontSize(13);
        doc.setTextColor(43, 43, 43);
        doc.text(title, margin, y);
        y += 20;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(68, 64, 60);

        items.forEach((item) => {
          const wrapped = doc.splitTextToSize("• " + item, contentWidth);
          wrapped.forEach((wl, wi) => {
            if (y > doc.internal.pageSize.getHeight() - 60) {
              doc.addPage();
              y = margin;
            }
            doc.text(wi === 0 ? wl : "  " + wl.trim(), margin, y);
            y += 15;
          });
          y += 3;
        });
        y += 12;
      };

      const addKeywordsSection = (title, keywords) => {
        if (y > doc.internal.pageSize.getHeight() - 100) {
          doc.addPage();
          y = margin;
        }
        doc.setFont("helvetica", "bold");
        doc.setFontSize(13);
        doc.setTextColor(43, 43, 43);
        doc.text(title, margin, y);
        y += 20;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(192, 57, 43);
        const kwText = keywords.join("  •  ");
        const wrapped = doc.splitTextToSize(kwText, contentWidth);
        wrapped.forEach((wl) => {
          if (y > doc.internal.pageSize.getHeight() - 60) {
            doc.addPage();
            y = margin;
          }
          doc.text(wl, margin, y);
          y += 15;
        });
        y += 12;
      };

      if (data.strengths?.length) {
        addBulletsSection("What You're Doing Well", data.strengths);
      }
      if (data.missingKeywords?.length) {
        addKeywordsSection("Missing Keywords", data.missingKeywords);
      }
      if (data.suggestedBullets?.length) {
        addSection("Suggested Resume Bullets", data.suggestedBullets);
      }

      // Footer
      const pageCount = doc.internal.getNumberOfPages();
      for (let p = 1; p <= pageCount; p++) {
        doc.setPage(p);
        const footerY = doc.internal.pageSize.getHeight() - 30;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(168, 162, 158);
        const footerText = "Generated by ResumeMatch — built by Slarve Benoit";
        const footerW = doc.getTextWidth(footerText);
        doc.text(footerText, (pageWidth - footerW) / 2, footerY);
      }

      const dateStr = new Date().toISOString().slice(0, 10);
      doc.save(`ResumeMatch-Analysis-${dateStr}.pdf`);
    } finally {
      setExporting(false);
    }
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
            {getScoreDesc(data.matchScore)}
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
                  onClick={() => handleCopy(bullet, i)}
                  title="Copy to clipboard"
                >
                  {copiedIndex === i ? "✅" : "📋"}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Toast notification */}
      {copiedIndex !== null && (
        <div className="toast">Copied to clipboard!</div>
      )}

      {/* Action buttons */}
      <div className="results-actions">
        <button
          className="export-btn"
          onClick={handleExportPDF}
          disabled={exporting}
        >
          {exporting ? (
            <span className="loading-text">
              <span className="spinner spinner-blue"></span> Generating…
            </span>
          ) : (
            "⬇ Export as PDF"
          )}
        </button>

        {onReset && (
          <button className="new-analysis-btn" onClick={onReset}>
            ↩ Start New Analysis
          </button>
        )}
      </div>
    </div>
  );
}

export default Results;
