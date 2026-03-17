// ── Wizard Score Utilities ────────────────────────────────────────────────

export function calculateScore(data) {
  let score = 10; // base for starting

  const pi = data.personalInfo || {};

  // Personal details complete: +10%
  if (pi.firstName && pi.lastName && pi.email && pi.phone) score += 10;

  // Job target filled: +10%
  if ((pi.jobTarget || '').trim()) score += 10;

  // At least 1 experience with 3+ bullets: +25%
  const exp = data.experience || [];
  const goodExp = exp.some(e => {
    const lines = (e.description || '').split('\n').filter(l => l.trim()).length;
    const bullets = (e.bullets || []).filter(b => b.trim()).length;
    return lines >= 3 || bullets >= 3;
  });
  if (goodExp) score += 25;

  // Education added: +15%
  const edu = data.education || [];
  if (edu.length > 0 && (edu[0].school || edu[0].degree)) score += 15;

  // 5+ skills added: +10%
  const skillsWL = data.skillsWithLevel || [];
  if (skillsWL.length >= 5) score += 10;

  // Professional summary 200+ characters: +15%
  if ((data.summary || '').length >= 200) score += 15;

  // Additional section added: +5%
  if ((data.customSections || []).length > 0) score += 5;

  // Extra experience entries: +5% each (up to +10%)
  if (exp.length >= 2) score += 5;
  if (exp.length >= 3) score += 5;

  return Math.min(score, 100);
}

export function getScoreEmoji(score) {
  if (score <= 20) return '😟';
  if (score <= 40) return '😐';
  if (score <= 60) return '🙂';
  if (score <= 80) return '😊';
  return '🤩';
}

export function getScoreColor(score) {
  if (score <= 30) return '#ef4444';
  if (score <= 60) return '#f59e0b';
  return '#22c55e';
}

export function getNextHint(data) {
  const pi = data.personalInfo || {};
  const exp = data.experience || [];
  const edu = data.education || [];
  const skillsWL = data.skillsWithLevel || [];

  if (!pi.firstName || !pi.lastName || !pi.email || !pi.phone) {
    return { text: 'Fill in personal details', pts: 10 };
  }
  if (!(pi.jobTarget || '').trim()) {
    return { text: 'Add your job target', pts: 10 };
  }
  const goodExp = exp.some(e => {
    const lines = (e.description || '').split('\n').filter(l => l.trim()).length;
    return lines >= 3 || (e.bullets || []).filter(b => b.trim()).length >= 3;
  });
  if (!goodExp) {
    return { text: 'Add 3+ experience bullet points', pts: 25 };
  }
  if (edu.length === 0 || (!edu[0].school && !edu[0].degree)) {
    return { text: 'Add your education', pts: 15 };
  }
  if (skillsWL.length < 5) {
    return { text: 'Add 5+ skills', pts: 10 };
  }
  if ((data.summary || '').length < 200) {
    return { text: 'Write a 200+ character summary', pts: 15 };
  }
  if (exp.length < 2) {
    return { text: 'Add another job entry', pts: 5 };
  }
  return null;
}

// Convert wizard data → legacy localStorage format for backward compat
export function wizardDataToStorageFormat(wizardData) {
  const pi = wizardData.personalInfo || {};

  // Derive fullName from firstName + lastName
  const fullName = [pi.firstName, pi.lastName].filter(Boolean).join(' ');

  // Derive location from address fields
  const locationParts = [pi.city, pi.state].filter(Boolean);
  const location = pi.address || locationParts.join(', ') || pi.location || '';

  // Convert experience description → bullets array
  const experience = (wizardData.experience || []).map(e => ({
    ...e,
    bullets: e.description
      ? e.description.split('\n').filter(l => l.trim()).map(l => l.replace(/^[•\-]\s*/, ''))
      : (e.bullets || ['']),
  }));

  // Convert skillsWithLevel → skills.technical (flat list)
  const skillsWL = wizardData.skillsWithLevel || [];
  const skills = {
    ...(wizardData.skills || {}),
    technical: skillsWL.map(s => s.name),
  };

  return {
    ...wizardData,
    personalInfo: {
      ...pi,
      fullName,
      location,
    },
    experience,
    skills,
  };
}

