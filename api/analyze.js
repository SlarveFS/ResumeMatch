import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

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
    res.json(JSON.parse(cleaned));
  } catch (err) {
    console.error("API Error:", err);
    res.status(500).json({ error: "Analysis failed. Please try again." });
  }
}
