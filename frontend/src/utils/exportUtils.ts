import jsPDF from 'jspdf';

// Export to CSV
export const exportToCSV = (filename: string, rows: any[], headers: { key: string; label: string }[]) => {
  if (!rows || rows.length === 0) {
    alert('No data to export');
    return;
  }

  const headerLine = headers.map(h => `"${h.label.replace(/"/g, '""')}"`).join(',');
  const rowLines = rows.map(row => {
    return headers.map(h => {
      const val = row[h.key] !== undefined && row[h.key] !== null ? String(row[h.key]) : '';
      return `"${val.replace(/"/g, '""')}"`;
    }).join(',');
  });

  const csvContent = '\uFEFF' + [headerLine, ...rowLines].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Export to Excel (XML Spreadsheet compatible with Excel)
export const exportToExcel = (filename: string, rows: any[], headers: { key: string; label: string }[]) => {
  if (!rows || rows.length === 0) {
    alert('No data to export');
    return;
  }

  const tableHeader = headers.map(h => `<th style="background-color:#ea580c;color:#ffffff;font-weight:bold;padding:8px;border:1px solid #cbd5e1;">${h.label}</th>`).join('');
  const tableRows = rows.map(row => {
    const cells = headers.map(h => {
      const val = row[h.key] !== undefined && row[h.key] !== null ? String(row[h.key]) : '';
      return `<td style="padding:6px;border:1px solid #e2e8f0;">${val}</td>`;
    }).join('');
    return `<tr>${cells}</tr>`;
  }).join('');

  const html = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta http-equiv="content-type" content="application/vnd.ms-excel; charset=UTF-8">
        <!--[if gte mso 9]>
        <xml>
          <x:ExcelWorkbook>
            <x:ExcelWorksheets>
              <x:ExcelWorksheet>
                <x:Name>${filename.slice(0, 31)}</x:Name>
                <x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions>
              </x:ExcelWorksheet>
            </x:ExcelWorksheets>
          </x:ExcelWorkbook>
        </xml>
        <![endif]-->
      </head>
      <body>
        <table border="1" style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:12px;">
          <thead><tr>${tableHeader}</tr></thead>
          <tbody>${tableRows}</tbody>
        </table>
      </body>
    </html>
  `;

  const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.xls`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Export Batch Results Summary PDF
export const exportResultsPDF = (results: any[], title = 'Examination Results Summary') => {
  if (!results || results.length === 0) {
    alert('No results to export');
    return;
  }

  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();

  // Primary Header Bar
  doc.setFillColor(234, 88, 12);
  doc.rect(0, 0, pageWidth, 24, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('CITY COLLEGE - EXAMINATION MANAGEMENT PORTAL', pageWidth / 2, 11, { align: 'center' });

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`OFFICIAL RESULTS TRANSCRIPT - ${title.toUpperCase()}`, pageWidth / 2, 18, { align: 'center' });

  // Metadata
  doc.setTextColor(51, 65, 85);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(`Total Records: ${results.length}`, 14, 32);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated on: ${new Date().toLocaleString()}`, pageWidth - 14, 32, { align: 'right' });

  // Table Headers
  let y = 40;
  const colX = [14, 30, 80, 140, 195, 225, 255];
  const colHeaders = ['#', 'Student ID', 'Student Name', 'Exam Title', 'Score', 'Percentage', 'Status'];

  doc.setFillColor(241, 245, 249);
  doc.rect(14, y - 5, pageWidth - 28, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);

  colHeaders.forEach((hdr, i) => {
    doc.text(hdr, colX[i], y);
  });

  doc.setDrawColor(203, 213, 225);
  doc.line(14, y + 3, pageWidth - 14, y + 3);

  y += 9;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);

  results.forEach((r, idx) => {
    if (y > 185) {
      doc.addPage();
      y = 20;
      doc.setFillColor(241, 245, 249);
      doc.rect(14, y - 5, pageWidth - 28, 8, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      colHeaders.forEach((hdr, i) => {
        doc.text(hdr, colX[i], y);
      });
      doc.line(14, y + 3, pageWidth - 14, y + 3);
      y += 9;
      doc.setFont('helvetica', 'normal');
    }

    const studentId = r.User?.loginId || '-';
    const studentName = r.User?.name || 'Unknown';
    const examName = r.Exam?.title || 'Unknown Exam';
    const score = `${r.score || 0} / ${r.Exam?.totalMarks || 100}`;
    const pct = `${r.percentage || 0}%`;
    const isPassed = (r.percentage || 0) >= (r.Exam?.passMarks || 40) && r.status !== 'terminated';
    const statusText = r.status === 'terminated' ? 'TERMINATED' : (isPassed ? 'PASSED' : 'FAILED');

    doc.setTextColor(30, 41, 59);
    doc.text(String(idx + 1), colX[0], y);
    doc.text(studentId, colX[1], y);
    doc.text(studentName.length > 25 ? studentName.slice(0, 23) + '..' : studentName, colX[2], y);
    doc.text(examName.length > 28 ? examName.slice(0, 26) + '..' : examName, colX[3], y);
    doc.text(score, colX[4], y);
    doc.text(pct, colX[5], y);

    if (isPassed) {
      doc.setTextColor(16, 185, 129); // green
    } else {
      doc.setTextColor(239, 68, 68); // red
    }
    doc.setFont('helvetica', 'bold');
    doc.text(statusText, colX[6], y);
    doc.setFont('helvetica', 'normal');

    doc.setDrawColor(241, 245, 249);
    doc.line(14, y + 2, pageWidth - 14, y + 2);

    y += 7;
  });

  doc.save(`${title.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}.pdf`);
};
