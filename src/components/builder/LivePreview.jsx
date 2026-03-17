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
          <div className="rp-bold-chips">
            {d.allSkills.map(s => <span key={s} className="rp-bold-chip">{s}</span>)}
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

// ── Executive Layout ───────────────────────────────────────────────────────────
// Premium two-column: dark accent sidebar | clean white main

function ExecutiveLayout({ d }) {
  const fields = buildContactFields(d.personalInfo);
  const sideSkills = [...(d.skills.technical || []), ...(d.skills.tools || []), ...(d.skills.soft || [])];
  return (
    <div className="rp-exec-wrap">
      <div className="rp-exec-sidebar">
        {d.personalInfo.fullName && <h1 className="rp-exec-name">{d.personalInfo.fullName}</h1>}
        {fields.length > 0 && (
          <div className="rp-exec-contact-block">
            {fields.map((f, i) => <div key={i} className="rp-exec-contact-item">{f}</div>)}
          </div>
        )}
        {sideSkills.length > 0 && (
          <div className="rp-exec-sb-section">
            <div className="rp-exec-sb-title">Core Skills</div>
            {sideSkills.map(s => <div key={s} className="rp-exec-skill">{s}</div>)}
          </div>
        )}
        {d.education.length > 0 && (
          <div className="rp-exec-sb-section">
            <div className="rp-exec-sb-title">Education</div>
            {d.education.map(ed => (
              <div key={ed.id} className="rp-exec-ed">
                <div className="rp-exec-ed-degree">{ed.degree}</div>
                {ed.school && <div className="rp-exec-ed-school">{ed.school}</div>}
                {ed.graduationDate && <div className="rp-exec-ed-date">{ed.graduationDate}</div>}
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="rp-exec-main">
        {d.summary && (
          <div className="rp-section">
            <h2 className="rp-section-title">Executive Summary</h2>
            <p className="rp-summary">{d.summary}</p>
          </div>
        )}
        {d.experience.length > 0 && (
          <div className="rp-section">
            <h2 className="rp-section-title">Career History</h2>
            {d.experience.map(job => (
              <div key={job.id} className="rp-entry">
                <div className="rp-entry-header">
                  <div className="rp-entry-left">
                    <strong className="rp-entry-title">{job.jobTitle}</strong>
                    {job.company && <span className="rp-entry-company"> · {job.company}</span>}
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
        {d.projects.length > 0 && (
          <div className="rp-section">
            <h2 className="rp-section-title">Key Projects</h2>
            {d.projects.map(proj => (
              <div key={proj.id} className="rp-entry">
                <strong className="rp-entry-title">{proj.name}</strong>
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

// ── Academic Layout ─────────────────────────────────────────────────────────────
// Education-first, formal scholarly structure

function AcademicLayout({ d }) {
  const fields = buildContactFields(d.personalInfo);
  return (
    <>
      <div className="rp-header rp-academic-header">
        {d.personalInfo.fullName && <h1 className="rp-name">{d.personalInfo.fullName}</h1>}
        <ContactLine fields={fields} separator=" | " />
      </div>
      {d.education.length > 0 && (
        <div className="rp-section">
          <h2 className="rp-section-title">Education</h2>
          {d.education.map(ed => (
            <div key={ed.id} className="rp-entry">
              <div className="rp-entry-header">
                <div className="rp-entry-left">
                  <strong className="rp-entry-title">{ed.degree}</strong>
                  {ed.school && <span className="rp-entry-company">, {ed.school}</span>}
                  {ed.location && <span className="rp-entry-location">, {ed.location}</span>}
                </div>
                {ed.graduationDate && <span className="rp-entry-date">{ed.graduationDate}</span>}
              </div>
              {ed.gpa && <p className="rp-coursework">GPA: {ed.gpa}{ed.honors ? ` · ${ed.honors}` : ''}</p>}
              {ed.coursework && <p className="rp-coursework">{ed.coursework}</p>}
            </div>
          ))}
        </div>
      )}
      {d.summary && (
        <div className="rp-section">
          <h2 className="rp-section-title">Research Interests & Profile</h2>
          <p className="rp-summary">{d.summary}</p>
        </div>
      )}
      {d.experience.length > 0 && (
        <div className="rp-section">
          <h2 className="rp-section-title">Academic & Professional Experience</h2>
          {d.experience.map(job => (
            <div key={job.id} className="rp-entry">
              <div className="rp-entry-header">
                <div className="rp-entry-left">
                  <strong className="rp-entry-title">{job.jobTitle}</strong>
                  {job.company && <span className="rp-entry-company">, {job.company}</span>}
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
      {d.allSkills.length > 0 && (
        <div className="rp-section">
          <h2 className="rp-section-title">Skills & Competencies</h2>
          <SkillGroups skills={d.skills} />
        </div>
      )}
    </>
  );
}

// ── Compact Layout ──────────────────────────────────────────────────────────────
// Maximum content density — tight spacing, two-col bottom

function CompactLayout({ d }) {
  const fields = buildContactFields(d.personalInfo);
  return (
    <>
      <div className="rp-compact-header">
        {d.personalInfo.fullName && <h1 className="rp-compact-name">{d.personalInfo.fullName}</h1>}
        <ContactLine fields={fields} separator=" · " className="rp-contact rp-compact-contact" />
      </div>
      {d.summary && (
        <div className="rp-section rp-compact-section">
          <h2 className="rp-section-title">Summary</h2>
          <p className="rp-summary">{d.summary}</p>
        </div>
      )}
      {d.experience.length > 0 && (
        <div className="rp-section rp-compact-section">
          <h2 className="rp-section-title">Experience</h2>
          {d.experience.map(job => (
            <div key={job.id} className="rp-entry rp-compact-entry">
              <div className="rp-compact-job-line">
                <strong>{job.jobTitle}</strong>
                {job.company && <span className="rp-entry-company"> · {job.company}</span>}
                {job.location && <span className="rp-entry-location">, {job.location}</span>}
                <span className="rp-compact-date">
                  {[job.startDate, job.current ? 'Present' : job.endDate].filter(Boolean).join('–')}
                </span>
              </div>
              <BulletList bullets={job.bullets} />
            </div>
          ))}
        </div>
      )}
      <div className="rp-compact-bottom">
        {d.education.length > 0 && (
          <div className="rp-compact-col">
            <h2 className="rp-section-title">Education</h2>
            {d.education.map(ed => (
              <div key={ed.id} className="rp-compact-ed">
                <strong className="rp-entry-title">{ed.degree}</strong>
                {ed.school && <div className="rp-entry-company">{ed.school}</div>}
                {ed.graduationDate && <div className="rp-entry-date">{ed.graduationDate}</div>}
              </div>
            ))}
          </div>
        )}
        {d.allSkills.length > 0 && (
          <div className="rp-compact-col">
            <h2 className="rp-section-title">Skills</h2>
            <div className="rp-compact-skills">
              {d.allSkills.map(s => <span key={s} className="rp-compact-skill">{s}</span>)}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// ── Timeline Layout ─────────────────────────────────────────────────────────────
// Vertical timeline with accent dots for each career entry

function TimelineLayout({ d }) {
  const fields = buildContactFields(d.personalInfo);
  return (
    <>
      <div className="rp-header rp-tl-header">
        {d.personalInfo.fullName && <h1 className="rp-name">{d.personalInfo.fullName}</h1>}
        <ContactLine fields={fields} />
      </div>
      {d.summary && (
        <div className="rp-section">
          <h2 className="rp-section-title">Profile</h2>
          <p className="rp-summary">{d.summary}</p>
        </div>
      )}
      {d.experience.length > 0 && (
        <div className="rp-section">
          <h2 className="rp-section-title">Experience</h2>
          <div className="rp-tl-track">
            {d.experience.map((job, idx) => (
              <div key={job.id} className="rp-tl-entry">
                <div className="rp-tl-marker">
                  <div className="rp-tl-dot" />
                  {idx < d.experience.length - 1 && <div className="rp-tl-line" />}
                </div>
                <div className="rp-tl-content">
                  <div className="rp-tl-date">
                    {[job.startDate, job.current ? 'Present' : job.endDate].filter(Boolean).join(' – ')}
                  </div>
                  <strong className="rp-entry-title">{job.jobTitle}</strong>
                  {job.company && <span className="rp-entry-company"> · {job.company}</span>}
                  {job.location && <span className="rp-entry-location">, {job.location}</span>}
                  <BulletList bullets={job.bullets} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {d.education.length > 0 && (
        <div className="rp-section">
          <h2 className="rp-section-title">Education</h2>
          <div className="rp-tl-track">
            {d.education.map((ed, idx) => (
              <div key={ed.id} className="rp-tl-entry">
                <div className="rp-tl-marker">
                  <div className="rp-tl-dot" />
                  {idx < d.education.length - 1 && <div className="rp-tl-line" />}
                </div>
                <div className="rp-tl-content">
                  {ed.graduationDate && <div className="rp-tl-date">{ed.graduationDate}</div>}
                  <strong className="rp-entry-title">{ed.degree}</strong>
                  {ed.school && <span className="rp-entry-company"> · {ed.school}</span>}
                  {ed.gpa && <p className="rp-coursework">GPA: {ed.gpa}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {d.allSkills.length > 0 && (
        <div className="rp-section">
          <h2 className="rp-section-title">Skills</h2>
          <SkillGroups skills={d.skills} />
        </div>
      )}
    </>
  );
}

// ── Elegant Layout ──────────────────────────────────────────────────────────────
// Serif throughout, centered decorative header, refined

function ElegantLayout({ d }) {
  const fields = buildContactFields(d.personalInfo);
  return (
    <>
      <div className="rp-elegant-header">
        {d.personalInfo.fullName && <h1 className="rp-elegant-name">{d.personalInfo.fullName}</h1>}
        <div className="rp-elegant-rule" />
        <ContactLine fields={fields} separator=" ◆ " className="rp-contact rp-elegant-contact" />
        <div className="rp-elegant-rule" />
      </div>
      {d.summary && (
        <div className="rp-section">
          <h2 className="rp-section-title rp-elegant-stitle">Professional Profile</h2>
          <p className="rp-summary">{d.summary}</p>
        </div>
      )}
      {d.experience.length > 0 && (
        <div className="rp-section">
          <h2 className="rp-section-title rp-elegant-stitle">Professional Experience</h2>
          {d.experience.map(job => (
            <div key={job.id} className="rp-entry">
              <div className="rp-entry-header">
                <div className="rp-entry-left">
                  <strong className="rp-entry-title">{job.jobTitle}</strong>
                  {job.company && <em className="rp-elegant-company">, {job.company}</em>}
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
          <h2 className="rp-section-title rp-elegant-stitle">Education</h2>
          {d.education.map(ed => (
            <div key={ed.id} className="rp-entry">
              <div className="rp-entry-header">
                <div className="rp-entry-left">
                  <strong className="rp-entry-title">{ed.degree}</strong>
                  {ed.school && <em className="rp-elegant-company">, {ed.school}</em>}
                </div>
                {ed.graduationDate && <span className="rp-entry-date">{ed.graduationDate}</span>}
              </div>
              {ed.honors && <p className="rp-coursework">{ed.honors}</p>}
            </div>
          ))}
        </div>
      )}
      {d.allSkills.length > 0 && (
        <div className="rp-section">
          <h2 className="rp-section-title rp-elegant-stitle">Areas of Excellence</h2>
          <SkillGroups skills={d.skills} />
        </div>
      )}
    </>
  );
}

// ── ATS-Strict Layout ───────────────────────────────────────────────────────────
// Plain text style — zero decorations, maximum ATS compatibility

function AtsStrictLayout({ d }) {
  const fields = buildContactFields(d.personalInfo);
  return (
    <>
      <div className="rp-ats-header">
        {d.personalInfo.fullName && <h1 className="rp-ats-name">{d.personalInfo.fullName}</h1>}
        {fields.length > 0 && <div className="rp-ats-contact">{fields.join(' | ')}</div>}
        <div className="rp-ats-rule" />
      </div>
      {d.summary && (
        <div className="rp-ats-block">
          <h2 className="rp-ats-title">PROFESSIONAL SUMMARY</h2>
          <p className="rp-summary">{d.summary}</p>
        </div>
      )}
      {d.experience.length > 0 && (
        <div className="rp-ats-block">
          <h2 className="rp-ats-title">WORK EXPERIENCE</h2>
          {d.experience.map(job => (
            <div key={job.id} className="rp-ats-entry">
              <div className="rp-ats-job-line">
                <strong>{job.jobTitle}</strong>
                {job.company ? `, ${job.company}` : ''}
                {job.location ? `, ${job.location}` : ''}
              </div>
              <div className="rp-ats-dates">
                {[job.startDate, job.current ? 'Present' : job.endDate].filter(Boolean).join(' - ')}
              </div>
              <BulletList bullets={job.bullets} />
            </div>
          ))}
        </div>
      )}
      {d.education.length > 0 && (
        <div className="rp-ats-block">
          <h2 className="rp-ats-title">EDUCATION</h2>
          {d.education.map(ed => (
            <div key={ed.id} className="rp-ats-entry">
              <div className="rp-ats-job-line">
                <strong>{ed.degree}</strong>
                {ed.school ? `, ${ed.school}` : ''}
                {ed.location ? `, ${ed.location}` : ''}
              </div>
              {ed.graduationDate && <div className="rp-ats-dates">{ed.graduationDate}</div>}
              {ed.gpa && <div>GPA: {ed.gpa}</div>}
            </div>
          ))}
        </div>
      )}
      {d.allSkills.length > 0 && (
        <div className="rp-ats-block">
          <h2 className="rp-ats-title">SKILLS</h2>
          <p>{d.allSkills.join(', ')}</p>
        </div>
      )}
    </>
  );
}

// ── Developer Layout ────────────────────────────────────────────────────────────
// Terminal bar header, two-col with skill-level bars on left

function SkillBar({ name }) {
  return (
    <div className="rp-dev-skill-row">
      <span className="rp-dev-skill-name">{name}</span>
      <div className="rp-dev-skill-track">
        <div className="rp-dev-skill-fill" />
      </div>
    </div>
  );
}

function DeveloperLayout({ d }) {
  const fields = buildContactFields(d.personalInfo);
  return (
    <>
      <div className="rp-dev-header">
        <div className="rp-dev-terminal-bar">
          <span className="rp-dev-dot" style={{ background: '#ff5f57' }} />
          <span className="rp-dev-dot" style={{ background: '#febc2e' }} />
          <span className="rp-dev-dot" style={{ background: '#28c840' }} />
          <span className="rp-dev-terminal-path">~/resume.json</span>
        </div>
        {d.personalInfo.fullName && <h1 className="rp-name rp-dev-name">{d.personalInfo.fullName}</h1>}
        <ContactLine fields={fields} separator=" | " className="rp-contact rp-dev-contact" />
      </div>
      <div className="rp-dev-layout">
        {d.allSkills.length > 0 && (
          <div className="rp-dev-sidebar">
            <h2 className="rp-section-title">{'// skills'}</h2>
            {d.allSkills.slice(0, 12).map(s => <SkillBar key={s} name={s} />)}
          </div>
        )}
        <div className="rp-dev-main">
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
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ── Vivid Layout ────────────────────────────────────────────────────────────────
// Bold full-width accent color bar as section header

function VividLayout({ d }) {
  const fields = buildContactFields(d.personalInfo);
  return (
    <>
      <div className="rp-vivid-hero">
        {d.personalInfo.fullName && <h1 className="rp-name rp-vivid-name">{d.personalInfo.fullName}</h1>}
        <ContactLine fields={fields} separator=" · " className="rp-contact rp-vivid-contact" />
      </div>
      {d.summary && (
        <div className="rp-section">
          <div className="rp-vivid-bar">Summary</div>
          <p className="rp-summary">{d.summary}</p>
        </div>
      )}
      {d.experience.length > 0 && (
        <div className="rp-section">
          <div className="rp-vivid-bar">Experience</div>
          {d.experience.map(job => (
            <div key={job.id} className="rp-entry">
              <div className="rp-entry-header">
                <div className="rp-entry-left">
                  <strong className="rp-entry-title">{job.jobTitle}</strong>
                  {job.company && <span className="rp-entry-company"> · {job.company}</span>}
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
          <div className="rp-vivid-bar">Education</div>
          {d.education.map(ed => (
            <div key={ed.id} className="rp-entry">
              <div className="rp-entry-header">
                <div className="rp-entry-left">
                  <strong className="rp-entry-title">{ed.degree}</strong>
                  {ed.school && <span className="rp-entry-company">, {ed.school}</span>}
                </div>
                {ed.graduationDate && <span className="rp-entry-date">{ed.graduationDate}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
      {d.allSkills.length > 0 && (
        <div className="rp-section">
          <div className="rp-vivid-bar">Skills</div>
          <div className="rp-vivid-skills">
            {d.allSkills.map(s => <span key={s} className="rp-vivid-chip">{s}</span>)}
          </div>
        </div>
      )}
    </>
  );
}

// ── Federal Layout ──────────────────────────────────────────────────────────────
// Government resume format — formal, detailed, ALL CAPS section titles

function FederalLayout({ d }) {
  const fields = buildContactFields(d.personalInfo);
  return (
    <>
      <div className="rp-federal-header">
        {d.personalInfo.fullName && <h1 className="rp-federal-name">{d.personalInfo.fullName}</h1>}
        {fields.length > 0 && (
          <div className="rp-federal-contact">
            {fields.map((f, i) => <span key={i} className="rp-federal-ci">{f}</span>)}
          </div>
        )}
      </div>
      <div className="rp-federal-meta">
        <span><strong>Citizenship:</strong> U.S. Citizen</span>
        <span><strong>Availability:</strong> Immediate</span>
      </div>
      {d.summary && (
        <div className="rp-federal-section">
          <div className="rp-federal-title">PROFESSIONAL SUMMARY</div>
          <p className="rp-summary">{d.summary}</p>
        </div>
      )}
      {d.experience.length > 0 && (
        <div className="rp-federal-section">
          <div className="rp-federal-title">WORK EXPERIENCE</div>
          {d.experience.map(job => (
            <div key={job.id} className="rp-federal-entry">
              <div className="rp-federal-job">
                <strong>{job.jobTitle}</strong>
                {job.company ? `, ${job.company}` : ''}
                {job.location ? `, ${job.location}` : ''}
              </div>
              <div className="rp-federal-dates">
                {[job.startDate, job.current ? 'Present' : job.endDate].filter(Boolean).join(' – ')}
                {' | Hours/week: 40'}
              </div>
              <BulletList bullets={job.bullets} />
            </div>
          ))}
        </div>
      )}
      {d.education.length > 0 && (
        <div className="rp-federal-section">
          <div className="rp-federal-title">EDUCATION</div>
          {d.education.map(ed => (
            <div key={ed.id} className="rp-federal-entry">
              <div className="rp-federal-job">
                <strong>{ed.degree}</strong>
                {ed.school ? `, ${ed.school}` : ''}
                {ed.location ? `, ${ed.location}` : ''}
              </div>
              {ed.graduationDate && <div className="rp-federal-dates">{ed.graduationDate}</div>}
              {ed.gpa && <div className="rp-federal-dates">GPA: {ed.gpa}</div>}
            </div>
          ))}
        </div>
      )}
      {d.allSkills.length > 0 && (
        <div className="rp-federal-section">
          <div className="rp-federal-title">SKILLS</div>
          <SkillGroups skills={d.skills} />
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
  const { personalInfo, summary, experience, education, skills, projects, selectedTemplate, design } = resumeData;

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

  // Build class list from design settings
  const paperClasses = [`resume-paper`, `template-${selectedTemplate}`];
  const spacing = design?.spacing || 'normal';
  if (spacing !== 'normal') paperClasses.push(`rp-spacing-${spacing}`);
  const layout = design?.layout || 'centered';
  if (layout !== 'centered') paperClasses.push(`rp-layout-${layout}`);
  const fontFamily = design?.fontFamily || '';
  if (fontFamily && fontFamily !== 'Inter') {
    paperClasses.push(`rp-font-${fontFamily.toLowerCase().replace(/\s+/g, '-')}`);
  }

  // Apply accent color as CSS custom property inline
  const paperStyle = {};
  if (design?.accentColor) paperStyle['--rp-accent'] = design.accentColor;

  const renderLayout = () => {
    if (isEmpty) return <EmptyState />;
    switch (selectedTemplate) {
      case 'modern':     return <ModernLayout d={d} />;
      case 'minimal':    return <MinimalLayout d={d} />;
      case 'bold':       return <BoldLayout d={d} />;
      case 'tech':       return <TechLayout d={d} />;
      case 'creative':   return <CreativeLayout d={d} />;
      case 'executive':  return <ExecutiveLayout d={d} />;
      case 'academic':   return <AcademicLayout d={d} />;
      case 'compact':    return <CompactLayout d={d} />;
      case 'timeline':   return <TimelineLayout d={d} />;
      case 'elegant':    return <ElegantLayout d={d} />;
      case 'ats-strict': return <AtsStrictLayout d={d} />;
      case 'developer':  return <DeveloperLayout d={d} />;
      case 'vivid':      return <VividLayout d={d} />;
      case 'federal':    return <FederalLayout d={d} />;
      default:           return <ClassicLayout d={d} />;
    }
  };

  return (
    <div className="preview-container">
      <div className={paperClasses.join(' ')} ref={paperRef} style={paperStyle}>
        {renderLayout()}
      </div>
    </div>
  );
}

export default LivePreview;
