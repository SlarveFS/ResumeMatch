import { useState } from "react";
import Header from "./components/Header";
import InputPanel from "./components/InputPanel";
import Results from "./components/Results";
import "./App.css";

function App() {
  const [jobDescription, setJobDescription] = useState("");
  const [resume, setResume] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
      const response = await fetch("http://localhost:3000/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobDescription, resume }),
      });

      if (!response.ok) {
        throw new Error("Analysis failed. Please try again.");
      }

      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
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
        {results && <Results data={results} />}
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
