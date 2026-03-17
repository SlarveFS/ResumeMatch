# ResumeMatch — AI-Powered Resume Platform

**Build, analyze, and optimize professional resumes for free.** No account required. No watermarks. No paywalls.

Live: [resume-match-gilt.vercel.app](https://resume-match-gilt.vercel.app)

-----

## Why ResumeMatch?

Most resume builders charge $25–50/month for AI features, lock PDF downloads behind paywalls, and require account creation before you can start. ResumeMatch gives you everything for free — AI-powered writing, 15 professional templates, job tailoring, cover letters, and unlimited PDF exports. Start building in seconds, no signup needed.

-----

## Features

### Step-by-Step Resume Wizard

A guided 7-step flow walks you through building a professional resume from scratch. Each step focuses on one section with helpful tips, recruiter insights, and character count targets. A gamified resume score bar tracks your progress in real-time, showing exactly what to add next to strengthen your resume.

### AI-Powered Writing Tools

- **Improve with AI** — Enhance any bullet point with stronger action verbs and quantified achievements
- **Pre-written Phrases** — Get role-specific bullet points and summary suggestions based on your job title
- **AI Summary Generator** — Generate 2-3 professional summary options with tone selection (Professional, Enthusiastic, Confident)
- **Suggested Skills** — AI recommends relevant skills based on your target role with one-click add and refresh

### 15 Professional Templates

Choose from 15 professionally designed templates across multiple categories: Simple, Modern, Creative, Professional, ATS-optimized, and Two-Column layouts. Every template shows a realistic preview with sample data so you can see exactly what it looks like before selecting.

### Full Design Customization

- **Templates** — Switch between 15 designs instantly
- **Layout** — Left Column, Centered, or Right Column arrangements
- **Fonts** — 8 professional font families with Dense, Normal, or Loose spacing
- **Colors** — 8 accent color presets applied to headers, dividers, and name

### Resume Analyzer

Paste any job description alongside your resume and get an AI-powered analysis: keyword match scoring, missing skills identification, and section-by-section improvement suggestions.

### Import & Improve

Upload an existing resume (PDF) and AI extracts all your data — experience, education, skills, summary — directly into the editor. Every field is pre-populated so you can start improving immediately instead of retyping.

### Job Tailoring

Paste a job description and AI rewrites your summary, improves bullet points with job-specific keywords, suggests skill additions, and shows an ATS keyword match percentage. Accept changes individually or all at once, with the option to save as a new resume version.

### Cover Letter Builder

Generate AI-powered cover letters matched to your resume design. Select a tone, paste a job description, and get a complete cover letter with editable sections. Export as a professionally formatted PDF.

### Resume Dashboard

Manage multiple resumes from a central dashboard. Each resume card shows a thumbnail preview with your actual content, resume score, and quick actions: Edit, Copy, Download, Delete, and Tailor to Job. Rename resumes for different applications.

### Free PDF Export

Download polished PDFs that match your preview exactly — properly formatted across multiple pages with correct margins and page breaks. Files are named automatically (FirstName_LastName_Resume.pdf).

-----

## Tech Stack

|Layer     |Technology                          |
|----------|------------------------------------|
|Frontend  |React (Vite), React Router          |
|Backend   |Express, Vercel Serverless Functions|
|AI        |Anthropic Claude API                |
|PDF       |jspdf, html2canvas, pdf-parse       |
|Storage   |localStorage (no database, no auth) |
|Deployment|Vercel                              |

-----

## How It Compares

|Feature             |ResumeMatch  |Resume.io  |Resume.co  |ResumeNow  |
|--------------------|:-----------:|:---------:|:---------:|:---------:|
|Price               |**Free**     |$30/mo     |$50/mo     |$2.75/mo   |
|Account Required    |**No**       |Yes        |Yes        |Yes        |
|AI Writing Tools    |**Free**     |Paid add-on|Paid add-on|Paid add-on|
|Resume Analyzer     |**Yes**      |No         |No         |No         |
|Job Tailoring       |**Free**     |Paid       |Paid       |No         |
|PDF Export          |**Free**     |Paid       |Paid       |Paid       |
|Templates           |15           |30+        |6+         |32+        |
|Cover Letters       |**Free**     |Paid       |Paid       |Paid       |
|Multiple Resumes    |**Unlimited**|Paid       |Paid       |Paid       |
|Watermarks          |**None**     |None       |None       |None       |
|Import & Improve    |**Yes**      |Yes        |Yes        |Yes        |
|Design Customization|**Yes**      |Yes        |Yes        |Limited    |
|Step-by-Step Wizard |**Yes**      |Yes        |Yes        |Yes        |
|Resume Score        |**Yes**      |Yes        |Yes        |No         |

-----

## Getting Started

### Prerequisites

- Node.js 18+
- Anthropic API key

### Local Development

```bash
git clone https://github.com/SlarveFS/ResumeMatch.git
cd ResumeMatch
npm install
```

Create a `.env` file:

```
ANTHROPIC_API_KEY=your-api-key-here
```

Start the development server:

```bash
npm run dev
```

Open <http://localhost:5173>

### Deployment

The project is configured for Vercel deployment with serverless functions in the `/api` directory.

```bash
vercel --prod
```

Set `ANTHROPIC_API_KEY` in your Vercel environment variables.

-----

## Project Structure

```
ResumeMatch/
├── api/                          # Vercel serverless functions
│   ├── analyze.js                # Resume analysis endpoint
│   ├── suggest-content.js        # AI content suggestions
│   ├── improve-content.js        # Bullet point improvement
│   ├── generate-cover-letter.js  # Cover letter generation
│   └── tailor-resume.js          # Job tailoring
├── src/
│   ├── components/
│   │   ├── wizard/               # Step-by-step builder
│   │   ├── customization/        # Design customization panel
│   │   ├── dashboard/            # Resume management
│   │   ├── cover-letter/         # Cover letter builder
│   │   └── templates/            # 15 resume templates
│   ├── pages/                    # Route pages
│   └── App.jsx                   # Main app with routing
├── server.js                     # Express server (local dev)
└── package.json
```

-----

## Key Features for Portfolio Discussion

**Problem Solved:** Resume builders charge $25-50/month and lock essential features behind paywalls. Job seekers — especially those early in their careers — shouldn’t have to pay to create a professional resume.

**Technical Highlights:**

- Full-stack React application with Express backend and Vercel serverless deployment
- Anthropic Claude API integration for 5 distinct AI features (analysis, content generation, improvement, cover letters, job tailoring)
- Real-time resume scoring algorithm with gamified progress tracking
- Dynamic PDF generation with multi-page support and proper formatting
- PDF parsing and AI-powered data extraction for resume import
- 15 customizable templates with live preview rendering
- localStorage-based state management supporting unlimited documents
- Form validation, date pickers, location autocomplete, and responsive design

**Competitive Research:** Analyzed Resume.io, Resume.co, ResumeNow, MyPerfectResume, and FlowCV to identify the best UX patterns — then implemented them in a free product that matches or exceeds the paid experience.

-----

## License

MIT

-----

Built by [Slarve Benoit](https://github.com/SlarveFS)