import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getResumes,
  renameResume,
  duplicateResume,
  deleteResume,
  loadResumeById,
  clearActiveResumeId,
  migrateOldResumeIfNeeded,
  getCoverLetters,
  deleteCoverLetter,
} from '../utils/storage';
import { TEMPLATES } from '../utils/templates';
import LivePreview from '../components/builder/LivePreview';
import ResumeThumbnail from '../components/common/ResumeThumbnail';
import { exportResumeToPDF } from '../utils/pdfExport';
import './Dashboard.css';

// ── Helpers ──────────────────────────────────────────────────────────────────

function relativeTime(isoString) {
  if (!isoString) return '';
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(isoString).toLocaleDateString();
}

function computeScore(data) {
  if (!data) return 0;
  let score = 0;
  const pi = data.personalInfo || {};
  if (pi.fullName) score += 10;
  if (pi.email) score += 8;
  if (pi.phone) score += 5;
  if (pi.location) score += 4;
  if (pi.linkedin || pi.github || pi.website) score += 5;
  if (data.summary && data.summary.length > 50) score += 15;
  const exp = data.experience || [];
  if (exp.length > 0) score += 15;
  if (exp.some(e => e.bullets?.filter(b => b.trim()).length >= 3)) score += 10;
  if ((data.education || []).length > 0) score += 10;
  const skills = data.skills || {};
  const allSkills = [
    ...(skills.technical || []), ...(skills.soft || []),
    ...(skills.tools || []), ...(skills.languages || []),
  ];
  if (allSkills.length >= 3) score += 10;
  if (allSkills.length >= 8) score += 5;
  if ((data.projects || []).length > 0) score += 8;
  return Math.min(score, 100);
}

function scoreColor(score) {
  if (score >= 86) return '#16a34a';
  if (score >= 66) return '#2563eb';
  if (score >= 41) return '#d97706';
  return '#dc2626';
}

function getTemplateAccent(data) {
  const tpl = TEMPLATES.find(t => t.id === data?.selectedTemplate);
  return data?.design?.accentColor || tpl?.accent || '#2E5A88';
}

// ── Toast ─────────────────────────────────────────────────────────────────────

function Toast({ message, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2800);
    return () => clearTimeout(t);
  }, [onDone]);
  return <div className="db-toast">{message}</div>;
}

// ── Delete Confirm Modal ──────────────────────────────────────────────────────

function DeleteConfirmModal({ name, onConfirm, onCancel }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onCancel(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onCancel]);

  return (
    <div className="db-modal-backdrop" onClick={onCancel}>
      <div className="db-modal db-delete-modal" onClick={e => e.stopPropagation()}>
        <button className="db-modal-close" onClick={onCancel} aria-label="Close">✕</button>
        <div className="db-delete-icon">🗑️</div>
        <h2 className="db-modal-title">Delete Resume?</h2>
        <p className="db-delete-name">"{name}"</p>
        <p className="db-delete-warning">This action cannot be undone. The resume will be permanently deleted.</p>
        <div className="db-delete-actions">
          <button className="db-btn-secondary" onClick={onCancel}>Cancel</button>
          <button className="db-btn-danger" onClick={onConfirm}>Delete Forever</button>
        </div>
      </div>
    </div>
  );
}

// ── Resume Card ──────────────────────────────────────────────────────────────

function ResumeCard({ resume, onEdit, onDelete, onCopy, onDownload, exporting }) {
  const [editingName, setEditingName] = useState(false);
  const [nameVal, setNameVal] = useState(resume.name);
  const nameInputRef = useRef(null);

  const score = computeScore(resume.data);
  const accent = getTemplateAccent(resume.data);

  const commitRename = () => {
    const trimmed = nameVal.trim();
    if (trimmed && trimmed !== resume.name) {
      renameResume(resume.id, trimmed);
    } else {
      setNameVal(resume.name);
    }
    setEditingName(false);
  };

  const handleNameKeyDown = (e) => {
    if (e.key === 'Enter') commitRename();
    if (e.key === 'Escape') { setNameVal(resume.name); setEditingName(false); }
  };

  useEffect(() => {
    if (editingName) nameInputRef.current?.focus();
  }, [editingName]);

  return (
    <div className="db-card" style={{ '--card-accent': accent }}>
      {/* Real resume thumbnail */}
      <div className="db-card-thumb">
        <ResumeThumbnail resumeData={resume.data} />
        <div className="db-card-thumb-overlay">
          <button className="db-thumb-edit-btn" onClick={() => onEdit(resume)}>Edit Resume</button>
        </div>
      </div>

      {/* Info */}
      <div className="db-card-body">
        <div className="db-card-name-row">
          {editingName ? (
            <input
              ref={nameInputRef}
              className="db-card-name-input"
              value={nameVal}
              onChange={e => setNameVal(e.target.value)}
              onBlur={commitRename}
              onKeyDown={handleNameKeyDown}
            />
          ) : (
            <span
              className="db-card-name"
              title="Click to rename"
              onClick={() => setEditingName(true)}
            >
              {nameVal}
              <span className="db-card-rename-icon">✏</span>
            </span>
          )}
          <span
            className="db-score-badge"
            style={{ background: scoreColor(score) }}
            title="Resume completeness score"
          >
            {score}%
          </span>
        </div>

        <div className="db-card-meta">
          Updated {relativeTime(resume.updatedAt)}
        </div>

        {/* Actions */}
        <div className="db-card-actions">
          <button
            className="db-action-btn"
            onClick={() => onDownload(resume)}
            disabled={exporting}
            title="Download PDF"
          >
            {exporting ? '…' : '↓ PDF'}
          </button>
          <button className="db-action-btn" onClick={() => onEdit(resume)} title="Edit resume">
            Edit
          </button>
          <button className="db-action-btn" onClick={() => onCopy(resume)} title="Duplicate resume">
            Copy
          </button>
          <button
            className="db-action-btn db-action-ghost"
            onClick={() => onDelete(resume)}
            title="Delete resume"
          >
            Delete
          </button>
        </div>

        {/* Tailor CTA */}
        <button className="db-tailor-btn" onClick={() => onEdit(resume, 'tailor')}>
          ✨ Tailor to Job Listing
        </button>
      </div>
    </div>
  );
}

