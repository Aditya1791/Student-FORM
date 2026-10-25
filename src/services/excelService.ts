import * as XLSX from 'xlsx';
import { Student, CreateStudentDto } from '../types/student';
import { normalizeStudentRow } from '../utils/excelLogic';

export interface ParseExcelResult {
  validStudents: CreateStudentDto[];
  errors: string[];
  totalRows: number;
}

export function exportStudentsToExcel(students: Student[], filename = 'student_records_2026.xlsx') {
  // Sheet 1: Student Directory
  const studentRows = students.map((s, idx) => ({
    'SL No': idx + 1,
    'Roll Number': s.rollNumber,
    'First Name': s.firstName,
    'Last Name': s.lastName,
    'Institutional Email': s.email,
    'Phone': s.phone || 'N/A',
    'Department': s.department,
    'Academic Year': s.academicYear,
    'Semester': s.semester,
    'GPA (4.0 Scale)': s.gpa,
    'Enrollment Status': s.status,
    'Attendance (%)': s.attendanceRate,
    'Date of Birth': s.dateOfBirth || '',
    'Gender': s.gender || '',
    'Address': s.address || '',
    'Emergency Contact': s.emergencyContact ? `${s.emergencyContact.name} (${s.emergencyContact.relationship}) - ${s.emergencyContact.phone}` : '',
    'Remarks / Notes': s.notes || '',
  }));

  const worksheet = XLSX.utils.json_to_sheet(studentRows);

  // Set column widths for readability
  worksheet['!cols'] = [
    { wch: 8 },  // SL No
    { wch: 15 }, // Roll Number
    { wch: 14 }, // First Name
    { wch: 14 }, // Last Name
    { wch: 28 }, // Email
    { wch: 18 }, // Phone
    { wch: 22 }, // Department
    { wch: 12 }, // Academic Year
    { wch: 12 }, // Semester
    { wch: 16 }, // GPA
    { wch: 18 }, // Status
    { wch: 14 }, // Attendance
    { wch: 14 }, // DOB
    { wch: 10 }, // Gender
    { wch: 30 }, // Address
    { wch: 35 }, // Emergency
    { wch: 30 }, // Notes
  ];

  // Sheet 2: Cohort Analytics Summary
  const deptCounts: Record<string, number> = {};
  let totalGpa = 0;
  let honors = 0;
  students.forEach((s) => {
    deptCounts[s.department] = (deptCounts[s.department] || 0) + 1;
    totalGpa += s.gpa;
    if (s.gpa >= 3.5) honors++;
  });

  const summaryRows = [
    { Metric: 'Total Records Exported', Value: students.length },
    { Metric: 'Average GPA', Value: students.length ? (totalGpa / students.length).toFixed(2) : 0 },
    { Metric: 'Honors Students (GPA >= 3.50)', Value: honors },
    { Metric: 'Active Enrolled', Value: students.filter((s) => s.status === 'Active').length },
    { Metric: 'On Leave', Value: students.filter((s) => s.status === 'On Leave').length },
    { Metric: 'Graduated', Value: students.filter((s) => s.status === 'Graduated').length },
    { Metric: 'Suspended', Value: students.filter((s) => s.status === 'Suspended').length },
    { Metric: 'Export Date', Value: new Date().toISOString() },
  ];
  const summarySheet = XLSX.utils.json_to_sheet(summaryRows);
  summarySheet['!cols'] = [{ wch: 32 }, { wch: 20 }];

  // Sheet 3: Department Breakdown
  const deptRows = Object.entries(deptCounts).map(([department, count]) => ({
    Department: department,
    'Student Count': count,
    'Share (%)': `${Math.round((count / students.length) * 100)}%`,
  }));
  const deptSheet = XLSX.utils.json_to_sheet(deptRows);
  deptSheet['!cols'] = [{ wch: 25 }, { wch: 15 }, { wch: 12 }];

  // Build workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Students');
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Analytics Summary');
  XLSX.utils.book_append_sheet(workbook, deptSheet, 'Departments');

  // Trigger download in browser
  XLSX.writeFile(workbook, filename);
}

