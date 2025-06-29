// src/pages/AddRisk.js
import React, { useState, useContext } from 'react';
import { RiskContext }       from '../context/RiskContext';
import { useMitigations }    from '../hooks/useMitigations';

export default function AddRisk() {
  const { addRisk } = useContext(RiskContext);

  // --- form state ---
  const [owner, setOwner]           = useState('');
  const [status, setStatus]         = useState('Open');
  const [title, setTitle]           = useState('');
  const [desc, setDesc]             = useState('');
  const [likelihood, setLikelihood] = useState(1);
  const [impact, setImpact]         = useState(1);
  const [category, setCategory]     = useState('Network');
  const [notes, setNotes]           = useState('');
  const [selectedControls, setSelectedControls] = useState([]);

  // AI-powered mitigation suggestions
  const { suggestions, loading } = useMitigations(title, category);

  // All the frameworks / regulations
  const frameworks = [
    'NIST CSF',
    'ISO 27001',
    'CIS Controls',
    'PCI DSS',
    'HIPAA',
    'GDPR',
    'CMMC',
    'COBIT',
    'CSA CCM'
  ];

  // Score = likelihood × impact (1–100)
  const score = likelihood * impact;

  // Helper to build 1–10 options
  const scaleOptions = Array.from({ length: 10 }, (_, i) => i + 1);

  const handleSubmit = e => {
    e.preventDefault();
    addRisk({
      owner,
      status,
      title,
      desc,
      likelihood,
      impact,
      category,
      notes,
      mappedControls: selectedControls,
      score,
    });
    // Reset form
    setOwner('');
    setStatus('Open');
    setTitle('');
    setDesc('');
    setLikelihood(1);
    setImpact(1);
    setCategory('Network');
    setNotes('');
    setSelectedControls([]);
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-6">Add New Risk</h2>
      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Owner */}
        <div>
          <label className="block mb-1 font-medium">Owner</label>
          <input
            type="text"
            value={owner}
            onChange={e => setOwner(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="e.g. Alice Smith"
          />
        </div>

        {/* Status */}
        <div>
          <label className="block mb-1 font-medium">Status</label>
          <select
            value={status}
            onChange={e => setStatus(e.target.value)}
            className="w-full p-2 border rounded"
          >
            {['Open','In Progress','Mitigated','Closed'].map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Title */}
        <div>
          <label className="block mb-1 font-medium">Risk Title</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block mb-1 font-medium">Description</label>
          <textarea
            value={desc}
            onChange={e => setDesc(e.target.value)}
            className="w-full p-2 border rounded"
            rows={3}
            required
          />
        </div>

        {/* Likelihood / Impact / Category */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block mb-1 font-medium">Likelihood (1–10)</label>
            <select
              value={likelihood}
              onChange={e => setLikelihood(+e.target.value)}
              className="w-full p-2 border rounded"
            >
              {scaleOptions.map(n => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block mb-1 font-medium">Impact (1–10)</label>
            <select
              value={impact}
              onChange={e => setImpact(+e.target.value)}
              className="w-full p-2 border rounded"
            >
              {scaleOptions.map(n => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block mb-1 font-medium">Category</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full p-2 border rounded"
            >
              {['Network','Compliance','Physical','Insider'].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        {/* AI Suggestions */}
        {loading ? (
          <p className="text-gray-500">Loading suggested mitigations…</p>
        ) : suggestions.length > 0 ? (
          <fieldset className="p-4 border rounded bg-gray-50">
            <legend className="font-semibold">Suggested Mitigations</legend>
            <ul className="list-disc ml-6 space-y-1">
              {suggestions.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </fieldset>
        ) : null}

        {/* Notes */}
        <div>
          <label className="block mb-1 font-medium">Notes</label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            className="w-full p-2 border rounded"
            rows={2}
          />
        </div>

        {/* Score */}
        <div>
          <p className="font-medium">
            Risk Score:{' '}
            <span className="text-xl">{score}</span>{' '}
            <span className="text-sm text-gray-500">(1–100)</span>
          </p>
        </div>

        {/* Map Controls (dropdown with checkboxes) */}
        <div>
          <label className="block mb-1 font-medium">Map Controls</label>
          <details className="border rounded">
            <summary className="px-3 py-2 cursor-pointer select-none">
              {selectedControls.length > 0
                ? `${selectedControls.length} selected…`
                : 'Select controls…'}
            </summary>
            <div className="p-3 space-y-2 max-h-60 overflow-auto">
              {frameworks.map(fw => (
                <label
                  key={fw}
                  className="flex items-center space-x-2"
                >
                  <input
                    type="checkbox"
                    checked={selectedControls.includes(fw)}
                    onChange={() => {
                      setSelectedControls(prev =>
                        prev.includes(fw)
                          ? prev.filter(x => x !== fw)
                          : [...prev, fw]
                      );
                    }}
                  />
                  <span>{fw}</span>
                </label>
              ))}
            </div>
          </details>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded"
        >
          Submit
        </button>
      </form>
    </div>
  );
}