import { useState } from 'react';
import { calculateScore, getScoreEmoji, getScoreColor, wizardDataToStorageFormat } from '../../../utils/wizardScore';
import { exportResumeToPDF } from '../../../utils/pdfExport';

// Build the expandable improvement checklist from the score logic
function buildChecklist(data) {
  const items = [];
  const pi = data.personalInfo || {};
  const exp = data.experience || [];
  const edu = data.education || [];
  const skillsWL = data.skillsWithLevel || [];

  if (!pi.firstName || !pi.lastName || !pi.email || !pi.phone) {
    items.push({ key: 'personal', label: 'Complete personal details (name, email, phone)', pts: 10, done: false, step: 1 });
  } else {
    items.push({ key: 'personal', label: 'Personal details complete', pts: 10, done: true, step: 1 });
  }

  if (!(pi.jobTarget || '').trim()) {
    items.push({ key: 'target', label: 'Add your job target role', pts: 10, done: false, step: 1 });
  } else {
    items.push({ key: 'target', label: `Job target: "${pi.jobTarget}"`, pts: 10, done: true, step: 1 });
  }

  const goodExp = exp.some(e => {
    const lines = (e.description || '').split('\n').filter(l => l.trim()).length;
    return lines >= 3 || (e.bullets || []).filter(b => b.trim()).length >= 3;
  });
  items.push({
    key: 'exp',
    label: goodExp ? 'Experience has 3+ bullet points' : 'Add 3+ bullet points to an experience entry',
    pts: 25, done: goodExp, step: 2,
  });

  const hasEdu = edu.length > 0 && (edu[0].school || edu[0].degree);
  items.push({
    key: 'edu',
    label: hasEdu ? 'Education added' : 'Add your education',
    pts: 15, done: hasEdu, step: 3,
  });

  items.push({
    key: 'skills',
    label: skillsWL.length >= 5 ? `${skillsWL.length} skills added` : `Add ${5 - skillsWL.length} more skills (need 5+)`,
    pts: 10, done: skillsWL.length >= 5, step: 4,
  });

  const summaryLen = (data.summary || '').length;
  items.push({
    key: 'summary',
    label: summaryLen >= 200 ? 'Professional summary written' : 'Write a 200+ character professional summary',
    pts: 15, done: summaryLen >= 200, step: 5,
  });

  const hasExtra = (data.customSections || []).length > 0;
  items.push({
    key: 'extra',
    label: hasExtra ? 'Additional section added' : 'Add an extra section (Certifications, Projects, etc.)',
    pts: 5, done: hasExtra, step: 6,
  });

  if (exp.length >= 2) {
    items.push({ key: 'exp2', label: '2+ experience entries', pts: 5, done: true, step: 2 });
  } else {
    items.push({ key: 'exp2', label: 'Add a second job entry (+5%)', pts: 5, done: false, step: 2 });
  }

  return items;
}