export async function parseExcelFile(file: File): Promise<ParseExcelResult> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });

  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) {
    throw new Error('Spreadsheet has no sheets');
  }

  const sheet = workbook.Sheets[firstSheetName];
  let rawRows: Record<string, any>[] = XLSX.utils.sheet_to_json(sheet, { defval: '' });

  // If the sheet has rows, check if the first row is a title banner instead of headers
  if (rawRows.length > 0) {
    const firstRowKeys = Object.keys(rawRows[0]);
    const hasRecognizableHeader = firstRowKeys.some((k) => {
      const clean = k.toLowerCase().replace(/[^a-z0-9]/g, '');
      return clean.includes('roll') || clean.includes('name') || clean.includes('email') || clean.includes('student');
    });

    if (!hasRecognizableHeader) {
      // Look for the actual header row in the first 10 rows
      const data2d: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
      let headerRowIdx = -1;
      for (let r = 0; r < Math.min(10, data2d.length); r++) {
        const rowArr = data2d[r];
        if (Array.isArray(rowArr)) {
          const rowHasHeader = rowArr.some((cell) => {
            const clean = String(cell || '').toLowerCase().replace(/[^a-z0-9]/g, '');
            return clean.includes('roll') || clean.includes('name') || clean.includes('email') || clean.includes('student');
          });
          if (rowHasHeader) {
            headerRowIdx = r;
            break;
          }
        }
      }

      if (headerRowIdx !== -1) {
        rawRows = XLSX.utils.sheet_to_json(sheet, { range: headerRowIdx, defval: '' });
      }
    }
  }

  if (!rawRows || rawRows.length === 0) {
    throw new Error('Spreadsheet contains no data rows');
  }

  const validStudents: CreateStudentDto[] = [];
  const errors: string[] = [];

  rawRows.forEach((row, index) => {
    const rowNumber = index + 2; // header is row 1
    const res = normalizeStudentRow(row);
    if (res.isEmpty) {
      // Silently ignore blank/trailing empty rows
      return;
    }
    if (res.error) {
      errors.push(`Row ${rowNumber}: ${res.error}`);
    } else if (res.student) {
      validStudents.push(res.student);
    }
  });

  return {
    validStudents,
    errors,
    totalRows: validStudents.length + errors.length,
  };
}

export function downloadSampleExcelTemplate() {
  const sampleData = [
    {
      'Roll Number': 'CS-2026-101',
      'First Name': 'Liam',
      'Last Name': 'Vance',
      'Institutional Email': 'liam.vance@university.edu',
      'Phone': '+1 (555) 234-5678',
      'Department': 'Computer Science',
      'Academic Year': 'Year 1',
      'Semester': 'Semester 1',
      'GPA (4.0 Scale)': 3.85,
      'Enrollment Status': 'Active',
      'Attendance (%)': 96,
      'Remarks / Notes': 'Sample imported record',
    },
    {
      'Roll Number': 'DS-2026-102',
      'First Name': 'Chloe',
      'Last Name': 'Dubois',
      'Institutional Email': 'chloe.dubois@university.edu',
      'Phone': '+1 (555) 876-5432',
      'Department': 'Data Science',
      'Academic Year': 'Year 2',
      'Semester': 'Semester 1',
      'GPA (4.0 Scale)': 3.72,
      'Enrollment Status': 'Active',
      'Attendance (%)': 92,
      'Remarks / Notes': 'Sample imported record',
    },
    {
      'Roll Number': 'EE-2026-103',
      'First Name': 'Mateo',
      'Last Name': 'Silva',
      'Institutional Email': 'mateo.silva@university.edu',
      'Phone': '+1 (555) 654-3210',
      'Department': 'Electrical Engineering',
      'Academic Year': 'Year 3',
      'Semester': 'Semester 2',
      'GPA (4.0 Scale)': 3.91,
      'Enrollment Status': 'Active',
      'Attendance (%)': 98,
      'Remarks / Notes': 'Dean List candidate',
    },
  ];

  const ws = XLSX.utils.json_to_sheet(sampleData);
  ws['!cols'] = [
    { wch: 15 },
    { wch: 14 },
    { wch: 14 },
    { wch: 28 },
    { wch: 18 },
    { wch: 22 },
    { wch: 14 },
    { wch: 12 },
    { wch: 15 },
    { wch: 18 },
    { wch: 14 },
    { wch: 25 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Template');
  XLSX.writeFile(wb, 'student_import_template.xlsx');
}
