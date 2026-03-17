import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { content, jobTitle, company } = req.body;

  if (!content || content.trim().length < 10) {
    return res.status(400).json({ error: "Content too short to improve." });
  }

  try {
    const prompt = `You are an expert resume writer. Improve these resume bullet points for a ${jobTitle || "professional"} role${company ? ` at ${company}` : ""}.

Original content:
${content}

Rewrite each bullet point to:
1. Start with a strong action verb
2. Include specific metrics or outcomes where plausible
3. Focus on impact and achievements, not just duties
4. Keep each bullet concise (under 120 characters)
5. Maintain the same number of bullet points

Return the improved bullet points in the same format (one per line, starting with •). Return ONLY the improved bullet points, nothing else.`;

    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 800,
      messages: [{ role: "user", content: prompt }],
    });

    const improved = message.content[0].text.trim();
    res.json({ improved });
  } catch (err) {
    console.error("improve-content error:", err);
    res.status(500).json({ error: "Failed to improve content." });
  }
}
