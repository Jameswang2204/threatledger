// src/pages/RiskDetail.js
import React, { useState, useContext, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { RiskContext } from '../context/RiskContext';

export default function RiskDetail() {
  const { id } = useParams();
  const idx = parseInt(id, 10);
  const { risks, updateRisk, makeId, linkTicket } = useContext(RiskContext);

  // If no risk at this index, show a message
  const risk = risks[idx];
  if (!risk) {
    return (
      <div className="p-6">
        <h2 className="text-xl">Risk not found</h2>
        <p>Please go back and select a valid risk.</p>
      </div>
    );
  }

  // --- Local state ---
  const [owner, setOwner]                       = useState(risk.owner);
  const [status, setStatus]                     = useState(risk.status);
  const [selectedControls, setSelectedControls] = useState(risk.mappedControls || []);
  const [likelihood, setLikelihood]             = useState(risk.likelihood);
  const [impact, setImpact]                     = useState(risk.impact);
  const [by, setBy]                             = useState('');
  const [notes, setNotes]                       = useState('');
  const [treatDesc, setTreatDesc]               = useState('');
  const [treatDue, setTreatDue]                 = useState('');

  // Sync form when risk changes
  useEffect(() => {
    setOwner(risk.owner);
    setStatus(risk.status);
    setSelectedControls(risk.mappedControls || []);
    setLikelihood(risk.likelihood);
    setImpact(risk.impact);
  }, [risk]);

  // 1–10 options helper
  const scaleOptions = Array.from({ length: 10 }, (_, i) => i + 1);

  // Residual score & color
  const residualScore = risk.residualScore ?? risk.inherentScore;
  const colorClass =
    residualScore >= 80 ? 'bg-red-200' :
    residualScore >= 40 ? 'bg-yellow-200' :
                          'bg-green-200';

  // --- Handlers ---
  const handleMetaSave = () => {
    updateRisk(
      idx,
      { owner, status },
      {
        user:    owner || 'Unknown',
        action:  'Update Meta',
        details: `Owner→"${owner}", Status→"${status}"`,
      }
    );
    alert('Owner & Status updated');
  };

  // full list of external standards & regs
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
  const toggleControl = fw =>
    setSelectedControls(prev =>
      prev.includes(fw)
        ? prev.filter(x => x !== fw)
        : [...prev, fw]
    );
  const handleControlsSave = () => {
    updateRisk(
      idx,
      { mappedControls: selectedControls },
      {
        user:    owner || 'System',
        action:  'Map Controls',
        details: `Mapped→[${selectedControls.join(', ')}]`,
      }
    );
    alert('Controls mapping updated');
  };

  const handleAddAssessment = e => {
    e.preventDefault();
    const newAssessment = { date: new Date(), likelihood, impact, by, notes };
    const newResidual    = likelihood * impact;
    updateRisk(
      idx,
      {
        assessments:   [...(risk.assessments || []), newAssessment],
        residualScore: newResidual,
      },
      {
        user:    by || 'Unknown',
        action:  'Add Assessment',
        details: `L=${likelihood}, I=${impact}, Notes="${notes}"`,
      }
    );
    setBy('');
    setNotes('');
  };

  const handleAddTreatment = e => {
    e.preventDefault();
    const newTreatment = {
      id:          makeId(),
      description: treatDesc,
      dueDate:     treatDue,
      completed:   false,
      attachments: [],
    };
    updateRisk(
      idx,
      { treatments: [...(risk.treatments || []), newTreatment] },
      {
        user:    owner || 'System',
        action:  'Add Treatment',
        details: `“${treatDesc}” due ${treatDue}`,
      }
    );
    setTreatDesc('');
    setTreatDue('');
  };

  const toggleTreatment = tId => {
    const updated = (risk.treatments || []).map(t =>
      t.id === tId ? { ...t, completed: !t.completed } : t
    );
    const completed = updated.find(t => t.id === tId)?.completed;
    updateRisk(
      idx,
      { treatments: updated },
      {
        user:    owner || 'System',
        action:  'Toggle Treatment',
        details: `Treatment ${tId} → ${completed}`,
      }
    );
  };

  const handleAttach = (e, tId) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const attachment = { id: makeId(), name: file.name, url: reader.result };
      const updated = (risk.treatments || []).map(t =>
        t.id === tId
          ? { ...t, attachments: [...(t.attachments || []), attachment] }
          : t
      );
      updateRisk(
        idx,
        { treatments: updated },
        {
          user:    owner || 'System',
          action:  'Add Attachment',
          details: `File "${file.name}" to treatment ${tId}`,
        }
      );
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">

      {/* Header & Summary */}
      <h1 className="text-2xl font-bold">{risk.title}</h1>
      <p className="text-gray-600">{risk.desc}</p>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p><strong>Owner:</strong> {risk.owner || '—'}</p>
          <p><strong>Status:</strong> {risk.status}</p>
          <p><strong>Category:</strong> {risk.category}</p>
        </div>
        <div>
          <p><strong>Inherent Score:</strong> {risk.inherentScore}</p>
          <p>
            <strong>Residual Score:</strong>{' '}
            <span className={`${colorClass} px-2 py-1 rounded`}>
              {residualScore}
            </span>
          </p>
          <p><strong>Created:</strong> {risk.dateCreated.toLocaleString()}</p>
          <p><strong>Updated:</strong> {risk.dateUpdated.toLocaleString()}</p>
        </div>
      </div>

      {/* Edit Owner/Status */}
      <div className="p-4 border rounded space-y-2">
        <h2 className="font-semibold">Edit Owner & Status</h2>
        <div className="flex space-x-4">
          <input
            className="flex-1 p-2 border rounded"
            value={owner}
            onChange={e => setOwner(e.target.value)}
            placeholder="Owner name"
          />
          <select
            className="p-2 border rounded"
            value={status}
            onChange={e => setStatus(e.target.value)}
          >
            {['Open','In Progress','Mitigated','Closed'].map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <button
          onClick={handleMetaSave}
          className="mt-2 bg-blue-600 text-white px-4 py-2 rounded"
        >
          Save Owner/Status
        </button>
      </div>

      {/* Mapped Controls */}
      <div className="p-4 border rounded space-y-2">
        <h2 className="font-semibold">Mapped Controls</h2>
        <div className="grid grid-cols-2 gap-4">
          {frameworks.map(fw => (
            <label key={fw} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={selectedControls.includes(fw)}
                onChange={() => toggleControl(fw)}
              />
              <span>{fw}</span>
            </label>
          ))}
        </div>
        <button
          onClick={handleControlsSave}
          className="mt-2 bg-blue-600 text-white px-4 py-2 rounded"
        >
          Save Control Mapping
        </button>
      </div>

      {/* Jira Ticket Integration */}
      <div className="p-4 border rounded space-y-2">
        {!risk.ticketLink ? (
          <button
            onClick={() => linkTicket(idx)}
            className="mt-2 bg-purple-600 text-white px-4 py-2 rounded"
          >
            Create Jira Ticket
          </button>
        ) : (
          <p>
            Jira Issue:{' '}
            <a
              href={`${process.env.REACT_APP_JIRA_BASE_URL}/browse/${risk.ticketLink}`}
              target="_blank"
              rel="noreferrer"
              className="text-blue-600 underline"
            >
              {risk.ticketLink}
            </a>
          </p>
        )}
      </div>

      {/* Assessment History */}
      <div className="p-4 border rounded">
        <h2 className="font-semibold mb-2">Assessment History</h2>
        {(risk.assessments || []).length > 0 ? (
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr className="bg-gray-100">
                {['Date','By','Likelihood','Impact','Notes'].map(h => (
                  <th key={h} className="border px-2 py-1">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {risk.assessments.map((a, i) => (
                <tr key={i}>
                  <td className="border px-2 py-1">{a.date.toLocaleString()}</td>
                  <td className="border px-2 py-1">{a.by}</td>
                  <td className="border px-2 py-1">{a.likelihood}</td>
                  <td className="border px-2 py-1">{a.impact}</td>
                  <td className="border px-2 py-1">{a.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No assessments yet.</p>
        )}
      </div>

      {/* Add New Assessment */}
      <div className="p-4 border rounded space-y-2">
        <h2 className="font-semibold">Add New Assessment</h2>
        <form onSubmit={handleAddAssessment} className="space-y-3">
          <div className="flex space-x-4">
            <div>
              <label>Likelihood (1–10)</label>
              <select
                className="ml-2 p-1 border rounded"
                value={likelihood}
                onChange={e => setLikelihood(+e.target.value)}
              >
                {scaleOptions.map(n => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
            <div>
              <label>Impact (1–10)</label>
              <select
                className="ml-2 p-1 border rounded"
                value={impact}
                onChange={e => setImpact(+e.target.value)}
              >
                {scaleOptions.map(n => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label>Assessed By</label>
            <input
              className="block w-full p-1 border rounded"
              value={by}
              onChange={e => setBy(e.target.value)}
            />
          </div>
          <div>
            <label>Notes</label>
            <textarea
              className="block w-full p-2 border rounded"
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Save Assessment
          </button>
        </form>
      </div>

      {/* Treatments (Action Items) */}
      <div className="p-4 border rounded space-y-4">
        <h2 className="font-semibold">Treatments (Action Items)</h2>
        {risk.treatments.map(t => (
          <div key={t.id} className="p-3 border rounded bg-gray-50">
            <div className="flex items-center justify-between mb-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={t.completed}
                  onChange={() => toggleTreatment(t.id)}
                />
                <span className={t.completed ? 'line-through text-gray-500' : ''}>
                  {t.description}
                </span>
              </label>
              <span className="text-sm text-gray-600">Due: {t.dueDate}</span>
            </div>
            <div className="space-y-2">
              <input type="file" onChange={e => handleAttach(e, t.id)} />
              {t.attachments.map(att => (
                <div key={att.id}>
                  <a
                    href={att.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 underline"
                  >
                    {att.name}
                  </a>
                </div>
              ))}
            </div>
          </div>
        ))}
        <form onSubmit={handleAddTreatment} className="space-y-2">
          <input
            type="text"
            required
            placeholder="Treatment description"
            value={treatDesc}
            onChange={e => setTreatDesc(e.target.value)}
            className="w-full p-2 border rounded"
          />
          <input
            type="date"
            required
            value={treatDue}
            onChange={e => setTreatDue(e.target.value)}
            className="p-2 border rounded"
          />
          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Add Treatment
          </button>
        </form>
      </div>

      {/* Change Log (Audit Trail) */}
      <div className="p-4 border rounded">
        <h2 className="font-semibold mb-2">Change Log (Audit Trail)</h2>
        {(risk.changeLog || []).length > 0 ? (
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr className="bg-gray-100">
                {['When','Who','Action','Details'].map(h => (
                  <th key={h} className="border px-2 py-1">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {risk.changeLog.map((entry, i) => (
                <tr key={i}>
                  <td className="border px-2 py-1">
                    {new Date(entry.timestamp).toLocaleString()}
                  </td>
                  <td className="border px-2 py-1">{entry.user}</td>
                  <td className="border px-2 py-1">{entry.action}</td>
                  <td className="border px-2 py-1">{entry.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No changes recorded.</p>
        )}
      </div>
    </div>
  );
}