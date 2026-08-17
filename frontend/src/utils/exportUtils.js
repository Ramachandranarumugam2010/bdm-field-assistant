/**
 * Triggers a client-side CSV download from structured JSON data.
 */
export function exportToCSV(filename, rows, headers) {
  if (!rows || !rows.length) return;

  const separator = ',';
  const keys = Object.keys(headers);

  // Build CSV Header line
  const headerRow = keys.map(k => `"${headers[k]}"`).join(separator);

  // Build Data Rows
  const csvContent = rows.map(row => {
    return keys.map(k => {
      let cell = row[k] === null || row[k] === undefined ? '' : row[k];
      cell = cell.toString().replace(/"/g, '""'); // Escape double quotes
      return `"${cell}"`;
    }).join(separator);
  });

  const fullCsv = [headerRow, ...csvContent].join('\n');
  const blob = new Blob([fullCsv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}