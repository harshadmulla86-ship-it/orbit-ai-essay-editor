import React, { useState, useEffect } from "react";
import EditorPanel from "./components/EditorPanel";
import ResultPanel from "./components/ResultPanel";
import HistoryPanel from "./components/HistoryPanel";
import Navbar from "./components/Navbar";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_URL = import.meta.env.VITE_API_BASE || "http://127.0.0.1:5000";

export default function App() {
  const [essay, setEssay] = useState("");
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    setWordCount(essay.trim() ? essay.trim().split(/\s+/).length : 0);
  }, [essay]);

  useEffect(() => {
    // Apply dark mode to full page (html + body)
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  async function analyze() {
    if (!essay.trim()) {
      toast.warn("Please enter an essay");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: essay }),
      });
      const data = await res.json();
      if (data.ok) {
        setResult(data.result);
        toast.success("Analysis complete");
      } else {
        toast.error(data.error || "Analysis failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Server error");
    } finally {
      setLoading(false);
    }
  }

  async function save() {
    if (!result) {
      toast.warn("Analyze first");
      return;
    }
    try {
      const res = await fetch(`${API_URL}/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: essay, result }),
      });
      const data = await res.json();
      if (data.ok) {
        toast.success("Saved");
        setEssay("");
        setResult(null);
        loadHistory();
      } else {
        toast.error(data.error || "Save failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Save error");
    }
  }

  async function loadHistory() {
    try {
      const res = await fetch(`${API_URL}/history`);
      const data = await res.json();
      if (data.ok) setHistory(data.history);
    } catch (err) {
      console.warn("loadHistory failed", err);
    }
  }

  return (
    <div className={`${dark ? "dark" : ""} min-h-screen`} id="theme-root">
      <Navbar dark={dark} onToggle={() => setDark((d) => !d)} />
      <main className="max-w-6xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2 space-y-4">
          <EditorPanel
            essay={essay}
            setEssay={setEssay}
            onAnalyze={analyze}
            onSave={save}
            loading={loading}
            wordCount={wordCount}
          />
          <ResultPanel result={result} />
        </section>

        <aside className="space-y-4">
          <HistoryPanel history={history} />
        </aside>
      </main>

      <ToastContainer position="top-right" />
    </div>
  );
}
