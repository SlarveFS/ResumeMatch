import * as cheerio from "cheerio";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: "URL is required." });
  }

  try {
    const parsed = new URL(url);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return res.status(400).json({ error: "Please provide a valid URL." });
    }
  } catch {
    return res.status(400).json({ error: "Please provide a valid URL." });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "Mozilla/5.0 (compatible; ResumeMatch/1.0)" },
    });

    clearTimeout(timeout);

    if (response.status === 403) {
      return res.status(403).json({
        error: "This site blocked access. Try pasting the description instead.",
      });
    }
    if (!response.ok) {
      return res.status(502).json({
        error: `Could not fetch the page (status ${response.status}). Try pasting instead.`,
      });
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    $("script, style, nav, header, footer, aside").remove();

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
      if (el.length) { text = el.text(); break; }
    }

    if (!text.trim()) text = $("body").text();

    text = text
      .replace(/\t/g, " ")
      .replace(/[ \t]+/g, " ")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    res.json({ text });
  } catch (err) {
    clearTimeout(timeout);
    if (err.name === "AbortError") {
      return res.status(504).json({
        error: "Request timed out. Try pasting the description instead.",
      });
    }
    console.error("URL fetch error:", err);
    res.status(502).json({
      error: "Network error fetching the URL. Try pasting instead.",
    });
  }
}
