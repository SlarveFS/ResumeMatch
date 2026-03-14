import { useState } from "react";
import Header from "./components/Header";
import InputPanel from "./components/InputPanel";
import Results from "./components/Results";
import AnalysisHistory from "./components/AnalysisHistory";
import "./App.css";

const STORAGE_KEY = "resumematch_history";
const MAX_HISTORY = 20;

function saveToHistory(entry) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const history = raw ? JSON.parse(raw) : [];
    history.unshift(entry);
    if (history.length > MAX_HISTORY) history.splice(MAX_HISTORY);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch {
    // localStorage unavailable — silently skip
  }
}

function App() {
  const [jobDescription, setJobDescription] = useState("");
  const [resume, setResume] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [historyKey, setHistoryKey] = useState(0);

  const handleAnalyze = async () => {
    if (jobDescription.trim().length < 50) {
      setError("Please paste a job description (at least 50 characters).");
      return;
    }
    if (resume.trim().length < 50) {
      setError("Please paste your resume (at least 50 characters).");
      return;
    }

    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobDescription, resume }),
      });

      if (!response.ok) {
        throw new Error("Analysis failed. Please try again.");
      }

      const data = await response.json();
      setResults(data);

      // Save to history
      saveToHistory({
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        jobTitle: jobDescription.slice(0, 60).trim(),
        matchScore: data.matchScore,
        jobDescriptionSnippet: jobDescription.slice(0, 100),
        resumeSnippet: resume.slice(0, 100),
        fullResults: data,
      });
      setHistoryKey((k) => k + 1);

      // Smooth scroll to results
      setTimeout(() => {
        document.getElementById("results-section")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResults(null);
    setJobDescription("");
    setResume("");
    setError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="app">
      <Header />
      <main className="main-content">
        <InputPanel
          jobDescription={jobDescription}
          setJobDescription={setJobDescription}
          resume={resume}
          setResume={setResume}
          onAnalyze={handleAnalyze}
          loading={loading}
        />
        {error && <div className="error-message">{error}</div>}
        {results && (
          <div id="results-section">
            <Results data={results} onReset={handleReset} />
          </div>
        )}
        <AnalysisHistory refreshKey={historyKey} />
      </main>
      <footer className="footer">
        <p>
          Built by <strong>Slarve Benoit</strong> •{" "}
          <a
            href="https://github.com/SlarveFS/ResumeMatch"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
        </p>
      </footer>
    </div>
  );
}

export default App;
