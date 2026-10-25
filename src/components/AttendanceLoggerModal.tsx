import React, { useState } from 'react';
import { X, Calendar, Check, Clock, UserX, FileText, CheckCheck, Loader2 } from 'lucide-react';
import { Student, AttendanceStatus } from '../types/student';
import { getAttendanceColor } from '../utils/studentLogic';

interface AttendanceLoggerModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  targetStudent?: Student | null;
  onSaveAttendance: (date: string, records: Array<{ studentId: string; status: AttendanceStatus; notes?: string }>) => Promise<void>;
}

export const AttendanceLoggerModal: React.FC<AttendanceLoggerModalProps> = ({
  isOpen,
  onClose,
  students,
  targetStudent,
  onSaveAttendance,
}) => {
  const today = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(today);
  const [departmentFilter, setDepartmentFilter] = useState<string>('All');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Map of studentId -> { status, notes }
  const [attendanceState, setAttendanceState] = useState<Record<string, { status: AttendanceStatus; notes: string }>>(() => {
    const initial: Record<string, { status: AttendanceStatus; notes: string }> = {};
    const list = targetStudent ? [targetStudent] : students;
    list.forEach((s) => {
      // Check if student already has a log for this date
      const existing = s.attendanceLogs?.find((l) => l.date === today);
      initial[s.id] = {
        status: existing ? existing.status : 'present',
        notes: existing?.notes || '',
      };
    });
    return initial;
  });

  if (!isOpen) return null;

  const activeStudents = targetStudent
    ? [targetStudent]
    : students.filter(
        (s) => departmentFilter === 'All' || s.department === departmentFilter
      );

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setAttendanceState((prev) => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || { notes: '' }),
        status,
      },
    }));
  };

  const handleNotesChange = (studentId: string, notes: string) => {
    setAttendanceState((prev) => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || { status: 'present' }),
        notes,
      },
    }));
  };

  const handleMarkAll = (status: AttendanceStatus) => {
    setAttendanceState((prev) => {
      const next = { ...prev };
      activeStudents.forEach((s) => {
        next[s.id] = {
          ...(next[s.id] || { notes: '' }),
          status,
        };
      });
      return next;
    });
  };

  const handleSave = async () => {
    try {
      setIsSubmitting(true);
      const records = activeStudents.map((s) => ({
        studentId: s.id,
        status: attendanceState[s.id]?.status || 'present',
        notes: attendanceState[s.id]?.notes,
      }));

      await onSaveAttendance(selectedDate, records);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const departments = ['All', ...Array.from(new Set(students.map((s) => s.department))).sort()];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="attendance-modal-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4"
    >
      <div className="relative bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 id="attendance-modal-title" className="text-base font-bold text-slate-900">
                {targetStudent
                  ? `Log Attendance for ${targetStudent.firstName} ${targetStudent.lastName}`
                  : 'Daily Presence & Attendance Logger'}
              </h2>
              <p className="text-xs text-slate-500">
                Record presence, tardiness, or excused absences to automatically recalculate attendance scores
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close attendance dialog"
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Controls Bar: Date selection & Department filter */}
        <div className="px-6 py-3.5 bg-slate-100/70 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <label htmlFor="att-date" className="font-semibold text-slate-700">
                Session Date:
              </label>
              <input
                id="att-date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {!targetStudent && (
              <div className="flex items-center gap-2">
                <label htmlFor="att-dept" className="font-semibold text-slate-700">
                  Department:
                </label>
                <select
                  id="att-dept"
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {departments.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Quick Mark All actions */}
          {!targetStudent && (
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-medium">Batch:</span>
              <button
                type="button"
                onClick={() => handleMarkAll('present')}
                className="px-2 py-1 bg-white border border-emerald-300 text-emerald-800 font-medium rounded hover:bg-emerald-50 transition-colors"
              >
                All Present
              </button>
              <button
                type="button"
                onClick={() => handleMarkAll('absent')}
                className="px-2 py-1 bg-white border border-rose-300 text-rose-800 font-medium rounded hover:bg-rose-50 transition-colors"
              >
                All Absent
              </button>
            </div>
          )}
        </div>

        {/* Student Presence List */}
        <div className="p-6 max-h-[60vh] overflow-y-auto divide-y divide-slate-100">
          {activeStudents.map((student) => {
            const currentStatus = attendanceState[student.id]?.status || 'present';
            const attColors = getAttendanceColor(student.attendanceRate);

            return (
              <div key={student.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-slate-900 truncate">
                      {student.firstName} {student.lastName}
                    </span>
                    <span className="font-mono text-xs text-slate-500">
                      ({student.rollNumber})
                    </span>
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${attColors.bg} ${attColors.text} ${attColors.border}`}>
                      {student.attendanceRate}% ({attColors.status})
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 truncate mt-0.5">
                    {student.department} · {student.academicYear}
                  </div>
                </div>

                {/* Status Toggle Buttons */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {/* Present */}
                  <button
                    type="button"
                    onClick={() => handleStatusChange(student.id, 'present')}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 border transition-colors ${
                      currentStatus === 'present'
                        ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Present</span>
                  </button>

                  {/* Late */}
                  <button
                    type="button"
                    onClick={() => handleStatusChange(student.id, 'late')}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 border transition-colors ${
                      currentStatus === 'late'
                        ? 'bg-amber-600 text-white border-amber-700 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Late</span>
                  </button>

                  {/* Excused */}
                  <button
                    type="button"
                    onClick={() => handleStatusChange(student.id, 'excused')}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 border transition-colors ${
                      currentStatus === 'excused'
                        ? 'bg-indigo-600 text-white border-indigo-700 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Excused</span>
                  </button>

                  {/* Absent */}
                  <button
                    type="button"
                    onClick={() => handleStatusChange(student.id, 'absent')}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 border transition-colors ${
                      currentStatus === 'absent'
                        ? 'bg-rose-600 text-white border-rose-700 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <UserX className="w-3.5 h-3.5" />
                    <span>Absent</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Updating presence for {activeStudents.length} {activeStudents.length === 1 ? 'student' : 'students'}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs sm:text-sm font-medium text-slate-700 hover:text-slate-900 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-xs"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors shadow-xs disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <CheckCheck className="w-4 h-4" />
                  <span>Save Attendance</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
