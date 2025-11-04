import React from "react";

export default function FeedbackPanel({ result, onSave }) {
  if (!result) {
    return <div className="p-4 text-gray-500">No analysis yet.</div>;
  }
  const r = result;
  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h3 className="text-xl font-semibold text-indigo-700">Analysis Result</h3>
      <ul className="mt-2 space-y-1 text-gray-700">
        <li>Words: {r.word_count}</li>
        <li>Clarity: {r.clarity_score}</li>
        <li>Tone: {r.tone}</li>
        <li>Grammar issues (est): {r.grammar_issues}</li>
      </ul>
      {r.suggestions && r.suggestions.length > 0 && (
        <>
          <h4 className="mt-3 font-semibold">Suggestions</h4>
          <ul className="list-disc pl-5 text-gray-700">
            {r.suggestions.map((s,i)=><li key={i}>{s}</li>)}
          </ul>
        </>
      )}
      <div className="mt-4">
        <button onClick={onSave} className="px-4 py-2 bg-green-600 text-white rounded">Save Analysis</button>
      </div>
    </div>
  );
}
