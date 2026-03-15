import './Sections.css';

function PersonalInfoSection({ resumeData, updateResumeData }) {
  const { personalInfo } = resumeData;

  const update = (field, value) => {
    updateResumeData({
      personalInfo: { ...personalInfo, [field]: value }
    });
  };

  return (
    <div className="section-panel">
      <div className="section-panel-header">
        <h2>Personal Information</h2>
        <p>This appears at the top of your resume.</p>
      </div>

      <div className="form-grid">
        <div className="form-field form-field-full">
          <label>Full Name *</label>
          <input
            type="text"
            value={personalInfo.fullName}
            onChange={e => update('fullName', e.target.value)}
            placeholder="Jane Smith"
            className="form-input"
          />
        </div>

        <div className="form-field">
          <label>Email *</label>
          <input
            type="email"
            value={personalInfo.email}
            onChange={e => update('email', e.target.value)}
            placeholder="jane@example.com"
            className="form-input"
          />
        </div>

        <div className="form-field">
          <label>Phone</label>
          <input
            type="tel"
            value={personalInfo.phone}
            onChange={e => update('phone', e.target.value)}
            placeholder="(555) 123-4567"
            className="form-input"
          />
        </div>

        <div className="form-field form-field-full">
          <label>Location</label>
          <input
            type="text"
            value={personalInfo.location}
            onChange={e => update('location', e.target.value)}
            placeholder="New York, NY"
            className="form-input"
          />
        </div>

        <div className="form-field form-field-full">
          <label>LinkedIn URL <span className="form-optional">(optional)</span></label>
          <input
            type="url"
            value={personalInfo.linkedin}
            onChange={e => update('linkedin', e.target.value)}
            placeholder="linkedin.com/in/janesmith"
            className="form-input"
          />
        </div>

        <div className="form-field">
          <label>GitHub URL <span className="form-optional">(optional)</span></label>
          <input
            type="url"
            value={personalInfo.github}
            onChange={e => update('github', e.target.value)}
            placeholder="github.com/janesmith"
            className="form-input"
          />
        </div>

        <div className="form-field">
          <label>Portfolio / Website <span className="form-optional">(optional)</span></label>
          <input
            type="url"
            value={personalInfo.website}
            onChange={e => update('website', e.target.value)}
            placeholder="janesmith.com"
            className="form-input"
          />
        </div>
      </div>
    </div>
  );
}

export default PersonalInfoSection;