// Suggested skills by job title keyword
const SKILL_SETS = {
  developer: ['JavaScript', 'Python', 'React', 'Node.js', 'Git', 'SQL', 'REST APIs', 'TypeScript', 'Docker', 'AWS', 'Agile', 'Problem Solving'],
  engineer: ['System Design', 'Python', 'Java', 'SQL', 'Git', 'Docker', 'Kubernetes', 'AWS', 'CI/CD', 'Agile', 'Testing', 'Linux'],
  designer: ['Figma', 'Adobe XD', 'UI/UX Design', 'Prototyping', 'User Research', 'Sketch', 'CSS', 'Typography', 'Wireframing', 'Design Systems'],
  marketing: ['SEO', 'Google Analytics', 'Social Media Marketing', 'Content Strategy', 'Email Marketing', 'PPC', 'Copywriting', 'HubSpot', 'A/B Testing'],
  manager: ['Project Management', 'Agile', 'Jira', 'Team Leadership', 'Budget Management', 'Stakeholder Management', 'Strategic Planning', 'OKRs'],
  analyst: ['Excel', 'SQL', 'Tableau', 'Data Visualization', 'Power BI', 'Python', 'R', 'Statistical Analysis', 'Business Intelligence'],
  data: ['Python', 'SQL', 'Machine Learning', 'TensorFlow', 'Pandas', 'NumPy', 'Tableau', 'Spark', 'Statistics', 'Deep Learning'],
  sales: ['CRM', 'Salesforce', 'Negotiation', 'Cold Calling', 'Relationship Building', 'Lead Generation', 'Pipeline Management', 'Account Management'],
  finance: ['Excel', 'Financial Analysis', 'Budgeting', 'GAAP', 'QuickBooks', 'Financial Reporting', 'Reconciliation', 'Forecasting'],
  accounting: ['QuickBooks', 'Excel', 'GAAP', 'Tax Preparation', 'Financial Reporting', 'Reconciliation', 'Auditing', 'Payroll'],
  nurse: ['Patient Care', 'EMR/EHR', 'HIPAA Compliance', 'Clinical Assessment', 'Medication Administration', 'IV Therapy', 'Triage'],
  teacher: ['Curriculum Development', 'Classroom Management', 'Google Classroom', 'Lesson Planning', 'Student Assessment', 'Differentiated Instruction'],
  product: ['Product Roadmap', 'Agile', 'User Stories', 'Jira', 'Stakeholder Management', 'A/B Testing', 'User Research', 'Data Analysis'],
  default: ['Communication', 'Problem Solving', 'Team Collaboration', 'Time Management', 'Adaptability', 'Critical Thinking', 'Leadership', 'Microsoft Office', 'Attention to Detail'],
};

export function getSuggestedSkills(jobTitle, existingSkills = []) {
  const lower = (jobTitle || '').toLowerCase();
  const existingNames = new Set(existingSkills.map(s => (s.name || s).toLowerCase()));

  let pool = SKILL_SETS.default;

  for (const [key, skills] of Object.entries(SKILL_SETS)) {
    if (key === 'default') continue;
    if (lower.includes(key)) {
      pool = [...skills, ...SKILL_SETS.default];
      break;
    }
  }

  // Also check for compound keywords
  if (lower.includes('software') || lower.includes('web') || lower.includes('full stack') || lower.includes('frontend') || lower.includes('backend')) {
    pool = [...SKILL_SETS.developer, ...SKILL_SETS.default];
  }

  return [...new Set(pool)].filter(s => !existingNames.has(s.toLowerCase())).slice(0, 12);
}
