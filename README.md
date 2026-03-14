# ◎ ResumeMatch

**AI-powered resume analysis that finds the gaps and helps you get the interview.**

🔗 **Live App:** [resume-match-gilt.vercel.app](https://resume-match-gilt.vercel.app)

---

## What It Does

ResumeMatch analyzes your resume against any job description using AI to give you actionable feedback. Instead of guessing whether your resume is a good fit, get a data-driven analysis in seconds.

**Upload your resume → Add a job description → Get instant AI analysis**

### Features

- **AI-Powered Analysis** — Uses Claude AI to deeply analyze keyword alignment, qualifications, and gaps between your resume and the target job
- **Match Score** — Get a 0-100% score showing how well your resume fits the role
- **Missing Keywords** — See exactly which important terms from the job description are missing in your resume  
- **Suggested Bullets** — AI-generated resume bullet points tailored to the specific job you're applying for
- **Strengths Report** — Understand what your resume already does well for the role
- **PDF Resume Upload** — Upload your resume as a PDF instead of copy-pasting
- **URL Auto-Extract** — Paste a job posting URL and automatically extract the description
- **Analysis History** — Save and compare results across multiple job applications
- **PDF Export** — Download your analysis as a professional PDF report

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React, Vite |
| Backend | Node.js, Express (local) / Vercel Serverless Functions (production) |
| AI | Anthropic Claude API (claude-sonnet-4-20250514) |
| Styling | Custom CSS |
| Deployment | Vercel |
| PDF Parsing | pdf-parse |

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

1. **Input** — Upload a PDF resume or paste resume text. Add a job description by pasting text or entering a job posting URL.
2. **Analysis** — The app sends both documents to Claude's API with a specialized prompt designed to evaluate ATS keyword alignment and qualification matching.
3. **Results** — Claude returns a structured analysis with a match score, strengths, missing keywords, and tailored bullet point suggestions.
4. **Action** — Use the suggested bullets to improve your resume, export the analysis as a PDF, and save it to your history to compare across jobs.

## Project Structure

```
resumematch/
├── api/                    # Vercel serverless functions
│   ├── analyze.js          # Resume analysis endpoint
│   ├── extract-pdf.js      # PDF text extraction endpoint
│   └── extract-url.js      # URL content extraction endpoint
├── src/
│   ├── components/
│   │   ├── Header.jsx      # App header with branding
│   │   ├── InputPanel.jsx  # Resume and job description inputs
│   │   └── Results.jsx     # Analysis results display
│   ├── App.jsx             # Main application component
│   ├── App.css             # Application styles
│   └── main.jsx            # React entry point
├── server.js               # Express server for local development
├── vercel.json             # Vercel deployment configuration
└── package.json
```

## Author

**Slarve Benoit** — Software Developer  
[GitHub](https://github.com/SlarveFS)

---

*Built with React, Claude AI, and shipped to production.*