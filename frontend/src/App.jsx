import React, { useState } from "react";
import { checkPdfWithRules } from "./api";

export default function App() {
  const [file, setFile] = useState(null);
  const [rules, setRules] = useState(["The document must mention at least one date.", "", ""]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState(null);
  const [error, setError] = useState("");

  const onFileChange = (e) => {
    setFile(e.target.files?.[0] ?? null);
  };

  const onRuleChange = (idx, val) => {
    const copy = [...rules];
    copy[idx] = val;
    setRules(copy);
  };

  const handleCheck = async () => {
    setError("");
    setResults(null);

    if (!file) {
      setError("Please select a PDF file.");
      return;
    }

    const filteredRules = rules.filter(r => r && r.trim().length > 0);
    if (filteredRules.length === 0) {
      setError("Please enter at least one rule.");
      return;
    }

    try {
      setLoading(true);
      setProgress(0);
      const data = await checkPdfWithRules(file, filteredRules, (p) => setProgress(p));
      // expected { summary, results }
      setResults(data);
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.error || err.message || "Request failed");
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  return (
    <div className="app">
      <div className="card">
        <h1>NIYAMR AI — PDF Rule Checker</h1>

        <label className="label">Upload PDF</label>
        <input type="file" accept=".pdf" onChange={onFileChange} />

        <div className="rules">
          <h3>Enter up to 3 rules</h3>
          { [0,1,2].map(i => (
            <input
              key={i}
              className="rule-input"
              placeholder={`Rule ${i+1}`}
              value={rules[i] || ""}
              onChange={(e) => onRuleChange(i, e.target.value)}
            />
          )) }
        </div>

        <div className="actions">
          <button onClick={handleCheck} disabled={loading}>Check Document</button>
          {loading && <div className="progress">Uploading... {progress}%</div>}
        </div>

        {error && <div className="error">{error}</div>}

        {results && (
          <div className="results">
            <h3>Summary: {results.summary?.passed ?? 0} / {results.summary?.total ?? (results.results?.length ?? 0)} passed</h3>

            <table>
              <thead>
                <tr>
                  <th>Rule</th>
                  <th>Status</th>
                  <th>Evidence</th>
                  <th>Reasoning</th>
                  <th>Confidence</th>
                </tr>
              </thead>
              <tbody>
                { (results.results || []).map((r, idx) => (
                  <tr key={idx}>
                    <td className="mono">{r.rule}</td>
                    <td>{r.status}</td>
                    <td className="evidence">{r.evidence}</td>
                    <td>{r.reasoning}</td>
                    <td>{r.confidence}</td>
                  </tr>
                )) }
              </tbody>
            </table>
          </div>
        )}

        <div className="note">
          Backend must be running at <code>http://localhost:5000</code>.
        </div>
      </div>
    </div>
  );
}
