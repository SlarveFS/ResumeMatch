import { useState } from 'react';
import LocationAutocomplete from '../../common/LocationAutocomplete';
import '../../common/LocationAutocomplete.css';

function isValidEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}

function isValidPhone(v) {
  return /^[\d\s().+\-]{7,20}$/.test(v.trim());
}

export default function Step1Personal({ data, onChange, showErrors }) {
  const pi = data.personalInfo || {};
  const [expanded, setExpanded] = useState(false);

  const set = (field, value) => {
    onChange({
      personalInfo: { ...pi, [field]: value },
    });
  };

  // Determine which fields have errors (only shown when showErrors=true)
  const errors = showErrors ? {
    firstName: !pi.firstName?.trim() ? 'First name is required' : '',
    lastName: !pi.lastName?.trim() ? 'Last name is required' : '',
    jobTarget: !pi.jobTarget?.trim() ? 'Job target is required' : '',
    email: !pi.email?.trim()
      ? 'Email is required'
      : !isValidEmail(pi.email)
      ? 'Enter a valid email address'
      : '',
    phone: pi.phone?.trim() && !isValidPhone(pi.phone) ? 'Enter a valid phone number' : '',
  } : {};

  const fieldClass = (key) => `wizard-input${errors[key] ? ' wizard-input-error' : ''}`;

  return (
    <div className="wizard-step">
      <div className="wizard-step-header">
        <h2 className="wizard-step-title">Personal Details</h2>
        <p className="wizard-step-subtitle">
          Fill in your details and the job title you are aiming for to make a clear first impression.
        </p>
      </div>

      <div className="wizard-form">
        {/* Name row */}
        <div className="wizard-field-row">
          <div className="wizard-field">
            <label className="wizard-label">First Name <span className="wizard-required">*</span></label>
            <input
              className={fieldClass('firstName')}
              type="text"
              placeholder="Jane"
              value={pi.firstName || ''}
              onChange={e => set('firstName', e.target.value)}
            />
            {errors.firstName && <span className="wizard-field-error">{errors.firstName}</span>}
          </div>
          <div className="wizard-field">
            <label className="wizard-label">Last Name <span className="wizard-required">*</span></label>
            <input
              className={fieldClass('lastName')}
              type="text"
              placeholder="Smith"
              value={pi.lastName || ''}
              onChange={e => set('lastName', e.target.value)}
            />
            {errors.lastName && <span className="wizard-field-error">{errors.lastName}</span>}
          </div>
        </div>

        {/* Job target — full width */}
        <div className="wizard-field wizard-field-full">
          <label className="wizard-label">Job Target <span className="wizard-required">*</span></label>
          <input
            className={fieldClass('jobTarget')}
            type="text"
            placeholder="The role you want, e.g. Senior Product Manager"
            value={pi.jobTarget || ''}
            onChange={e => set('jobTarget', e.target.value)}
          />
          {errors.jobTarget && <span className="wizard-field-error">{errors.jobTarget}</span>}
        </div>

        {/* Email + Phone */}
        <div className="wizard-field-row">
          <div className="wizard-field">
            <label className="wizard-label">Email <span className="wizard-required">*</span></label>
            <input
              className={fieldClass('email')}
              type="email"
              placeholder="jane@example.com"
              value={pi.email || ''}
              onChange={e => set('email', e.target.value)}
            />
            {errors.email && <span className="wizard-field-error">{errors.email}</span>}
          </div>
          <div className="wizard-field">
            <label className="wizard-label">Phone</label>
            <input
              className={fieldClass('phone')}
              type="tel"
              placeholder="(555) 123-4567"
              value={pi.phone || ''}
              onChange={e => set('phone', e.target.value)}
            />
            {errors.phone && <span className="wizard-field-error">{errors.phone}</span>}
          </div>
        </div>

        {/* Address */}
        <div className="wizard-field wizard-field-full">
          <label className="wizard-label">City / Address</label>
          <LocationAutocomplete
            value={pi.address || ''}
            onChange={v => set('address', v)}
            placeholder="New York, NY or 123 Main St, New York, NY 10001"
          />
        </div>

        {/* Recruiter tip */}
        <div className="wizard-recruiter-tip">
          <span className="wizard-tip-icon">💡</span>
          <p>
            <strong>Recruiter tip:</strong> Users who added phone number and email received{' '}
            <strong>64% more positive feedback</strong> from recruiters.
          </p>
        </div>

        {/* Expand: LinkedIn, Website, City, State, Zip */}
        <button
          type="button"
          className="wizard-expand-btn"
          onClick={() => setExpanded(v => !v)}
        >
          {expanded ? '▲ Hide extra details' : '+ Add more details'}{' '}
          <span className="wizard-expand-hint">(LinkedIn, Website, City, State, Zip)</span>
        </button>

        {expanded && (
          <div className="wizard-expanded">
            <div className="wizard-field-row">
              <div className="wizard-field">
                <label className="wizard-label">LinkedIn</label>
                <input
                  className="wizard-input"
                  type="url"
                  placeholder="linkedin.com/in/janesmith"
                  value={pi.linkedin || ''}
                  onChange={e => set('linkedin', e.target.value)}
                />
              </div>
              <div className="wizard-field">
                <label className="wizard-label">Website / Portfolio</label>
                <input
                  className="wizard-input"
                  type="url"
                  placeholder="janesmith.com"
                  value={pi.website || ''}
                  onChange={e => set('website', e.target.value)}
                />
              </div>
            </div>
            <div className="wizard-field-row wizard-field-row-3">
              <div className="wizard-field">
                <label className="wizard-label">City</label>
                <LocationAutocomplete
                  value={pi.city || ''}
                  onChange={v => set('city', v)}
                  placeholder="New York"
                />
              </div>
              <div className="wizard-field">
                <label className="wizard-label">State</label>
                <input
                  className="wizard-input"
                  type="text"
                  placeholder="NY"
                  value={pi.state || ''}
                  onChange={e => set('state', e.target.value)}
                />
              </div>
              <div className="wizard-field">
                <label className="wizard-label">Zip</label>
                <input
                  className="wizard-input"
                  type="text"
                  placeholder="10001"
                  value={pi.zip || ''}
                  onChange={e => set('zip', e.target.value)}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
