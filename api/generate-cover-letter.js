import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

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
}
