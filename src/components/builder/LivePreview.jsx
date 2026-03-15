import './LivePreview.css';

// ── Shared helpers ────────────────────────────────────────────────────────────

function buildContactFields(pi) {
  return [pi.email, pi.phone, pi.location, pi.linkedin, pi.github, pi.website].filter(Boolean);
}

function ContactLine({ fields, separator = ' · ', className = 'rp-contact', sepClass = 'rp-contact-sep' }) {
  if (!fields.length) return null;
  return (
    <div className={className}>
      {fields.map((f, i) => (
        <span key={i} className="rp-contact-item">
          {i > 0 && <span className={sepClass}>{separator}</span>}
          {f}
        </span>
      ))}
    </div>
  );
}

function BulletList({ bullets }) {
  const filtered = (bullets || []).filter(b => b.trim());
  if (!filtered.length) return null;
  return (
    <ul className="rp-bullets">
      {filtered.map((b, i) => <li key={i}>{b}</li>)}
    </ul>
  );
}

function SkillGroups({ skills }) {
  const groups = [
    { key: 'technical', label: 'Technical' },
    { key: 'tools', label: 'Tools' },
    { key: 'soft', label: 'Soft Skills' },
    { key: 'languages', label: 'Languages' },
    { key: 'certifications', label: 'Certifications' },
  ];
  return (
    <div className="rp-skills">
      {groups.filter(g => skills[g.key]?.length > 0).map(g => (
        <div key={g.key} className="rp-skill-group">
          <strong>{g.label}: </strong>{skills[g.key].join(' · ')}
        </div>
      ))}
    </div>
  );
}

// ── Classic Layout ─────────────────────────────────────────────────────────────
// Traditional single-column, centered header, Georgia serif, navy underlines

function ClassicLayout({ d }) {
  const fields = buildContactFields(d.personalInfo);
  return (
    <>
      {(d.personalInfo.fullName || fields.length > 0) && (
        <div className="rp-header">
          {d.personalInfo.fullName && <h1 className="rp-name">{d.personalInfo.fullName}</h1>}
          <ContactLine fields={fields} />
        </div>
      )}

      {d.summary && (
        <div className="rp-section">
          <h2 className="rp-section-title">Professional Summary</h2>
          <p className="rp-summary">{d.summary}</p>
        </div>
      )}

      {d.experience.length > 0 && (
        <div className="rp-section">
          <h2 className="rp-section-title">Experience</h2>
          {d.experience.map(job => (
            <div key={job.id} className="rp-entry">
              <div className="rp-entry-header">
                <div className="rp-entry-left">
                  <strong className="rp-entry-title">{job.jobTitle}</strong>
                  {job.company && <span className="rp-entry-company"> — {job.company}</span>}
                  {job.location && <span className="rp-entry-location">, {job.location}</span>}
                </div>
                <span className="rp-entry-date">
                  {[job.startDate, job.current ? 'Present' : job.endDate].filter(Boolean).join(' – ')}
                </span>
              </div>
              <BulletList bullets={job.bullets} />
            </div>
          ))}
        </div>
      )}

      {d.education.length > 0 && (
        <div className="rp-section">
          <h2 className="rp-section-title">Education</h2>
          {d.education.map(ed => (
            <div key={ed.id} className="rp-entry">
              <div className="rp-entry-header">
                <div className="rp-entry-left">
                  <strong className="rp-entry-title">{ed.degree}</strong>
                  {ed.school && <span className="rp-entry-company"> — {ed.school}</span>}
                  {ed.location && <span className="rp-entry-location">, {ed.location}</span>}
                  {ed.gpa && <span className="rp-entry-gpa"> | GPA: {ed.gpa}</span>}
                </div>
                {ed.graduationDate && <span className="rp-entry-date">{ed.graduationDate}</span>}
              </div>
              {ed.honors && <p className="rp-honors">{ed.honors}</p>}
              {ed.coursework && <p className="rp-coursework">Coursework: {ed.coursework}</p>}
            </div>
          ))}
        </div>
      )}

      {d.allSkills.length > 0 && (
        <div className="rp-section">
          <h2 className="rp-section-title">Skills</h2>
          <SkillGroups skills={d.skills} />
        </div>
      )}

      {d.projects.length > 0 && (
        <div className="rp-section">
          <h2 className="rp-section-title">Projects</h2>
          {d.projects.map(proj => (
            <div key={proj.id} className="rp-entry">
              <div className="rp-entry-header">
                <strong className="rp-entry-title">{proj.name}</strong>
                {proj.link && <span className="rp-entry-link"> · {proj.link}</span>}
              </div>
              {proj.technologies.length > 0 && <p className="rp-proj-tech">{proj.technologies.join(', ')}</p>}
              {proj.description && <p className="rp-proj-desc">{proj.description}</p>}
              <BulletList bullets={proj.bullets} />
            </div>
          ))}
        </div>
      )}
    </>
  );
}

