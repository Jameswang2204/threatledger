// src/utils/sheet.js
import * as XLSX    from 'xlsx';
import { saveAs }   from 'file-saver';

const fieldLabels = {
  title:         'Title',
  category:      'Category',
  likelihood:    'Likelihood',
  impact:        'Impact',
  inherentScore: 'Inherent Score',
  residualScore: 'Residual Score',
  owner:         'Owner',
  status:        'Status',
  mappedControls:'Controls',
};

export function exportRisksToExcel(risks, selectedFields, fileName='report.xlsx') {
  // Build array of objects matching selected fields
  const data = risks.map(r => {
    const row = {};
    selectedFields.forEach(key => {
      let val = r[key];
      if (key === 'mappedControls') {
        val = (r.mappedControls || []).join(', ');
      }
      row[fieldLabels[key] || key] = val;
    });
    return row;
  });

  // Create worksheet
  const ws = XLSX.utils.json_to_sheet(data, {
    header: selectedFields.map(key => fieldLabels[key] || key)
  });
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Risks');

  // Write and trigger download
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  saveAs(new Blob([wbout], { type: 'application/octet-stream' }), fileName);
}