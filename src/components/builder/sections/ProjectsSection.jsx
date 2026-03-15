import { useState } from 'react';
import './Sections.css';

function createProject() {
  return {
    id: crypto.randomUUID(),
    name: '',
    description: '',
    technologies: [],
    link: '',
    bullets: [''],
  };
}

function ProjectsSection({ resumeData, updateResumeData }) {
  const { projects } = resumeData;
  const [expandedId, setExpandedId] = useState(null);
  const [techInput, setTechInput] = useState({});

  const addProject = () => {
    const p = createProject();
    updateResumeData({ projects: [...projects, p] });
    setExpandedId(p.id);
  };

  const removeProject = (id) => updateResumeData({ projects: projects.filter(p => p.id !== id) });

  const updateProject = (id, field, value) => {
    updateResumeData({ projects: projects.map(p => p.id === id ? { ...p, [field]: value } : p) });
  };

  const addTech = (id, tech) => {
    const proj = projects.find(p => p.id === id);
    if (tech.trim() && !proj.technologies.includes(tech.trim())) {
      updateProject(id, 'technologies', [...proj.technologies, tech.trim()]);
    }
  };

  const removeTech = (id, tech) => {
    const proj = projects.find(p => p.id === id);
    updateProject(id, 'technologies', proj.technologies.filter(t => t !== tech));
  };

  const addBullet = (id) => {
    const proj = projects.find(p => p.id === id);
    updateProject(id, 'bullets', [...proj.bullets, '']);
  };

  const updateBullet = (id, idx, val) => {
    const proj = projects.find(p => p.id === id);
    updateProject(id, 'bullets', proj.bullets.map((b, i) => i === idx ? val : b));
  };

  const removeBullet = (id, idx) => {
    const proj = projects.find(p => p.id === id);
    updateProject(id, 'bullets', proj.bullets.filter((_, i) => i !== idx));
  };

  return (
    <div className="section-panel">
      <div className="section-panel-header">
        <h2>Projects</h2>
        <p>Showcase your personal or professional projects.</p>
      </div>

      {projects.length === 0 && (
        <div className="section-empty"><p>No projects added yet.</p></div>
      )}

      <div className="entries-list">
        {projects.map(proj => (
          <div key={proj.id} className={`entry-card ${expandedId === proj.id ? 'expanded' : ''}`}>
            <div className="entry-card-header" onClick={() => setExpandedId(expandedId === proj.id ? null : proj.id)}>
              <div className="entry-card-title">
                <span className="entry-drag-handle">⠿</span>
                <strong>{proj.name || 'New Project'}</strong>
              </div>
              <div className="entry-card-actions">
                <button className="entry-delete-btn" onClick={e => { e.stopPropagation(); removeProject(proj.id); }}>✕</button>
                <span className="entry-chevron">{expandedId === proj.id ? '▲' : '▼'}</span>
              </div>
            </div>
            {expandedId === proj.id && (
              <div className="entry-card-body">
                <div className="form-grid">
                  <div className="form-field form-field-full">
                    <label>Project Name *</label>
                    <input
                      className="form-input"
                      value={proj.name}
                      onChange={e => updateProject(proj.id, 'name', e.target.value)}
                      placeholder="ResumeMatch"
                    />
                  </div>
                  <div className="form-field form-field-full">
                    <label>Description</label>
                    <textarea
                      className="form-textarea"
                      rows={2}
                      value={proj.description}
                      onChange={e => updateProject(proj.id, 'description', e.target.value)}
                      placeholder="Brief description of the project..."
                    />
                  </div>
                  <div className="form-field form-field-full">
                    <label>Link <span className="form-optional">(optional)</span></label>
                    <input
                      className="form-input"
                      value={proj.link}
                      onChange={e => updateProject(proj.id, 'link', e.target.value)}
                      placeholder="github.com/username/project"
                    />
                  </div>
                  <div className="form-field form-field-full">
                    <label>Technologies</label>
                    <div className="skill-chips" style={{ marginBottom: '0.5rem' }}>
                      {proj.technologies.map(t => (
                        <span key={t} className="skill-chip">
                          {t}
                          <button className="skill-chip-remove" onClick={() => removeTech(proj.id, t)}>×</button>
                        </span>
                      ))}
                    </div>
                    <div className="skill-input-row">
                      <input
                        className="form-input skill-input"
                        value={techInput[proj.id] || ''}
                        onChange={e => setTechInput(prev => ({ ...prev, [proj.id]: e.target.value }))}
                        onKeyDown={e => {
                          if (e.key === 'Enter' || e.key === ',') {
                            e.preventDefault();
                            addTech(proj.id, techInput[proj.id] || '');
                            setTechInput(prev => ({ ...prev, [proj.id]: '' }));
                          }
                        }}
                        placeholder="React, Node.js, PostgreSQL..."
                      />
                      <button
                        className="skill-add-btn"
                        onClick={() => {
                          addTech(proj.id, techInput[proj.id] || '');
                          setTechInput(prev => ({ ...prev, [proj.id]: '' }));
                        }}
                      >Add</button>
                    </div>
                  </div>
                </div>
                <div className="bullets-section">
                  <label>Key Points</label>
                  {proj.bullets.map((b, idx) => (
                    <div key={idx} className="bullet-row">
                      <span className="bullet-dot">•</span>
                      <input
                        className="form-input bullet-input"
                        value={b}
                        onChange={e => updateBullet(proj.id, idx, e.target.value)}
                        placeholder="Describe what you built or achieved..."
                      />
                      <button
                        className="bullet-remove-btn"
                        onClick={() => removeBullet(proj.id, idx)}
                        disabled={proj.bullets.length === 1}
                      >✕</button>
                    </div>
                  ))}
                  <button className="add-bullet-btn" onClick={() => addBullet(proj.id)}>+ Add point</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      <button className="add-entry-btn" onClick={addProject}>+ Add Project</button>
    </div>
  );
}

export default ProjectsSection;
