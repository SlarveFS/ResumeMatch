import { useRef, useEffect, useState } from 'react';
import LivePreview from '../builder/LivePreview';
import './TemplateThumbnail.css';

// Width of the resume-paper element at full render size
const PAPER_WIDTH = 680;

// ── Realistic sample resume data (thumbnail use only) ─────────────────────
const SAMPLE_RESUME = {
  personalInfo: {
    fullName: 'Alex Johnson',
    email: 'alex.johnson@email.com',
    phone: '(555) 867-5309',
    location: 'San Francisco, CA',
    linkedin: 'linkedin.com/in/alexjohnson',
    github: '',
    website: '',
  },
  summary:
    'Results-driven marketing professional with 6+ years of experience in digital marketing, content strategy, and campaign management. Proven track record of increasing engagement by 45% and managing multi-channel campaigns with budgets up to $75K/month.',
  experience: [
    {
      id: 'samp-exp-1',
      jobTitle: 'Senior Marketing Manager',
      company: 'Coastal Digital Agency',
      location: 'San Francisco, CA',
      startDate: 'Mar 2021',
      endDate: '',
      current: true,
      bullets: [
        'Led cross-functional team of 8 to execute 20+ integrated campaigns, increasing brand reach by 45%',
        'Managed $75K/month digital ad budget across Google, Meta, and LinkedIn platforms',
        'Developed content strategy that grew organic social following by 32K in 14 months',
        'Built automated email workflows achieving 38% open rates — 2.4× industry average',
        'Launched A/B testing program across landing pages, lifting conversion rates by 22%',
        'Partnered with sales to create enablement collateral that shortened deal cycles by 18%',
      ],
    },
    {
      id: 'samp-exp-2',
      jobTitle: 'Marketing Coordinator',
      company: 'BrightWave Solutions',
      location: 'San Jose, CA',
      startDate: 'Jun 2018',
      endDate: 'Feb 2021',
      current: false,
      bullets: [
        'Coordinated execution of 12 product launch campaigns across digital channels',
        'Produced weekly SEO content driving 28% year-over-year organic traffic growth',
        'Managed HubSpot CRM database of 15K contacts and designed lead nurture sequences',
        'Collaborated with design team on branded assets for trade shows and webinars',
      ],
    },
  ],
  education: [
    {
      id: 'samp-edu-1',
      degree: 'Bachelor of Science in Marketing',
      school: 'San Francisco State University',
      location: 'San Francisco, CA',
      graduationDate: '2018',
      gpa: '3.8',
      honors: "Dean's List · Marketing Club President",
      coursework: '',
    },
  ],
  skills: {
    technical: ['Social Media Management', 'Content Strategy', 'Email Marketing', 'SEO/SEM', 'Campaign Analytics'],
    tools: ['Google Analytics', 'HubSpot', 'Adobe Creative Suite'],
    soft: ['A/B Testing', 'Data Visualization', 'Project Management'],
    languages: [],
    certifications: [],
  },
  projects: [],
  certifications: [],
  design: {},
  sectionOrder: ['summary', 'experience', 'education', 'skills', 'projects'],
  hiddenSections: [],
  customSections: [],
};

// ── Component ──────────────────────────────────────────────────────────────

export default function TemplateThumbnail({ template }) {
  const outerRef = useRef(null);
  const [scale, setScale] = useState(0.27);

  useEffect(() => {
    const el = outerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(entries => {
      const w = entries[0].contentRect.width;
      if (w > 10) setScale(w / PAPER_WIDTH);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const data = { ...SAMPLE_RESUME, selectedTemplate: template.id };

  return (
    <div ref={outerRef} className="tt-outer">
      <div
        className="tt-inner"
        style={{ transform: `scale(${scale})`, width: PAPER_WIDTH }}
      >
        <LivePreview resumeData={data} paperRef={null} />
      </div>
    </div>
  );
}
