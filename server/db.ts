import fs from 'node:fs';
import path from 'node:path';
import { Student, CreateStudentDto, UpdateStudentDto, StudentFilters, StudentStats, AttendanceEntry, AttendanceStatus } from '../src/types/student';
import { filterStudents, computeStudentStats, validateStudentPayload, calculateAttendancePercentage } from '../src/utils/studentLogic';

const DB_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'students.json');

const INITIAL_SEED_STUDENTS: Student[] = [
  {
    id: 'std_01',
    rollNumber: 'CS-2023-014',
    firstName: 'Sophia',
    lastName: 'Martinez',
    email: 'sophia.martinez@university.edu',
    phone: '+1 (555) 234-5678',
    department: 'Computer Science',
    academicYear: 'Year 3',
    semester: 'Semester 1',
    gpa: 3.92,
    status: 'Active',
    dateOfBirth: '2003-04-12',
    gender: 'Female',
    address: '412 Academic Way, Suite 3B, Boston, MA',
    emergencyContact: {
      name: 'Elena Martinez',
      relationship: 'Mother',
      phone: '+1 (555) 987-6543',
    },
    courses: [
      { id: 'c1', code: 'CS301', title: 'Data Structures & Algorithms', credits: 4, grade: 'A', semester: 'Fall 2025' },
      { id: 'c2', code: 'CS342', title: 'Operating Systems Architecture', credits: 4, grade: 'A-', semester: 'Fall 2025' },
      { id: 'c3', code: 'MATH210', title: 'Discrete Mathematics', credits: 3, grade: 'A', semester: 'Fall 2025' },
    ],
    attendanceRate: 98,
    notes: 'Teaching Assistant for introductory Python lab; President of ACM student chapter.',
    createdAt: '2023-09-01T08:00:00.000Z',
    updatedAt: '2026-10-15T14:20:00.000Z',
  },
  {
    id: 'std_02',
    rollNumber: 'DS-2022-088',
    firstName: 'Liam',
    lastName: 'Patel',
    email: 'liam.patel@university.edu',
    phone: '+1 (555) 345-6789',
    department: 'Data Science',
    academicYear: 'Year 4',
    semester: 'Semester 2',
    gpa: 3.84,
    status: 'Active',
    dateOfBirth: '2002-11-28',
    gender: 'Male',
    address: '89 Research Blvd, Cambridge, MA',
    emergencyContact: {
      name: 'Rohan Patel',
      relationship: 'Father',
      phone: '+1 (555) 876-5432',
    },
    courses: [
      { id: 'c4', code: 'DS401', title: 'Machine Learning Systems', credits: 4, grade: 'A', semester: 'Spring 2026' },
      { id: 'c5', code: 'DS415', title: 'Applied Deep Learning', credits: 4, grade: 'A', semester: 'Spring 2026' },
      { id: 'c6', code: 'STAT350', title: 'Bayesian Statistical Inference', credits: 3, grade: 'B+', semester: 'Spring 2026' },
    ],
    attendanceRate: 94,
    notes: 'Undergraduate thesis on graph neural networks for molecular property prediction.',
    createdAt: '2022-09-01T09:00:00.000Z',
    updatedAt: '2026-10-18T10:30:00.000Z',
  },
  {
    id: 'std_03',
    rollNumber: 'ME-2024-031',
    firstName: 'Marcus',
    lastName: 'Vance',
    email: 'marcus.vance@university.edu',
    phone: '+1 (555) 456-7890',
    department: 'Mechanical Engineering',
    academicYear: 'Year 2',
    semester: 'Semester 1',
    gpa: 2.85,
    status: 'Active',
    dateOfBirth: '2004-07-19',
    gender: 'Male',
    address: '77 Campus Commons, Apt 12, Boston, MA',
    emergencyContact: {
      name: 'Sarah Vance',
      relationship: 'Guardian',
      phone: '+1 (555) 765-4321',
    },
    courses: [
      { id: 'c7', code: 'ME201', title: 'Thermodynamics I', credits: 4, grade: 'B', semester: 'Fall 2025' },
      { id: 'c8', code: 'ME215', title: 'Fluid Mechanics & Transport', credits: 4, grade: 'C+', semester: 'Fall 2025' },
    ],
    attendanceRate: 86,
    notes: 'Member of the Formula SAE collegiate automotive racing team.',
    createdAt: '2024-09-01T10:00:00.000Z',
    updatedAt: '2026-09-20T16:00:00.000Z',
  },
  {
    id: 'std_04',
    rollNumber: 'EE-2023-059',
    firstName: 'Amara',
    lastName: 'Okonkwo',
    email: 'amara.okonkwo@university.edu',
    phone: '+1 (555) 567-8901',
    department: 'Electrical Engineering',
    academicYear: 'Year 3',
    semester: 'Semester 1',
    gpa: 3.76,
    status: 'Active',
    dateOfBirth: '2003-02-05',
    gender: 'Female',
    address: '302 Beacon St, Somerville, MA',
    emergencyContact: {
      name: 'Chidi Okonkwo',
      relationship: 'Father',
      phone: '+1 (555) 654-3210',
    },
    courses: [
      { id: 'c9', code: 'EE310', title: 'Microelectronic Circuits', credits: 4, grade: 'A', semester: 'Fall 2025' },
      { id: 'c10', code: 'EE325', title: 'Signal Processing & Filtering', credits: 3, grade: 'A-', semester: 'Fall 2025' },
    ],
    attendanceRate: 96,
    notes: 'Recipient of IEEE Undergraduate Leadership Scholarship.',
    createdAt: '2023-09-01T11:00:00.000Z',
    updatedAt: '2026-10-10T11:15:00.000Z',
  },
  {
    id: 'std_05',
    rollNumber: 'BA-2022-104',
    firstName: 'Alexander',
    lastName: 'Wright',
    email: 'alex.wright@university.edu',
    phone: '+1 (555) 678-9012',
    department: 'Business Administration',
    academicYear: 'Year 4',
    semester: 'Semester 2',
    gpa: 3.65,
    status: 'Graduated',
    dateOfBirth: '2002-05-14',
    gender: 'Male',
    address: '150 Financial Center Dr, Boston, MA',
    emergencyContact: {
      name: 'Jessica Wright',
      relationship: 'Sister',
      phone: '+1 (555) 543-2109',
    },
    courses: [
      { id: 'c11', code: 'BUS420', title: 'Corporate Finance & Valuation', credits: 3, grade: 'A-', semester: 'Spring 2026' },
      { id: 'c12', code: 'BUS450', title: 'Strategic Operations Management', credits: 3, grade: 'A', semester: 'Spring 2026' },
    ],
    attendanceRate: 92,
    notes: 'Completed honors capstone; accepted analyst role at global advisory firm.',
    createdAt: '2022-09-01T12:00:00.000Z',
    updatedAt: '2026-06-01T09:00:00.000Z',
  },
  {
    id: 'std_06',
    rollNumber: 'CS-2025-007',
    firstName: 'Zara',
    lastName: 'Khan',
    email: 'zara.khan@university.edu',
    phone: '+1 (555) 789-0123',
    department: 'Computer Science',
    academicYear: 'Year 1',
    semester: 'Semester 1',
    gpa: 3.98,
    status: 'Active',
    dateOfBirth: '2005-09-22',
    gender: 'Female',
    address: '12 Riverview Hall, Room 410, Cambridge, MA',
    emergencyContact: {
      name: 'Farhan Khan',
      relationship: 'Father',
      phone: '+1 (555) 432-1098',
    },
    courses: [
      { id: 'c13', code: 'CS101', title: 'Principles of Computing', credits: 4, grade: 'A+', semester: 'Fall 2025' },
      { id: 'c14', code: 'MATH150', title: 'Calculus for Engineers', credits: 4, grade: 'A', semester: 'Fall 2025' },
    ],
    attendanceRate: 100,
    notes: 'First-year Dean\'s List honoree with perfect attendance record.',
    createdAt: '2025-09-01T08:30:00.000Z',
    updatedAt: '2026-10-20T12:00:00.000Z',
  },
  {
    id: 'std_07',
    rollNumber: 'BIO-2023-042',
    firstName: 'Ethan',
    lastName: 'Kim',
    email: 'ethan.kim@university.edu',
    phone: '+1 (555) 890-1234',
    department: 'Biotechnology',
    academicYear: 'Year 3',
    semester: 'Semester 2',
    gpa: 2.38,
    status: 'On Leave',
    dateOfBirth: '2003-08-30',
    gender: 'Male',
    address: '58 Orchard Lane, Newton, MA',
    emergencyContact: {
      name: 'Grace Kim',
      relationship: 'Mother',
      phone: '+1 (555) 321-0987',
    },
    courses: [
      { id: 'c15', code: 'BIO230', title: 'Cellular Biochemistry', credits: 4, grade: 'C', semester: 'Spring 2026' },
      { id: 'c16', code: 'CHEM220', title: 'Organic Chemistry Lab', credits: 2, grade: 'C+', semester: 'Spring 2026' },
    ],
    attendanceRate: 74,
    notes: 'Medical leave approved for semester; academic recovery plan active.',
    createdAt: '2023-09-01T14:00:00.000Z',
    updatedAt: '2026-09-15T15:45:00.000Z',
  },
  {
    id: 'std_08',
    rollNumber: 'DS-2024-019',
    firstName: 'Chloe',
    lastName: 'Dubois',
    email: 'chloe.dubois@university.edu',
    phone: '+1 (555) 901-2345',
    department: 'Data Science',
    academicYear: 'Year 2',
    semester: 'Semester 1',
    gpa: 3.52,
    status: 'Active',
    dateOfBirth: '2004-03-08',
    gender: 'Female',
    address: '228 Newbury St, Boston, MA',
    emergencyContact: {
      name: 'Pierre Dubois',
      relationship: 'Father',
      phone: '+1 (555) 210-9876',
    },
    courses: [
      { id: 'c17', code: 'DS201', title: 'Applied Data Wrangling', credits: 3, grade: 'A-', semester: 'Fall 2025' },
      { id: 'c18', code: 'STAT200', title: 'Probability for Data Science', credits: 3, grade: 'B+', semester: 'Fall 2025' },
    ],
    attendanceRate: 91,
    notes: 'Active participant in University Hackathon 2025 (1st place data track).',
    createdAt: '2024-09-01T15:30:00.000Z',
    updatedAt: '2026-10-22T09:10:00.000Z',
  },
];

