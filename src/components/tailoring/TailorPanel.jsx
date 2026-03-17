import { useState, useCallback } from 'react';
import AILoadingScreen from '../common/AILoadingScreen';
import './TailorPanel.css';

function atsColor(score) {
  if (score >= 86) return 'green';
  if (score >= 66) return 'blue';
  if (score >= 41) return 'amber';
  return 'red';
}

export default function TailorPanel({ resumeData, onApply, onSaveVersion, onClose }) {
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [acceptedSummary, setAcceptedSummary] = useState(false);
  const [acceptedBullets, setAcceptedBullets] = useState({});  // key: `${jobId}-${i}` → true/false
  const [addedSkills, setAddedSkills] = useState(new Set());
  const [saveMsg, setSaveMsg] = useState('');

  const handleAnalyze = async () => {
    if (jobDescription.trim().length < 30) return;
    setLoading(true);
    setError('');
    setResult(null);
    setAcceptedSummary(false);
    setAcceptedBullets({});
    setAddedSkills(new Set());
    try {
      const res = await fetch('/api/tailor-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeData, jobDescription }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
    } catch (e) {
      setError(e.message || 'Failed to analyze. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptAll = () => {
    setAcceptedSummary(true);
    const all = {};
    (result?.bullets || []).forEach((b, i) => {
      all[`${b.jobId}-${i}`] = true;
    });
    setAcceptedBullets(all);
    (result?.skillAdditions || []).forEach(s => {
      setAddedSkills(prev => new Set([...prev, s]));
    });
  };

  const buildTailored = useCallback(() => {
    const data = JSON.parse(JSON.stringify(resumeData));

    if (acceptedSummary && result?.summary?.improved) {
      data.summary = result.summary.improved;
    }

    (result?.bullets || []).forEach((b, i) => {
      const key = `${b.jobId}-${i}`;
      if (!acceptedBullets[key]) return;
      const exp = (data.experience || []).find(e => e.id === b.jobId);
      if (!exp) return;
      if (exp.description) {
        exp.description = exp.description.replace(b.original, b.improved);
      }
      if (exp.bullets) {
        const idx = exp.bullets.indexOf(b.original);
        if (idx !== -1) exp.bullets[idx] = b.improved;
      }
    });

    if (addedSkills.size > 0) {
      if (Array.isArray(data.skills)) {
        data.skills = [...new Set([...data.skills, ...addedSkills])];
      } else if (data.skills && typeof data.skills === 'object') {
        data.skills.technical = [...new Set([...(data.skills.technical || []), ...addedSkills])];
      }
    }

    return data;
  }, [resumeData, result, acceptedSummary, acceptedBullets, addedSkills]);

  const handleApply = () => {
    onApply(buildTailored());
  };

  const handleSaveVersion = () => {
    onSaveVersion(buildTailored());
    setSaveMsg('Saved as new version!');
    setTimeout(() => setSaveMsg(''), 3000);
  };

  const toggleSkill = (skill) => {
    setAddedSkills(prev => {
      const next = new Set(prev);
      if (next.has(skill)) next.delete(skill);
      else next.add(skill);
      return next;
    });
  };

  return (
    <div className="tp-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="tp-panel">
        <div className="tp-header">
          <h2 className="tp-title">Tailor to Job</h2>
          <button className="tp-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        {!result && !loading && (
          <div className="tp-setup">
            <p className="tp-desc">Paste a job description and we'll optimize your resume to match — improving keywords, bullet points, and ATS score.</p>
            <textarea
              className="tp-jd-textarea"
              rows={10}
              value={jobDescription}
              onChange={e => setJobDescription(e.target.value)}
              placeholder="Paste the full job description here…"
            />
            {error && <p className="tp-error">{error}</p>}
            <button
              className="tp-analyze-btn"
              onClick={handleAnalyze}
              disabled={jobDescription.trim().length < 30}
            >
              ✨ Analyze &amp; Tailor
            </button>
          </div>
        )}

        {loading && (
          <AILoadingScreen message="Analyzing your resume against the job description…" />
        )}

        {result && (
          <div className="tp-results">
            {/* ATS Score */}
            <div className={`tp-ats-banner tp-ats-${atsColor(result.atsScore)}`}>
              <span className="tp-ats-label">ATS Match Score</span>
              <span className="tp-ats-score">{result.atsScore}%</span>
            </div>

            {/* Summary */}
            {result.summary?.improved && (
              <div className="tp-card">
                <div className="tp-card-header">
                  <span className="tp-card-title">Professional Summary</span>
                  <button
                    className={`tp-accept-btn ${acceptedSummary ? 'accepted' : ''}`}
                    onClick={() => setAcceptedSummary(v => !v)}
                  >
                    {acceptedSummary ? '✓ Accepted' : 'Accept'}
                  </button>
                </div>
                <div className="tp-diff">
                  <div className="tp-diff-original">
                    <span className="tp-diff-tag">Original</span>
                    <p>{resumeData?.summary || '(no summary)'}</p>
                  </div>
                  <div className="tp-diff-improved">
                    <span className="tp-diff-tag">Improved</span>
                    <p>{result.summary.improved}</p>
                  </div>
                </div>
                {result.summary.reason && (
                  <p className="tp-reason">💡 {result.summary.reason}</p>
                )}
              </div>
            )}

            {/* Bullets */}
            {result.bullets?.length > 0 && (
              <div className="tp-section">
                <h3 className="tp-section-title">Bullet Point Improvements</h3>
                {result.bullets.map((b, i) => {
                  const key = `${b.jobId}-${i}`;
                  const accepted = !!acceptedBullets[key];
                  return (
                    <div key={key} className="tp-card">
                      <div className="tp-card-header">
                        <span className="tp-card-title tp-card-title-sm">{b.jobId ? '' : 'Bullet'}</span>
                        <button
                          className={`tp-accept-btn ${accepted ? 'accepted' : ''}`}
                          onClick={() => setAcceptedBullets(prev => ({ ...prev, [key]: !accepted }))}
                        >
                          {accepted ? '✓ Accepted' : 'Accept'}
                        </button>
                      </div>
                      <div className="tp-diff">
                        <div className="tp-diff-original">
                          <span className="tp-diff-tag">Original</span>
                          <p>{b.original}</p>
                        </div>
                        <div className="tp-diff-improved">
                          <span className="tp-diff-tag">Improved</span>
                          <p>{b.improved}</p>
                        </div>
                      </div>
                      {b.reason && <p className="tp-reason">💡 {b.reason}</p>}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Skill Additions */}
            {result.skillAdditions?.length > 0 && (
              <div className="tp-section">
                <h3 className="tp-section-title">Suggested Skills to Add</h3>
                <div className="tp-skills">
                  {result.skillAdditions.map(skill => (
                    <button
                      key={skill}
                      className={`tp-skill-chip ${addedSkills.has(skill) ? 'added' : ''}`}
                      onClick={() => toggleSkill(skill)}
                    >
                      {addedSkills.has(skill) ? '✓ ' : '+ '}{skill}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Missing Qualifications */}
            {result.missingQualifications?.length > 0 && (
              <div className="tp-section">
                <h3 className="tp-section-title">Missing Qualifications</h3>
                <ul className="tp-missing-list">
                  {result.missingQualifications.map(q => (
                    <li key={q} className="tp-missing-item">⚠ {q}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Actions */}
            <div className="tp-actions">
              <button className="tp-btn tp-btn-secondary" onClick={handleAcceptAll}>
                Accept All
              </button>
              <button className="tp-btn tp-btn-secondary" onClick={handleSaveVersion}>
                Save as New Version
              </button>
              <button className="tp-btn tp-btn-primary" onClick={handleApply}>
                Apply Accepted Changes
              </button>
            </div>
            {saveMsg && <p className="tp-save-msg">{saveMsg}</p>}

            <button className="tp-reanalyze" onClick={() => setResult(null)}>
              ← Paste a different job description
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
