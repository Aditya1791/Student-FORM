import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeStudentRow } from './excelLogic';

test('normalizeStudentRow correctly parses standard column names', () => {
  const row = {
    rollNumber: 'CS-2024-501',
    firstName: 'Jordan',
    lastName: 'Lee',
    email: 'jordan.lee@university.edu',
    phone: '555-4321',
    department: 'Computer Science',
    gpa: 3.82,
    status: 'Active',
    attendance: 94,
  };

  const result = normalizeStudentRow(row);
  assert.equal(result.error, undefined);
  assert.ok(result.student);
  assert.equal(result.student.rollNumber, 'CS-2024-501');
  assert.equal(result.student.firstName, 'Jordan');
  assert.equal(result.student.lastName, 'Lee');
  assert.equal(result.student.gpa, 3.82);
  assert.equal(result.student.attendanceRate, 94);
});

test('normalizeStudentRow parses headers with spaces and special symbols (Export / Template format)', () => {
  const exportedRow = {
    'SL No': 1,
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
    'Remarks / Notes': 'Dean List candidate',
  };

  const result = normalizeStudentRow(exportedRow);
  assert.equal(result.error, undefined);
  assert.ok(result.student);
  assert.equal(result.student.rollNumber, 'CS-2026-101');
  assert.equal(result.student.firstName, 'Liam');
  assert.equal(result.student.lastName, 'Vance');
  assert.equal(result.student.email, 'liam.vance@university.edu');
  assert.equal(result.student.gpa, 3.85);
  assert.equal(result.student.attendanceRate, 96);
  assert.equal(result.student.notes, 'Dean List candidate');
});

test('normalizeStudentRow accepts alternate roll number variations', () => {
  const variations = [
    { 'Roll No': 'R-01', 'First Name': 'A', 'Last Name': 'B', 'Email': 'a@u.edu', 'GPA': 3.5 },
    { 'Roll No.': 'R-02', 'Name': 'A B', 'Email': 'a@u.edu', 'GPA': 3.5 },
    { 'Roll_Number': 'R-03', 'Name': 'A B', 'Email': 'a@u.edu', 'GPA': 3.5 },
    { 'Student ID': 'R-04', 'Name': 'A B', 'Email': 'a@u.edu', 'GPA': 3.5 },
    { 'Registration Number': 'R-05', 'Name': 'A B', 'Email': 'a@u.edu', 'GPA': 3.5 },
  ];

  variations.forEach((row, i) => {
    const res = normalizeStudentRow(row);
    assert.equal(res.error, undefined, `Failed for variation ${i}: ${JSON.stringify(row)}`);
    assert.ok(res.student);
    assert.ok(res.student.rollNumber.startsWith('R-0'));
  });
});

test('normalizeStudentRow splits full name when first/last not separated', () => {
  const row = {
    roll_number: 'ME-2023-909',
    name: 'Maya Lin Angelou',
    email: 'maya@university.edu',
    gpa: '3.65',
    dept: 'Mechanical Engineering',
  };

  const result = normalizeStudentRow(row);
  assert.equal(result.error, undefined);
  assert.ok(result.student);
  assert.equal(result.student.firstName, 'Maya');
  assert.equal(result.student.lastName, 'Lin Angelou');
  assert.equal(result.student.gpa, 3.65);
});

test('normalizeStudentRow handles empty rows gracefully', () => {
  const emptyRow1 = {};
  const emptyRow2 = { '': '', 'Roll Number': '', 'Name': '   ' };

  assert.equal(normalizeStudentRow(emptyRow1).isEmpty, true);
  assert.equal(normalizeStudentRow(emptyRow2).isEmpty, true);
});

test('normalizeStudentRow converts 10-point GPA scale and percentage attendance', () => {
  const row = {
    'Roll Number': 'EE-100',
    'Name': 'Carlos Gomez',
    'Email': 'carlos@univ.edu',
    'GPA': 8.5, // 10-point scale: 8.5 / 10 * 4 = 3.4
    'Attendance': '95%',
  };

  const res = normalizeStudentRow(row);
  assert.equal(res.error, undefined);
  assert.ok(res.student);
  assert.equal(res.student.gpa, 3.4);
  assert.equal(res.student.attendanceRate, 95);
});

test('normalizeStudentRow reports validation errors for invalid rows', () => {
  // Missing roll number when other data exists
  const r1 = normalizeStudentRow({ name: 'Test User', email: 'test@u.edu', gpa: 3.5 });
  assert.ok(r1.error?.includes('Missing Roll Number'));

  // Invalid email
  const r2 = normalizeStudentRow({ roll: '123', name: 'Test', email: 'invalid-email' });
  assert.ok(r2.error?.includes('invalid email'));

  // Negative GPA
  const r3 = normalizeStudentRow({ roll: '123', name: 'Test', email: 't@u.edu', gpa: -1 });
  assert.ok(r3.error?.includes('invalid GPA'));
});