export default function Step7Review({ data, onGoToStep, onDownload }) {
  const score = calculateScore(data);
  const emoji = getScoreEmoji(score);
  const color = getScoreColor(score);
  const checklist = buildChecklist(data);
  const done = checklist.filter(i => i.done);
  const pending = checklist.filter(i => !i.done);

  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewItems, setReviewItems] = useState([]);
  const [reviewAdvice, setReviewAdvice] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [reviewOpen, setReviewOpen] = useState(false);

  const handleAIReview = async () => {
    setReviewLoading(true);
    setReviewError('');
    setReviewOpen(true);
    try {
      const storageData = wizardDataToStorageFormat(data);
      const resumeSummary = {
        personalInfo: storageData.personalInfo,
        summary: storageData.summary,
        experience: (storageData.experience || []).map(e => ({
          jobTitle: e.jobTitle, company: e.company,
          bullets: (e.bullets || []).slice(0, 3),
        })),
        education: storageData.education,
        skills: storageData.skills,
      };

      const res = await fetch('/api/suggest-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section: 'review', resumeData: resumeSummary }),
      });
      if (!res.ok) throw new Error('API error');
      const json = await res.json();
      if (json.feedback) setReviewItems(json.feedback);
      if (json.overallAdvice) setReviewAdvice(json.overallAdvice);
    } catch {
      setReviewError('AI Review unavailable. Check your connection and try again.');
    } finally {
      setReviewLoading(false);
    }
  };

  const handleDownload = async () => {
    if (onDownload) { onDownload(); return; }
    // Fallback: open expert editor which has download capability
  };

  return (
    <div className="wizard-step">
      <div className="wizard-step-header">
        <h2 className="wizard-step-title">Review &amp; Improve</h2>
        <p className="wizard-step-subtitle">
          Your resume is taking shape! See what's done and what would make it even stronger.
        </p>
      </div>

      {/* Score hero */}
      <div className="review-score-hero" style={{ borderColor: `${color}40`, background: `${color}08` }}>
        <span className="review-score-emoji">{emoji}</span>
        <div className="review-score-info">
          <div className="review-score-number" style={{ color }}>{score}%</div>
          <div className="review-score-label">
            {score >= 80 ? 'Outstanding resume!' : score >= 60 ? 'Great resume — a few improvements left' : score >= 40 ? 'Good start — improve a few things to shine' : 'Keep going — add more content to boost your score'}
          </div>
        </div>
        <div className="review-score-bar-wrap">
          <div className="review-score-bar-track">
            <div className="review-score-bar-fill" style={{ width: `${score}%`, background: color }} />
          </div>
        </div>
      </div>

      {/* Checklist */}
      <div className="review-checklist">
        {/* Pending items */}
        {pending.length > 0 && (
          <div className="review-checklist-section">
            <h3 className="review-checklist-heading">Improvements available</h3>
            {pending.map(item => (
              <div key={item.key} className="review-item review-item-pending">
                <span className="review-item-check review-item-empty">○</span>
                <span className="review-item-label">{item.label}</span>
                <span className="review-item-pts">+{item.pts}%</span>
                <button
                  type="button"
                  className="review-item-goto"
                  onClick={() => onGoToStep(item.step)}
                >
                  Fix →
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Done items */}
        {done.length > 0 && (
          <div className="review-checklist-section">
            <h3 className="review-checklist-heading review-checklist-heading-done">Completed</h3>
            {done.map(item => (
              <div key={item.key} className="review-item review-item-done">
                <span className="review-item-check">✓</span>
                <span className="review-item-label">{item.label}</span>
                <span className="review-item-pts review-item-pts-done">+{item.pts}%</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* AI Review */}
      <div className="review-ai-section">
        <button
          type="button"
          className="review-ai-btn"
          onClick={handleAIReview}
          disabled={reviewLoading}
        >
          {reviewLoading ? '⏳ Getting AI review…' : '🤖 Get AI Review'}
        </button>
        {reviewError && <p className="wizard-improve-error" style={{ marginTop: '0.5rem' }}>{reviewError}</p>}
      </div>

      {/* AI Review results */}
      {reviewOpen && !reviewLoading && reviewItems.length > 0 && (
        <div className="review-ai-results">
          <h3 className="review-ai-results-title">AI Feedback</h3>
          {reviewAdvice && (
            <div className="review-ai-advice">{reviewAdvice}</div>
          )}
          {reviewItems.map((item, i) => (
            <div key={i} className="review-ai-item">
              <span className="review-ai-category">{item.category}</span>
              <p className="review-ai-issue">{item.issue}</p>
              <p className="review-ai-suggestion">→ {item.suggestion}</p>
            </div>
          ))}
        </div>
      )}

      {/* Action buttons */}
      <div className="review-actions">
        <p className="review-actions-label">Ready to finalize your resume?</p>
        <div className="review-actions-btns">
          <button
            type="button"
            className="review-btn-edit"
            onClick={() => onGoToStep(1)}
          >
            ← Edit More
          </button>
          <button
            type="button"
            className="review-btn-download"
            onClick={handleDownload}
          >
            Download PDF →
          </button>
        </div>
        <p className="review-actions-hint">
          You can also download from the full editor after clicking "Finish &amp; Open Editor" below.
        </p>
      </div>
    </div>
  );
}
