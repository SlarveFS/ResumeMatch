import { useState, useRef } from "react";
import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

function InputPanel({
  jobDescription,
  setJobDescription,
  resume,
  setResume,
  onAnalyze,
  loading,
}) {
  const [dragOver, setDragOver] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [urlLoading, setUrlLoading] = useState(false);
  const [urlError, setUrlError] = useState("");
  const fileInputRef = useRef(null);

  const handlePdfFile = async (file) => {
    if (!file || file.type !== "application/pdf") return;
    setPdfLoading(true);
    setUploadedFile(file);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const doc = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
      let text = "";
      for (let i = 1; i <= doc.numPages; i++) {
        const page = await doc.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map((item) => item.str).join(" ") + "\n";
        page.cleanup();
      }
      await doc.destroy();
      setResume(text.trim());
    } catch (err) {
      setUploadedFile(null);
      setResume("");
      alert(err.message || "Failed to extract PDF text.");
    } finally {
      setPdfLoading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    handlePdfFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  const handleZoneClick = () => fileInputRef.current?.click();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    handlePdfFile(file);
    e.target.value = "";
  };

  const handleClearFile = () => {
    setUploadedFile(null);
    setResume("");
  };

  const handleFetchUrl = async () => {
    if (!urlInput.trim()) return;
    setUrlLoading(true);
    setUrlError("");
    try {
      const res = await fetch("/api/extract-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: urlInput.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Extraction failed.");
      setJobDescription(data.text);
    } catch {
      setUrlError("Couldn't extract from this URL. Try pasting the description instead.");
    } finally {
      setUrlLoading(false);
    }
  };

  const handleUrlKeyDown = (e) => {
    if (e.key === "Enter") handleFetchUrl();
  };

  return (
    <div className="input-panel">
      {/* Job Description section */}
      <div className="input-group">
        <label htmlFor="job-desc">
          <span className="label-icon">📋</span> Job Description
        </label>

        {/* URL input row */}
        <div className="url-input-row">
          <input
            type="url"
            placeholder="Paste a job posting URL…"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={handleUrlKeyDown}
            className="url-input"
          />
          <button
            className="fetch-btn"
            onClick={handleFetchUrl}
            disabled={urlLoading || !urlInput.trim()}
          >
            {urlLoading ? (
              <span className="loading-text">
                <span className="spinner spinner-sm"></span>
              </span>
            ) : (
              "Fetch"
            )}
          </button>
        </div>
        {urlError && <p className="url-error">{urlError}</p>}

        <div className="or-divider"><span>OR</span></div>

        <textarea
          id="job-desc"
          placeholder="Paste the full job description here..."
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          rows={10}
        />
        <span className="char-count">{jobDescription.length} characters</span>
      </div>

      {/* Resume section */}
      <div className="input-group">
        <label htmlFor="resume">
          <span className="label-icon">📄</span> Your Resume
        </label>

        {/* Upload zone */}
        <div
          className={`upload-zone${dragOver ? " drag-over" : ""}${uploadedFile ? " has-file" : ""}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={!uploadedFile ? handleZoneClick : undefined}
          style={{ cursor: uploadedFile ? "default" : "pointer" }}
        >
          {pdfLoading ? (
            <span className="loading-text">
              <span className="spinner spinner-dark"></span> Extracting text…
            </span>
          ) : uploadedFile ? (
            <div className="file-indicator">
              <span className="file-check">✅</span>
              <span className="file-name">{uploadedFile.name}</span>
              <button
                className="file-remove-btn"
                onClick={(e) => { e.stopPropagation(); handleClearFile(); }}
                title="Remove file"
              >
                ✕
              </button>
            </div>
          ) : (
            <div className="upload-zone-inner">
              <span className="upload-icon">☁</span>
              <span className="upload-text">Drop your resume PDF here or click to upload</span>
            </div>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          style={{ display: "none" }}
          onChange={handleFileChange}
        />

        <div className="or-divider"><span>OR</span></div>

        <textarea
          id="resume"
          placeholder="Paste your resume text here..."
          value={resume}
          onChange={(e) => setResume(e.target.value)}
          rows={10}
        />
        <span className="char-count">{resume.length} characters</span>
      </div>

      <button
        className="analyze-btn"
        onClick={onAnalyze}
        disabled={loading}
      >
        {loading ? (
          <span className="loading-text">
            <span className="spinner"></span> Analyzing...
          </span>
        ) : (
          "Analyze My Resume"
        )}
      </button>
    </div>
  );
}

export default InputPanel;
