function getValue(obj, path) {
  if (!path) return '';
  if (obj == null) return '';
  if (!path.includes('.')) return obj[path];
  return path.split('.').reduce((acc, p) => (acc ? acc[p] : undefined), obj);
}

export function exportToCSV(items = [], columns = [], filename = 'export.csv') {
  if (!items || !items.length) return;

  // columns: [{ key: 'code', label: 'Kode' }, ...]
  const header = columns.map((c) => c.label || c.key).join(',') + '\n';
  const rows = items.map((item) =>
    columns
      .map((c) => {
        const val = getValue(item, c.key);
        // format Date if necessary
        if (val instanceof Date) return `"${val.toLocaleString()}"`;
        if (val === null || val === undefined) return '';
        // escape double quotes
        const s = String(val).replace(/"/g, '""');
        return `"${s}"`;
      })
      .join(',')
  );

  const csv = header + rows.join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.setAttribute('download', filename);
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export async function exportToPDF(items = [], columns = [], filename = 'export.pdf', title = '') {
  if (!items || !items.length) return;

  // dynamic import so SSR is safe
  const { jsPDF } = await import('jspdf');
  await import('jspdf-autotable');

  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();

  if (title) {
    doc.setFontSize(14);
    doc.text(title, pageWidth / 2, 30, { align: 'center' });
  }

  const head = [columns.map((c) => c.label || c.key)];
  const body = items.map((it) => columns.map((c) => {
    let v = getValue(it, c.key);
    if (v === null || v === undefined) return '';
    if (v instanceof Date) return v.toLocaleString();
    return String(v);
  }));

  // @ts-ignore autotable injects to jsPDF
  doc.autoTable({ head, body, startY: title ? 50 : 40, styles: { fontSize: 10, cellPadding: 6 }, headStyles: { fillColor: [127, 0, 255] } });

  doc.save(filename);
}
