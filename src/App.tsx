/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Header } from './components/Header';
import { StatsCards } from './components/StatsCards';
import { StudentAnalyticsCharts } from './components/StudentAnalyticsCharts';
import { StudentFiltersBar } from './components/StudentFilters';
import { StudentTable } from './components/StudentTable';
import { StudentGrid } from './components/StudentGrid';
import { StudentDetailModal } from './components/StudentDetailModal';
import { StudentFormModal } from './components/StudentFormModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { ApiExplorerModal } from './components/ApiExplorerModal';
import { ExcelImportModal } from './components/ExcelImportModal';
import { AttendanceLoggerModal } from './components/AttendanceLoggerModal';
import { LoginPage, UserSession } from './components/LoginPage';
import { NotificationToast, ToastMessage } from './components/NotificationToast';
import { Student, StudentFilters, StudentStats, CreateStudentDto, AttendanceStatus } from './types/student';
import { api } from './services/api';
import { exportStudentsToExcel } from './services/excelService';

const DEFAULT_FILTERS: StudentFilters = {
  search: '',
  department: 'All',
  status: 'All',
  sortBy: 'createdAt',
  sortOrder: 'desc',
};

const DEFAULT_STATS: StudentStats = {
  totalStudents: 0,
  activeStudents: 0,
  averageGpa: 0,
  honorsCount: 0,
  atRiskCount: 0,
  departmentCounts: {},
};

const STORAGE_KEY_USER = 'sms_user_session';

