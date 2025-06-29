// src/pages/ChartsHeatmap.js
import React, { useContext, useState, useMemo } from 'react';
import { RiskContext } from '../context/RiskContext';
import { Pie, Bar } from 'react-chartjs-2';
import 'chart.js/auto';

export default function ChartsHeatmap() {
  const { risks } = useContext(RiskContext);

  // ➊ Thresholds for coloring cell counts
  const [highThresh, setHighThresh] = useState(5);
  const [medThresh, setMedThresh]   = useState(3);

  // Categories for pie/bar charts
  const categories = useMemo(
    () => [...new Set(risks.map(r => r.category))],
    [risks]
  );

  // Pie: # of risks in each category
  const pieData = {
    labels: categories,
    datasets: [{
      data: categories.map(c => risks.filter(r => r.category === c).length)
    }]
  };

  // Bar: sum of residualScores by category (1–100 scale)
  const barData = {
    labels: categories,
    datasets: [{
      label: 'Total Residual Score',
      data: categories.map(c =>
        risks
          .filter(r => r.category === c)
          .reduce((sum, r) => sum + (r.residualScore ?? r.score), 0)
      )
    }]
  };

  // ➋ Build a 10×10 heatmap: likelihood 1–10 vs impact 1–10
  const size = 10;
  const heatmap = useMemo(() => {
    const matrix = Array.from({ length: size }, () => Array(size).fill(0));
    risks.forEach(r => {
      const li = Math.min(Math.max(r.likelihood, 1), size) - 1;
      const im = Math.min(Math.max(r.impact,     1), size) - 1;
      matrix[li][im]++;
    });
    return matrix;
  }, [risks]);

  return (
    <div className="space-y-6">
      <h2 className="text-xl mb-4">Charts &amp; Heatmap</h2>

      {/* Pie & Bar */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="mb-2">Risks by Category</h3>
          <Pie data={pieData} />
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="mb-2">Residual Scores by Category</h3>
          <Bar data={barData} />
        </div>
      </div>

      {/* Threshold Controls */}
      <div className="bg-white p-4 rounded shadow mb-4 flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-sm">High Severity ≥</label>
          <input
            type="number"
            min="1" max={risks.length}
            value={highThresh}
            onChange={e => setHighThresh(+e.target.value)}
            className="mt-1 p-2 border rounded w-24"
          />
        </div>
        <div>
          <label className="block text-sm">Medium Severity ≥</label>
          <input
            type="number"
            min="1" max={risks.length}
            value={medThresh}
            onChange={e => setMedThresh(+e.target.value)}
            className="mt-1 p-2 border rounded w-24"
          />
        </div>
        <p className="text-sm text-gray-600">
          Cells with count ≥ high are <span className="bg-red-200 px-2">red</span>, ≥ medium are <span className="bg-yellow-200 px-2">yellow</span>, else <span className="bg-green-200 px-2">green</span>.
        </p>
      </div>

      {/* ➌ Heatmap Table */}
      <div>
        <h3 className="mb-2">Risk Heatmap (Likelihood × Impact)</h3>
        <table className="table-auto border-collapse border border-gray-300">
          <thead>
            <tr>
              <th className="px-2"></th>
              {[...Array(size)].map((_, i) => (
                <th key={i} className="border px-2 py-1 text-center">{i+1}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {heatmap.map((row, li) => (
              <tr key={li}>
                <th className="border px-2 py-1 text-center">{li+1}</th>
                {row.map((count, im) => {
                  let bg = 'bg-green-200';
                  if (count >= highThresh) bg = 'bg-red-200';
                  else if (count >= medThresh) bg = 'bg-yellow-200';
                  return (
                    <td
                      key={im}
                      className={`${bg} border px-4 py-2 text-center`}
                    >
                      {count}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}