class StudentDatabase {
  private inMemoryCache: Student[] = [];

  constructor() {
    this.init();
  }

  private init() {
    try {
      if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
      }

      if (!fs.existsSync(DB_FILE)) {
        fs.writeFileSync(DB_FILE, JSON.stringify(INITIAL_SEED_STUDENTS, null, 2), 'utf-8');
        this.inMemoryCache = [...INITIAL_SEED_STUDENTS];
      } else {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.inMemoryCache = JSON.parse(raw);
      }
    } catch (err) {
      console.error('Error initializing student database file, falling back to memory seed:', err);
      this.inMemoryCache = [...INITIAL_SEED_STUDENTS];
    }
  }

  private persist() {
    try {
      if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(this.inMemoryCache, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error writing to student database file:', err);
    }
  }

  public getAll(filters?: Partial<StudentFilters>): Student[] {
    const defaultFilters: StudentFilters = {
      search: filters?.search || '',
      department: filters?.department || 'All',
      status: filters?.status || 'All',
      sortBy: filters?.sortBy || 'createdAt',
      sortOrder: filters?.sortOrder || 'desc',
    };

    return filterStudents(this.inMemoryCache, defaultFilters);
  }

  public getById(id: string): Student | undefined {
    return this.inMemoryCache.find((s) => s.id === id);
  }

  public getByRollNumber(rollNumber: string): Student | undefined {
    return this.inMemoryCache.find(
      (s) => s.rollNumber.trim().toLowerCase() === rollNumber.trim().toLowerCase()
    );
  }

  public create(data: CreateStudentDto): { student?: Student; error?: string } {
    const validation = validateStudentPayload(data);
    if (!validation.isValid) {
      return { error: Object.values(validation.errors)[0] };
    }

    const existing = this.getByRollNumber(data.rollNumber);
    if (existing) {
      return { error: `Student with Roll Number "${data.rollNumber}" already exists.` };
    }

    const newId = `std_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    const newStudent: Student = {
      ...data,
      id: newId,
      rollNumber: data.rollNumber.trim(),
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      email: data.email.trim(),
      phone: data.phone?.trim() || '',
      department: data.department.trim(),
      academicYear: data.academicYear || 'Year 1',
      semester: data.semester || 'Semester 1',
      gpa: Number(data.gpa.toFixed(2)),
      status: data.status || 'Active',
      courses: data.courses || [],
      attendanceRate: data.attendanceRate !== undefined ? Number(data.attendanceRate) : 95,
      createdAt: now,
      updatedAt: now,
    };

    this.inMemoryCache.unshift(newStudent);
    this.persist();

    return { student: newStudent };
  }

  public update(id: string, data: UpdateStudentDto): { student?: Student; error?: string } {
    const index = this.inMemoryCache.findIndex((s) => s.id === id);
    if (index === -1) {
      return { error: `Student with ID "${id}" not found.` };
    }

    const current = this.inMemoryCache[index];

    // If rollNumber changed, check uniqueness
    if (data.rollNumber && data.rollNumber.trim().toLowerCase() !== current.rollNumber.toLowerCase()) {
      const existing = this.getByRollNumber(data.rollNumber);
      if (existing && existing.id !== id) {
        return { error: `Student with Roll Number "${data.rollNumber}" already exists.` };
      }
    }

    const merged = { ...current, ...data };
    const validation = validateStudentPayload(merged);
    if (!validation.isValid) {
      return { error: Object.values(validation.errors)[0] };
    }

    const updatedStudent: Student = {
      ...current,
      ...data,
      rollNumber: data.rollNumber ? data.rollNumber.trim() : current.rollNumber,
      firstName: data.firstName ? data.firstName.trim() : current.firstName,
      lastName: data.lastName ? data.lastName.trim() : current.lastName,
      email: data.email ? data.email.trim() : current.email,
      phone: data.phone !== undefined ? data.phone.trim() : current.phone,
      department: data.department ? data.department.trim() : current.department,
      gpa: data.gpa !== undefined ? Number(data.gpa.toFixed(2)) : current.gpa,
      updatedAt: new Date().toISOString(),
    };

    this.inMemoryCache[index] = updatedStudent;
    this.persist();

    return { student: updatedStudent };
  }

  public delete(id: string): { success: boolean; error?: string } {
    const initialLen = this.inMemoryCache.length;
    this.inMemoryCache = this.inMemoryCache.filter((s) => s.id !== id);
    if (this.inMemoryCache.length === initialLen) {
      return { success: false, error: `Student with ID "${id}" was not found.` };
    }
    this.persist();
    return { success: true };
  }

  public getStats(): StudentStats {
    return computeStudentStats(this.inMemoryCache);
  }

  public resetSeed(): Student[] {
    this.inMemoryCache = [...INITIAL_SEED_STUDENTS];
    this.persist();
    return this.inMemoryCache;
  }

  public bulkUpsert(students: CreateStudentDto[]): { added: number; updated: number; errors: string[] } {
    let added = 0;
    let updated = 0;
    const errors: string[] = [];

    for (const dto of students) {
      const validation = validateStudentPayload(dto);
      if (!validation.isValid) {
        errors.push(`Roll "${dto.rollNumber}": ${Object.values(validation.errors)[0]}`);
        continue;
      }

      const existingIndex = this.inMemoryCache.findIndex(
        (s) => s.rollNumber.trim().toLowerCase() === dto.rollNumber.trim().toLowerCase()
      );

      const now = new Date().toISOString();

      if (existingIndex >= 0) {
        const current = this.inMemoryCache[existingIndex];
        this.inMemoryCache[existingIndex] = {
          ...current,
          ...dto,
          gpa: Number(dto.gpa.toFixed(2)),
          updatedAt: now,
        };
        updated++;
      } else {
        const newId = `std_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const newStudent: Student = {
          ...dto,
          id: newId,
          gpa: Number(dto.gpa.toFixed(2)),
          courses: dto.courses || [],
          attendanceRate: dto.attendanceRate !== undefined ? Number(dto.attendanceRate) : 90,
          createdAt: now,
          updatedAt: now,
        };
        this.inMemoryCache.unshift(newStudent);
        added++;
      }
    }

    if (added > 0 || updated > 0) {
      this.persist();
    }

    return { added, updated, errors };
  }

  public recordAttendance(
    studentId: string,
    date: string,
    status: AttendanceStatus,
    notes?: string
  ): { student?: Student; error?: string } {
    const index = this.inMemoryCache.findIndex((s) => s.id === studentId);
    if (index === -1) {
      return { error: `Student with ID "${studentId}" not found.` };
    }

    const student = this.inMemoryCache[index];
    const logs = [...(student.attendanceLogs || [])];

    const existingLogIdx = logs.findIndex((l) => l.date === date);
    const entry: AttendanceEntry = {
      id: `att_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      date,
      status,
      notes,
      recordedAt: new Date().toISOString(),
    };

    if (existingLogIdx >= 0) {
      logs[existingLogIdx] = entry;
    } else {
      logs.unshift(entry);
    }

    const newRate = calculateAttendancePercentage(logs);

    const updatedStudent: Student = {
      ...student,
      attendanceRate: newRate,
      attendanceLogs: logs,
      updatedAt: new Date().toISOString(),
    };

    this.inMemoryCache[index] = updatedStudent;
    this.persist();

    return { student: updatedStudent };
  }

  public recordBulkAttendance(
    date: string,
    records: Array<{ studentId: string; status: AttendanceStatus; notes?: string }>
  ): { updatedCount: number; students: Student[] } {
    let updatedCount = 0;
    const updatedStudents: Student[] = [];

    for (const rec of records) {
      const res = this.recordAttendance(rec.studentId, date, rec.status, rec.notes);
      if (res.student) {
        updatedCount++;
        updatedStudents.push(res.student);
      }
    }

    return { updatedCount, students: updatedStudents };
  }
}

export const studentDb = new StudentDatabase();
