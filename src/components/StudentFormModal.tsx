import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import { Student, CreateStudentDto, EnrollmentStatus } from '../types/student';
import { validateStudentPayload } from '../utils/studentLogic';
import { SORTED_COUNTRY_CODES, parsePhoneNumberWithCountry } from '../utils/countryCodes';

interface StudentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateStudentDto) => Promise<void>;
  initialData?: Student | null;
  departments: string[];
}

export const StudentFormModal: React.FC<StudentFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  departments,
}) => {
  const isEditing = Boolean(initialData);

  const [rollNumber, setRollNumber] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [countryCode, setCountryCode] = useState('+1');
  const [phoneDigits, setPhoneDigits] = useState('');
  const [department, setDepartment] = useState('');
  const [academicYear, setAcademicYear] = useState('Year 1');
  const [semester, setSemester] = useState('Semester 1');
  const [gpa, setGpa] = useState<string>('3.50');
  const [status, setStatus] = useState<EnrollmentStatus>('Active');
  const [attendanceRate, setAttendanceRate] = useState<string>('95');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other' | 'Prefer not to say'>('Prefer not to say');
  const [address, setAddress] = useState('');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyRelation, setEmergencyRelation] = useState('');
  const [emergencyCountryCode, setEmergencyCountryCode] = useState('+1');
  const [emergencyPhoneDigits, setEmergencyPhoneDigits] = useState('');
  const [notes, setNotes] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // Keyboard navigation & strict numeric input restriction
  const handleNumericKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow essential editing & navigation keys
    if (
      ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key) ||
      e.ctrlKey ||
      e.metaKey
    ) {
      return;
    }
    // Block any non-digit character (only 0-9 allowed)
    if (!/^[0-9]$/.test(e.key)) {
      e.preventDefault();
    }
  };

  const handlePhoneDigitsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '');
    setPhoneDigits(val);
  };

  const handleEmergencyPhoneDigitsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '');
    setEmergencyPhoneDigits(val);
  };

  const handleNumericPaste = (e: React.ClipboardEvent<HTMLInputElement>, setter: (v: string) => void) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text');
    setter(pasted.replace(/\D/g, ''));
  };

  useEffect(() => {
    if (initialData) {
      setRollNumber(initialData.rollNumber);
      setFirstName(initialData.firstName);
      setLastName(initialData.lastName);
      setEmail(initialData.email);

      const parsedPhone = parsePhoneNumberWithCountry(initialData.phone);
      setCountryCode(parsedPhone.dialCode);
      setPhoneDigits(parsedPhone.digits);

      setDepartment(initialData.department);
      setAcademicYear(initialData.academicYear);
      setSemester(initialData.semester);
      setGpa(initialData.gpa.toString());
      setStatus(initialData.status);
      setAttendanceRate(initialData.attendanceRate.toString());
      setDateOfBirth(initialData.dateOfBirth || '');
      setGender(initialData.gender || 'Prefer not to say');
      setAddress(initialData.address || '');
      setEmergencyName(initialData.emergencyContact?.name || '');
      setEmergencyRelation(initialData.emergencyContact?.relationship || '');

      const parsedEmergency = parsePhoneNumberWithCountry(initialData.emergencyContact?.phone);
      setEmergencyCountryCode(parsedEmergency.dialCode);
      setEmergencyPhoneDigits(parsedEmergency.digits);

      setNotes(initialData.notes || '');
    } else {
      setRollNumber('');
      setFirstName('');
      setLastName('');
      setEmail('');
      setCountryCode('+1');
      setPhoneDigits('');
      setDepartment(departments[0] || 'Computer Science');
      setAcademicYear('Year 1');
      setSemester('Semester 1');
      setGpa('3.50');
      setStatus('Active');
      setAttendanceRate('95');
      setDateOfBirth('');
      setGender('Prefer not to say');
      setAddress('');
      setEmergencyName('');
      setEmergencyRelation('');
      setEmergencyCountryCode('+1');
      setEmergencyPhoneDigits('');
      setNotes('');
    }
    setErrors({});
    setServerError(null);
  }, [initialData, isOpen, departments]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    const parsedGpa = parseFloat(gpa);
    const parsedAttendance = parseFloat(attendanceRate);

    const fullPhone = phoneDigits.trim() ? `${countryCode} ${phoneDigits.trim()}` : '';
    const fullEmergencyPhone = emergencyPhoneDigits.trim() ? `${emergencyCountryCode} ${emergencyPhoneDigits.trim()}` : '';

    const payload: CreateStudentDto = {
      rollNumber: rollNumber.trim(),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      phone: fullPhone,
      department: department.trim(),
      academicYear,
      semester,
      gpa: isNaN(parsedGpa) ? 0 : parsedGpa,
      status,
      attendanceRate: isNaN(parsedAttendance) ? 90 : parsedAttendance,
      dateOfBirth: dateOfBirth || undefined,
      gender,
      address: address.trim() || undefined,
      emergencyContact: emergencyName.trim()
        ? {
            name: emergencyName.trim(),
            relationship: emergencyRelation.trim() || 'Guardian',
            phone: fullEmergencyPhone,
          }
        : undefined,
      courses: initialData ? initialData.courses : [],
      notes: notes.trim() || undefined,
    };

    const validation = validateStudentPayload(payload);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(payload);
      onClose();
    } catch (err: any) {
      setServerError(err.message || 'Failed to save student record');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="student-form-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4"
    >
      <div className="relative bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h2 id="student-form-title" className="text-lg font-bold text-slate-900">
              {isEditing ? `Edit Student: ${initialData?.firstName} ${initialData?.lastName}` : 'Add New Student Record'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {isEditing
                ? 'Update academic credentials and personal details'
                : 'Enter student information to register in the central records database'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Server Error Alert */}
        {serverError && (
          <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2 text-rose-800 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{serverError}</span>
          </div>
        )}

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Section: Academic Identification */}
          <div>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Academic Identification
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Roll Number */}
              <div>
                <label htmlFor="student-roll" className="block text-xs font-medium text-slate-700 mb-1">
                  Roll Number / Student ID <span className="text-rose-500">*</span>
                </label>
                <input
                  id="student-roll"
                  type="text"
                  required
                  placeholder="e.g. CS-2024-001"
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg text-sm bg-white font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors.rollNumber ? 'border-rose-400 focus:ring-rose-400' : 'border-slate-300'
                  }`}
                />
                {errors.rollNumber && (
                  <p className="text-rose-600 text-xs mt-1">{errors.rollNumber}</p>
                )}
              </div>

              {/* Department */}
              <div>
                <label htmlFor="student-dept" className="block text-xs font-medium text-slate-700 mb-1">
                  Department / Major <span className="text-rose-500">*</span>
                </label>
                <select
                  id="student-dept"
                  required
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                  <option value="Biotechnology">Biotechnology</option>
                  <option value="Civil Engineering">Civil Engineering</option>
                  <option value="Economics">Economics</option>
                </select>
              </div>

              {/* Enrollment Status */}
              <div>
                <label htmlFor="student-status" className="block text-xs font-medium text-slate-700 mb-1">
                  Enrollment Status <span className="text-rose-500">*</span>
                </label>
                <select
                  id="student-status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as EnrollmentStatus)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Active">Active</option>
                  <option value="On Leave">On Leave</option>
                  <option value="Graduated">Graduated</option>
                  <option value="Suspended">Suspended</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section: Student Name & Contact */}
          <div>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Personal Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* First Name */}
              <div>
                <label htmlFor="student-fname" className="block text-xs font-medium text-slate-700 mb-1">
                  First Name <span className="text-rose-500">*</span>
                </label>
                <input
                  id="student-fname"
                  type="text"
                  required
                  placeholder="e.g. Liam"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors.firstName ? 'border-rose-400 focus:ring-rose-400' : 'border-slate-300'
                  }`}
                />
                {errors.firstName && (
                  <p className="text-rose-600 text-xs mt-1">{errors.firstName}</p>
                )}
              </div>

              {/* Last Name */}
              <div>
                <label htmlFor="student-lname" className="block text-xs font-medium text-slate-700 mb-1">
                  Last Name <span className="text-rose-500">*</span>
                </label>
                <input
                  id="student-lname"
                  type="text"
                  required
                  placeholder="e.g. Vance"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors.lastName ? 'border-rose-400 focus:ring-rose-400' : 'border-slate-300'
                  }`}
                />
                {errors.lastName && (
                  <p className="text-rose-600 text-xs mt-1">{errors.lastName}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="student-email" className="block text-xs font-medium text-slate-700 mb-1">
                  Institutional Email <span className="text-rose-500">*</span>
                </label>
                <input
                  id="student-email"
                  type="email"
                  required
                  placeholder="e.g. liam.vance@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors.email ? 'border-rose-400 focus:ring-rose-400' : 'border-slate-300'
                  }`}
                />
                {errors.email && (
                  <p className="text-rose-600 text-xs mt-1">{errors.email}</p>
                )}
              </div>

              {/* Phone with Country Code Selector & Numbers-Only Input */}
              <div>
                <label htmlFor="student-phone" className="block text-xs font-medium text-slate-700 mb-1">
                  Phone Number
                </label>
                <div className="flex gap-2">
                  <select
                    id="student-country-code"
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    aria-label="Country calling code"
                    title="Select Country Calling Code"
                    className="w-[140px] sm:w-[170px] shrink-0 px-2 py-2 border border-slate-300 rounded-lg text-xs sm:text-sm bg-slate-50 hover:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-sans cursor-pointer transition-colors"
                  >
                    {SORTED_COUNTRY_CODES.map((c) => (
                      <option key={`${c.code}-${c.dialCode}`} value={c.dialCode}>
                        {c.flag} {c.name} ({c.dialCode})
                      </option>
                    ))}
                  </select>

                  <input
                    id="student-phone"
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="Digits only (e.g. 5552345678)"
                    value={phoneDigits}
                    onChange={handlePhoneDigitsChange}
                    onKeyDown={handleNumericKeyDown}
                    onPaste={(e) => handleNumericPaste(e, setPhoneDigits)}
                    className={`flex-1 min-w-0 px-3 py-2 border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono tracking-wide ${
                      errors.phone ? 'border-rose-400 focus:ring-rose-400' : 'border-slate-300'
                    }`}
                  />
                </div>
                {errors.phone ? (
                  <p className="text-rose-600 text-xs mt-1">{errors.phone}</p>
                ) : (
                  <p className="text-slate-400 text-[11px] mt-1 font-mono">
                    Full: {countryCode} {phoneDigits || '••••••••••'}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Section: Academic Performance */}
          <div>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Academic Standing & Metrics
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Year */}
              <div>
                <label htmlFor="student-year" className="block text-xs font-medium text-slate-700 mb-1">
                  Year
                </label>
                <select
                  id="student-year"
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Year 1">Year 1 (Freshman)</option>
                  <option value="Year 2">Year 2 (Sophomore)</option>
                  <option value="Year 3">Year 3 (Junior)</option>
                  <option value="Year 4">Year 4 (Senior)</option>
                </select>
              </div>

              {/* Semester */}
              <div>
                <label htmlFor="student-semester" className="block text-xs font-medium text-slate-700 mb-1">
                  Semester
                </label>
                <select
                  id="student-semester"
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Semester 1">Semester 1 (Fall)</option>
                  <option value="Semester 2">Semester 2 (Spring)</option>
                </select>
              </div>

              {/* GPA */}
              <div>
                <label htmlFor="student-gpa" className="block text-xs font-medium text-slate-700 mb-1">
                  GPA (0.00 - 4.00) <span className="text-rose-500">*</span>
                </label>
                <input
                  id="student-gpa"
                  type="number"
                  step="0.01"
                  min="0"
                  max="4.00"
                  required
                  value={gpa}
                  onChange={(e) => setGpa(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors.gpa ? 'border-rose-400 focus:ring-rose-400' : 'border-slate-300'
                  }`}
                />
                {errors.gpa && (
                  <p className="text-rose-600 text-xs mt-1">{errors.gpa}</p>
                )}
              </div>

              {/* Attendance Rate */}
              <div>
                <label htmlFor="student-att" className="block text-xs font-medium text-slate-700 mb-1">
                  Attendance (%)
                </label>
                <input
                  id="student-att"
                  type="number"
                  min="0"
                  max="100"
                  value={attendanceRate}
                  onChange={(e) => setAttendanceRate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Section: Additional Details */}
          <div>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Emergency Contact & Address
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label htmlFor="emergency-name" className="block text-xs font-medium text-slate-700 mb-1">
                  Contact Name
                </label>
                <input
                  id="emergency-name"
                  type="text"
                  placeholder="e.g. John Doe"
                  value={emergencyName}
                  onChange={(e) => setEmergencyName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label htmlFor="emergency-rel" className="block text-xs font-medium text-slate-700 mb-1">
                  Relationship
                </label>
                <input
                  id="emergency-rel"
                  type="text"
                  placeholder="e.g. Mother, Father"
                  value={emergencyRelation}
                  onChange={(e) => setEmergencyRelation(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label htmlFor="emergency-phone" className="block text-xs font-medium text-slate-700 mb-1">
                  Contact Phone
                </label>
                <div className="flex gap-2">
                  <select
                    id="emergency-country-code"
                    value={emergencyCountryCode}
                    onChange={(e) => setEmergencyCountryCode(e.target.value)}
                    aria-label="Emergency contact country code"
                    title="Select Emergency Country Code"
                    className="w-[130px] sm:w-[150px] shrink-0 px-2 py-2 border border-slate-300 rounded-lg text-xs bg-slate-50 hover:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-sans cursor-pointer transition-colors"
                  >
                    {SORTED_COUNTRY_CODES.map((c) => (
                      <option key={`em-${c.code}-${c.dialCode}`} value={c.dialCode}>
                        {c.flag} {c.name} ({c.dialCode})
                      </option>
                    ))}
                  </select>

                  <input
                    id="emergency-phone"
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="Digits only"
                    value={emergencyPhoneDigits}
                    onChange={handleEmergencyPhoneDigitsChange}
                    onKeyDown={handleNumericKeyDown}
                    onPaste={(e) => handleNumericPaste(e, setEmergencyPhoneDigits)}
                    className="flex-1 min-w-0 px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono tracking-wide"
                  />
                </div>
              </div>
            </div>

            <div className="mt-3">
              <label htmlFor="student-address" className="block text-xs font-medium text-slate-700 mb-1">
                Residential Address
              </label>
              <input
                id="student-address"
                type="text"
                placeholder="e.g. 124 University Ave, Apt 4"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="mt-3">
              <label htmlFor="student-notes" className="block text-xs font-medium text-slate-700 mb-1">
                Advisor Notes / Remarks
              </label>
              <textarea
                id="student-notes"
                rows={2}
                placeholder="Optional academic remarks, awards, scholarships or advisor notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs sm:text-sm font-medium text-slate-700 hover:text-slate-900 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-xs disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'Saving...' : isEditing ? 'Update Student Record' : 'Create Student Record'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
