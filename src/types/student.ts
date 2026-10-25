export type EnrollmentStatus = 'Active' | 'On Leave' | 'Graduated' | 'Suspended';

export type AcademicStanding = 'Summa Cum Laude' | 'Magna Cum Laude' | 'Cum Laude' | 'Good Standing' | 'Academic Warning';

export type AttendanceStatus = 'present' | 'late' | 'excused' | 'absent';

export interface AttendanceEntry {
  id: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  notes?: string;
  recordedAt: string;
}

export interface CourseRecord {
  id: string;
  code: string;
  title: string;
  credits: number;
  grade: string;
  semester: string;
}

export interface Student {
  id: string;
  rollNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  department: string;
  academicYear: string; // e.g. "Year 1", "Year 2", "Year 3", "Year 4"
  semester: string; // e.g. "Semester 1", "Semester 2"
  gpa: number; // 0.00 to 4.00
  status: EnrollmentStatus;
  dateOfBirth?: string;
  gender?: 'Male' | 'Female' | 'Other' | 'Prefer not to say';
  address?: string;
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
  courses: CourseRecord[];
  attendanceRate: number; // e.g. 92 (%)
  attendanceLogs?: AttendanceEntry[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type CreateStudentDto = Omit<Student, 'id' | 'createdAt' | 'updatedAt'>;

export type UpdateStudentDto = Partial<CreateStudentDto>;

export interface StudentFilters {
  search: string;
  department: string;
  status: string;
  sortBy: 'name' | 'rollNumber' | 'gpa' | 'createdAt';
  sortOrder: 'asc' | 'desc';
}

export interface StudentStats {
  totalStudents: number;
  activeStudents: number;
  averageGpa: number;
  honorsCount: number; // GPA >= 3.5
  atRiskCount: number; // GPA < 2.5
  departmentCounts: Record<string, number>;
}
