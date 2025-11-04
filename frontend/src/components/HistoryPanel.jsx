import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function HistoryPanel({ history }) {
  if (!history || history.length === 0) return <div className="bg-white rounded-lg shadow p-4">No saved essays yet.</div>;

  const chartData = history.slice(0, 10).map((h, i) => ({
    name: `#${h.id}`,
    clarity: h.result ? h.result.clarity_score : 0,
    readability: h.result ? h.result.readability : 0
  })).reverse(); // show oldest->newest

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow p-4">
        <h4 className="font-semibold">Saved Essays</h4>
        <ul className="mt-2 space-y-2">
          {history.map(h => (
            <li key={h.id} className="border p-2 rounded bg-gray-50">
              <div className="text-xs text-gray-400">{h.created_at}</div>
              <div className="text-sm text-gray-700">Score: {h.result ? h.result.clarity_score : '-'}</div>
              <div className="text-xs mt-1 text-gray-600">{h.text.slice(0,200)}{h.text.length>200 ? '...' : ''}</div>
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <h4 className="font-semibold mb-2">Recent Performance</h4>
        <div style={{width:'100%', height:200}}>
          <ResponsiveContainer>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="clarity" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
