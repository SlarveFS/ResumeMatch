import { Link } from 'react-router-dom';
import './Landing.css';

function Landing() {
  return (
    <div className="landing">
      {/* Hero Section */}
      <section className="landing-hero">
        <div className="landing-hero-inner">
          <div className="landing-hero-badge">AI-Powered • 100% Free • No Signup</div>
          <h1 className="landing-hero-title">
            Land Your Dream Job<br />
            <span className="landing-hero-gradient">Faster Than Ever</span>
          </h1>
          <p className="landing-hero-subtitle">
            Analyze your resume against any job posting, then build a polished,
            professional resume with AI assistance — all for free.
          </p>
          <div className="landing-hero-actions">
            <Link to="/analyze" className="landing-cta-primary">
              Analyze My Resume
            </Link>
            <Link to="/builder" className="landing-cta-secondary">
              Build a Resume
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="landing-features">
        <div className="landing-features-inner">
          <div className="feature-card">
            <div className="feature-card-icon" style={{ background: 'rgba(46,90,136,0.1)', color: '#2E5A88' }}>📊</div>
            <h2 className="feature-card-title">Resume Analyzer</h2>
            <p className="feature-card-desc">
              Get an AI-powered match score comparing your resume to any job description.
              See missing keywords, strengths, and get suggested resume bullets.
            </p>
            <ul className="feature-card-list">
              <li>✓ Match score (0–100%)</li>
              <li>✓ Missing keywords analysis</li>
              <li>✓ Suggested bullet points</li>
              <li>✓ Upload PDF or paste text</li>
            </ul>
            <Link to="/analyze" className="feature-card-btn">
              Analyze Resume →
            </Link>
          </div>

          <div className="feature-card feature-card-featured">
            <div className="feature-card-badge">NEW</div>
            <div className="feature-card-icon" style={{ background: 'rgba(74,144,217,0.15)', color: '#4A90D9' }}>✏️</div>
            <h2 className="feature-card-title">Resume Builder</h2>
            <p className="feature-card-desc">
              Build a stunning, professional resume from scratch or import your existing one.
              AI helps you write every section — and export is 100% free.
            </p>
            <ul className="feature-card-list">
              <li>✓ 6 professional templates</li>
              <li>✓ AI writing assistance</li>
              <li>✓ Live preview as you type</li>
              <li>✓ Free PDF export, no watermark</li>
            </ul>
            <Link to="/builder" className="feature-card-btn feature-card-btn-primary">
              Build Resume →
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="landing-stats">
        <div className="landing-stats-inner">
          <div className="stat-item">
            <div className="stat-number">100%</div>
            <div className="stat-label">Free Forever</div>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <div className="stat-number">6</div>
            <div className="stat-label">Professional Templates</div>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <div className="stat-number">AI</div>
            <div className="stat-label">Powered Analysis</div>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <div className="stat-number">0</div>
            <div className="stat-label">Watermarks</div>
          </div>
        </div>
      </section>

      {/* Why Free Section */}
      <section className="landing-why">
        <div className="landing-why-inner">
          <h2>Why is everything free?</h2>
          <p>
            Resume builders like Resume.io and Zety charge $20–40/month just to download your own resume.
            That's not right. ResumeMatch gives you everything — AI writing, professional templates,
            and PDF export — completely free. No trials, no paywalls, no watermarks.
          </p>
        </div>
      </section>
    </div>
  );
}

export default Landing;
