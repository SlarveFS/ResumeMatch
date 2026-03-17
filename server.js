import "dotenv/config";
import Anthropic from "@anthropic-ai/sdk";
import express from "express";
import cors from "cors";
import { createServer as createViteServer } from "vite";
import multer from "multer";
import { PDFParse } from "pdf-parse";
import * as cheerio from "cheerio";

const app = express();
app.use(cors());
app.use(express.json());

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Feature 1: PDF upload endpoint
const upload = multer({ storage: multer.memoryStorage() });

app.post("/api/extract-pdf", upload.single("resume"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded." });
  }
  if (req.file.mimetype !== "application/pdf") {
    return res.status(400).json({ error: "Only PDF files are accepted." });
  }
  try {
    const parser = new PDFParse({ data: req.file.buffer });
    const result = await parser.getText();
    await parser.destroy();
    res.json({ text: result.text });
  } catch (err) {
    console.error("PDF parse error:", err);
    res.status(500).json({ error: "Failed to extract text from PDF." });
  }
});

// Feature 2: URL extraction endpoint
app.post("/api/extract-url", async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: "URL is required." });
  }

  let parsedUrl;
  try {
    parsedUrl = new URL(url);
    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      throw new Error("Invalid protocol");
    }
  } catch {
    return res.status(400).json({ error: "Please provide a valid URL." });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; ResumeMatch/1.0)",
      },
    });

    clearTimeout(timeout);

    if (response.status === 403) {
      return res
        .status(403)
        .json({
          error:
            "This site blocked access (403). Try pasting the description instead.",
        });
    }

    if (!response.ok) {
      return res
        .status(502)
        .json({
          error: `Could not fetch the page (status ${response.status}). Try pasting instead.`,
        });
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Remove noise elements
    $("script, style, nav, header, footer, aside").remove();

    // Try specific job-description selectors first, fall back to body
    let text = "";
    const selectors = [
      "main",
      "article",
      ".job-description",
      '[class*="job-description"]',
      '[id*="job-description"]',
      '[class*="jobDescription"]',
      '[id*="jobDescription"]',
    ];

    for (const sel of selectors) {
      const el = $(sel);
      if (el.length) {
        text = el.text();
        break;
      }
    }

    if (!text.trim()) {
      text = $("body").text();
    }

    // Clean up whitespace
    text = text
      .replace(/\t/g, " ")
      .replace(/[ \t]+/g, " ")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    res.json({ text });
  } catch (err) {
    clearTimeout(timeout);
    if (err.name === "AbortError") {
      return res
        .status(504)
        .json({
          error: "Request timed out. Try pasting the description instead.",
        });
    }
    console.error("URL fetch error:", err);
    res
      .status(502)
      .json({
        error: "Network error fetching the URL. Try pasting instead.",
      });
  }
});

app.post("/api/analyze", async (req, res) => {
  const { jobDescription, resume } = req.body;

  if (!jobDescription || !resume) {
    return res.status(400).json({ error: "Both fields are required." });
  }

  try {
    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1500,
      messages: [
        {
          role: "user",
          content: `You are an expert ATS resume analyst and career coach. Analyze the following resume against the job description.

JOB DESCRIPTION:
${jobDescription}

RESUME:
${resume}

Respond ONLY with a valid JSON object (no markdown, no backticks, no explanation) with exactly this structure:
{
  "matchScore": <number 0-100 representing how well the resume matches>,
  "strengths": [<3-5 strings describing what the resume does well for this role>],
  "missingKeywords": [<5-10 important keywords/skills from the job description missing in the resume>],
  "suggestedBullets": [<3-5 resume bullet points the candidate could add to better match this role>]
}

Be specific and actionable. The suggested bullets should be realistic and based on skills the candidate likely has given their resume.`,
        },
      ],
    });

    const text = message.content[0].text;
    const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const parsed = JSON.parse(cleaned);

    res.json(parsed);
  } catch (err) {
    console.error("API Error:", err);
    res.status(500).json({ error: "Analysis failed. Please try again." });
  }
});

