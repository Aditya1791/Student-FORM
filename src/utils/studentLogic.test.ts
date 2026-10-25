import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateAcademicStanding,
  formatGpa,
  validateStudentPayload,
  filterStudents,
  computeStudentStats,
  computeGpaDistribution,
  computeCohortTrends,
  getHighlightedParts,
  calculateAttendancePercentage,
  getAttendanceColor,
} from './studentLogic';
import { Student, StudentFilters } from '../types/student';

test('calculateAcademicStanding assigns correct honors and warnings', () => {
  assert.equal(calculateAcademicStanding(4.0), 'Summa Cum Laude');
  assert.equal(calculateAcademicStanding(3.92), 'Summa Cum Laude');
  assert.equal(calculateAcademicStanding(3.8), 'Magna Cum Laude');
  assert.equal(calculateAcademicStanding(3.55), 'Cum Laude');
  assert.equal(calculateAcademicStanding(3.2), 'Good Standing');
  assert.equal(calculateAcademicStanding(2.5), 'Good Standing');
  assert.equal(calculateAcademicStanding(2.1), 'Academic Warning');
  assert.equal(calculateAcademicStanding(1.8), 'Academic Warning');
});

test('formatGpa handles numbers and edge cases', () => {
  assert.equal(formatGpa(3.8), '3.80');
  assert.equal(formatGpa(4), '4.00');
  assert.equal(formatGpa(null as unknown as number), '0.00');
  assert.equal(formatGpa(NaN), '0.00');
});

test('validateStudentPayload catches missing required fields and format issues', () => {
  const invalidResult = validateStudentPayload({
    rollNumber: '',
    firstName: '',
    lastName: '',
    email: 'not-an-email',
    gpa: 4.8,
  });

  assert.equal(invalidResult.isValid, false);
  assert.ok(invalidResult.errors.rollNumber);
  assert.ok(invalidResult.errors.firstName);
  assert.ok(invalidResult.errors.lastName);
  assert.ok(invalidResult.errors.email);
  assert.ok(invalidResult.errors.gpa);

  const validResult = validateStudentPayload({
    rollNumber: 'CS-2024-001',
    firstName: 'Alex',
    lastName: 'Rivera',
    email: 'alex.rivera@university.edu',
    department: 'Computer Science',
    gpa: 3.85,
    attendanceRate: 95,
  });

  assert.equal(validResult.isValid, true);
  assert.equal(Object.keys(validResult.errors).length, 0);
});

test('filterStudents searches by name, roll number, department, and status', () => {
  const mockStudents: Student[] = [
    {
      id: '1',
      rollNumber: 'CS-101',
      firstName: 'Emily',
      lastName: 'Chen',
      email: 'emily@univ.edu',
      phone: '555-0101',
      department: 'Computer Science',
      academicYear: 'Year 3',
      semester: 'Semester 1',
      gpa: 3.95,
      status: 'Active',
      courses: [],
      attendanceRate: 96,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    },
    {
      id: '2',
      rollNumber: 'ME-202',
      firstName: 'Marcus',
      lastName: 'Vance',
      email: 'marcus@univ.edu',
      phone: '555-0202',
      department: 'Mechanical Engineering',
      academicYear: 'Year 2',
      semester: 'Semester 2',
      gpa: 2.3,
      status: 'On Leave',
      courses: [],
      attendanceRate: 78,
      createdAt: '2024-01-02T00:00:00.000Z',
      updatedAt: '2024-01-02T00:00:00.000Z',
    },
    {
      id: '3',
      rollNumber: 'EE-303',
      firstName: 'Sarah',
      lastName: 'Connor',
      email: 'sarah@univ.edu',
      phone: '555-0303',
      department: 'Electrical Engineering',
      academicYear: 'Year 4',
      semester: 'Semester 1',
      gpa: 3.6,
      status: 'Active',
      courses: [],
      attendanceRate: 91,
      createdAt: '2024-01-03T00:00:00.000Z',
      updatedAt: '2024-01-03T00:00:00.000Z',
    },
  ];

  // Search by roll number
  const r1 = filterStudents(mockStudents, {
    search: 'CS-101',
    department: 'All',
    status: 'All',
    sortBy: 'name',
    sortOrder: 'asc',
  });
  assert.equal(r1.length, 1);
  assert.equal(r1[0].firstName, 'Emily');

  // Filter by department
  const r2 = filterStudents(mockStudents, {
    search: '',
    department: 'Mechanical Engineering',
    status: 'All',
    sortBy: 'name',
    sortOrder: 'asc',
  });
  assert.equal(r2.length, 1);
  assert.equal(r2[0].lastName, 'Vance');

  // Filter by status
  const r3 = filterStudents(mockStudents, {
    search: '',
    department: 'All',
    status: 'Active',
    sortBy: 'gpa',
    sortOrder: 'desc',
  });
  assert.equal(r3.length, 2);
  assert.equal(r3[0].gpa, 3.95);
  assert.equal(r3[1].gpa, 3.6);
});

