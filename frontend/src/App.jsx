import React, { useState, useEffect, useRef } from "react";
import ReactQuill from "react-quill";
import "quill/dist/quill.snow.css";
import "./App.css";

export default function App() {
  const [value, setValue] = useState(""); // HTML content
  const [analysis, setAnalysis] = useState(null);
  const [rephrased, setRephrased] = useState(null);
  const [grammarInfo, setGrammarInfo] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dark, setDark] = useState(localStorage.getItem("theme") === "dark");
  const quillRef = useRef(null);

  // load draft
  useEffect(() => {
    const saved = localStorage.getItem("draft_html");
    if (saved) setValue(saved);
  }, []);

  // autosave (HTML)
  useEffect(() => {
    const t = setInterval(() => {
      localStorage.setItem("draft_html", value);
    }, 5000);
    return () => clearInterval(t);
  }, [value]);

  // theme
  useEffect(() => {
    if (dark) document.body.classList.add("dark");
    else document.body.classList.remove("dark");
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  const plainText = (html) => {
    // minimal HTML -> plain text
    const tmp = document.createElement("div");
    tmp.innerHTML = html || "";
    return tmp.textContent || tmp.innerText || "";
  };

  const wordCount = (plainText(value) || "").trim() ? plainText(value).trim().split(/\s+/).length : 0;
  const charCount = (plainText(value) || "").length;

  // API helpers
  async function postJSON(path, body) {
    const res = await fetch(`/api/${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    return res.json();
  }

  // Analyze
  const handleAnalyze = async () => {
    const text = plainText(value);
    if (!text.trim()) {
      alert("Write something to analyze.");
      return;
    }
    setLoading(true);
    try {
      const data = await postJSON("analyze", { text });
      setAnalysis(data);
    } catch (err) {
      console.error("analyze err", err);
      alert("Analyze failed.");
    } finally {
      setLoading(false);
    }
  };

  // Rephrase
  const handleRephrase = async () => {
    const text = plainText(value);
    if (!text.trim()) {
      alert("Enter text to rephrase.");
      return;
    }
    setLoading(true);
    try {
      const data = await postJSON("rephrase", { text });
      setRephrased(data.rephrased || null);
    } catch (err) {
      console.error("rephrase err", err);
      alert("Rephrase failed.");
    } finally {
      setLoading(false);
    }
  };

  // Grammar fix — apply corrected text back into editor HTML (preserve as plain paragraph)
  const handleGrammar = async () => {
    const text = plainText(value);
    if (!text.trim()) {
      alert("Enter text for grammar correction.");
      return;
    }
    setLoading(true);
    try {
      const data = await postJSON("grammar", { text });
      // set corrected plain text into the editor as plain paragraph (safe)
      const correctedPlain = data.corrected || text;
      setValue(`<p>${correctedPlain.replace(/\n/g, "<br/>")}</p>`);
      setGrammarInfo(data);
      alert("Grammar corrected and applied into editor.");
    } catch (err) {
      console.error("grammar err", err);
      alert("Grammar fix failed.");
    } finally {
      setLoading(false);
    }
  };

  // Summarize
  const handleSummarize = async () => {
    const text = plainText(value);
    if (!text.trim()) { alert("Enter text to summarize."); return; }
    setLoading(true);
    try {
      const data = await postJSON("summarize", { text });
      setSummary(data.summary || "");
    } catch (err) {
      console.error("summarize err", err);
      alert("Summarize failed.");
    } finally { setLoading(false); }
  };

  // Tone transform
  const handleTone = async (tone) => {
    const text = plainText(value);
    if (!text.trim()) { alert("Enter text to transform."); return; }
    setLoading(true);
    try {
      const data = await postJSON("transform", { text, tone });
      const transformed = data.transformed || text;
      setValue(`<p>${transformed.replace(/\n/g, "<br/>")}</p>`);
      alert(`Tone transformed to ${tone}.`);
    } catch (err) {
      console.error("transform err", err);
      alert("Tone transform failed.");
    } finally { setLoading(false); }
  };

  // Download as txt
  const handleDownload = () => {
    const plain = plainText(value);
    const blob = new Blob([plain], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "essay.txt";
    a.click();
  };

  // Copy rephrased option
  const copyTextToClipboard = async (txt) => {
    try {
      await navigator.clipboard.writeText(txt);
      alert("Copied to clipboard.");
    } catch {
      alert("Copy failed.");
    }
  };

  // Quill toolbar modules
  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link", "clean"],
      [{ align: [] }]
    ]
  };

  return (
    <div className="app-wrap">
      <header className="topbar">
        <div className="brand">🪐 Orbit AI Essay Editor</div>
        <div className="controls">
          <span className="counter">📝 {wordCount} words • 🔡 {charCount} chars</span>
          <button className="theme-btn" onClick={() => setDark(!dark)}>{dark ? "☀️ Light" : "🌙 Dark"}</button>
        </div>
      </header>

      <main className="main">
        <section className="editor-section">
          <ReactQuill
            ref={quillRef}
            value={value}
            onChange={setValue}
            modules={modules}
            theme="snow"
            placeholder="Start writing your essay..."
            className="editor"
          />

          <div className="action-row">
            <button onClick={handleAnalyze}>🔍 Analyze</button>
            <button onClick={handleRephrase}>✨ Rephrase</button>
            <button onClick={handleGrammar}>🧩 Grammar Fix</button>
            <button onClick={handleSummarize}>📝 Summarize</button>
            <button onClick={() => handleTone("formal")}>Formal</button>
            <button onClick={() => handleTone("casual")}>Casual</button>
            <button onClick={() => handleTone("concise")}>Concise</button>
            <button onClick={handleDownload}>📥 Download</button>
          </div>

          {loading && <div className="loading">🤖 AI is thinking...</div>}
        </section>

        <aside className="sidebar">
          {analysis && (
            <div className="card">
              <h3>AI Feedback</h3>
              <p>Clarity: {analysis.clarity}%</p>
              <p>Impact: {analysis.impact}%</p>
              <p>Readability: {analysis.readability}%</p>
              <p>Tone: {analysis.tone}</p>
              <ul>
                {analysis.suggestions.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
          )}

          {rephrased && (
            <div className="card">
              <h3>Rephrased Versions</h3>
              {Object.entries(rephrased).map(([k, txt]) => (
                <div key={k} className="rephrase-box">
                  <strong>{k}</strong>
                  <p>{txt}</p>
                  <div>
                    <button onClick={() => copyTextToClipboard(txt)}>📋 Copy</button>
                    <button onClick={() => setValue(`<p>${txt.replace(/\n/g,"<br/>")}</p>`)}>Use</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {grammarInfo && (
            <div className="card">
              <h3>Grammar</h3>
              <p>{grammarInfo.message}</p>
            </div>
          )}

          {summary && (
            <div className="card">
              <h3>Summary</h3>
              <p>{summary}</p>
            </div>
          )}
        </aside>
      </main>

      <footer className="footer">Orbit AI — Essay Editor (Enhanced) • Demo</footer>
    </div>
  );
}
