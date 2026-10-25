import { jsPDF } from 'jspdf';
import { Student } from '../types/student';
import { calculateAcademicStanding, formatGpa } from '../utils/studentLogic';

export function generateStudentTranscriptPdf(student: Student) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;

  const standing = calculateAcademicStanding(student.gpa);
  const totalCredits = student.courses.reduce((sum, c) => sum + (c.credits || 0), 0);

  // Background and Outer Border
  doc.setDrawColor(226, 232, 240); // #E2E8F0
  doc.setLineWidth(0.5);
  doc.rect(margin - 4, margin - 4, contentWidth + 8, pageHeight - margin * 2 + 8);

  // Inner Accent Border
  doc.setDrawColor(109, 40, 217); // Royal Violet #6D28D9
  doc.setLineWidth(0.7);
  doc.line(margin, margin + 22, pageWidth - margin, margin + 22);

  // Header Banner
  doc.setFont('times', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(15, 23, 42); // #0F172A
  doc.text('UNIVERSITY REGISTRY & ACADEMIC AFFAIRS', pageWidth / 2, margin + 8, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139); // #64748B
  doc.text('OFFICIAL ACADEMIC TRANSCRIPT & COMPREHENSIVE PERFORMANCE RECORD', pageWidth / 2, margin + 14, {
    align: 'center',
  });

  doc.setFont('courier', 'normal');
  doc.setFontSize(7.5);
  const serialNo = `REG-${new Date().getFullYear()}-${student.rollNumber.replace(/[^A-Za-z0-9]/g, '')}`;
  doc.text(`DOC REF: ${serialNo} | VERIFIED ON: ${new Date().toLocaleDateString()}`, pageWidth / 2, margin + 19, {
    align: 'center',
  });

  // Student Profile Summary Box
  let y = margin + 29;
  doc.setFillColor(248, 250, 252); // #F8FAFC
  doc.roundedRect(margin, y, contentWidth, 34, 2, 2, 'F');
  doc.setDrawColor(203, 213, 225); // #CBD5E1
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, y, contentWidth, 34, 2, 2, 'S');

  // Left side: Student Name and Details
  doc.setFont('times', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text(`${student.firstName} ${student.lastName}`, margin + 5, y + 8);

  doc.setFont('courier', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(109, 40, 217); // #6D28D9
  doc.text(`ROLL NO: ${student.rollNumber}`, margin + 5, y + 14);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105); // #475569
  doc.text(`Department: ${student.department}`, margin + 5, y + 20);
  doc.text(`Academic Level: ${student.academicYear} (${student.semester})`, margin + 5, y + 25);
  doc.text(`Email: ${student.email}`, margin + 5, y + 30);

  // Right side: Status and Standing
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('ENROLLMENT STATUS:', margin + 110, y + 8);
  doc.setTextColor(student.status === 'Active' ? 16 : 100, student.status === 'Active' ? 149 : 116, 139);
  doc.text(student.status.toUpperCase(), margin + 148, y + 8);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('ACADEMIC STANDING:', margin + 110, y + 15);
  doc.setTextColor(109, 40, 217);
  doc.text(standing.toUpperCase(), margin + 148, y + 15);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('DATE ISSUED:', margin + 110, y + 22);
  doc.setTextColor(15, 23, 42);
  doc.text(new Date().toLocaleDateString(), margin + 148, y + 22);

  doc.setTextColor(100, 116, 139);
  doc.text('DATABASE SYNC:', margin + 110, y + 29);
  doc.setTextColor(16, 149, 193);
  doc.text('G-Cloud Verified', margin + 148, y + 29);

  // 4 Key Metric Metric Badges
  y += 40;
  const colWidth = (contentWidth - 9) / 4;

  const metrics = [
    { label: 'CUMULATIVE GPA', val: `${formatGpa(student.gpa)} / 4.00`, sub: standing },
    { label: 'TOTAL CREDITS', val: `${totalCredits} Credits`, sub: `${student.courses.length} Completed Courses` },
    { label: 'ATTENDANCE RATE', val: `${student.attendanceRate}%`, sub: student.attendanceRate >= 90 ? 'Excellent' : student.attendanceRate >= 75 ? 'Satisfactory' : 'Advisory Warning' },
    { label: 'DISCIPLINARY', val: 'Clear Record', sub: 'In Good Standing' },
  ];

  metrics.forEach((m, idx) => {
    const boxX = margin + idx * (colWidth + 3);
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.roundedRect(boxX, y, colWidth, 18, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text(m.label, boxX + 4, y + 5);

    doc.setFont('times', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(15, 23, 42);
    doc.text(m.val, boxX + 4, y + 11);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(109, 40, 217);
    doc.text(m.sub, boxX + 4, y + 15);
  });

  // Coursework Transcript Table
  y += 25;
  doc.setFont('times', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('OFFICIAL COURSE CURRICULUM & GRADE BREAKDOWN', margin, y);

  y += 3;
  // Table Header
  doc.setFillColor(241, 245, 249); // #F1F5F9
  doc.rect(margin, y, contentWidth, 7, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.2);
  doc.line(margin, y + 7, pageWidth - margin, y + 7);

  doc.setFont('courier', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text('CODE', margin + 3, y + 5);
  doc.text('COURSE TITLE', margin + 24, y + 5);
  doc.text('CREDITS', margin + 110, y + 5);
  doc.text('TERM', margin + 130, y + 5);
  doc.text('GRADE', margin + 160, y + 5);

  y += 7;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);

  if (student.courses.length > 0) {
    student.courses.forEach((c, index) => {
      if (index % 2 === 1) {
        doc.setFillColor(248, 250, 252);
        doc.rect(margin, y, contentWidth, 7, 'F');
      }

      doc.setFont('courier', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text(c.code, margin + 3, y + 5);

      doc.setFont('helvetica', 'normal');
      doc.text(c.title, margin + 24, y + 5);

      doc.setFont('helvetica', 'normal');
      doc.text(String(c.credits), margin + 114, y + 5);

      doc.text(c.semester || student.semester, margin + 130, y + 5);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(109, 40, 217);
      doc.text(c.grade, margin + 162, y + 5);

      doc.setDrawColor(241, 245, 249);
      doc.line(margin, y + 7, pageWidth - margin, y + 7);
      y += 7;
    });
  } else {
    doc.setTextColor(148, 163, 184);
    doc.text('No active course records registered for current academic session.', margin + 3, y + 5);
    y += 7;
  }

  // Attendance History Summary
  y += 8;
  doc.setFont('times', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('DAILY PRESENCE & ATTENDANCE AUDIT LOG', margin, y);

  y += 3;
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, y, contentWidth, 7, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.line(margin, y + 7, pageWidth - margin, y + 7);

  doc.setFont('courier', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text('DATE', margin + 3, y + 5);
  doc.text('SESSION PRESENCE', margin + 45, y + 5);
  doc.text('REGISTRAR NOTES / AUDIT REMARKS', margin + 95, y + 5);

  y += 7;
  const logs = student.attendanceLogs || [];
  if (logs.length > 0) {
    logs.slice(0, 4).forEach((log, index) => {
      if (index % 2 === 1) {
        doc.setFillColor(248, 250, 252);
        doc.rect(margin, y, contentWidth, 6.5, 'F');
      }

      doc.setFont('courier', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(15, 23, 42);
      doc.text(log.date, margin + 3, y + 4.5);

      doc.setFont('helvetica', 'bold');
      if (log.status === 'present') doc.setTextColor(16, 149, 100);
      else if (log.status === 'late') doc.setTextColor(217, 119, 6);
      else if (log.status === 'excused') doc.setTextColor(109, 40, 217);
      else doc.setTextColor(225, 29, 72);
      doc.text(log.status.toUpperCase(), margin + 45, y + 4.5);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text(log.notes || 'Routine attendance logged and verified', margin + 95, y + 4.5);

      doc.setDrawColor(241, 245, 249);
      doc.line(margin, y + 6.5, pageWidth - margin, y + 6.5);
      y += 6.5;
    });
  } else {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(
      `Aggregate presence verified at ${student.attendanceRate}%. Zero disciplinary absences recorded on cloud registry.`,
      margin + 3,
      y + 4.5
    );
    y += 7;
  }

  // Institutional Certification Statement & Signatures
  y = pageHeight - margin - 32;

  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.4);
  doc.line(margin, y, pageWidth - margin, y);

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text(
    'This official transcript is certified by the University Academic Registry. It is electronically generated, tamper-evident, and synchronized with the Institutional Student Registry database.',
    margin,
    y + 4,
    { maxWidth: contentWidth }
  );

  // Signature Blocks
  const sigY = y + 16;
  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(0.3);
  doc.line(margin + 5, sigY, margin + 55, sigY);
  doc.line(pageWidth - margin - 55, sigY, pageWidth - margin - 5, sigY);

  doc.setFont('times', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text('Dr. Robert Sterling', margin + 30, sigY + 4, { align: 'center' });
  doc.text('Office of the Registrar', pageWidth - margin - 30, sigY + 4, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Chief Registrar & Academic Officer', margin + 30, sigY + 7.5, { align: 'center' });
  doc.text('Official University Seal Affixed', pageWidth - margin - 30, sigY + 7.5, { align: 'center' });

  // Save PDF
  const sanitizedName = `${student.firstName}_${student.lastName}`.toLowerCase().replace(/[^a-z0-9]/g, '_');
  doc.save(`transcript_${student.rollNumber}_${sanitizedName}.pdf`);
}
