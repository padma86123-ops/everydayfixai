import { useState } from "react";

const SAMPLE_PROBLEMS = [
  "Coffee stain",
  "Mud on shoes",
  "Wax on a table"
];

function App() {
  const [problem, setProblem] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function findSolution(textOverride) {
    const text = (textOverride ?? problem).trim();

    if (!text) {
      setError("Please type a household problem, or tap a sample button.");
      setResult(null);
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("/api/solve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problem: text })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Something went wrong. Try again.");
        return;
      }

      setResult(data);
    } catch (err) {
      setError(
        "Could not reach the backend. Make sure the Node.js server is running on port 5000."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleSampleClick(sample) {
    setProblem(sample);
    findSolution(sample);
  }

  function handleSubmit(event) {
    event.preventDefault();
    findSolution();
  }

  return (
    <div className="page">
      <header className="hero">
        <p className="brand">EverydayFix AI</p>
        <h1>Everyday problems. Safer solutions.</h1>
        <p className="subtitle">
          Type a small household mess and get simple steps plus safety warnings.
          This demo uses labelled sample answers, not a live AI model.
        </p>
      </header>

      <main className="card">
        <form onSubmit={handleSubmit}>
          <label htmlFor="problem">Household problem</label>
          <textarea
            id="problem"
            rows="3"
            placeholder="Example: coffee stain on a shirt"
            value={problem}
            onChange={(event) => setProblem(event.target.value)}
          />

          <p className="hint">Try a sample:</p>
          <div className="samples">
            {SAMPLE_PROBLEMS.map((sample) => (
              <button
                type="button"
                key={sample}
                className="sample-btn"
                onClick={() => handleSampleClick(sample)}
              >
                {sample}
              </button>
            ))}
          </div>

          <button type="submit" className="primary" disabled={loading}>
            {loading ? "Finding a solution…" : "Find a Solution"}
          </button>
        </form>

        {error ? <p className="error" role="alert">{error}</p> : null}

        {result ? (
          <section className="results" aria-live="polite">
            <span className="badge">{result.sourceLabel}</span>
            <h2>{result.title}</h2>
            <p className="asked">You asked: {result.problem}</p>

            <h3>Instructions</h3>
            <ol>
              {result.steps.map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ol>

            <div className="warnings">
              <h3>Safety warnings</h3>
              <ul>
                {result.warnings.map((warning, index) => (
                  <li key={index}>{warning}</li>
                ))}
              </ul>
            </div>
          </section>
        ) : null}
      </main>

      <footer>
        Built as a beginner-friendly hackathon demo. Sample answers only.
      </footer>
    </div>
  );
}

export default App;
