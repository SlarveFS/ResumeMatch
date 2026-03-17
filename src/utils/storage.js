const RESUME_KEY = 'resumematch_builder';
const RESUMES_KEY = 'resumematch_resumes';
const ACTIVE_ID_KEY = 'resumematch_active_id';

// ── Single-resume working copy ───────────────────────────────────────────────

export function saveResumeData(data) {
  try {
    const withTimestamp = { ...data, lastSaved: new Date().toISOString() };
    localStorage.setItem(RESUME_KEY, JSON.stringify(withTimestamp));
    // Auto-sync to multi-resume store
    let activeId = getActiveResumeId();
    if (!activeId) {
      activeId = crypto.randomUUID();
      setActiveResumeId(activeId);
    }
    _syncToResumes(activeId, data);
  } catch {}
}

export function loadResumeData() {
  try {
    const raw = localStorage.getItem(RESUME_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function clearResumeData() {
  try { localStorage.removeItem(RESUME_KEY); } catch {}
}

// ── Active resume ID ─────────────────────────────────────────────────────────

export function getActiveResumeId() {
  try { return localStorage.getItem(ACTIVE_ID_KEY) || null; } catch { return null; }
}

export function setActiveResumeId(id) {
  try { localStorage.setItem(ACTIVE_ID_KEY, id); } catch {}
}

export function clearActiveResumeId() {
  try { localStorage.removeItem(ACTIVE_ID_KEY); } catch {}
}

// ── Multi-resume store ───────────────────────────────────────────────────────

export function getResumes() {
  try {
    const raw = localStorage.getItem(RESUMES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function _saveResumes(resumes) {
  try { localStorage.setItem(RESUMES_KEY, JSON.stringify(resumes)); } catch {}
}

function _syncToResumes(id, data) {
  const resumes = getResumes();
  const idx = resumes.findIndex(r => r.id === id);
  const now = new Date().toISOString();
  if (idx === -1) {
    const name = data.personalInfo?.fullName
      ? `${data.personalInfo.fullName}'s Resume`
      : 'Untitled Resume';
    resumes.unshift({ id, name, data, createdAt: now, updatedAt: now });
  } else {
    resumes[idx] = { ...resumes[idx], data, updatedAt: now };
  }
  _saveResumes(resumes);
}

export function createResumeEntry(data, name) {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const resumes = getResumes();
  const entry = { id, name: name || 'Untitled Resume', data, createdAt: now, updatedAt: now };
  _saveResumes([entry, ...resumes]);
  setActiveResumeId(id);
  return entry;
}

export function renameResume(id, name) {
  const resumes = getResumes();
  const idx = resumes.findIndex(r => r.id === id);
  if (idx === -1) return;
  resumes[idx] = { ...resumes[idx], name, updatedAt: new Date().toISOString() };
  _saveResumes(resumes);
}

export function duplicateResume(id) {
  const resumes = getResumes();
  const original = resumes.find(r => r.id === id);
  if (!original) return null;
  const newId = crypto.randomUUID();
  const now = new Date().toISOString();
  // Deep-clone data so the copy is completely independent
  const dataCopy = JSON.parse(JSON.stringify(original.data));
  const copy = { ...original, id: newId, name: original.name + ' (Copy)', data: dataCopy, createdAt: now, updatedAt: now };
  _saveResumes([copy, ...resumes]);
  return copy;
}

export function deleteResume(id) {
  _saveResumes(getResumes().filter(r => r.id !== id));
  if (getActiveResumeId() === id) clearActiveResumeId();
}

export function loadResumeById(id) {
  const resumes = getResumes();
  const entry = resumes.find(r => r.id === id);
  if (!entry) return false;
  setActiveResumeId(id);
  try {
    localStorage.setItem(RESUME_KEY, JSON.stringify({ ...entry.data, lastSaved: new Date().toISOString() }));
  } catch {}
  return true;
}

// ── Cover Letter store ───────────────────────────────────────────────────────

const COVER_LETTERS_KEY = 'resumematch_cover_letters';

export function getCoverLetters() {
  try {
    const raw = localStorage.getItem(COVER_LETTERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function _saveCoverLetters(cls) {
  try { localStorage.setItem(COVER_LETTERS_KEY, JSON.stringify(cls)); } catch {}
}

export function saveCoverLetter(cl) {
  const cls = getCoverLetters();
  const idx = cls.findIndex(c => c.id === cl.id);
  const now = new Date().toISOString();
  if (idx === -1) {
    _saveCoverLetters([{ ...cl, createdAt: cl.createdAt || now, updatedAt: now }, ...cls]);
  } else {
    cls[idx] = { ...cls[idx], ...cl, updatedAt: now };
    _saveCoverLetters(cls);
  }
}

export function getCoverLetterById(id) {
  return getCoverLetters().find(c => c.id === id) || null;
}

export function deleteCoverLetter(id) {
  _saveCoverLetters(getCoverLetters().filter(c => c.id !== id));
}

// ── Migration ────────────────────────────────────────────────────────────────

export function addResumeToStore(data, name) {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const resumes = getResumes();
  _saveResumes([{ id, name: name || 'Untitled Resume', data, createdAt: now, updatedAt: now }, ...resumes]);
  return id;
}

export function migrateOldResumeIfNeeded() {
  try {
    const resumes = getResumes();
    if (resumes.length > 0) return; // Already have multi-resume data
    const old = loadResumeData();
    if (!old || !old.personalInfo?.fullName) return; // Nothing meaningful to migrate
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const name = `${old.personalInfo.fullName}'s Resume`;
    _saveResumes([{ id, name, data: old, createdAt: now, updatedAt: now }]);
    setActiveResumeId(id);
  } catch {}
}
