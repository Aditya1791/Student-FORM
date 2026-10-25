import { Student, StudentFilters, StudentStats, AcademicStanding, CreateStudentDto, AttendanceEntry } from '../types/student';

export function calculateAcademicStanding(gpa: number): AcademicStanding {
  if (gpa >= 3.9) return 'Summa Cum Laude';
  if (gpa >= 3.7) return 'Magna Cum Laude';
  if (gpa >= 3.5) return 'Cum Laude';
  if (gpa >= 2.5) return 'Good Standing';
  return 'Academic Warning';
}

export function formatGpa(gpa: number | undefined | null): string {
  if (typeof gpa !== 'number' || isNaN(gpa)) return '0.00';
  return gpa.toFixed(2);
}

export function validateStudentPayload(data: Partial<CreateStudentDto>): {
  isValid: boolean;
  errors: Record<string, string>;
} {
  const errors: Record<string, string> = {};

  if (!data.rollNumber?.trim()) {
    errors.rollNumber = 'Roll number / Student ID is required';
  } else if (!/^[A-Za-z0-9-_]+$/.test(data.rollNumber.trim())) {
    errors.rollNumber = 'Roll number must contain only letters, numbers, hyphens or underscores';
  }

  if (!data.firstName?.trim()) {
    errors.firstName = 'First name is required';
  }

  if (!data.lastName?.trim()) {
    errors.lastName = 'Last name is required';
  }

  if (!data.email?.trim()) {
    errors.email = 'Email address is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
    errors.email = 'Enter a valid email address';
  }

  if (data.phone && !/^[0-9+\s()-]{7,20}$/.test(data.phone.trim())) {
    errors.phone = 'Enter a valid phone number (at least 7 digits)';
  }

  if (!data.department?.trim()) {
    errors.department = 'Department is required';
  }

  if (typeof data.gpa !== 'number' || isNaN(data.gpa)) {
    errors.gpa = 'GPA is required and must be a number';
  } else if (data.gpa < 0 || data.gpa > 4.0) {
    errors.gpa = 'GPA must be between 0.00 and 4.00';
  }

  if (data.attendanceRate !== undefined && (data.attendanceRate < 0 || data.attendanceRate > 100)) {
    errors.attendanceRate = 'Attendance rate must be between 0% and 100%';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function filterStudents(students: Student[], filters: StudentFilters): Student[] {
  const searchLower = (filters.search || '').trim().toLowerCase();

  const filtered = students.filter((s) => {
    // Search match
    if (searchLower) {
      const fullName = `${s.firstName} ${s.lastName}`.toLowerCase();
      const matchesSearch =
        fullName.includes(searchLower) ||
        s.rollNumber.toLowerCase().includes(searchLower) ||
        s.email.toLowerCase().includes(searchLower) ||
        s.department.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }

    // Department match
    if (filters.department && filters.department !== 'All') {
      if (s.department !== filters.department) return false;
    }

    // Status match
    if (filters.status && filters.status !== 'All') {
      if (s.status !== filters.status) return false;
    }

    return true;
  });

  // Sorting
  return [...filtered].sort((a, b) => {
    let comparison = 0;
    if (filters.sortBy === 'name') {
      comparison = `${a.lastName} ${a.firstName}`.localeCompare(`${b.lastName} ${b.firstName}`);
    } else if (filters.sortBy === 'rollNumber') {
      comparison = a.rollNumber.localeCompare(b.rollNumber, undefined, { numeric: true });
    } else if (filters.sortBy === 'gpa') {
      comparison = a.gpa - b.gpa;
    } else if (filters.sortBy === 'createdAt') {
      comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }
    return filters.sortOrder === 'desc' ? -comparison : comparison;
  });
}

export function computeStudentStats(students: Student[]): StudentStats {
  const totalStudents = students.length;
  if (totalStudents === 0) {
    return {
      totalStudents: 0,
      activeStudents: 0,
      averageGpa: 0,
      honorsCount: 0,
      atRiskCount: 0,
      departmentCounts: {},
    };
  }

  let activeStudents = 0;
  let totalGpa = 0;
  let honorsCount = 0;
  let atRiskCount = 0;
  const departmentCounts: Record<string, number> = {};

  for (const s of students) {
    if (s.status === 'Active') {
      activeStudents++;
    }

    totalGpa += s.gpa;

    if (s.gpa >= 3.5) {
      honorsCount++;
    } else if (s.gpa < 2.5) {
      atRiskCount++;
    }

    const dept = s.department || 'Unassigned';
    departmentCounts[dept] = (departmentCounts[dept] || 0) + 1;
  }

  const averageGpa = Number((totalGpa / totalStudents).toFixed(2));

  return {
    totalStudents,
    activeStudents,
    averageGpa,
    honorsCount,
    atRiskCount,
    departmentCounts,
  };
}

export interface GpaBucket {
  bracket: string;
  standing: string;
  count: number;
  percentage: number;
  color: string;
}

export function computeGpaDistribution(students: Student[]): GpaBucket[] {
  const buckets: { bracket: string; standing: string; min: number; max: number; color: string }[] = [
    { bracket: '< 2.50', standing: 'Warning', min: 0, max: 2.499, color: '#f43f5e' },
    { bracket: '2.50 - 2.99', standing: 'Satisfactory', min: 2.5, max: 2.999, color: '#fb923c' },
    { bracket: '3.00 - 3.49', standing: 'Good Standing', min: 3.0, max: 3.499, color: '#3b82f6' },
    { bracket: '3.50 - 3.69', standing: 'Cum Laude', min: 3.5, max: 3.699, color: '#6366f1' },
    { bracket: '3.70 - 3.89', standing: 'Magna Cum Laude', min: 3.7, max: 3.899, color: '#8b5cf6' },
    { bracket: '3.90 - 4.00', standing: 'Summa Cum Laude', min: 3.9, max: 4.0, color: '#10b981' },
  ];

  const total = students.length;

  return buckets.map((b) => {
    const count = students.filter((s) => s.gpa >= b.min && s.gpa <= b.max).length;
    const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
    return {
      bracket: b.bracket,
      standing: b.standing,
      count,
      percentage,
      color: b.color,
    };
  });
}

export interface CohortTrend {
  year: string;
  avgGpa: number;
  avgAttendance: number;
  count: number;
}

export function computeCohortTrends(students: Student[]): CohortTrend[] {
  const years = ['Year 1', 'Year 2', 'Year 3', 'Year 4'];

  return years.map((year) => {
    const cohortStudents = students.filter((s) => s.academicYear === year);
    const count = cohortStudents.length;

    if (count === 0) {
      return {
        year,
        avgGpa: 0,
        avgAttendance: 0,
        count: 0,
      };
    }

    const totalGpa = cohortStudents.reduce((acc, s) => acc + s.gpa, 0);
    const totalAttendance = cohortStudents.reduce((acc, s) => acc + (s.attendanceRate || 0), 0);

    return {
      year,
      avgGpa: Number((totalGpa / count).toFixed(2)),
      avgAttendance: Math.round(totalAttendance / count),
      count,
    };
  });
}

export interface HighlightSegment {
  text: string;
  isMatch: boolean;
}

export function getHighlightedParts(text: string, query: string): HighlightSegment[] {
  if (!text) return [];
  const trimmed = query ? query.trim() : '';
  if (!trimmed) {
    return [{ text, isMatch: false }];
  }

  const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escaped})`, 'gi');
  const parts = text.split(regex);

  return parts
    .filter((part) => part.length > 0)
    .map((part) => ({
      text: part,
      isMatch: part.toLowerCase() === trimmed.toLowerCase(),
    }));
}

export function calculateAttendancePercentage(logs: AttendanceEntry[]): number {
  if (!logs || logs.length === 0) return 100;

  let score = 0;
  for (const log of logs) {
    if (log.status === 'present' || log.status === 'excused') {
      score += 1.0;
    } else if (log.status === 'late') {
      score += 0.75;
    }
  }

  return Math.round((score / logs.length) * 100);
}

export function getAttendanceColor(rate: number) {
  if (rate >= 90) {
    return {
      text: 'text-emerald-700',
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      bar: 'bg-emerald-500',
      status: 'Excellent',
    };
  }
  if (rate >= 75) {
    return {
      text: 'text-amber-700',
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      bar: 'bg-amber-500',
      status: 'Satisfactory',
    };
  }
  return {
    text: 'text-rose-700',
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    bar: 'bg-rose-500',
    status: 'At Risk',
  };
}



