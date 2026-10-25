import React from 'react';
import { Eye, Edit2, Trash2 } from 'lucide-react';
import { Student } from '../types/student';
import { calculateAcademicStanding, formatGpa } from '../utils/studentLogic';
import { HighlightText } from './HighlightText';

interface StudentTableProps {
  students: Student[];
  onView: (student: Student) => void;
  onEdit: (student: Student) => void;
  onDelete: (student: Student) => void;
  searchQuery?: string;
}

export const StudentTable: React.FC<StudentTableProps> = ({
  students,
  onView,
  onEdit,
  onDelete,
  searchQuery = '',
}) => {
  if (students.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-xs">
        <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
          <Eye className="w-6 h-6" />
        </div>
        <h3 className="mt-4 text-base font-medium text-slate-900">No student records found</h3>
        <p className="mt-1 text-sm text-slate-500 max-w-sm mx-auto">
          No records match your active search or filters. Try adjusting your query or resetting the filters.
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
    <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500 border-b border-slate-200 font-semibold tracking-wider">
            <tr>
              <th scope="col" className="py-3.5 px-4">Student</th>
              <th scope="col" className="py-3.5 px-4">Roll Number</th>
              <th scope="col" className="py-3.5 px-4">Department</th>
              <th scope="col" className="py-3.5 px-4">Year & Term</th>
              <th scope="col" className="py-3.5 px-4">GPA & Standing</th>
              <th scope="col" className="py-3.5 px-4">Status</th>
              <th scope="col" className="py-3.5 px-4">Attendance</th>
              <th scope="col" className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {students.map((student) => {
              const standing = calculateAcademicStanding(student.gpa);
              const initials = `${student.firstName.charAt(0)}${student.lastName.charAt(0)}`.toUpperCase();

              return (
                <tr
                  key={student.id}
                  className="hover:bg-slate-50/80 transition-colors group"
                >
                  {/* Student Name & Email */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center font-semibold text-xs shrink-0">
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <button
                          type="button"
                          onClick={() => onView(student)}
                          className="font-medium text-slate-900 hover:text-indigo-600 text-left truncate block focus:outline-none focus:underline"
                        >
                          <HighlightText
                            text={`${student.firstName} ${student.lastName}`}
                            query={searchQuery}
                          />
                        </button>
                        <div className="text-xs text-slate-500 truncate">
                          <HighlightText text={student.email} query={searchQuery} />
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Roll Number */}
                  <td className="py-3 px-4 font-mono text-xs text-slate-800">
                    <HighlightText text={student.rollNumber} query={searchQuery} />
                  </td>

                  {/* Department */}
                  <td className="py-3 px-4 text-slate-800 font-medium">
                    <HighlightText text={student.department} query={searchQuery} />
                  </td>

                  {/* Year & Semester */}
                  <td className="py-3 px-4 text-slate-600 text-xs">
                    <div>{student.academicYear}</div>
                    <div className="text-slate-500">{student.semester}</div>
                  </td>

                  {/* GPA & Standing */}
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900">
                      {formatGpa(student.gpa)}
                    </div>
                    <div className="text-xs text-slate-500">
                      {standing}
                    </div>
                  </td>

                  {/* Status */}
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1.5 text-xs text-slate-700 font-medium">
                      <span className={`w-2 h-2 rounded-full ${getStatusDot(student.status)}`} />
                      {student.status}
                    </span>
                  </td>

                  {/* Attendance */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full ${
                            student.attendanceRate >= 90
                              ? 'bg-emerald-500'
                              : student.attendanceRate >= 75
                              ? 'bg-amber-500'
                              : 'bg-rose-500'
                          }`}
                          style={{ width: `${Math.min(100, Math.max(0, student.attendanceRate))}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate-600 font-medium">
                        {student.attendanceRate}%
                      </span>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => onView(student)}
                        aria-label={`View details for ${student.firstName} ${student.lastName}`}
                        title="View Full Profile"
                        className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-md transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onEdit(student)}
                        aria-label={`Edit ${student.firstName} ${student.lastName}`}
                        title="Edit Record"
                        className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-slate-100 rounded-md transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(student)}
                        aria-label={`Delete ${student.firstName} ${student.lastName}`}
                        title="Delete Record"
                        className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-slate-100 rounded-md transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
        <span>Showing {students.length} student records</span>
        <span>Sorted by current selection</span>
      </div>
    </div>
  );
};
