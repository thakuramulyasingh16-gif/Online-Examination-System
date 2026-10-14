import jsPDF from 'jspdf';

interface PDFResultData {
  studentName: string;
  loginId: string;
  examTitle: string;
  examDate: string;
  score: number;
  totalMarks: number;
  percentage: number;
  status: string;
  isPassed: boolean;
  correctCount: number;
  wrongCount: number;
  skippedCount: number;
  questions?: {
    question: string;
    studentAnswer?: string;
    correctAnswer: string;
    isCorrect: boolean;
  }[];
}

export const generateResultPDF = (data: PDFResultData) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // Primary Header Bar
  doc.setFillColor(234, 88, 12); // College Primary Orange (#EA580C)
  doc.rect(0, 0, pageWidth, 28, 'F');

  // Header Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('CITY COLLEGE', pageWidth / 2, 12, { align: 'center' });

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('ONLINE EXAMINATION PORTAL & ACADEMIC EVALUATION SYSTEM', pageWidth / 2, 18, {
    align: 'center',
  });

  doc.setFontSize(8);
  doc.text('OFFICIAL SCORECARD & PERFORMANCE TRANSCRIPT', pageWidth / 2, 23, {
    align: 'center',
  });

  // Certificate / Transcript Title
  doc.setTextColor(30, 41, 59); // Slate-800
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('STUDENT ASSESSMENT REPORT', 14, 40);

  doc.setDrawColor(226, 232, 240); // Slate-200
  doc.setLineWidth(0.5);
  doc.line(14, 43, pageWidth - 14, 43);

  // Student & Exam Details Box
  doc.setFillColor(248, 250, 252); // Slate-50
  doc.roundedRect(14, 47, pageWidth - 28, 38, 3, 3, 'F');

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105); // Slate-600

  // Left Column
  doc.text('Student Name:', 20, 56);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(data.studentName, 52, 56);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Roll / Login ID:', 20, 64);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(data.loginId, 52, 64);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Issue Date:', 20, 72);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(new Date().toLocaleDateString('en-IN'), 52, 72);

  // Right Column
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Examination:', 110, 56);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(data.examTitle, 140, 56);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Exam Date:', 110, 64);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(data.examDate, 140, 64);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Attempt Status:', 110, 72);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(data.status.toUpperCase(), 140, 72);

  // Summary Result Badges Box
  let currentY = 93;
  const colWidth = (pageWidth - 28 - 9) / 4;

  const boxes = [
    { title: 'Score Obtained', val: `${data.score} / ${data.totalMarks}`, color: [234, 88, 12] },
    { title: 'Percentage', val: `${data.percentage.toFixed(1)}%`, color: [30, 41, 59] },
    {
      title: 'Result Status',
      val: data.isPassed ? 'PASSED' : 'FAILED',
      color: data.isPassed ? [16, 185, 129] : [239, 68, 68],
    },
    {
      title: 'Breakdown (C/W/S)',
      val: `${data.correctCount} / ${data.wrongCount} / ${data.skippedCount}`,
      color: [100, 116, 139],
    },
  ];

  boxes.forEach((box, i) => {
    const x = 14 + i * (colWidth + 3);
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(x, currentY, colWidth, 22, 2, 2, 'FD');

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 116, 139);
    doc.text(box.title, x + colWidth / 2, currentY + 7, { align: 'center' });

    doc.setFontSize(10);
    doc.setTextColor(box.color[0], box.color[1], box.color[2]);
    doc.text(box.val, x + colWidth / 2, currentY + 16, { align: 'center' });
  });

  currentY += 32;

  // Question Performance Breakdown Section
  if (data.questions && data.questions.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(30, 41, 59);
    doc.text('QUESTION-BY-QUESTION REVIEW SUMMARY', 14, currentY);

    currentY += 4;
    doc.setDrawColor(226, 232, 240);
    doc.line(14, currentY, pageWidth - 14, currentY);
    currentY += 6;

    // Table Header
    doc.setFillColor(241, 245, 249);
    doc.rect(14, currentY, pageWidth - 28, 8, 'F');

    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text('#', 18, currentY + 5);
    doc.text('Question Excerpt', 28, currentY + 5);
    doc.text('Your Answer', 110, currentY + 5);
    doc.text('Correct Answer', 150, currentY + 5);
    doc.text('Status', pageWidth - 20, currentY + 5, { align: 'right' });

    currentY += 9;

    // Question Rows
    data.questions.slice(0, 15).forEach((q, idx) => {
      if (currentY > 265) {
        doc.addPage();
        currentY = 20;
      }

      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(30, 41, 59);

      doc.text(`${idx + 1}`, 18, currentY + 4);
      const qText = q.question.length > 45 ? `${q.question.slice(0, 43)}...` : q.question;
      doc.text(qText, 28, currentY + 4);

      const yourAns = q.studentAnswer
        ? q.studentAnswer.length > 20
          ? `${q.studentAnswer.slice(0, 18)}...`
          : q.studentAnswer
        : 'Skipped';
      doc.text(yourAns, 110, currentY + 4);

      const corAns =
        q.correctAnswer.length > 20 ? `${q.correctAnswer.slice(0, 18)}...` : q.correctAnswer;
      doc.text(corAns, 150, currentY + 4);

      doc.setFont('helvetica', 'bold');
      if (q.isCorrect) {
        doc.setTextColor(16, 185, 129);
        doc.text('CORRECT', pageWidth - 20, currentY + 4, { align: 'right' });
      } else if (!q.studentAnswer) {
        doc.setTextColor(245, 158, 11);
        doc.text('SKIPPED', pageWidth - 20, currentY + 4, { align: 'right' });
      } else {
        doc.setTextColor(239, 68, 68);
        doc.text('WRONG', pageWidth - 20, currentY + 4, { align: 'right' });
      }

      currentY += 7;
    });
  }

  // Footer / Verification Seal
  const footerY = 275;
  doc.setDrawColor(226, 232, 240);
  doc.line(14, footerY, pageWidth - 14, footerY);

  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text(
    'This is a digitally generated document certified by City College Examination Portal. No physical signature is required.',
    pageWidth / 2,
    footerY + 5,
    { align: 'center' }
  );

  doc.text(
    `Verification ID: CC-EVAL-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
    pageWidth / 2,
    footerY + 9,
    { align: 'center' }
  );

  // Save the document
  const filename = `CityCollege_Result_${data.examTitle.replace(/[^a-zA-Z0-9]/g, '_')}_${data.studentName.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
  doc.save(filename);
};
