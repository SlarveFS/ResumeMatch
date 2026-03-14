import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";

// Disable worker thread — not available in serverless
pdfjsLib.GlobalWorkerOptions.workerSrc = "";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { data } = req.body;

  if (!data) {
    return res.status(400).json({ error: "No file data provided." });
  }

  try {
    const buffer = Buffer.from(data, "base64");
    const uint8Array = new Uint8Array(buffer);

    const loadingTask = pdfjsLib.getDocument({
      data: uint8Array,
      useWorkerFetch: false,
      isEvalSupported: false,
      useSystemFonts: true,
    });

    const doc = await loadingTask.promise;
    let text = "";

    for (let i = 1; i <= doc.numPages; i++) {
      const page = await doc.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items
        .map((item) => ("str" in item ? item.str : ""))
        .join(" ");
      text += pageText + "\n";
      page.cleanup();
    }

    await doc.destroy();
    res.json({ text: text.trim() });
  } catch (err) {
    console.error("PDF parse error:", err);
    res.status(500).json({ error: "Failed to extract text from PDF." });
  }
}
