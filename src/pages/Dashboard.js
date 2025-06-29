// src/pages/Dashboard.js
import React, { useContext, useMemo, useState } from 'react';
import { RiskContext } from '../context/RiskContext';
import { Pie, Bar, Line } from 'react-chartjs-2';
import 'chart.js/auto';

export default function Dashboard() {
  const { risks } = useContext(RiskContext);

  // Appetite threshold state (1–100)
  const [appetite, setAppetite] = useState(50);

  // Summary metrics
  const total = risks.length;
  const highResidualCount = risks.filter(r =>
    (r.residualScore ?? r.score) >= 4  // you can bump this to 40 if you want “high” on 1–100
  ).length;
  const lastRiskTitle = risks[risks.length - 1]?.title || 'N/A';

  const avgInherent = total
    ? (risks.reduce((sum, r) => sum + r.inherentScore, 0) / total).toFixed(1)
    : '0.0';
  const avgResidual = total
    ? (risks.reduce((sum, r) => sum + (r.residualScore ?? r.score), 0) / total).toFixed(1)
    : '0.0';

  // Count how many inherent scores exceed appetite
  const aboveAppetiteCount = risks.filter(r => r.inherentScore >= appetite).length;

  // Pie & Bar data by category
  const categories = [...new Set(risks.map(r => r.category))];
  const pieData = {
    labels: categories,
    datasets: [{
      data: categories.map(
        c => risks.filter(r => r.category === c).length
      )
    }]
  };
  const barData = {
    labels: categories,
    datasets: [{
      label: 'Risk Scores by Category',        
      data: categories.map(c =>
        risks
          .filter(r => r.category === c)
          .reduce((sum, r) => sum + r.score, 0)
      )
    }]
  };

  // Risk Creation Trend: count by creation date
  const lineData = useMemo(() => {
    const counts = {};
    risks.forEach(r => {
      const day = new Date(r.dateCreated).toLocaleDateString();
      counts[day] = (counts[day] || 0) + 1;
    });
    const days = Object.keys(counts).sort(
      (a, b) => new Date(a) - new Date(b)
    );
    return {
      labels: days,
      datasets: [{
        label: 'Risks Created',
        data: days.map(d => counts[d]),
        fill: false,
        tension: 0.1,
      }]
    };
  }, [risks]);

  const lineOptions = {
    responsive: true,
    plugins: {
      title: { display: true, text: 'Risk Creation Trend' },
      legend: { position: 'bottom' }
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="bg-blue-100 p-4 rounded flex-1 min-w-[160px]">
          <h2 className="text-sm font-semibold">Total Risks</h2>
          <p className="text-2xl">{total}</p>
        </div>

        <div className="bg-green-100 p-4 rounded flex-1 min-w-[160px]">
          <h2 className="text-sm font-semibold">Avg. Inherent Score</h2>
          <p className="text-2xl">{avgInherent}</p>
        </div>

        <div className="bg-yellow-100 p-4 rounded flex-1 min-w-[160px]">
          <h2 className="text-sm font-semibold">Avg. Residual Score</h2>
          <p className="text-2xl">{avgResidual}</p>
        </div>

        <div className="bg-red-100 p-4 rounded flex-1 min-w-[160px]">
          <h2 className="text-sm font-semibold">
            High-Risk Count<br/>(Residual ≥4)
          </h2>
          <p className="text-2xl">{highResidualCount}</p>
        </div>

        <div className="bg-purple-100 p-4 rounded flex-1 min-w-[160px]">
          <h2 className="text-sm font-semibold">
            Above Appetite (≥{appetite})
          </h2>
          <p className="text-2xl">{aboveAppetiteCount}</p>
          <input
            type="range"
            min="1"
            max="100"
            value={appetite}
            onChange={e => setAppetite(+e.target.value)}
            className="w-full mt-2"
          />
        </div>

        <div className="bg-gray-100 p-4 rounded flex-1 min-w-[160px]">
          <h2 className="text-sm font-semibold">Last Risk Added</h2>
          <p className="text-2xl">{lastRiskTitle}</p>
        </div>
      </div>

      {/* Pie & Bar Charts */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="mb-2">Risks by Category</h3>
          <Pie data={pieData} />
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="mb-2">Risk Scores by Category</h3>
          <Bar data={barData} />
        </div>
      </div>

      {/* Trend Line Chart */}
      <div className="bg-white p-4 rounded shadow">
        <h3 className="mb-2">Risk Creation Trend</h3>
        <Line data={lineData} options={lineOptions} />
      </div>
    </div>
  );
}