test('computeStudentStats computes aggregates correctly', () => {
  const mockStudents: Student[] = [
    {
      id: '1',
      rollNumber: 'CS-101',
      firstName: 'A',
      lastName: 'A',
      email: 'a@u.edu',
      phone: '',
      department: 'Computer Science',
      academicYear: 'Year 1',
      semester: 'Semester 1',
      gpa: 3.8,
      status: 'Active',
      courses: [],
      attendanceRate: 90,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    },
    {
      id: '2',
      rollNumber: 'CS-102',
      firstName: 'B',
      lastName: 'B',
      email: 'b@u.edu',
      phone: '',
      department: 'Computer Science',
      academicYear: 'Year 1',
      semester: 'Semester 1',
      gpa: 2.2,
      status: 'On Leave',
      courses: [],
      attendanceRate: 80,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    },
  ];

  const stats = computeStudentStats(mockStudents);
  assert.equal(stats.totalStudents, 2);
  assert.equal(stats.activeStudents, 1);
  assert.equal(stats.averageGpa, 3.0);
  assert.equal(stats.honorsCount, 1);
  assert.equal(stats.atRiskCount, 1);
  assert.equal(stats.departmentCounts['Computer Science'], 2);
});

test('computeGpaDistribution distributes students into correct brackets', () => {
  const students: Student[] = [
    { id: '1', rollNumber: '1', firstName: 'A', lastName: 'A', email: 'a@u.edu', phone: '', department: 'CS', academicYear: 'Year 1', semester: 'Semester 1', gpa: 3.95, status: 'Active', courses: [], attendanceRate: 95, createdAt: '', updatedAt: '' },
    { id: '2', rollNumber: '2', firstName: 'B', lastName: 'B', email: 'b@u.edu', phone: '', department: 'CS', academicYear: 'Year 2', semester: 'Semester 1', gpa: 3.75, status: 'Active', courses: [], attendanceRate: 90, createdAt: '', updatedAt: '' },
    { id: '3', rollNumber: '3', firstName: 'C', lastName: 'C', email: 'c@u.edu', phone: '', department: 'CS', academicYear: 'Year 3', semester: 'Semester 1', gpa: 2.1, status: 'Active', courses: [], attendanceRate: 70, createdAt: '', updatedAt: '' },
  ];

  const dist = computeGpaDistribution(students);
  assert.equal(dist.length, 6);

  const summaBucket = dist.find((b) => b.bracket === '3.90 - 4.00');
  assert.equal(summaBucket?.count, 1);

  const magnaBucket = dist.find((b) => b.bracket === '3.70 - 3.89');
  assert.equal(magnaBucket?.count, 1);

  const warningBucket = dist.find((b) => b.bracket === '< 2.50');
  assert.equal(warningBucket?.count, 1);
});

