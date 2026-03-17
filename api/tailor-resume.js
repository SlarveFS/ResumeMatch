import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { resumeData, jobDescription, section, existingContent } = req.body;

  if (!jobDescription) {
    return res.status(400).json({ error: "jobDescription is required" });
  }

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
1. Calculate an ATS keyword match score (0-100) based on how well the resume matches the job requirements
2. Rewrite the summary to better target this specific job
3. Improve up to 6 bullet points (individual lines from experience descriptions) that are most relevant to the job
4. Suggest up to 8 skills to add that appear in the job description but are missing from the resume
5. List up to 5 missing qualifications or requirements from the job that the resume doesn't address

For bullet improvements, identify specific lines from the experience descriptions and rewrite them to include job-relevant keywords and stronger impact.

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
    const cleaned = raw
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();
    const result = JSON.parse(cleaned);
    res.json(result);
  } catch (err) {
    console.error("tailor-resume error:", err);
    res.status(500).json({ error: "Failed to tailor resume. Please try again." });
  }
}
