import React, { useState } from "react";

export default function Editor({ onAnalyze, initial="" }) {
  const [text, setText] = useState(initial);
  const [loading, setLoading] = useState(false);

  async function handleAnalyze() {
    if (!text.trim()) return alert("Paste your essay first.");
    setLoading(true);
    try {
      await onAnalyze(text);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <textarea
        value={text}
        onChange={(e)=>setText(e.target.value)}
        placeholder="Paste your essay here..."
        className="w-full h-56 p-3 border rounded focus:outline-indigo-500 resize-none"
      />
      <div className="flex gap-2 mt-3">
        <button onClick={handleAnalyze} className="px-4 py-2 bg-indigo-600 text-white rounded" disabled={loading}>
          {loading ? "Analyzing..." : "Analyze"}
        </button>
        <button onClick={()=>setText("")} className="px-4 py-2 border rounded">Clear</button>
      </div>
    </div>
  );
}
