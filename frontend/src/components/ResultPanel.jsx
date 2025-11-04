import React from "react";
import { motion } from "framer-motion";

export default function ResultPanel({ result, onExport }) {
  if (!result) {
    return <div className="bg-white rounded-lg shadow p-4 text-gray-500">No analysis yet.</div>;
  }
  const r = result;
  return (
    <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} className="bg-white rounded-lg shadow p-4">
      <h3 className="text-xl font-semibold text-indigo-700">Analysis</h3>
      <div className="mt-3 space-y-2">
        <div><strong>Words:</strong> {r.word_count}</div>
        <div><strong>Clarity:</strong> {r.clarity_score}</div>
        <div><strong>Grammar issues (est):</strong> {r.grammar_issues}</div>
        <div><strong>Tone:</strong> {r.tone}</div>
        <div><strong>Readability (Flesch):</strong> {r.readability}</div>
        {r.suggestions && r.suggestions.length > 0 && (
          <div>
            <strong>Suggestions:</strong>
            <ul className="list-disc ml-6">
              {r.suggestions.map((s,i)=> <li key={i}>{s}</li>)}
            </ul>
          </div>
        )}
      </div>
      <div className="mt-3 flex gap-2">
        <button onClick={onExport} className="bg-gray-800 text-white px-3 py-1 rounded">Export PDF</button>
      </div>
    </motion.div>
  );
}