app.post("/api/extract-resume-data", async (req, res) => {
  const { text } = req.body;
  if (!text || text.trim().length < 20) {
    return res.status(400).json({ error: "No resume text provided." });
  }

  try {
    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4000,
      messages: [
        {
          role: "user",
          content: `You are an expert resume parser. Extract ALL structured data from this resume and return ONLY valid JSON. No markdown, no backticks, no explanation — just the raw JSON object.

CRITICAL RULES:
1. Extract EVERY bullet point from EVERY job — do not skip or summarize any bullet
2. Parse the full name: split into first and last name parts
3. For dates, preserve the exact format shown (e.g. "Jan 2020", "2021", "March 2019")
4. If a person is currently employed, set "current": true and leave endDate empty
5. Categorize ALL skills into the correct category — technical, tools, soft, languages
6. Extract the professional summary/objective verbatim if present
7. Include ALL education entries with ALL fields you can find

Return this exact JSON structure (all fields required, use "" or [] if not found):

{
  "personalInfo": {
    "fullName": "First Last",
    "firstName": "First",
    "lastName": "Last",
    "email": "",
    "phone": "",
    "location": "",
    "address": "",
    "linkedin": "",
    "github": "",
    "website": ""
  },
  "summary": "",
  "experience": [
    {
      "jobTitle": "",
      "company": "",
      "location": "",
      "startDate": "",
      "endDate": "",
      "current": false,
      "bullets": ["every bullet point exactly as written", "another bullet"]
    }
  ],
  "education": [
    {
      "degree": "",
      "school": "",
      "location": "",
      "startDate": "",
      "graduationDate": "",
      "gpa": "",
      "honors": "",
      "coursework": ""
    }
  ],
  "skills": {
    "technical": ["programming languages, frameworks, technical skills"],
    "soft": ["communication, leadership, teamwork"],
    "tools": ["software tools, platforms, SaaS tools"],
    "languages": ["spoken languages"],
    "certifications": ["certifications, licenses"]
  },
  "projects": [
    {
      "name": "",
      "description": "",
      "technologies": [],
      "link": "",
      "bullets": [""]
    }
  ],
  "certifications": []
}

RESUME TEXT:
${text}`,
        },
      ],
    });

    const raw = message.content[0].text;
    const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const resumeData = JSON.parse(cleaned);
    res.json({ resumeData });
  } catch (err) {
    console.error("Resume extraction error:", err);
    res.status(500).json({ error: "Extraction failed. Please try again." });
  }
});

app.post("/api/suggest-content", async (req, res) => {
  const { section, jobTitle, currentContent, experienceSummary, resumeData } = req.body;

  if (!section) return res.status(400).json({ error: "section is required" });

  try {
    let prompt = "";

    if (section === "summary") {
      const contextLines = [];
      if (currentContent) contextLines.push(`Current summary: "${currentContent}"`);
      if (experienceSummary) contextLines.push(`Experience: ${experienceSummary}`);
      if (resumeData?.experience?.length) {
        const expSnippet = resumeData.experience
          .map(e => `${e.jobTitle || ""}${e.company ? ` at ${e.company}` : ""}${e.description ? `: ${e.description.slice(0, 150)}` : ""}`)
          .filter(Boolean)
          .join("\n");
        if (expSnippet) contextLines.push(`Work history:\n${expSnippet}`);
      }
      if (resumeData?.skills?.length) {
        contextLines.push(`Key skills: ${resumeData.skills.slice(0, 8).join(", ")}`);
      }

      prompt = `Generate 3 professional resume summary paragraphs for a ${jobTitle || "professional"}.

${contextLines.join("\n\n")}

Generate exactly 3 distinct summaries with different tones. Each should be 2-4 sentences and 400-600 characters long. They should mention the target role "${jobTitle || "the role"}" naturally.

Return ONLY valid JSON with no markdown or explanation:
{
  "summaries": [
    {"tone": "Enthusiastic", "text": "..."},
    {"tone": "Professional", "text": "..."},
    {"tone": "Confident", "text": "..."}
  ]
}`;
    } else if (section === "bullets") {
      prompt = `Generate 8 strong resume bullet points for a ${jobTitle || "professional"} role.

Each bullet should start with a powerful action verb, include specific quantified metrics or outcomes, and be under 120 characters. Make them realistic and impressive.

Return ONLY valid JSON with no markdown: {"bullets": ["bullet 1", "bullet 2", ...]}`;
    } else if (section === "skills") {
      prompt = `List the 10 most important and in-demand skills for a ${jobTitle || "professional"} role. Mix technical skills with relevant soft skills and tools. Return short, specific skill names (1-3 words each).

Return ONLY valid JSON with no markdown: {"skills": ["skill1", "skill2", ...]}`;
    } else if (section === "review") {
      const context = resumeData ? JSON.stringify(resumeData).slice(0, 2000) : currentContent || "";
      prompt = `You are an expert resume coach. Review this resume and provide specific, actionable feedback.

Resume: ${context}

Provide 5-7 specific improvement suggestions covering: missing keywords, weak bullet points, incomplete sections, and overall impact.

Return ONLY valid JSON:
{
  "feedback": [{"category": "...", "issue": "...", "suggestion": "..."}, ...],
  "overallAdvice": "..."
}`;
    } else {
      return res.status(400).json({ error: "Unknown section type" });
    }

    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1500,
      messages: [{ role: "user", content: prompt }],
    });

    const raw = message.content[0].text;
    const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    res.json(JSON.parse(cleaned));
  } catch (err) {
    console.error("suggest-content error:", err);
    res.status(500).json({ error: "Failed to generate suggestions." });
  }
});

