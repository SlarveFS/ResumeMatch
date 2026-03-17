import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { section, jobTitle, currentContent, experienceSummary } = req.body;

  if (!section) return res.status(400).json({ error: "section is required" });

  try {
    let prompt = "";

    if (section === "summary") {
      const { resumeData } = req.body;
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
      const { resumeData } = req.body;
      const context = resumeData
        ? JSON.stringify(resumeData).slice(0, 2000)
        : currentContent || "";

      prompt = `You are an expert resume coach. Review this resume data and provide specific, actionable feedback.

Resume: ${context}

Provide 5-7 specific improvement suggestions. Focus on: missing keywords, weak bullet points, incomplete sections, formatting issues, and overall impact.

Return ONLY valid JSON:
{
  "feedback": [
    {"category": "Experience", "issue": "...", "suggestion": "..."},
    ...
  ],
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
    const cleaned = raw
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();
    const result = JSON.parse(cleaned);
    res.json(result);
  } catch (err) {
    console.error("suggest-content error:", err);
    res.status(500).json({ error: "Failed to generate suggestions." });
  }
}
