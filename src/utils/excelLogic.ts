import { CreateStudentDto } from '../types/student';

export interface ParsedExcelRow {
  rollNumber?: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  email?: string;
  phone?: string;
  department?: string;
  academicYear?: string;
  semester?: string;
  gpa?: number | string;
  status?: string;
  attendanceRate?: number | string;
  notes?: string;
  address?: string;
}

export interface NormalizeRowResult {
  student?: CreateStudentDto;
  error?: string;
  isEmpty?: boolean;
}

/**
 * Normalizes a key by lowercasing and stripping all non-alphanumeric characters.
 * E.g. "Roll Number", "roll_number", "Roll-Number", "Roll No.", "Roll #" all become "rollnumber" or "rollno" or "roll".
 */
export function cleanKey(str: string): string {
  return String(str || '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

/**
 * Robust value extractor from an Excel row object.
 * Searches with normalized keys, exact matches, prefixes, and common synonyms.
 */
export function getVal(row: Record<string, any>, ...candidateKeys: string[]): any {
  if (!row || typeof row !== 'object') return undefined;

  const rowEntries = Object.entries(row);
  const normalizedCandidates = candidateKeys.map(cleanKey);

  // 1. First pass: exact normalized key match
  for (const [rawKey, val] of rowEntries) {
    if (val === undefined || val === null || String(val).trim() === '') continue;
    const cleanedRaw = cleanKey(rawKey);
    if (normalizedCandidates.includes(cleanedRaw)) {
      return val;
    }
  }

  // 2. Second pass: prefix / suffix / substring match
  for (const [rawKey, val] of rowEntries) {
    if (val === undefined || val === null || String(val).trim() === '') continue;
    const cleanedRaw = cleanKey(rawKey);
    for (const cand of normalizedCandidates) {
      if (cand.length >= 3 && (cleanedRaw.startsWith(cand) || cleanedRaw.endsWith(cand) || cleanedRaw.includes(cand))) {
        return val;
      }
    }
  }

  return undefined;
}

export function normalizeStudentRow(row: Record<string, any>): NormalizeRowResult {
  if (!row || typeof row !== 'object') {
    return { isEmpty: true };
  }

  // Check if row has any non-empty cell at all
  const hasAnyData = Object.values(row).some(
    (v) => v !== null && v !== undefined && String(v).trim() !== ''
  );
  if (!hasAnyData) {
    return { isEmpty: true };
  }

  // 1. Roll Number - support every possible column name variation
  const rawRoll = getVal(
    row,
    'rollnumber',
    'roll_number',
    'roll number',
    'rollno',
    'roll_no',
    'roll no',
    'roll no.',
    'roll',
    'studentid',
    'student_id',
    'student id',
    'regno',
    'reg_no',
    'reg no',
    'registrationnumber',
    'registration_number',
    'registration number',
    'enrollmentno',
    'enrollment_no',
    'enrollmentnumber',
    'enrollment number',
    'id'
  );

  const rollNumber = String(rawRoll !== undefined && rawRoll !== null ? rawRoll : '').trim();
  if (!rollNumber) {
    return { error: 'Missing Roll Number' };
  }

  // 2. First and Last Name (or Full Name split)
  let firstName = String(
    getVal(row, 'firstname', 'first_name', 'first name', 'fname', 'givenname', 'first') || ''
  ).trim();

  let lastName = String(
    getVal(row, 'lastname', 'last_name', 'last name', 'lname', 'surname', 'familyname', 'last') || ''
  ).trim();

  const fullName = String(
    getVal(row, 'name', 'fullname', 'full_name', 'full name', 'studentname', 'student_name', 'student name') || ''
  ).trim();

  if ((!firstName || !lastName) && fullName) {
    const parts = fullName.split(/\s+/);
    firstName = firstName || parts[0] || '';
    lastName = lastName || parts.slice(1).join(' ') || parts[0];
  }

  if (!firstName) {
    return { error: `Row with Roll "${rollNumber}" is missing First Name` };
  }

  // 3. Email
  const email = String(
    getVal(
      row,
      'email',
      'emailaddress',
      'email_address',
      'email address',
      'institutionalemail',
      'institutional_email',
      'institutional email',
      'mail',
      'e-mail'
    ) || ''
  ).trim();

  if (!email || !email.includes('@')) {
    return { error: `Row with Roll "${rollNumber}" has missing or invalid email` };
  }

  // 4. GPA (Supports 4.0, 10.0 scale, and percentage formats)
  const rawGpa = getVal(
    row,
    'gpa',
    'gpa40scale',
    'gpa 4.0 scale',
    'gpa40',
    'cgpa',
    'grade_point_average',
    'gradepointaverage',
    'grade point average',
    'marks',
    'score'
  );

  let gpa = typeof rawGpa === 'number' ? rawGpa : parseFloat(String(rawGpa || '0'));
  if (isNaN(gpa) || gpa < 0) {
    return { error: `Row with Roll "${rollNumber}" has invalid GPA: "${rawGpa}"` };
  }

  // Auto-normalize GPA if given on 10.0 or 100% scale
  if (gpa > 4.0 && gpa <= 10.0) {
    gpa = (gpa / 10.0) * 4.0;
  } else if (gpa > 10.0 && gpa <= 100.0) {
    gpa = (gpa / 100.0) * 4.0;
  }

  if (gpa > 4.0) {
    return { error: `Row with Roll "${rollNumber}" has invalid GPA: "${rawGpa}" (must be 0.00 - 4.00)` };
  }

  // 5. Attendance Rate (handles 0.95 or 95 or "95%")
  const rawAttendance = getVal(
    row,
    'attendance',
    'attendance%',
    'attendance (%)',
    'attendancerate',
    'attendance_rate',
    'attendance rate',
    'attendancepercentage',
    'attendance percentage'
  );

  let attendanceRate = 90;
  if (rawAttendance !== undefined && rawAttendance !== null && String(rawAttendance).trim() !== '') {
    const cleanAttStr = String(rawAttendance).replace(/%/g, '').trim();
    let parsedAtt = typeof rawAttendance === 'number' ? rawAttendance : parseFloat(cleanAttStr);
    if (!isNaN(parsedAtt)) {
      if (parsedAtt <= 1.0 && parsedAtt > 0) {
        parsedAtt = parsedAtt * 100; // 0.95 -> 95%
      }
      attendanceRate = Math.min(100, Math.max(0, parsedAtt));
    }
  }

  // 6. Department
  const department = String(
    getVal(row, 'department', 'dept', 'major', 'branch', 'course', 'stream', 'program') || 'Computer Science'
  ).trim();

  // 7. Academic Year
  const academicYear = String(
    getVal(row, 'academicyear', 'academic_year', 'academic year', 'year', 'classyear', 'class_year', 'class year', 'batch') || 'Year 1'
  ).trim();

  // 8. Semester
  const semester = String(getVal(row, 'semester', 'sem', 'term') || 'Semester 1').trim();

  // 9. Phone
  const rawPhone = String(
    getVal(row, 'phone', 'phonenumber', 'phone_number', 'phone number', 'mobile', 'mobilenumber', 'contact', 'contactnumber', 'cell', 'tel') || ''
  ).trim();

  // 10. Enrollment Status
  const rawStatus = String(
    getVal(row, 'status', 'enrollmentstatus', 'enrollment_status', 'enrollment status', 'studentstatus') || 'Active'
  ).trim();

  const status: any = ['Active', 'On Leave', 'Graduated', 'Suspended'].includes(rawStatus)
    ? rawStatus
    : 'Active';

  // 11. Optional Metadata
  const dateOfBirth = String(getVal(row, 'dateofbirth', 'date_of_birth', 'date of birth', 'dob', 'birthdate') || '').trim() || undefined;
  const gender = String(getVal(row, 'gender', 'sex') || '').trim() || undefined;
  const address = String(getVal(row, 'address', 'residence', 'residentialaddress') || '').trim() || undefined;
  const notes = String(getVal(row, 'notes', 'remarks', 'remarksnotes', 'remarks / notes', 'comments') || '').trim() || undefined;

  const emergencyName = String(getVal(row, 'emergencycontact', 'emergency_contact', 'emergency name', 'guardian name') || '').trim();
  const emergencyPhone = String(getVal(row, 'emergencyphone', 'emergency_phone', 'emergency phone', 'guardian phone') || '').trim();

  return {
    student: {
      rollNumber,
      firstName,
      lastName: lastName || firstName,
      email,
      phone: rawPhone,
      department,
      academicYear,
      semester,
      gpa: Number(gpa.toFixed(2)),
      status,
      attendanceRate: Math.round(attendanceRate),
      dateOfBirth,
      gender: gender as any,
      address,
      emergencyContact: emergencyName
        ? {
            name: emergencyName,
            relationship: 'Guardian',
            phone: emergencyPhone || '',
          }
        : undefined,
      courses: [],
      notes,
    },
  };
}