// ── Modern Layout ──────────────────────────────────────────────────────────────
// Two-column: dark navy sidebar (contact + skills) | white main (experience, edu, projects)

function ModernLayout({ d }) {
  const fields = buildContactFields(d.personalInfo);
  const sidebarSkills = [
    ...(d.skills.technical || []),
    ...(d.skills.tools || []),
    ...(d.skills.soft || []),
    ...(d.skills.languages || []),
    ...(d.skills.certifications || []),
  ];

  return (
    <div className="rp-modern-wrap">
      {/* Sidebar */}
      <div className="rp-sidebar">
        {d.personalInfo.fullName && (
          <div className="rp-sidebar-name-block">
            <h1 className="rp-sidebar-name">{d.personalInfo.fullName}</h1>
          </div>
        )}

        {fields.length > 0 && (
          <div className="rp-sidebar-section">
            <h3 className="rp-sidebar-title">Contact</h3>
            {fields.map((f, i) => <p key={i} className="rp-sidebar-contact-item">{f}</p>)}
          </div>
        )}

        {sidebarSkills.length > 0 && (
          <div className="rp-sidebar-section">
            <h3 className="rp-sidebar-title">Skills</h3>
            <div className="rp-sidebar-skills">
              {sidebarSkills.map(s => <span key={s} className="rp-sidebar-skill">{s}</span>)}
            </div>
          </div>
        )}
      </div>

      {/* Main column */}
      <div className="rp-main">
        {d.summary && (
          <div className="rp-section">
            <h2 className="rp-section-title">Summary</h2>
            <p className="rp-summary">{d.summary}</p>
          </div>
        )}

        {d.experience.length > 0 && (
          <div className="rp-section">
            <h2 className="rp-section-title">Experience</h2>
            {d.experience.map(job => (
              <div key={job.id} className="rp-entry">
                <div className="rp-entry-header">
                  <div className="rp-entry-left">
                    <strong className="rp-entry-title">{job.jobTitle}</strong>
                    {job.company && <span className="rp-entry-company"> — {job.company}</span>}
                    {job.location && <span className="rp-entry-location">, {job.location}</span>}
                  </div>
                  <span className="rp-entry-date">
                    {[job.startDate, job.current ? 'Present' : job.endDate].filter(Boolean).join(' – ')}
                  </span>
                </div>
                <BulletList bullets={job.bullets} />
              </div>
            ))}
          </div>
        )}

        {d.education.length > 0 && (
          <div className="rp-section">
            <h2 className="rp-section-title">Education</h2>
            {d.education.map(ed => (
              <div key={ed.id} className="rp-entry">
                <div className="rp-entry-header">
                  <div className="rp-entry-left">
                    <strong className="rp-entry-title">{ed.degree}</strong>
                    {ed.school && <span className="rp-entry-company"> — {ed.school}</span>}
                  </div>
                  {ed.graduationDate && <span className="rp-entry-date">{ed.graduationDate}</span>}
                </div>
                {ed.gpa && <p className="rp-coursework">GPA: {ed.gpa}</p>}
                {ed.honors && <p className="rp-honors">{ed.honors}</p>}
              </div>
            ))}
          </div>
        )}

        {d.projects.length > 0 && (
          <div className="rp-section">
            <h2 className="rp-section-title">Projects</h2>
            {d.projects.map(proj => (
              <div key={proj.id} className="rp-entry">
                <div className="rp-entry-header">
                  <strong className="rp-entry-title">{proj.name}</strong>
                  {proj.link && <span className="rp-entry-link"> · {proj.link}</span>}
                </div>
                {proj.technologies.length > 0 && <p className="rp-proj-tech">{proj.technologies.join(', ')}</p>}
                {proj.description && <p className="rp-proj-desc">{proj.description}</p>}
                <BulletList bullets={proj.bullets} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Minimal Layout ─────────────────────────────────────────────────────────────
// Single column, extreme whitespace, elegant light typography — same structure as
// Classic but CSS does heavy lifting (see .template-minimal overrides)

function MinimalLayout({ d }) {
  // Same as Classic but with different section title wording and no inline separators
  const fields = buildContactFields(d.personalInfo);
  return (
    <>
      {(d.personalInfo.fullName || fields.length > 0) && (
        <div className="rp-header">
          {d.personalInfo.fullName && <h1 className="rp-name">{d.personalInfo.fullName}</h1>}
          <ContactLine fields={fields} separator="   ·   " />
        </div>
      )}

      {d.summary && (
        <div className="rp-section">
          <h2 className="rp-section-title">Profile</h2>
          <p className="rp-summary">{d.summary}</p>
        </div>
      )}

      {d.experience.length > 0 && (
        <div className="rp-section">
          <h2 className="rp-section-title">Work History</h2>
          {d.experience.map(job => (
            <div key={job.id} className="rp-entry">
              <div className="rp-entry-header">
                <div className="rp-entry-left">
                  <strong className="rp-entry-title">{job.jobTitle}</strong>
                  {job.company && <span className="rp-entry-company">, {job.company}</span>}
                  {job.location && <span className="rp-entry-location"> · {job.location}</span>}
                </div>
                <span className="rp-entry-date">
                  {[job.startDate, job.current ? 'Present' : job.endDate].filter(Boolean).join(' – ')}
                </span>
              </div>
              <BulletList bullets={job.bullets} />
            </div>
          ))}
        </div>
      )}

      {d.education.length > 0 && (
        <div className="rp-section">
          <h2 className="rp-section-title">Education</h2>
          {d.education.map(ed => (
            <div key={ed.id} className="rp-entry">
              <div className="rp-entry-header">
                <div className="rp-entry-left">
                  <strong className="rp-entry-title">{ed.degree}</strong>
                  {ed.school && <span className="rp-entry-company">, {ed.school}</span>}
                </div>
                {ed.graduationDate && <span className="rp-entry-date">{ed.graduationDate}</span>}
              </div>
              {ed.gpa && <p className="rp-coursework">GPA {ed.gpa}{ed.honors ? ` · ${ed.honors}` : ''}</p>}
            </div>
          ))}
        </div>
      )}

      {d.allSkills.length > 0 && (
        <div className="rp-section">
          <h2 className="rp-section-title">Expertise</h2>
          <SkillGroups skills={d.skills} />
        </div>
      )}

      {d.projects.length > 0 && (
        <div className="rp-section">
          <h2 className="rp-section-title">Selected Work</h2>
          {d.projects.map(proj => (
            <div key={proj.id} className="rp-entry">
              <div className="rp-entry-header">
                <strong className="rp-entry-title">{proj.name}</strong>
                {proj.link && <span className="rp-entry-link"> · {proj.link}</span>}
              </div>
              {proj.technologies.length > 0 && <p className="rp-proj-tech">{proj.technologies.join(', ')}</p>}
              {proj.description && <p className="rp-proj-desc">{proj.description}</p>}
              <BulletList bullets={proj.bullets} />
            </div>
          ))}
        </div>
      )}
    </>
  );
}

// ── Bold Layout ────────────────────────────────────────────────────────────────
// Strong filled section headers, heavy typography, left-aligned name

function BoldLayout({ d }) {
  const fields = buildContactFields(d.personalInfo);
  return (
    <>
      {(d.personalInfo.fullName || fields.length > 0) && (
        <div className="rp-header">
          {d.personalInfo.fullName && <h1 className="rp-name">{d.personalInfo.fullName}</h1>}
          <ContactLine fields={fields} separator=" | " />
        </div>
      )}

      {d.summary && (
        <div className="rp-section">
          <h2 className="rp-section-title">Professional Summary</h2>
          <p className="rp-summary">{d.summary}</p>
        </div>
      )}

      {d.experience.length > 0 && (
        <div className="rp-section">
          <h2 className="rp-section-title">Work Experience</h2>
          {d.experience.map(job => (
            <div key={job.id} className="rp-entry">
              <div className="rp-entry-header">
                <div className="rp-entry-left">
                  <strong className="rp-entry-title">{job.jobTitle}</strong>
                  {job.company && <span className="rp-bold-company"> | {job.company}</span>}
                  {job.location && <span className="rp-entry-location"> | {job.location}</span>}
                </div>
                <span className="rp-entry-date">
                  {[job.startDate, job.current ? 'Present' : job.endDate].filter(Boolean).join(' – ')}
                </span>
              </div>
              <BulletList bullets={job.bullets} />
            </div>
          ))}
        </div>
      )}

      {d.education.length > 0 && (
        <div className="rp-section">
          <h2 className="rp-section-title">Education</h2>
          {d.education.map(ed => (
            <div key={ed.id} className="rp-entry">
              <div className="rp-entry-header">
                <div className="rp-entry-left">
                  <strong className="rp-entry-title">{ed.degree}</strong>
                  {ed.school && <span className="rp-bold-company"> | {ed.school}</span>}
                </div>
                {ed.graduationDate && <span className="rp-entry-date">{ed.graduationDate}</span>}
              </div>
              {ed.honors && <p className="rp-honors">{ed.honors}</p>}
            </div>
          ))}
        </div>
      )}

      {d.allSkills.length > 0 && (
        <div className="rp-section">
          <h2 className="rp-section-title">Core Skills</h2>
          <SkillGroups skills={d.skills} />
        </div>
      )}

      {d.projects.length > 0 && (
        <div className="rp-section">
          <h2 className="rp-section-title">Projects</h2>
          {d.projects.map(proj => (
            <div key={proj.id} className="rp-entry">
              <div className="rp-entry-header">
                <strong className="rp-entry-title">{proj.name}</strong>
                {proj.link && <span className="rp-entry-location"> | {proj.link}</span>}
              </div>
              {proj.technologies.length > 0 && <p className="rp-proj-tech">{proj.technologies.join(', ')}</p>}
              {proj.description && <p className="rp-proj-desc">{proj.description}</p>}
              <BulletList bullets={proj.bullets} />
            </div>
          ))}
        </div>
      )}
    </>
  );
}

// ── Tech Layout ────────────────────────────────────────────────────────────────
// Code-inspired: `> Name`, `// Section`, monospace throughout, skills first

function TechLayout({ d }) {
  const fields = buildContactFields(d.personalInfo);
  return (
    <>
      <div className="rp-tech-header">
        {d.personalInfo.fullName && (
          <div className="rp-tech-name-row">
            <span className="rp-tech-prompt">&gt;_</span>
            <h1 className="rp-name">{d.personalInfo.fullName}</h1>
          </div>
        )}
        <ContactLine fields={fields} separator=" | " className="rp-contact rp-tech-contact" />
      </div>

      {d.allSkills.length > 0 && (
        <div className="rp-section">
          <h2 className="rp-section-title">{'// skills'}</h2>
          <SkillGroups skills={d.skills} />
        </div>
      )}

      {d.summary && (
        <div className="rp-section">
          <h2 className="rp-section-title">{'// about'}</h2>
          <p className="rp-summary">{d.summary}</p>
        </div>
      )}

      {d.experience.length > 0 && (
        <div className="rp-section">
          <h2 className="rp-section-title">{'// experience'}</h2>
          {d.experience.map(job => (
            <div key={job.id} className="rp-entry">
              <div className="rp-entry-header">
                <div className="rp-entry-left">
                  <strong className="rp-entry-title">{job.jobTitle}</strong>
                  {job.company && <span className="rp-entry-company"> @ {job.company}</span>}
                  {job.location && <span className="rp-entry-location"> · {job.location}</span>}
                </div>
                <span className="rp-entry-date">
                  {[job.startDate, job.current ? 'Present' : job.endDate].filter(Boolean).join(' – ')}
                </span>
              </div>
              <BulletList bullets={job.bullets} />
            </div>
          ))}
        </div>
      )}

      {d.projects.length > 0 && (
        <div className="rp-section">
          <h2 className="rp-section-title">{'// projects'}</h2>
          {d.projects.map(proj => (
            <div key={proj.id} className="rp-entry">
              <div className="rp-entry-header">
                <strong className="rp-entry-title">{proj.name}</strong>
                {proj.link && <span className="rp-entry-link"> [{proj.link}]</span>}
              </div>
              {proj.technologies.length > 0 && <p className="rp-proj-tech">{proj.technologies.join(' · ')}</p>}
              {proj.description && <p className="rp-proj-desc">{proj.description}</p>}
              <BulletList bullets={proj.bullets} />
            </div>
          ))}
        </div>
      )}

      {d.education.length > 0 && (
        <div className="rp-section">
          <h2 className="rp-section-title">{'// education'}</h2>
          {d.education.map(ed => (
            <div key={ed.id} className="rp-entry">
              <div className="rp-entry-header">
                <div className="rp-entry-left">
                  <strong className="rp-entry-title">{ed.degree}</strong>
                  {ed.school && <span className="rp-entry-company"> — {ed.school}</span>}
                </div>
                {ed.graduationDate && <span className="rp-entry-date">{ed.graduationDate}</span>}
              </div>
              {ed.gpa && <p className="rp-coursework">GPA: {ed.gpa}</p>}
            </div>
          ))}
        </div>
      )}
    </>
  );
}

// ── Creative Layout ────────────────────────────────────────────────────────────
// Full-bleed purple gradient header, skill chips, personality

function CreativeLayout({ d }) {
  const fields = buildContactFields(d.personalInfo);
  const allDisplaySkills = [
    ...(d.skills.technical || []),
    ...(d.skills.tools || []),
    ...(d.skills.soft || []),
    ...(d.skills.languages || []),
    ...(d.skills.certifications || []),
  ];

  return (
    <>
      <div className="rp-creative-header">
        {d.personalInfo.fullName && <h1 className="rp-name">{d.personalInfo.fullName}</h1>}
        <ContactLine
          fields={fields}
          separator=" · "
          className="rp-contact rp-creative-contact"
          sepClass="rp-creative-sep"
        />
      </div>

      {d.summary && (
        <div className="rp-section">
          <h2 className="rp-section-title">About Me</h2>
          <p className="rp-summary">{d.summary}</p>
        </div>
      )}

      {d.experience.length > 0 && (
        <div className="rp-section">
          <h2 className="rp-section-title">Experience</h2>
          {d.experience.map(job => (
            <div key={job.id} className="rp-entry">
              <div className="rp-entry-header">
                <div className="rp-entry-left">
                  <strong className="rp-entry-title">{job.jobTitle}</strong>
                  {job.company && <span className="rp-entry-company"> — {job.company}</span>}
                  {job.location && <span className="rp-entry-location">, {job.location}</span>}
                </div>
                <span className="rp-entry-date">
                  {[job.startDate, job.current ? 'Present' : job.endDate].filter(Boolean).join(' – ')}
                </span>
              </div>
              <BulletList bullets={job.bullets} />
            </div>
          ))}
        </div>
      )}

      {d.education.length > 0 && (
        <div className="rp-section">
          <h2 className="rp-section-title">Education</h2>
          {d.education.map(ed => (
            <div key={ed.id} className="rp-entry">
              <div className="rp-entry-header">
                <div className="rp-entry-left">
                  <strong className="rp-entry-title">{ed.degree}</strong>
                  {ed.school && <span className="rp-entry-company"> — {ed.school}</span>}
                </div>
                {ed.graduationDate && <span className="rp-entry-date">{ed.graduationDate}</span>}
              </div>
              {ed.honors && <p className="rp-honors">{ed.honors}</p>}
            </div>
          ))}
        </div>
      )}

      {allDisplaySkills.length > 0 && (
        <div className="rp-section">
          <h2 className="rp-section-title">Skills & Expertise</h2>
          <div className="rp-creative-skills">
            {allDisplaySkills.map(s => (
              <span key={s} className="rp-creative-skill-chip">{s}</span>
            ))}
          </div>
        </div>
      )}

      {d.projects.length > 0 && (
        <div className="rp-section">
          <h2 className="rp-section-title">Projects</h2>
          {d.projects.map(proj => (
            <div key={proj.id} className="rp-entry">
              <div className="rp-entry-header">
                <strong className="rp-entry-title">{proj.name}</strong>
                {proj.link && <span className="rp-entry-link"> · {proj.link}</span>}
              </div>
              {proj.technologies.length > 0 && <p className="rp-proj-tech">{proj.technologies.join(', ')}</p>}
              {proj.description && <p className="rp-proj-desc">{proj.description}</p>}
              <BulletList bullets={proj.bullets} />
            </div>
          ))}
        </div>
      )}
    </>
  );
}

// ── Empty State ────────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="rp-empty">
      <div className="rp-empty-icon">📄</div>
      <p>Start filling in your information on the left to see your resume here.</p>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

function LivePreview({ resumeData, paperRef }) {
  const { personalInfo, summary, experience, education, skills, projects, selectedTemplate } = resumeData;

  const allSkills = [
    ...(skills.technical || []),
    ...(skills.soft || []),
    ...(skills.tools || []),
    ...(skills.languages || []),
    ...(skills.certifications || []),
  ];

  const isEmpty =
    !personalInfo.fullName &&
    !personalInfo.email &&
    !summary &&
    experience.length === 0 &&
    education.length === 0 &&
    allSkills.length === 0 &&
    projects.length === 0;

  const d = { personalInfo, summary, experience, education, skills, projects, allSkills };

  const renderLayout = () => {
    if (isEmpty) return <EmptyState />;
    switch (selectedTemplate) {
      case 'modern':   return <ModernLayout d={d} />;
      case 'minimal':  return <MinimalLayout d={d} />;
      case 'bold':     return <BoldLayout d={d} />;
      case 'tech':     return <TechLayout d={d} />;
      case 'creative': return <CreativeLayout d={d} />;
      default:         return <ClassicLayout d={d} />;
    }
  };

  return (
    <div className="preview-container">
      <div className={`resume-paper template-${selectedTemplate}`} ref={paperRef}>
        {renderLayout()}
      </div>
    </div>
  );
}

export default LivePreview;
