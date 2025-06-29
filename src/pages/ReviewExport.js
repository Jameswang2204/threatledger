// src/pages/ReviewExport.js
import React, { useContext, useState, useMemo, useRef } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Pie, Bar } from 'react-chartjs-2';
import { exportRisksToExcel } from '../utils/sheet';
import 'chart.js/auto';
import { RiskContext } from '../context/RiskContext';

export default function ReviewExport() {
  const { risks } = useContext(RiskContext);

  // Refs for hidden charts
  const pieRef = useRef(null);
  const ownerRef = useRef(null);

  // 1) Date‐range filter
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // 2) Column selector
  const allFields = [
    { key: 'title', label: 'Title' },
    { key: 'category', label: 'Category' },
    { key: 'likelihood', label: 'Likelihood' },
    { key: 'impact', label: 'Impact' },
    { key: 'inherentScore', label: 'Inherent Score' },
    { key: 'residualScore', label: 'Residual Score' },
    { key: 'owner', label: 'Owner' },
    { key: 'status', label: 'Status' },
    { key: 'mappedControls', label: 'Controls' },
  ];
  const [selectedFields, setSelectedFields] = useState(
    allFields.map(f => f.key)
  );
  const toggleField = key =>
    setSelectedFields(prev =>
      prev.includes(key)
        ? prev.filter(k => k !== key)
        : [...prev, key]
    );

  // 3) Filter risks by dateCreated or dateUpdated
  const filteredRisks = useMemo(() => {
    const start = fromDate ? new Date(fromDate) : null;
    const end = toDate ? new Date(toDate) : null;
    return risks.filter(r => {
      const c = new Date(r.dateCreated);
      const u = new Date(r.dateUpdated);
      const inCreated = (!start || c >= start) && (!end || c <= end);
      const inUpdated = (!start || u >= start) && (!end || u <= end);
      return inCreated || inUpdated;
    });
  }, [risks, fromDate, toDate]);

  // 4) Summary metrics
  const total = filteredRisks.length;
  const coveredCount = filteredRisks.filter(
    r => (r.mappedControls || []).length > 0
  ).length;
  const coverage = total ? Math.round((coveredCount / total) * 100) : 0;
  const mostSevere = filteredRisks.reduce((prev, curr) => {
    const p = prev.residualScore ?? prev.score;
    const c = curr.residualScore ?? curr.score;
    return c > p ? curr : prev;
  }, filteredRisks[0] || { title: 'N/A', residualScore: 0 });
  const sev = mostSevere.residualScore ?? mostSevere.score;

  // 5) Executive Summary: this month’s numbers
  const now = new Date();
  const thisYear = now.getFullYear();
  const thisMonth = now.getMonth();
  const newThisMonth = filteredRisks.filter(r => {
    const d = new Date(r.dateCreated);
    return d.getFullYear() === thisYear && d.getMonth() === thisMonth;
  }).length;
  const highThisMonth = filteredRisks.filter(r => {
    const d = new Date(r.dateCreated);
    const score = r.residualScore ?? r.score;
    return (
      d.getFullYear() === thisYear &&
      d.getMonth() === thisMonth &&
      score >= sev
    );
  }).length;
  const mitigatedThisMonth = filteredRisks.filter(r => {
    const d = new Date(r.dateUpdated);
    return (
      r.status === 'Mitigated' &&
      d.getFullYear() === thisYear &&
      d.getMonth() === thisMonth
    );
  }).length;

  // 6) Trend data (last 6 months)
  const trendData = useMemo(() => {
    const arr = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(thisYear, thisMonth - i, 1);
      const label = d.toLocaleString('default', {
        month: 'short',
        year: 'numeric',
      });
      const created = filteredRisks.filter(r => {
        const c = new Date(r.dateCreated);
        return c.getFullYear() === d.getFullYear() && c.getMonth() === d.getMonth();
      }).length;
      const mitigated = filteredRisks.filter(r => {
        const u = new Date(r.dateUpdated);
        return (
          r.status === 'Mitigated' &&
          u.getFullYear() === d.getFullYear() &&
          u.getMonth() === d.getMonth()
        );
      }).length;
      arr.push({ month: label, created, mitigated });
    }
    return arr;
  }, [filteredRisks, thisYear, thisMonth]);

  // 7) Chart data for PDF embed
  const statuses = [...new Set(filteredRisks.map(r => r.status))];
  const statusPieData = {
    labels: statuses,
    datasets: [
      {
        data: statuses.map(s =>
          filteredRisks.filter(r => r.status === s).length
        ),
      },
    ],
  };
  const owners = [
    ...new Set(filteredRisks.map(r => r.owner).filter(o => o)),
  ];
  const ownerBarData = {
    labels: owners,
    datasets: [
      {
        label: 'Risks by Owner',
        data: owners.map(o =>
          filteredRisks.filter(r => r.owner === o).length
        ),
      },
    ],
  };

  // ——— Export handlers ——————————————————————————

  // CSV
  const downloadCSV = () => {
    const header = selectedFields
      .map(key => allFields.find(f => f.key === key).label)
      .join(',');
    const rows = filteredRisks
      .map(r =>
        selectedFields
          .map(key => {
            if (key === 'mappedControls')
              return `"${(r.mappedControls || []).join('|')}"`;
            return `"${r[key] ?? ''}"`;
          })
          .join(',')
      )
      .join('\n');
    const uri = `data:text/csv;charset=utf-8,${header}\n${rows}`;
    const link = document.createElement('a');
    link.href = encodeURI(uri);
    link.download = 'ThreatLedger_RiskRegister.csv';
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  // Excel
  const downloadExcel = () => {
    exportRisksToExcel(
      filteredRisks,
      selectedFields,
      'ThreatLedger_RiskRegister.xlsx'
    );
  };

  // PDF
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('ThreatLedger Risk Register', 14, 20);
    doc.setFontSize(12);
    doc.text(`Total Risks: ${total}`, 14, 30);
    doc.text(`Most Severe: ${mostSevere.title} (Score: ${sev})`, 14, 36);
    doc.text(`Control Coverage: ${coverage}%`, 14, 42);

    // — embed status pie via ref —
    const pieImg = pieRef.current.toBase64Image();
    doc.addImage(pieImg, 'PNG', 14, 50, 60, 40);

    // — embed owner bar via ref —
    const barImg = ownerRef.current.toBase64Image();
    doc.addImage(barImg, 'PNG', 90, 50, 80, 40);

    // — trend table —
    autoTable(doc, {
      head: [['Month', 'Created', 'Mitigated']],
      body: trendData.map(t => [t.month, t.created, t.mitigated]),
      startY: 95,
      margin: { left: 14 },
      styles: { fontSize: 8 },
    });

    // — main risk table —
    const columns = selectedFields.map(
      key => allFields.find(f => f.key === key).label
    );
    const rows = filteredRisks.map(r =>
      selectedFields.map(key => {
        if (key === 'mappedControls') return (r.mappedControls || []).join(', ');
        return r[key] ?? '';
      })
    );
    autoTable(doc, {
      head: [columns],
      body: rows,
      startY: doc.lastAutoTable.finalY + 10,
      margin: { left: 14 },
      styles: { fontSize: 7 },
    });

    doc.save('ThreatLedger_RiskRegister.pdf');
  };

  // ——— render UI ——————————————————————————————————————
  return (
    <div className="space-y-6">
      <h2 className="text-xl">Review &amp; Export</h2>

      {/* date range */}
      <div className="flex gap-4">
        <label className="flex flex-col">
          From date
          <input
            type="date"
            value={fromDate}
            onChange={e => setFromDate(e.target.value)}
            className="p-2 border rounded"
          />
        </label>
        <label className="flex flex-col">
          To date
          <input
            type="date"
            value={toDate}
            onChange={e => setToDate(e.target.value)}
            className="p-2 border rounded"
          />
        </label>
      </div>

      {/* column selector */}
      <fieldset className="p-4 border rounded space-y-2">
        <legend className="font-semibold">Columns to export</legend>
        <div className="grid grid-cols-2 gap-2">
          {allFields.map(f => (
            <label key={f.key} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={selectedFields.includes(f.key)}
                onChange={() => toggleField(f.key)}
              />
              <span>{f.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {/* summary */}
      <div className="space-y-1">
        <p>Total Risks (filtered): <strong>{total}</strong></p>
        <p>
          Most Severe: <strong>{mostSevere.title}</strong> (Score: <strong>{sev}</strong>)
        </p>
        <p>Control Coverage: <strong>{coverage}%</strong></p>
      </div>

      {/* executive summary */}
      <div className="p-4 bg-gray-50 rounded">
        <h3 className="font-semibold">Executive Summary</h3>
        <ul className="list-disc ml-6">
          <li>
            {newThisMonth} risks created this month ({thisMonth + 1}/{thisYear})
          </li>
          <li>{highThisMonth} high-severity risks created this month</li>
          <li>{mitigatedThisMonth} risks mitigated this month</li>
        </ul>
      </div>

      {/* trend table */}
      <div>
        <h3 className="font-semibold mb-2">
          Created vs Mitigated (Last 6 Months)
        </h3>
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-2 py-1">Month</th>
              <th className="border px-2 py-1">Created</th>
              <th className="border px-2 py-1">Mitigated</th>
            </tr>
          </thead>
          <tbody>
            {trendData.map((t, i) => (
              <tr key={i} className={i % 2 ? 'bg-gray-50' : 'bg-white'}>
                <td className="border px-2 py-1">{t.month}</td>
                <td className="border px-2 py-1">{t.created}</td>
                <td className="border px-2 py-1">{t.mitigated}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* preview */}
      <div>
        <h3 className="font-semibold mb-2">Preview</h3>
        <div className="overflow-auto max-h-64 border rounded">
          <table className="w-full table-auto border-collapse">
            <thead className="bg-gray-100">
              <tr>
                {selectedFields.map(key => (
                  <th key={key} className="border px-2 py-1 text-left">
                    {allFields.find(f => f.key === key).label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredRisks.length ? (
                filteredRisks.map((r, i) => (
                  <tr key={i} className={i % 2 ? 'bg-gray-50' : 'bg-white'}>
                    {selectedFields.map(key => (
                      <td key={key} className="border px-2 py-1">
                        {key === 'mappedControls'
                          ? (r.mappedControls || []).join(', ')
                          : String(r[key] || '')}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={selectedFields.length} className="text-center py-4">
                    No risks match the filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* hidden charts for PDF capture */}
      <div style={{ position: 'absolute', left: -9999, top: -9999 }}>
        <Pie ref={pieRef} data={statusPieData} />
        <Bar ref={ownerRef} data={ownerBarData} />
      </div>

      {/* export buttons */}
      <div className="flex gap-2">
        <button
          onClick={downloadCSV}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
        >
          Export CSV
        </button>
        <button
          onClick={downloadExcel}
          className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded"
        >
          Export Excel
        </button>
        <button
          onClick={exportPDF}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          Export PDF
        </button>
      </div>
    </div>
  );
}