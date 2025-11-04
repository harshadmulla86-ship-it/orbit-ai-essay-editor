import React, { useRef } from "react";

export default function EditorPanel({ essay, setEssay, onAnalyze, onSave, onReset, loading, wordCount }) {
  const ref = useRef(null);
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-lg font-semibold mb-2">Editor</h2>
      <textarea
        ref={ref}
        value={essay}
        onChange={(e) => setEssay(e.target.value)}
        placeholder="Paste/write your essay here..."
        className="w-full h-56 border rounded p-3 resize-none focus:outline-indigo-500"
      />
      <div className="flex justify-between items-center mt-2">
        <div className="text-sm text-gray-500">Words: {wordCount}</div>
        <div className="flex gap-2">
          <button onClick={onAnalyze} disabled={loading} className="bg-indigo-600 text-white px-3 py-1 rounded">
            {loading ? "Analyzing..." : "Analyze"}
          </button>
          <button onClick={onSave} className="bg-green-600 text-white px-3 py-1 rounded">Save</button>
          <button onClick={onReset} className="bg-red-500 text-white px-3 py-1 rounded">Reset</button>
        </div>
      </div>
    </div>
  );
}