app.post("/api/generate-cover-letter", async (req, res) => {
  const { resumeData, jobDescription, companyName, hiringManagerName, tone, section, existingContent } = req.body;

  if (!jobDescription) return res.status(400).json({ error: "jobDescription is required" });

  const pi = resumeData?.personalInfo || {};
  const name = pi.fullName || "the candidate";
  const skills = resumeData?.skills || {};
  const allSkills = [
    ...(skills.technical || []), ...(skills.soft || []), ...(skills.tools || []),
  ].slice(0, 8);
  const topExp = (resumeData?.experience || []).slice(0, 2).map(e =>
    `${e.jobTitle || ""}${e.company ? ` at ${e.company}` : ""}${e.bullets?.[0] ? `: ${e.bullets[0]}` : ""}`
  ).filter(Boolean).join("\n");

  const signoffByTone = { Enthusiastic: "With enthusiasm", Creative: "Warmly", Confident: "Best regards", Professional: "Sincerely" };
  const signoff = signoffByTone[tone] || "Sincerely";
  const recipient = hiringManagerName || "Hiring Manager";
  const company = companyName || "the company";

  try {
    let prompt;

    if (section) {
      // Regenerate a single section
      const sectionDesc = {
        greeting: `A salutation line. Example: "Dear ${recipient},"`,
        opening: "A 2-3 sentence opening paragraph expressing enthusiasm for the role and briefly mentioning the strongest qualification.",
        body: "A 3-5 sentence middle paragraph highlighting 2-3 specific achievements or experiences that match the job requirements.",
        closing: "A 1-2 sentence closing paragraph with a clear call to action expressing interest in an interview.",
        signoff: `Just the sign-off phrase (e.g. "${signoff}") — no name.`,
      };
      prompt = `Regenerate ONLY the "${section}" section of this cover letter. Keep tone: ${tone}.

Candidate: ${name}
Company: ${company}
Role context: ${jobDescription.slice(0, 600)}
${topExp ? `Experience:\n${topExp}` : ""}
Existing letter for context: ${JSON.stringify(existingContent || {})}

Section to write — ${section}: ${sectionDesc[section] || ""}

Return ONLY valid JSON with one key: { "${section}": "..." }`;
    } else {
      // Generate full cover letter
      prompt = `You are an expert cover letter writer. Write a compelling cover letter.

CANDIDATE:
Name: ${name}
${pi.email ? `Email: ${pi.email}` : ""}
${topExp ? `Experience:\n${topExp}` : ""}
${allSkills.length ? `Skills: ${allSkills.join(", ")}` : ""}
${resumeData?.summary ? `Summary: ${resumeData.summary.slice(0, 200)}` : ""}

JOB DESCRIPTION:
${jobDescription.slice(0, 1500)}

COMPANY: ${company}
HIRING MANAGER: ${recipient}
TONE: ${tone}

Write exactly these five sections:
- greeting: "Dear ${recipient}," (literal salutation)
- opening: 2-3 sentences — express enthusiasm + strongest qualification hook
- body: 3-5 sentences — cite 2-3 specific achievements or experiences matching the job
- closing: 1-2 sentences — call to action, request interview
- signoff: "${signoff}" (just the phrase, no name)

Return ONLY valid JSON, no markdown:
{
  "greeting": "Dear ${recipient},",
  "opening": "...",
  "body": "...",
  "closing": "...",
  "signoff": "${signoff}"
}`;
    }

    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1200,
      messages: [{ role: "user", content: prompt }],
    });

    const raw = message.content[0].text;
    const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    res.json(JSON.parse(cleaned));
  } catch (err) {
    console.error("generate-cover-letter error:", err);
    res.status(500).json({ error: "Failed to generate cover letter." });
  }
});

