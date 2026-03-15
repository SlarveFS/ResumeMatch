import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { text } = req.body;
  if (!text || text.trim().length < 20) {
    return res.status(400).json({ error: "No resume text provided." });
  }

  try {
    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 3000,
      messages: [
        {
          role: "user",
          content: `Extract all structured data from this resume and return ONLY valid JSON with this exact structure. No markdown, no backticks, no explanation — just the raw JSON object.

{
  "personalInfo": {
    "fullName": "",
    "email": "",
    "phone": "",
    "location": "",
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
      "bullets": [""]
    }
  ],
  "education": [
    {
      "degree": "",
      "school": "",
      "location": "",
      "graduationDate": "",
      "gpa": "",
      "honors": "",
      "coursework": ""
    }
  ],
  "skills": {
    "technical": [],
    "soft": [],
    "tools": [],
    "languages": [],
    "certifications": []
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

Extract as much data as possible. If a field isn't present, leave it as empty string or empty array. For dates, use the exact format shown in the resume. For skills, intelligently categorize them into technical, soft, tools, languages, and certifications.

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
}
