import React, { useState } from 'react';
import { X, Mail, Phone, MapPin, Calendar, BookOpen, AlertCircle, Edit2, ShieldAlert, CheckCircle2, CalendarCheck, Download, Loader2 } from 'lucide-react';
import { Student } from '../types/student';
import { calculateAcademicStanding, formatGpa, getAttendanceColor } from '../utils/studentLogic';
import { generateStudentTranscriptPdf } from '../services/pdfService';

interface StudentDetailModalProps {
  student: Student | null;
  onClose: () => void;
  onEdit: (student: Student) => void;
  onLogAttendance?: (student: Student) => void;
}

export const StudentDetailModal: React.FC<StudentDetailModalProps> = ({
  student,
  onClose,
  onEdit,
  onLogAttendance,
}) => {
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  if (!student) return null;

  const standing = calculateAcademicStanding(student.gpa);
  const initials = `${student.firstName.charAt(0)}${student.lastName.charAt(0)}`.toUpperCase();
  const attColor = getAttendanceColor(student.attendanceRate);

  const handleDownloadPdf = () => {
    try {
      setIsDownloadingPdf(true);
      generateStudentTranscriptPdf(student);
    } finally {
      setTimeout(() => setIsDownloadingPdf(false), 500);
    }
  };

  const getStatusDot = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-emerald-500';
      case 'On Leave':
        return 'bg-amber-500';
      case 'Graduated':
        return 'bg-indigo-500';
      case 'Suspended':
        return 'bg-rose-500';
      default:
        return 'bg-slate-400';
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="student-detail-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4"
    >
      <div className="relative bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-[#E2E8F0] overflow-hidden my-8">
        {/* Header bar */}
        <div className="px-6 py-5 border-b border-[#E2E8F0] flex items-start justify-between bg-[#F8FAFC]">
          <div className="flex items-center gap-4">
            <div className="w-13 h-13 rounded bg-[#0F172A] text-white flex items-center justify-center font-mono-geist font-bold text-base shadow-sm">
              {initials}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="student-detail-title" className="font-serif-cormorant text-2xl font-bold text-[#0F172A]">
                  {student.firstName} {student.lastName}
                </h2>
                <span className="inline-flex items-center gap-1.5 text-xs text-slate-700 font-medium ml-2">
                  <span className={`w-2 h-2 rounded-full ${getStatusDot(student.status)}`} />
                  {student.status}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 font-mono-geist">
                <span className="font-medium text-[#6D28D9]">{student.rollNumber}</span>
                <span aria-hidden="true">·</span>
                <span>{student.department}</span>
                <span aria-hidden="true">·</span>
                <span>{student.academicYear} ({student.semester})</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isDownloadingPdf}
              title="Download Official PDF Transcript"
              aria-label="Download PDF transcript"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#6D28D9] bg-[#F5F3FF] border border-[#DDD6FE] rounded hover:bg-[#EDE9FE] transition-colors shadow-xs"
            >
              {isDownloadingPdf ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5 text-[#6D28D9]" />
              )}
              <span className="hidden sm:inline">Download PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close dialog"
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Key Academic Metrics */}
          <div className="grid grid-cols-3 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
            <div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Cumulative GPA
              </span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-2xl font-bold text-slate-900">{formatGpa(student.gpa)}</span>
                <span className="text-xs text-slate-500">/ 4.00</span>
              </div>
              <span className="text-xs text-indigo-700 font-medium block mt-0.5">
                {standing}
              </span>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Attendance Rate
                </span>
                <span className={`text-[10px] font-bold ${attColor.text}`}>
                  {attColor.status}
                </span>
              </div>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-2xl font-bold text-slate-900">{student.attendanceRate}%</span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full mt-1 overflow-hidden">
                <div
                  className={`h-full rounded-full ${attColor.bar}`}
                  style={{ width: `${Math.min(100, Math.max(0, student.attendanceRate))}%` }}
                />
              </div>
            </div>

            <div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Active Courses
              </span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-2xl font-bold text-slate-900">{student.courses.length}</span>
                <span className="text-xs text-slate-500">courses</span>
              </div>
              <span className="text-xs text-slate-500 block mt-0.5">
                {student.courses.reduce((acc, c) => acc + c.credits, 0)} total credits
              </span>
            </div>
          </div>

          {/* Contact & Personal Information */}
          <div>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Personal & Contact Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2.5 text-slate-700">
                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="truncate">{student.email}</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-700">
                <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                <span>{student.phone || 'No phone registered'}</span>
              </div>
              {student.dateOfBirth && (
                <div className="flex items-center gap-2.5 text-slate-700">
                  <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>DOB: {student.dateOfBirth} {student.gender ? `(${student.gender})` : ''}</span>
                </div>
              )}
              {student.address && (
                <div className="flex items-center gap-2.5 text-slate-700 sm:col-span-2">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="truncate">{student.address}</span>
                </div>
              )}
            </div>
          </div>

          {/* Emergency Contact */}
          {student.emergencyContact && (
            <div className="p-3 bg-amber-50/60 border border-amber-200/80 rounded-xl">
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-900 uppercase tracking-wider mb-1">
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                Emergency Contact
              </div>
              <div className="text-sm text-slate-800">
                <span className="font-medium">{student.emergencyContact.name}</span> ({student.emergencyContact.relationship}) · {student.emergencyContact.phone}
              </div>
            </div>
          )}

          {/* Enrolled Courses */}
          <div>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Enrolled Courses & Academic Transcript
            </h3>
            {student.courses.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No courses currently registered for this semester.</p>
            ) : (
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Code</th>
                      <th className="py-2.5 px-3">Course Title</th>
                      <th className="py-2.5 px-3">Credits</th>
                      <th className="py-2.5 px-3">Grade</th>
                      <th className="py-2.5 px-3">Term</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {student.courses.map((course) => (
                      <tr key={course.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-mono font-medium text-slate-800">{course.code}</td>
                        <td className="py-2.5 px-3 text-slate-800 font-medium">{course.title}</td>
                        <td className="py-2.5 px-3">{course.credits}</td>
                        <td className="py-2.5 px-3 font-bold text-slate-900">{course.grade}</td>
                        <td className="py-2.5 px-3 text-slate-500">{course.semester}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Attendance History */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Daily Attendance History
              </h3>
              {onLogAttendance && (
                <button
                  type="button"
                  onClick={() => onLogAttendance(student)}
                  className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 hover:text-emerald-800 hover:underline"
                >
                  <CalendarCheck className="w-3.5 h-3.5" />
                  <span>Log Attendance for Today</span>
                </button>
              )}
            </div>

            {student.attendanceLogs && student.attendanceLogs.length > 0 ? (
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-2 px-3">Date</th>
                      <th className="py-2 px-3">Presence Status</th>
                      <th className="py-2 px-3">Notes / Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {student.attendanceLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50">
                        <td className="py-2 px-3 font-medium text-slate-800">{log.date}</td>
                        <td className="py-2 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${
                              log.status === 'present'
                                ? 'bg-emerald-100 text-emerald-800'
                                : log.status === 'late'
                                ? 'bg-amber-100 text-amber-800'
                                : log.status === 'excused'
                                ? 'bg-indigo-100 text-indigo-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {log.status}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-slate-500">{log.notes || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500 flex items-center justify-between">
                <span>Overall aggregate attendance recorded at {student.attendanceRate}%. No single-day session logs yet.</span>
                {onLogAttendance && (
                  <button
                    type="button"
                    onClick={() => onLogAttendance(student)}
                    className="px-2.5 py-1 bg-white border border-slate-300 rounded text-slate-700 font-medium hover:bg-slate-50 shadow-xs"
                  >
                    Log First Session
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Faculty Notes */}
          {student.notes && (
            <div>
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Advisor Notes & Academic Remarks
              </h3>
              <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                {student.notes}
              </p>
            </div>
          )}

          {/* Record Metadata */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>Record ID: {student.id}</span>
            <span>Last Updated: {new Date(student.updatedAt).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Modal actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-[#E2E8F0] flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs sm:text-sm font-medium text-slate-700 hover:text-slate-900 bg-white border border-[#CBD5E1] rounded hover:bg-slate-50 transition-colors shadow-xs"
          >
            Close
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isDownloadingPdf}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold text-[#6D28D9] bg-[#F5F3FF] border border-[#DDD6FE] rounded hover:bg-[#EDE9FE] transition-colors shadow-xs"
            >
              {isDownloadingPdf ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4 text-[#6D28D9]" />
              )}
              <span>Download PDF</span>
            </button>

            {onLogAttendance && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onLogAttendance(student);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 rounded hover:bg-emerald-100 transition-colors shadow-xs"
              >
                <CalendarCheck className="w-4 h-4 text-emerald-600" />
                <span>Log Attendance</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(student);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-[#0F172A] hover:bg-[#6D28D9] rounded transition-all duration-200 shadow-sm"
            >
              <Edit2 className="w-4 h-4" />
              <span>Edit Student</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
