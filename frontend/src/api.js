const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:5000";

export async function analyzeText(text) {
  const res = await fetch(`${API_BASE}/analyze`, {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({ text })
  });
  if (!res.ok) {
    const err = await res.json().catch(()=>({error:'server-error'}));
    throw new Error(err.error || 'Analysis failed');
  }
  return res.json();
}

export async function saveAnalysis(text, result) {
  const res = await fetch(`${API_BASE}/save`, {
    method:"POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({ text, result })
  });
  return res.json();
}

export async function fetchHistory() {
  const res = await fetch(`${API_BASE}/history`);
  return res.json();
}
