import { useState } from 'react';
import './Sections.css';

function createJob() {
  return {
    id: crypto.randomUUID(),
    jobTitle: '',
    company: '',
    location: '',
    startDate: '',
    endDate: '',
    current: false,
    bullets: [''],
  };
}

function ExperienceSection({ resumeData, updateResumeData }) {
  const { experience } = resumeData;
  const [expandedJob, setExpandedJob] = useState(experience.length > 0 ? experience[0].id : null);

  const addJob = () => {
    const newJob = createJob();
    updateResumeData({ experience: [...experience, newJob] });
    setExpandedJob(newJob.id);
  };

  const removeJob = (id) => {
    updateResumeData({ experience: experience.filter(j => j.id !== id) });
  };

  const updateJob = (id, field, value) => {
    updateResumeData({
      experience: experience.map(j => j.id === id ? { ...j, [field]: value } : j)
    });
  };

  const addBullet = (jobId) => {
    updateResumeData({
      experience: experience.map(j => j.id === jobId ? { ...j, bullets: [...j.bullets, ''] } : j)
    });
  };

  const updateBullet = (jobId, idx, value) => {
    updateResumeData({
      experience: experience.map(j => j.id === jobId ? {
        ...j,
        bullets: j.bullets.map((b, i) => i === idx ? value : b)
      } : j)
    });
  };

  const removeBullet = (jobId, idx) => {
    updateResumeData({
      experience: experience.map(j => j.id === jobId ? {
        ...j,
        bullets: j.bullets.filter((_, i) => i !== idx)
      } : j)
    });
  };

  return (
    <div className="section-panel">
      <div className="section-panel-header">
        <h2>Work Experience</h2>
        <p>Add your work history, starting with the most recent.</p>
      </div>

      {experience.length === 0 && (
        <div className="section-empty">
          <p>No experience added yet. Click below to add your first job.</p>
        </div>
      )}

      <div className="entries-list">
        {experience.map((job) => (
          <div key={job.id} className={`entry-card ${expandedJob === job.id ? 'expanded' : ''}`}>
            <div className="entry-card-header" onClick={() => setExpandedJob(expandedJob === job.id ? null : job.id)}>
              <div className="entry-card-title">
                <span className="entry-drag-handle">⠿</span>
                <div>
                  <strong>{job.jobTitle || 'New Position'}</strong>
                  {job.company && <span className="entry-subtitle"> at {job.company}</span>}
                </div>
              </div>
              <div className="entry-card-actions">
                <button className="entry-delete-btn" onClick={e => { e.stopPropagation(); removeJob(job.id); }}>✕</button>
                <span className="entry-chevron">{expandedJob === job.id ? '▲' : '▼'}</span>
              </div>
            </div>

            {expandedJob === job.id && (
              <div className="entry-card-body">
                <div className="form-grid">
                  <div className="form-field">
                    <label>Job Title *</label>
                    <input
                      className="form-input"
                      value={job.jobTitle}
                      onChange={e => updateJob(job.id, 'jobTitle', e.target.value)}
                      placeholder="Software Engineer"
                    />
                  </div>
                  <div className="form-field">
                    <label>Company *</label>
                    <input
                      className="form-input"
                      value={job.company}
                      onChange={e => updateJob(job.id, 'company', e.target.value)}
                      placeholder="Acme Corp"
                    />
                  </div>
                  <div className="form-field">
                    <label>Location</label>
                    <input
                      className="form-input"
                      value={job.location}
                      onChange={e => updateJob(job.id, 'location', e.target.value)}
                      placeholder="San Francisco, CA"
                    />
                  </div>
                  <div className="form-field">
                    <label>Start Date</label>
                    <input
                      className="form-input"
                      value={job.startDate}
                      onChange={e => updateJob(job.id, 'startDate', e.target.value)}
                      placeholder="Jan 2022"
                    />
                  </div>
                  <div className="form-field">
                    <label>End Date</label>
                    <input
                      className="form-input"
                      value={job.endDate}
                      onChange={e => updateJob(job.id, 'endDate', e.target.value)}
                      placeholder="Present"
                      disabled={job.current}
                    />
                  </div>
                  <div className="form-field form-field-checkbox">
                    <label>
                      <input
                        type="checkbox"
                        checked={job.current}
                        onChange={e => {
                          updateJob(job.id, 'current', e.target.checked);
                          if (e.target.checked) updateJob(job.id, 'endDate', 'Present');
                        }}
                      />
                      Currently working here
                    </label>
                  </div>
                </div>

                <div className="bullets-section">
                  <div className="bullets-header">
                    <label>Bullet Points</label>
                    <button className="ai-btn-small" disabled>✨ Generate with AI</button>
                  </div>
                  {job.bullets.map((bullet, bIdx) => (
                    <div key={bIdx} className="bullet-row">
                      <span className="bullet-dot">•</span>
                      <input
                        className="form-input bullet-input"
                        value={bullet}
                        onChange={e => updateBullet(job.id, bIdx, e.target.value)}
                        placeholder="Describe an accomplishment or responsibility..."
                      />
                      <div className="bullet-actions">
                        <button className="ai-icon-btn" disabled title="Improve with AI">✨</button>
                        <button
                          className="bullet-remove-btn"
                          onClick={() => removeBullet(job.id, bIdx)}
                          disabled={job.bullets.length === 1}
                        >✕</button>
                      </div>
                    </div>
                  ))}
                  <button className="add-bullet-btn" onClick={() => addBullet(job.id)}>
                    + Add bullet
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <button className="add-entry-btn" onClick={addJob}>
        + Add Work Experience
      </button>
    </div>
  );
}

export default ExperienceSection;