test('computeCohortTrends calculates averages per year', () => {
  const students: Student[] = [
    { id: '1', rollNumber: '1', firstName: 'A', lastName: 'A', email: 'a@u.edu', phone: '', department: 'CS', academicYear: 'Year 1', semester: 'Semester 1', gpa: 3.8, status: 'Active', courses: [], attendanceRate: 90, createdAt: '', updatedAt: '' },
    { id: '2', rollNumber: '2', firstName: 'B', lastName: 'B', email: 'b@u.edu', phone: '', department: 'CS', academicYear: 'Year 1', semester: 'Semester 1', gpa: 3.6, status: 'Active', courses: [], attendanceRate: 100, createdAt: '', updatedAt: '' },
    { id: '3', rollNumber: '3', firstName: 'C', lastName: 'C', email: 'c@u.edu', phone: '', department: 'CS', academicYear: 'Year 2', semester: 'Semester 1', gpa: 3.0, status: 'Active', courses: [], attendanceRate: 85, createdAt: '', updatedAt: '' },
  ];

  const trends = computeCohortTrends(students);
  assert.equal(trends.length, 4);

  const y1 = trends.find((t) => t.year === 'Year 1');
  assert.equal(y1?.count, 2);
  assert.equal(y1?.avgGpa, 3.7);
  assert.equal(y1?.avgAttendance, 95);

  const y2 = trends.find((t) => t.year === 'Year 2');
  assert.equal(y2?.count, 1);
  assert.equal(y2?.avgGpa, 3.0);
  assert.equal(y2?.avgAttendance, 85);
});

test('getHighlightedParts splits and matches text case-insensitively', () => {
  // Empty query returns whole text unmatched
  const p1 = getHighlightedParts('Computer Science', '');
  assert.deepEqual(p1, [{ text: 'Computer Science', isMatch: false }]);

  // Match in the middle
  const p2 = getHighlightedParts('Computer Science', 'uter');
  assert.equal(p2.length, 3);
  assert.equal(p2[0].text, 'Comp');
  assert.equal(p2[0].isMatch, false);
  assert.equal(p2[1].text, 'uter');
  assert.equal(p2[1].isMatch, true);
  assert.equal(p2[2].text, ' Science');
  assert.equal(p2[2].isMatch, false);

  // Case-insensitive match at beginning
  const p3 = getHighlightedParts('sophia.martinez@university.edu', 'SOPHIA');
  assert.equal(p3[0].text, 'sophia');
  assert.equal(p3[0].isMatch, true);

  // Regex special characters do not crash
  const p4 = getHighlightedParts('CS-2023-014 (Dean)', '(Dean)');
  assert.equal(p4.some((p) => p.isMatch && p.text === '(Dean)'), true);
});

test('calculateAttendancePercentage calculates accurate percentage scores', () => {
  assert.equal(calculateAttendancePercentage([]), 100);

  const logs = [
    { id: '1', date: '2026-10-21', status: 'present' as const, recordedAt: '' },
    { id: '2', date: '2026-10-22', status: 'present' as const, recordedAt: '' },
    { id: '3', date: '2026-10-23', status: 'late' as const, recordedAt: '' },
    { id: '4', date: '2026-10-24', status: 'absent' as const, recordedAt: '' },
  ];

  // (1 + 1 + 0.75 + 0) / 4 = 2.75 / 4 = 68.75% -> 69%
  assert.equal(calculateAttendancePercentage(logs), 69);

  // All present
  const allPresent = [
    { id: '1', date: '2026-10-21', status: 'present' as const, recordedAt: '' },
    { id: '2', date: '2026-10-22', status: 'present' as const, recordedAt: '' },
  ];
  assert.equal(calculateAttendancePercentage(allPresent), 100);
});

test('getAttendanceColor assigns appropriate severity color classes', () => {
  const high = getAttendanceColor(95);
  assert.equal(high.status, 'Excellent');
  assert.ok(high.text.includes('emerald'));

  const med = getAttendanceColor(80);
  assert.equal(med.status, 'Satisfactory');
  assert.ok(med.text.includes('amber'));

  const low = getAttendanceColor(65);
  assert.equal(low.status, 'At Risk');
  assert.ok(low.text.includes('rose'));
});



