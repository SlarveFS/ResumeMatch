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
