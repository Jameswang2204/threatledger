// src/pages/ViewRisks.js
import React, { useContext, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { RiskContext } from '../context/RiskContext';

export default function ViewRisks() {
  const { risks, deleteRisk } = useContext(RiskContext);

  // Filter/Search state
  const [search, setSearch]               = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus]     = useState('');
  const [filterOwner, setFilterOwner]       = useState('');

  // Unique dropdown options
  const categories = useMemo(() => Array.from(new Set(risks.map(r => r.category))), [risks]);
  const statuses   = useMemo(() => Array.from(new Set(risks.map(r => r.status))),   [risks]);
  const owners     = useMemo(() => Array.from(new Set(risks.map(r => r.owner).filter(o => o))), [risks]);

  // Apply search + filters
  const filtered = useMemo(() => {
    const term = search.toLowerCase();
    return risks.filter(r => {
      const matchSearch   = r.title.toLowerCase().includes(term);
      const matchCategory = !filterCategory || r.category === filterCategory;
      const matchStatus   = !filterStatus   || r.status   === filterStatus;
      const matchOwner    = !filterOwner    || r.owner    === filterOwner;
      return matchSearch && matchCategory && matchStatus && matchOwner;
    });
  }, [risks, search, filterCategory, filterStatus, filterOwner]);

  // Color‐coding based on residualScore
  const getColor = score =>
    score >= 16 ? 'bg-red-200' :
    score >= 9  ? 'bg-yellow-200' :
                  'bg-green-200';

  return (
    <div>
      <h2 className="text-xl mb-4">View Risks</h2>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by title…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border p-2 rounded flex-1"
        />
        <select
          value={filterCategory}
          onChange={e => setFilterCategory(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">All Categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">All Statuses</option>
          {statuses.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select
          value={filterOwner}
          onChange={e => setFilterOwner(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">All Owners</option>
          {owners.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      </div>

      <table className="w-full table-auto border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="px-4 py-2 border">Owner</th>
            <th className="px-4 py-2 border">Status</th>
            <th className="px-4 py-2 border">Title</th>
            <th className="px-4 py-2 border">Category</th>
            <th className="px-4 py-2 border">Likelihood</th>
            <th className="px-4 py-2 border">Impact</th>
            <th className="px-4 py-2 border">Inherent Score</th>
            <th className="px-4 py-2 border">Residual Score</th>
            <th className="px-4 py-2 border">Mapped Controls</th>
            <th className="px-4 py-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((r, i) => {
            const inherent = r.inherentScore;
            const residual = r.residualScore ?? r.score;
            return (
              <tr key={i}>
                <td className="border px-4 py-2">{r.owner || '—'}</td>
                <td className="border px-4 py-2">{r.status}</td>
                <td className="border px-4 py-2">{r.title}</td>
                <td className="border px-4 py-2">{r.category}</td>
                <td className="border px-4 py-2">{r.likelihood}</td>
                <td className="border px-4 py-2">{r.impact}</td>
                <td className="border px-4 py-2">{inherent}</td>
                <td className={`border px-4 py-2 ${getColor(residual)}`}>{residual}</td>
                <td className="border px-4 py-2">
                  {r.mappedControls?.length > 0 ? (
                    <select
                      multiple
                      disabled
                      value={r.mappedControls}
                      className="w-full h-20 p-1 border rounded bg-gray-50 text-sm"
                    >
                      {r.mappedControls.map(fw => (
                        <option key={fw} value={fw}>{fw}</option>
                      ))}
                    </select>
                  ) : '—'}
                </td>
                <td className="border px-4 py-2 space-x-2">
                  <Link
                    to={`/risks/${i}`}
                    className="px-2 py-1 bg-indigo-500 text-white rounded"
                  >
                    Details
                  </Link>
                  <button
                    onClick={() => deleteRisk(i)}
                    className="px-2 py-1 bg-red-500 text-white rounded"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            );
          })}

          {filtered.length === 0 && (
            <tr>
              <td colSpan={10} className="text-center py-4">
                No risks match your filters.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}