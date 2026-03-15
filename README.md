# ◎ ResumeMatch

**AI-powered resume platform. Analyze, build, and perfect your resume — 100% free, no watermarks, no paywalls.**

🔗 **Live App:** [resume-match-gilt.vercel.app](https://resume-match-gilt.vercel.app)

![ResumeMatch Screenshot](./resume.screenshot.png)

-----

## Why ResumeMatch?

Resume builders like Resume.io and Zety charge $20–40/month just to download your own resume as a PDF. That’s not right.

ResumeMatch gives you everything — AI writing assistance, professional templates, resume analysis, and PDF export — completely free. No trials, no paywalls, no watermarks.

## Features

### Resume Builder

- **6 Professional Templates** — Classic, Modern, Minimal, Bold, Tech, and Creative. Each designed for different industries and roles, all ATS-optimized
- **Live Preview** — See your resume update in real-time as you type, exactly as it will appear in the exported PDF
- **Template Switcher** — Switch between templates instantly without losing any data
- **Section Editor** — Personal Info, Professional Summary, Experience, Education, Skills, Projects, and custom sections. Add, remove, reorder, and toggle sections on/off
- **Free PDF Export** — Download your finished resume as a pixel-perfect PDF. No watermark. No signup required. No paywall.

### Import & Improve

- **Upload your existing resume** (PDF, DOCX, or paste text) and AI automatically extracts all your information
- **Pre-fills the entire builder** — name, contact info, experience, education, skills, projects — all parsed and structured instantly
- **Improve with AI** — once imported, use AI tools to enhance every section of your resume

### AI Writing Assistance

- **AI Summary Writer** — generates professional summary options based on your role and experience
- **AI Bullet Improver** — transforms weak bullet points into strong, quantified achievement statements
- **AI Bullet Generator** — describe what you did in plain English, get polished professional bullets
- **AI Skills Suggester** — recommends relevant skills based on your experience and target role
- **AI Tailor to Job** — paste a job description and AI rewrites your resume to match the specific role

### Resume Analyzer

- **Match Score** — get a 0-100% score showing how well your resume fits a job description
- **Missing Keywords** — see exactly which important terms from the job description are missing
- **Suggested Bullets** — AI-generated resume bullet points tailored to the specific job
- **Strengths Report** — understand what your resume already does well for the role
- **PDF Upload** — upload your resume as a PDF instead of copy-pasting
- **URL Auto-Extract** — paste a job posting URL and automatically extract the description
- **Analysis History** — save and compare results across multiple job applications
- **PDF Export** — download your analysis as a professional report

## Tech Stack

|Layer         |Technology                                                         |
|--------------|-------------------------------------------------------------------|
|Frontend      |React, Vite, React Router                                          |
|Backend       |Node.js, Express (local) / Vercel Serverless Functions (production)|
|AI            |Anthropic Claude API (claude-sonnet-4-20250514)                    |
|PDF Generation|jsPDF, html2canvas                                                 |
|PDF Parsing   |pdf-parse                                                          |
|Styling       |Custom CSS                                                         |
|Deployment    |Vercel                                                             |

## How to Run Locally

### Prerequisites

- Node.js 18+
- An [Anthropic API key](https://console.anthropic.com/)

### Setup

```bash
# Clone the repo
git clone https://github.com/SlarveFS/ResumeMatch.git
cd ResumeMatch

# Install dependencies
npm install

# Create your .env file
echo "ANTHROPIC_API_KEY=your-api-key-here" > .env

# Start the development server
node server.js
```

Open **http://localhost:3000** in your browser.

## How It Works

### Build a Resume

1. Choose **Start from scratch** or **Import & Improve** (upload an existing resume)
1. Pick a professional template
1. Fill in your information — AI assists with writing at every step
1. Preview your resume in real-time, switch templates anytime
1. Download as a free PDF — no watermark, no paywall

### Analyze a Resume

1. Upload your resume PDF or paste the text
1. Add a job description by pasting text or entering a URL
1. Get an AI-powered analysis with match score, missing keywords, strengths, and suggested improvements
1. Export the analysis as a PDF report

## What Makes This Different

|                    |ResumeMatch       |Resume.io  |MyPerfectResume|Zety      |
|--------------------|------------------|-----------|---------------|----------|
|**Price**           |Free              |$30/month  |$24/month      |$24/month |
|**PDF Export**      |Free, no watermark|Paid only  |Paid only      |Paid only |
|**AI Writing**      |Built-in          |Limited    |Limited        |Basic     |
|**Resume Analysis** |Full ATS analysis |Basic score|None           |Basic     |
|**Import & Improve**|AI extraction     |Upload only|No             |No        |
|**Templates**       |6 professional    |20+ (paid) |30+ (paid)     |20+ (paid)|

## Project Structure

```
resumematch/
├── api/                        # Vercel serverless functions
│   ├── analyze.js              # Resume analysis
│   ├── extract-pdf.js          # PDF text extraction
│   ├── extract-url.js          # URL content extraction
│   ├── extract-resume-data.js  # AI resume data parsing
│   ├── generate-summary.js     # AI summary writer
│   ├── improve-bullet.js       # AI bullet improver
│   ├── generate-bullets.js     # AI bullet generator
│   └── suggest-skills.js       # AI skills suggester
├── src/
│   ├── components/
│   │   ├── navbar/             # Top navigation
│   │   ├── analyzer/           # Resume analysis UI
│   │   ├── builder/            # Resume builder
│   │   │   ├── sections/       # Editor form sections
│   │   │   ├── ai/             # AI feature components
│   │   │   ├── templates/      # Template CSS styles
│   │   │   └── export/         # PDF export
│   │   └── common/             # Shared components
│   ├── pages/                  # Route pages
│   ├── utils/                  # Helpers and configs
│   ├── App.jsx
│   └── App.css
├── server.js                   # Express server (local dev)
└── package.json
```

## Roadmap

- [x] Resume Analyzer with AI
- [x] Resume Builder with templates
- [x] Import & Improve with AI extraction
- [x] AI writing assistance
- [x] Free PDF export
- [ ] Cover Letter Generator
- [ ] Job Search Dashboard
- [ ] Mobile App (iOS & Android)

## Author

**Slarve Benoit** — Software Developer
[GitHub](https://github.com/SlarveFS)

-----

*Built with React, Claude AI, and shipped to production. 100% free, forever.*