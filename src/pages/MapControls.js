// src/pages/MapControls.js
import React, { useState, useContext, useEffect } from 'react';
import { RiskContext } from '../context/RiskContext';

export default function MapControls() {
  const { risks, updateRisk } = useContext(RiskContext);

  // Full list of External Standards & Regulations
  const frameworks = [
    'NIST CSF',
    'NIST SP 800-53',
    'ISO 27001',
    'ISO 27001 Annex A',
    'CIS Controls',
    'PCI DSS',
    'HIPAA',
    'GDPR',
    'CMMC',
    'COBIT',
    'CSA CCM'
  ];

  // 1) Which risk are we editing?
  const [riskIdx, setRiskIdx] = useState(0);
  // 2) Which frameworks are checked?
  const [selected, setSelected] = useState([]);

  // Whenever the selected risk changes (or the list updates), preload its mapping
  useEffect(() => {
    if (risks.length) {
      setSelected(risks[riskIdx].mappedControls || []);
    }
  }, [riskIdx, risks]);

  const handleToggle = fw =>
    setSelected(prev =>
      prev.includes(fw) ? prev.filter(x => x !== fw) : [...prev, fw]
    );

  const applyMapping = () => {
    const risk = risks[riskIdx];
    updateRisk(
      riskIdx,
      { mappedControls: selected },
      {
        user:    risk.owner || 'System',
        action:  'Map Controls',
        details: `Mapped→[${selected.join(', ')}] on risk “${risk.title}”`
      }
    );
    alert(`Controls updated for “${risk.title}”`);
  };

  if (!risks.length) {
    return <p>No risks to map. Please add one first.</p>;
  }

  return (
    <div>
      <h2 className="text-xl mb-4">Map Controls</h2>

      {/* 1) Select the risk */}
      <label className="block mb-4">
        Risk:
        <select
          value={riskIdx}
          onChange={e => setRiskIdx(Number(e.target.value))}
          className="ml-2 p-1 border rounded"
        >
          {risks.map((r, i) => (
            <option key={i} value={i}>
              {r.title}
            </option>
          ))}
        </select>
      </label>

      {/* 2) Framework checkboxes */}
      <div className="space-y-2 mb-4 max-h-64 overflow-auto">
        {frameworks.map(fw => (
          <label key={fw} className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={selected.includes(fw)}
              onChange={() => handleToggle(fw)}
            />
            <span>{fw}</span>
          </label>
        ))}
      </div>

      {/* 3) Save mapping & log it */}
      <button
        onClick={applyMapping}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Apply Mapping
      </button>
    </div>
  );
}
