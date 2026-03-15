const RESUME_KEY = 'resumematch_builder';

export function saveResumeData(data) {
  try {
    localStorage.setItem(RESUME_KEY, JSON.stringify({ ...data, lastSaved: new Date().toISOString() }));
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
