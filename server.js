import "dotenv/config";
import Anthropic from "@anthropic-ai/sdk";
import express from "express";
import cors from "cors";
import { createServer as createViteServer } from "vite";

const app = express();
app.use(cors());
app.use(express.json());

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
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