app.post("/api/tailor-resume", async (req, res) => {
  const { resumeData, jobDescription } = req.body;

  if (!jobDescription) return res.status(400).json({ error: "jobDescription is required" });

  try {
    const name = resumeData?.personalInfo?.fullName || "the candidate";
    const currentSummary = resumeData?.summary || "";
    const skills = [
      ...(resumeData?.skills?.technical || []),
      ...(resumeData?.skills?.tools || []),
      ...(resumeData?.skills?.soft || []),
    ].join(", ");
    const experience = (resumeData?.experience || []).map(e => ({
      id: e.id,
      jobTitle: e.jobTitle,
      company: e.company,
      description: (e.bullets || []).filter(Boolean).join("\n"),
    }));
    const prompt = `You are an expert ATS resume optimizer. Analyze this resume against the job description and suggest targeted improvements.

CANDIDATE: ${name}
CURRENT SUMMARY: ${currentSummary}
SKILLS: ${skills}
EXPERIENCE:
${experience.map(e => `[ID: ${e.id}] ${e.jobTitle} at ${e.company}:\n${e.description}`).join("\n\n")}

JOB DESCRIPTION:
${jobDescription.slice(0, 3000)}

Your task:
1. Calculate an ATS keyword match score (0-100)
2. Rewrite the summary to better target this specific job
3. Improve up to 6 bullet points from experience descriptions with job-relevant keywords
4. Suggest up to 8 skills to add that appear in the job description but are missing
5. List up to 5 missing qualifications from the job that the resume doesn't address

Return ONLY valid JSON with no markdown:
{
  "atsScore": 72,
  "summary": {
    "improved": "Rewritten summary targeting this specific role...",
    "reason": "Brief reason for the change"
  },
  "bullets": [
    {
      "jobId": "exact-experience-id-from-above",
      "original": "exact original bullet text",
      "improved": "improved version with job keywords",
      "reason": "why this was improved"
    }
  ],
  "skillAdditions": ["skill1", "skill2"],
  "missingQualifications": ["qualification 1", "qualification 2"]
}`;

    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      messages: [{ role: "user", content: prompt }],
    });

    const raw = message.content[0].text;
    const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    res.json(JSON.parse(cleaned));
  } catch (err) {
    console.error("tailor-resume error:", err);
    res.status(500).json({ error: "Failed to tailor resume. Please try again." });
  }
});

app.post("/api/improve-content", async (req, res) => {
  const { content, jobTitle, company } = req.body;

  if (!content || content.trim().length < 10) {
    return res.status(400).json({ error: "Content too short to improve." });
  }

  try {
    const prompt = `You are an expert resume writer. Improve these resume bullet points for a ${jobTitle || "professional"} role${company ? ` at ${company}` : ""}.

Original content:
${content}

Rewrite each bullet point to start with a strong action verb, include specific metrics, and focus on impact. Keep each bullet under 120 characters. Maintain the same number of bullet points.

Return the improved bullet points one per line starting with •. Return ONLY the improved bullets, nothing else.`;

    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 800,
      messages: [{ role: "user", content: prompt }],
    });

    res.json({ improved: message.content[0].text.trim() });
  } catch (err) {
    console.error("improve-content error:", err);
    res.status(500).json({ error: "Failed to improve content." });
  }
});

// Set up Vite middleware for development
const vite = await createViteServer({
  server: { middlewareMode: true },
});
app.use(vite.middlewares);

app.listen(3000, () => {
  console.log("");
  console.log("🚀 ResumeMatch is running at http://localhost:3000");
  console.log("");
});