// ── Create New Card ──────────────────────────────────────────────────────────

function CreateNewCard({ onClick }) {
  return (
    <button className="db-card db-card-new" onClick={onClick}>
      <div className="db-card-new-icon">+</div>
      <span className="db-card-new-label">Create New Resume</span>
    </button>
  );
}

// ── Edit Mode Modal ──────────────────────────────────────────────────────────

function EditModeModal({ resume, onSelect, onClose }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div className="db-modal-backdrop" onClick={onClose}>
      <div className="db-modal" onClick={e => e.stopPropagation()}>
        <button className="db-modal-close" onClick={onClose}>✕</button>
        <h2 className="db-modal-title">How would you like to edit?</h2>
        <p className="db-modal-sub">"{resume.name}"</p>
        <div className="db-modal-options">
          <button className="db-modal-opt db-modal-opt-guided" onClick={() => onSelect('guided')}>
            <span className="db-modal-opt-icon">🧭</span>
            <strong>Guided</strong>
            <span>Step-by-step with AI tips</span>
          </button>
          <button className="db-modal-opt" onClick={() => onSelect('expert')}>
            <span className="db-modal-opt-icon">⚡</span>
            <strong>Expert</strong>
            <span>All sections at once</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Cover Letter Card ────────────────────────────────────────────────────────

const TONE_COLORS = {
  Professional: '#2563eb',
  Enthusiastic: '#f59e0b',
  Confident:    '#7c3aed',
  Creative:     '#16a34a',
};

function CoverLetterCard({ cl, onEdit, onDelete }) {
  return (
    <div className="db-card db-cl-card">
      {/* Thumbnail */}
      <div className="db-card-thumb db-cl-thumb">
        <div className="db-cl-thumb-icon">✉️</div>
        <div className="db-cl-thumb-lines">
          <div className="db-mockup-line db-ml-wide" />
          <div className="db-mockup-line db-ml-med" />
          <div className="db-mockup-line db-ml-wide" />
          <div className="db-mockup-line db-ml-narrow" />
        </div>
      </div>

      <div className="db-card-body">
        <div className="db-card-name-row">
          <span className="db-card-name" style={{ cursor: 'default' }}>
            {cl.companyName || 'Cover Letter'}
          </span>
          {cl.tone && (
            <span
              className="db-score-badge"
              style={{ background: TONE_COLORS[cl.tone] || '#2563eb' }}
            >
              {cl.tone}
            </span>
          )}
        </div>

        {cl.resumeName && (
          <div className="db-card-meta">Resume: {cl.resumeName}</div>
        )}
        <div className="db-card-meta">Updated {relativeTime(cl.updatedAt)}</div>

        <div className="db-card-actions">
          <button className="db-action-btn" onClick={() => onEdit(cl.id)}>Edit</button>
          <button className="db-action-btn db-action-ghost" onClick={() => onDelete(cl)}>Delete</button>
        </div>
      </div>
    </div>
  );
}

// ── Main Dashboard ───────────────────────────────────────────────────────────

export default function Dashboard() {
  const navigate = useNavigate();
  const [resumes, setResumes] = useState([]);
  const [coverLetters, setCoverLetters] = useState([]);
  const [activeTab, setActiveTab] = useState('resumes');
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null); // { id, name, type }
  const [exportingId, setExportingId] = useState(null);
  const [toast, setToast] = useState('');
  const exportPaperRef = useRef(null);

  // Run migration + load on mount
  useEffect(() => {
    migrateOldResumeIfNeeded();
    setResumes(getResumes());
    setCoverLetters(getCoverLetters());
  }, []);

  const refresh = useCallback(() => {
    setResumes(getResumes());
    setCoverLetters(getCoverLetters());
  }, []);

  const showToast = useCallback((msg) => {
    setToast(msg);
  }, []);

  // ── PDF export ─────────────────────────────────────────────────────────────

  const handleDownload = async (resume) => {
    setExportingId(resume.id);
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
    await new Promise(r => setTimeout(r, 150));
    try {
      const fullName = resume.data?.personalInfo?.fullName || '';
      await exportResumeToPDF(exportPaperRef.current, fullName);
    } catch (e) {
      console.error('PDF export error:', e);
    }
    setExportingId(null);
  };

  // ── Edit ───────────────────────────────────────────────────────────────────

  const handleEdit = (resume, action) => {
    if (action === 'tailor') {
      loadResumeById(resume.id);
      navigate('/builder/edit?tailor=1');
      return;
    }
    setEditTarget(resume);
  };

  const handleModeSelect = (mode) => {
    if (!editTarget) return;
    loadResumeById(editTarget.id);
    setEditTarget(null);
    navigate(mode === 'guided' ? '/builder/wizard' : '/builder/edit');
  };

  // ── Copy ───────────────────────────────────────────────────────────────────

  const handleCopy = (resume) => {
    duplicateResume(resume.id);
    refresh();
    showToast(`"${resume.name}" copied`);
  };

  // ── Delete ─────────────────────────────────────────────────────────────────

  const handleDeleteResume = (resume) => {
    setDeleteTarget({ id: resume.id, name: resume.name, type: 'resume' });
  };

  const handleDeleteCoverLetter = (cl) => {
    setDeleteTarget({ id: cl.id, name: cl.companyName || 'Cover Letter', type: 'cover-letter' });
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    const name = deleteTarget.name;
    if (deleteTarget.type === 'resume') {
      deleteResume(deleteTarget.id);
    } else {
      deleteCoverLetter(deleteTarget.id);
    }
    setDeleteTarget(null);
    refresh();
    showToast(`"${name}" deleted`);
  };

  // ── Create new resume ─────────────────────────────────────────────────────

  const handleCreateNew = () => {
    clearActiveResumeId();
    navigate('/builder');
  };

  // ── Cover letter actions ───────────────────────────────────────────────────

  const handleEditCoverLetter = (id) => navigate(`/cover-letter?id=${id}`);

  const exportingResume = exportingId ? resumes.find(r => r.id === exportingId) : null;

  return (
    <div className="dashboard-page">
      {/* Toast notification */}
      {toast && <Toast message={toast} onDone={() => setToast('')} />}

      {/* Hidden renderer for PDF export */}
      {exportingResume && (
        <div className="db-hidden-renderer">
          <LivePreview resumeData={exportingResume.data} paperRef={exportPaperRef} />
        </div>
      )}

      {/* Edit mode modal */}
      {editTarget && (
        <EditModeModal
          resume={editTarget}
          onSelect={handleModeSelect}
          onClose={() => setEditTarget(null)}
        />
      )}

      {/* Delete confirm modal */}
      {deleteTarget && (
        <DeleteConfirmModal
          name={deleteTarget.name}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      <div className="dashboard-inner">
        {/* Header */}
        <div className="db-header">
          <div>
            <h1 className="db-title">My Dashboard</h1>
            <p className="db-subtitle">{resumes.length} resume{resumes.length !== 1 ? 's' : ''} saved</p>
          </div>
          <button className="db-create-btn" onClick={handleCreateNew}>
            + New Resume
          </button>
        </div>

        {/* Tabs */}
        <div className="db-tabs">
          <button
            className={`db-tab ${activeTab === 'resumes' ? 'active' : ''}`}
            onClick={() => setActiveTab('resumes')}
          >
            My Resumes
            {resumes.length > 0 && <span className="db-tab-count">{resumes.length}</span>}
          </button>
          <button
            className={`db-tab ${activeTab === 'cover-letters' ? 'active' : ''}`}
            onClick={() => setActiveTab('cover-letters')}
          >
            Cover Letters
            {coverLetters.length > 0 && <span className="db-tab-count">{coverLetters.length}</span>}
          </button>
        </div>

        {/* Content */}
        {activeTab === 'resumes' ? (
          <div className="db-grid">
            <CreateNewCard onClick={handleCreateNew} />
            {resumes.map(resume => (
              <ResumeCard
                key={resume.id}
                resume={resume}
                onEdit={handleEdit}
                onDelete={handleDeleteResume}
                onCopy={handleCopy}
                onDownload={handleDownload}
                exporting={exportingId === resume.id}
              />
            ))}
          </div>
        ) : (
          <div className="db-grid">
            <button className="db-card db-card-new" onClick={() => navigate('/cover-letter')}>
              <div className="db-card-new-icon">+</div>
              <span className="db-card-new-label">New Cover Letter</span>
            </button>
            {coverLetters.map(cl => (
              <CoverLetterCard
                key={cl.id}
                cl={cl}
                onEdit={handleEditCoverLetter}
                onDelete={handleDeleteCoverLetter}
              />
            ))}
          </div>
        )}

        {activeTab === 'resumes' && resumes.length === 0 && (
          <div className="db-empty-state" style={{ marginTop: '2rem' }}>
            <div className="db-empty-icon">📄</div>
            <h2>No resumes yet</h2>
            <p>Create your first resume to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}
