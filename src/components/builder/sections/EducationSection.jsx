import { useState } from 'react';
import './Sections.css';

function createEducation() {
  return {
    id: crypto.randomUUID(),
    degree: '',
    school: '',
    location: '',
    graduationDate: '',
    gpa: '',
    honors: '',
    coursework: '',
  };
}

function EducationSection({ resumeData, updateResumeData }) {
  const { education } = resumeData;
  const [expandedId, setExpandedId] = useState(education.length > 0 ? education[0].id : null);

  const addEducation = () => {
    const newEd = createEducation();
    updateResumeData({ education: [...education, newEd] });
    setExpandedId(newEd.id);
  };

  const removeEducation = (id) => {
    updateResumeData({ education: education.filter(e => e.id !== id) });
  };

  const updateEducation = (id, field, value) => {
    updateResumeData({
      education: education.map(e => e.id === id ? { ...e, [field]: value } : e)
    });
  };

  return (
    <div className="section-panel">
      <div className="section-panel-header">
        <h2>Education</h2>
        <p>Add your educational background.</p>
      </div>

      {education.length === 0 && (
        <div className="section-empty"><p>No education added yet.</p></div>
      )}

      <div className="entries-list">
        {education.map(ed => (
          <div key={ed.id} className={`entry-card ${expandedId === ed.id ? 'expanded' : ''}`}>
            <div className="entry-card-header" onClick={() => setExpandedId(expandedId === ed.id ? null : ed.id)}>
              <div className="entry-card-title">
                <span className="entry-drag-handle">⠿</span>
                <div>
                  <strong>{ed.degree || 'New Degree'}</strong>
                  {ed.school && <span className="entry-subtitle"> — {ed.school}</span>}
                </div>
              </div>
              <div className="entry-card-actions">
                <button className="entry-delete-btn" onClick={e => { e.stopPropagation(); removeEducation(ed.id); }}>✕</button>
                <span className="entry-chevron">{expandedId === ed.id ? '▲' : '▼'}</span>
              </div>
            </div>
            {expandedId === ed.id && (
              <div className="entry-card-body">
                <div className="form-grid">
                  <div className="form-field form-field-full">
                    <label>Degree *</label>
                    <input
                      className="form-input"
                      value={ed.degree}
                      onChange={e => updateEducation(ed.id, 'degree', e.target.value)}
                      placeholder="Bachelor of Science in Computer Science"
                    />
                  </div>
                  <div className="form-field">
                    <label>School *</label>
                    <input
                      className="form-input"
                      value={ed.school}
                      onChange={e => updateEducation(ed.id, 'school', e.target.value)}
                      placeholder="University of California"
                    />
                  </div>
                  <div className="form-field">
                    <label>Location</label>
                    <input
                      className="form-input"
                      value={ed.location}
                      onChange={e => updateEducation(ed.id, 'location', e.target.value)}
                      placeholder="Berkeley, CA"
                    />
                  </div>
                  <div className="form-field">
                    <label>Graduation Date</label>
                    <input
                      className="form-input"
                      value={ed.graduationDate}
                      onChange={e => updateEducation(ed.id, 'graduationDate', e.target.value)}
                      placeholder="May 2023"
                    />
                  </div>
                  <div className="form-field">
                    <label>GPA <span className="form-optional">(optional)</span></label>
                    <input
                      className="form-input"
                      value={ed.gpa}
                      onChange={e => updateEducation(ed.id, 'gpa', e.target.value)}
                      placeholder="3.8"
                    />
                  </div>
                  <div className="form-field form-field-full">
                    <label>Honors / Awards <span className="form-optional">(optional)</span></label>
                    <input
                      className="form-input"
                      value={ed.honors}
                      onChange={e => updateEducation(ed.id, 'honors', e.target.value)}
                      placeholder="Magna Cum Laude, Dean's List"
                    />
                  </div>
                  <div className="form-field form-field-full">
                    <label>Relevant Coursework <span className="form-optional">(optional)</span></label>
                    <input
                      className="form-input"
                      value={ed.coursework}
                      onChange={e => updateEducation(ed.id, 'coursework', e.target.value)}
                      placeholder="Data Structures, Algorithms, Machine Learning"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <button className="add-entry-btn" onClick={addEducation}>+ Add Education</button>
    </div>
  );
}

export default EducationSection;
