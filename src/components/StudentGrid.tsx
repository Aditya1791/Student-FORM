import React from 'react';
import { Eye, Edit2, Trash2, Mail, Phone, BookOpen, CalendarCheck } from 'lucide-react';
import { Student } from '../types/student';
import { calculateAcademicStanding, formatGpa, getAttendanceColor } from '../utils/studentLogic';
import { HighlightText } from './HighlightText';

interface StudentGridProps {
  students: Student[];
  onView: (student: Student) => void;
  onEdit: (student: Student) => void;
  onDelete: (student: Student) => void;
  onLogAttendance?: (student: Student) => void;
  searchQuery?: string;
}

export const StudentGrid: React.FC<StudentGridProps> = ({
  students,
  onView,
  onEdit,
  onDelete,
  onLogAttendance,
  searchQuery = '',
}) => {
  if (students.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-xs">
        <h3 className="text-base font-medium text-slate-900">No student records found</h3>
        <p className="mt-1 text-sm text-slate-500">
          Try adjusting your search criteria or filters.
        </p>
      </div>
    );
  }

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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {students.map((student) => {
        const standing = calculateAcademicStanding(student.gpa);
        const initials = `${student.firstName.charAt(0)}${student.lastName.charAt(0)}`.toUpperCase();

        return (
          <div
            key={student.id}
            className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
          >
            <div>
              {/* Top card header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center font-semibold text-sm shrink-0">
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <button
                      type="button"
                      onClick={() => onView(student)}
                      className="font-semibold text-slate-900 hover:text-indigo-600 text-left truncate block focus:outline-none focus:underline"
                    >
                      <HighlightText
                        text={`${student.firstName} ${student.lastName}`}
                        query={searchQuery}
                      />
                    </button>
                    <div className="text-xs font-mono text-slate-500">
                      <HighlightText text={student.rollNumber} query={searchQuery} />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium shrink-0">
                  <span className={`w-2 h-2 rounded-full ${getStatusDot(student.status)}`} />
                  {student.status}
                </div>
              </div>

              {/* Department & Year */}
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                <span className="font-medium text-slate-800 truncate">
                  <HighlightText text={student.department} query={searchQuery} />
                </span>
                <span className="text-slate-500 shrink-0">
                  {student.academicYear} · {student.semester}
                </span>
              </div>

              {/* Academic Metrics */}
              <div className="mt-3 grid grid-cols-2 gap-2 bg-slate-50 rounded-lg p-2.5">
                <div>
                  <div className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider">GPA Score</div>
                  <div className="text-base font-bold text-slate-900 mt-0.5">
                    {formatGpa(student.gpa)}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate">{standing}</div>
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider">Attendance</span>
                    <span className={`text-[10px] font-bold ${getAttendanceColor(student.attendanceRate).text}`}>
                      {getAttendanceColor(student.attendanceRate).status}
                    </span>
                  </div>
                  <div className="text-base font-bold text-slate-900 mt-0.5">
                    {student.attendanceRate}%
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full mt-1 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${getAttendanceColor(student.attendanceRate).bar}`}
                      style={{ width: `${Math.min(100, Math.max(0, student.attendanceRate))}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Contact info snippets */}
              <div className="mt-3 space-y-1 text-xs text-slate-500">
                <div className="flex items-center gap-1.5 truncate">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">
                    <HighlightText text={student.email} query={searchQuery} />
                  </span>
                </div>
                {student.phone && (
                  <div className="flex items-center gap-1.5 truncate">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{student.phone}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onView(student)}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-700 py-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  View Profile
                </button>

                {onLogAttendance && (
                  <button
                    type="button"
                    onClick={() => onLogAttendance(student)}
                    title="Log presence for this student"
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200 transition-colors"
                  >
                    <CalendarCheck className="w-3 h-3" />
                    <span>Log Presence</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => onEdit(student)}
                  aria-label={`Edit ${student.firstName} ${student.lastName}`}
                  className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-slate-100 rounded-md transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(student)}
                  aria-label={`Delete ${student.firstName} ${student.lastName}`}
                  className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-slate-100 rounded-md transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