export default function App() {
  // Authentication & Database connection state
  const [userSession, setUserSession] = useState<UserSession | null>(() => {
    // Check url param for autostart
    const params = new URLSearchParams(window.location.search);
    if (params.get('autostart') === '1' || params.get('demo') === '1') {
      return {
        name: 'Academic Administrator',
        email: 'admin@university.edu',
        role: 'Chief Registrar',
        provider: 'sso',
        connectedDatabase: 'Institutional Central Database',
        consentGiven: true,
        signedInAt: new Date().toISOString(),
      };
    }
    const saved = localStorage.getItem(STORAGE_KEY_USER);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  const [students, setStudents] = useState<Student[]>([]);
  const [stats, setStats] = useState<StudentStats>(DEFAULT_STATS);
  const [filters, setFilters] = useState<StudentFilters>(DEFAULT_FILTERS);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isResetting, setIsResetting] = useState<boolean>(false);

  // Modals state
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [deletingStudent, setDeletingStudent] = useState<Student | null>(null);
  const [isApiExplorerOpen, setIsApiExplorerOpen] = useState<boolean>(false);
  const [isExcelImportOpen, setIsExcelImportOpen] = useState<boolean>(false);
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState<boolean>(false);
  const [attendanceTargetStudent, setAttendanceTargetStudent] = useState<Student | null>(null);

  // Notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = `${Date.now()}_${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, message }]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Login handler
  const handleLogin = (session: UserSession) => {
    setUserSession(session);
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(session));
    showToast(`Central Database connected! Welcome, ${session.name}.`, 'success');
  };

  // Logout handler
  const handleSignOut = () => {
    setUserSession(null);
    localStorage.removeItem(STORAGE_KEY_USER);
    showToast('Signed out of central student records portal.', 'info');
  };

  // Fetch data from backend REST API
  const loadData = useCallback(async () => {
    if (!userSession) return;
    try {
      setIsLoading(true);
      const [studentsRes, statsRes] = await Promise.all([
        api.getStudents(filters),
        api.getStats(),
      ]);
      setStudents(studentsRes.data);
      setStats(statsRes);
    } catch (err: any) {
      console.error('Error fetching student data:', err);
      showToast(err.message || 'Failed to load records from server', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [filters, userSession, showToast]);

  useEffect(() => {
    if (userSession) {
      loadData();
    }
  }, [userSession, loadData]);

  // Derived list of distinct departments
  const availableDepartments = useMemo(() => {
    const set = new Set<string>();
    ['Computer Science', 'Data Science', 'Mechanical Engineering', 'Electrical Engineering', 'Business Administration'].forEach(d => set.add(d));
    Object.keys(stats.departmentCounts).forEach((d) => set.add(d));
    return Array.from(set).sort();
  }, [stats.departmentCounts]);

  // Open Form for Adding New Student
  const handleOpenAddForm = () => {
    setEditingStudent(null);
    setIsFormOpen(true);
  };

  // Open Form for Editing Existing Student
  const handleOpenEditForm = (student: Student) => {
    setEditingStudent(student);
    setIsFormOpen(true);
  };

  // Form Submission (Add or Update)
  const handleFormSubmit = async (payload: CreateStudentDto) => {
    if (editingStudent) {
      const updated = await api.updateStudent(editingStudent.id, payload);
      showToast(`Student record for ${updated.firstName} ${updated.lastName} updated successfully.`);
      if (viewingStudent?.id === editingStudent.id) {
        setViewingStudent(updated);
      }
    } else {
      const created = await api.createStudent(payload);
      showToast(`Student ${created.firstName} ${created.lastName} (Roll: ${created.rollNumber}) added.`);
    }
    await loadData();
  };

  // Delete Action
  const handleDeleteConfirm = async (studentId: string) => {
    await api.deleteStudent(studentId);
    showToast('Student record deleted from database.');
    if (viewingStudent?.id === studentId) {
      setViewingStudent(null);
    }
    await loadData();
  };

  // Reset Demo Database
  const handleResetDatabase = async () => {
    try {
      setIsResetting(true);
      await api.resetDemoData();
      showToast('Central database reset to initial demonstration records.');
      await loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to reset database', 'error');
    } finally {
      setIsResetting(false);
    }
  };

  // Excel Export Handler
  const handleExportExcel = () => {
    try {
      const dateStr = new Date().toISOString().split('T')[0];
      exportStudentsToExcel(students, `student_directory_${dateStr}.xlsx`);
      showToast(`Exported ${students.length} student records to Excel workbook.`);
    } catch (err: any) {
      showToast(err.message || 'Failed to export spreadsheet', 'error');
    }
  };

  // Excel Bulk Import Handler
  const handleBulkImport = async (importedStudents: CreateStudentDto[]) => {
    const result = await api.bulkImportStudents(importedStudents);
    showToast(
      `Import complete: ${result.added} new students registered, ${result.updated} records updated.`,
      'success'
    );
    await loadData();
    return result;
  };

  // Attendance Handlers
  const handleOpenAttendanceModal = (target?: Student) => {
    setAttendanceTargetStudent(target || null);
    setIsAttendanceModalOpen(true);
  };

  const handleSaveAttendance = async (
    date: string,
    records: Array<{ studentId: string; status: AttendanceStatus; notes?: string }>
  ) => {
    const res = await api.recordBulkAttendance(date, records);
    showToast(
      `Daily presence logged for ${res.updatedCount} ${res.updatedCount === 1 ? 'student' : 'students'} on ${date}.`,
      'success'
    );
    await loadData();
    if (viewingStudent) {
      const refreshed = await api.getStudentById(viewingStudent.id);
      setViewingStudent(refreshed);
    }
  };

  // If no user is logged in, show the Default Landing & Login Page with Video Showcase
  if (!userSession) {
    return (
      <>
        <LoginPage onLogin={handleLogin} />
        <NotificationToast toasts={toasts} onDismiss={dismissToast} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans">
      {/* Top Application Header */}
      <Header
        onAddStudent={handleOpenAddForm}
        onOpenApiExplorer={() => setIsApiExplorerOpen(true)}
        onResetDatabase={handleResetDatabase}
        onOpenExcelImport={() => setIsExcelImportOpen(true)}
        onExportExcel={handleExportExcel}
        onOpenAttendance={() => handleOpenAttendanceModal()}
        userSession={userSession}
        onSignOut={handleSignOut}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        isResetting={isResetting}
        totalStudents={stats.totalStudents}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Cohort Metric Statistics & Visual Analytics Section */}
        <section aria-labelledby="analytics-heading" className="space-y-4">
          <h2 id="analytics-heading" className="sr-only">
            Cohort Statistics & Academic Analytics
          </h2>
          <StatsCards stats={stats} />
          <StudentAnalyticsCharts students={students} />
        </section>

        {/* Search, Department & Status Filters */}
        <section aria-labelledby="directory-filters">
          <h2 id="directory-filters" className="sr-only">
            Directory Filters
          </h2>
          <StudentFiltersBar
            filters={filters}
            onChange={setFilters}
            departments={availableDepartments}
          />
        </section>

        {/* Student Records List (Table or Cards) */}
        <section aria-labelledby="directory-list">
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-2">
              <h2 id="directory-list" className="font-serif-cormorant text-xl font-semibold text-[#0F172A]">
                Student Directory
              </h2>
              <span className="font-mono-geist text-[10px] text-[#64748B] uppercase tracking-wider">
                Registry Roster
              </span>
            </div>
            <div className="font-mono-geist text-xs text-[#64748B]">
              Showing {students.length} of {stats.totalStudents} enrolled students
            </div>
          </div>

          {isLoading ? (
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-12 text-center shadow-xs">
              <div className="inline-block w-8 h-8 border-3 border-[#6D28D9] border-t-transparent rounded-full animate-spin" />
              <p className="mt-3 text-sm text-[#64748B] font-medium">Loading records from database...</p>
            </div>
          ) : viewMode === 'table' ? (
            <StudentTable
              students={students}
              searchQuery={filters.search}
              onView={(s) => setViewingStudent(s)}
              onEdit={handleOpenEditForm}
              onDelete={(s) => setDeletingStudent(s)}
            />
          ) : (
            <StudentGrid
              students={students}
              searchQuery={filters.search}
              onView={(s) => setViewingStudent(s)}
              onEdit={handleOpenEditForm}
              onDelete={(s) => setDeletingStudent(s)}
              onLogAttendance={(s) => handleOpenAttendanceModal(s)}
            />
          )}
        </section>
      </main>

      {/* Variation 18 Footer */}
      <footer className="border-t border-[#E2E8F0] bg-white h-12 flex items-center px-4 sm:px-10 mt-auto">
        <div className="max-w-7xl w-full mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-mono-geist text-[#64748B]">
          <div className="flex items-center gap-3">
            <span>SYSTEM_STATUS: READY</span>
            <span aria-hidden="true">·</span>
            <span>G-CLOUD-DB: CONNECTED</span>
          </div>
          <div className="flex items-center gap-4">
            <span>User: {userSession.email}</span>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={() => setIsApiExplorerOpen(true)}
              className="text-[#6D28D9] hover:underline"
            >
              APIs
            </button>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={handleSignOut}
              className="text-rose-600 hover:underline"
            >
              Sign Out
            </button>
            <span aria-hidden="true">·</span>
            <span>2026 © ACADEMIC RECORDS PORTAL</span>
          </div>
        </div>
      </footer>

      {/* View Student Detail Modal */}
      <StudentDetailModal
        student={viewingStudent}
        onClose={() => setViewingStudent(null)}
        onEdit={(s) => {
          setViewingStudent(null);
          handleOpenEditForm(s);
        }}
        onLogAttendance={(s) => handleOpenAttendanceModal(s)}
      />

      {/* Add / Edit Student Form Modal */}
      <StudentFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingStudent(null);
        }}
        onSubmit={handleFormSubmit}
        initialData={editingStudent}
        departments={availableDepartments}
      />

      {/* Safe Delete Confirmation Dialog */}
      <DeleteConfirmModal
        student={deletingStudent}
        isOpen={Boolean(deletingStudent)}
        onClose={() => setDeletingStudent(null)}
        onConfirm={handleDeleteConfirm}
      />

      {/* Excel & CSV Bulk Import Modal */}
      <ExcelImportModal
        isOpen={isExcelImportOpen}
        onClose={() => setIsExcelImportOpen(false)}
        onImportSuccess={() => loadData()}
        onBulkImport={handleBulkImport}
      />

      {/* Daily Attendance Session Logger */}
      <AttendanceLoggerModal
        isOpen={isAttendanceModalOpen}
        onClose={() => {
          setIsAttendanceModalOpen(false);
          setAttendanceTargetStudent(null);
        }}
        students={students}
        targetStudent={attendanceTargetStudent}
        onSaveAttendance={handleSaveAttendance}
      />

      {/* Interactive REST API Explorer */}
      <ApiExplorerModal
        isOpen={isApiExplorerOpen}
        onClose={() => setIsApiExplorerOpen(false)}
      />

      {/* Notifications Toast */}
      <NotificationToast toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
