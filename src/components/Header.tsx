import React from 'react';
import {
  Plus,
  Terminal,
  RefreshCw,
  LayoutGrid,
  Table,
  FileSpreadsheet,
  Download,
  LogOut,
  CalendarCheck,
} from 'lucide-react';
import { UserSession } from './LoginPage';

interface HeaderProps {
  onAddStudent: () => void;
  onOpenApiExplorer: () => void;
  onResetDatabase: () => void;
  onOpenExcelImport: () => void;
  onExportExcel: () => void;
  onOpenAttendance: () => void;
  userSession?: UserSession | null;
  onSignOut?: () => void;
  viewMode: 'table' | 'grid';
  onViewModeChange: (mode: 'table' | 'grid') => void;
  isResetting: boolean;
  totalStudents: number;
}

export const Header: React.FC<HeaderProps> = ({
  onAddStudent,
  onOpenApiExplorer,
  onResetDatabase,
  onOpenExcelImport,
  onExportExcel,
  onOpenAttendance,
  userSession,
  onSignOut,
  viewMode,
  onViewModeChange,
  isResetting,
  totalStudents,
}) => {
  const userInitials = userSession?.name
    ? userSession.name
        .split(' ')
        .map((p) => p[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'AD';

  return (
    <header className="h-[72px] border-b border-[#E2E8F0] bg-white/90 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex items-center justify-between h-full gap-3">
          {/* Logo & System Identity */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="min-w-0">
              <div className="flex items-center gap-2.5">
                <h1 className="font-serif-cormorant text-2xl font-semibold text-[#0F172A] tracking-tight truncate">
                  S.M. System
                </h1>
                <span className="hidden sm:inline-flex px-2.5 py-0.5 bg-[#F5F3FF] text-[#6D28D9] border border-[#EDE9FE] rounded-full text-[10px] font-mono-geist font-semibold tracking-wide">
                  REGISTRY PORTAL
                </span>
              </div>
              <p className="font-mono-geist text-[11px] text-[#64748B] hidden md:block truncate">
                {userSession ? `Signed in as ${userSession.name} (${userSession.email})` : 'Central Student Database'} · {totalStudents} Records Loaded
              </p>
            </div>
          </div>

          {/* Action buttons & View toggle */}
          <div className="flex items-center gap-2 shrink-0">
            {/* View switcher segmented control */}
            <div className="hidden lg:flex items-center p-1 bg-[#F1F5F9] rounded border border-[#E2E8F0]">
              <button
                type="button"
                onClick={() => onViewModeChange('table')}
                aria-label="Table view"
                className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                  viewMode === 'table'
                    ? 'bg-white text-[#0F172A] shadow-xs'
                    : 'text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                <Table className="w-3.5 h-3.5" />
                Table
              </button>
              <button
                type="button"
                onClick={() => onViewModeChange('grid')}
                aria-label="Grid view"
                className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white text-[#0F172A] shadow-xs'
                    : 'text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                Cards
              </button>
            </div>

            {/* Attendance Logger button */}
            <button
              type="button"
              onClick={onOpenAttendance}
              aria-label="Log daily attendance"
              title="Record student presence and daily roll call"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#6D28D9] bg-[#F5F3FF] border border-[#DDD6FE] rounded hover:bg-[#EDE9FE] transition-colors shadow-xs"
            >
              <CalendarCheck className="w-3.5 h-3.5 text-[#6D28D9]" />
              <span className="hidden sm:inline">Daily Attendance</span>
            </button>

            {/* Excel Import button */}
            <button
              type="button"
              onClick={onOpenExcelImport}
              aria-label="Import student records from Excel"
              title="Import from Excel or CSV spreadsheet"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 rounded hover:bg-emerald-100 transition-colors shadow-xs"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">Import Excel</span>
            </button>

            {/* Excel Export button */}
            <button
              type="button"
              onClick={onExportExcel}
              aria-label="Export all records to Excel file"
              title="Download Excel spreadsheet workbook (.xlsx)"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#475569] bg-white border border-[#CBD5E1] rounded hover:bg-slate-50 transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5 text-[#64748B]" />
              <span className="hidden sm:inline">Export Excel</span>
            </button>

            {/* REST API Explorer */}
            <button
              type="button"
              onClick={onOpenApiExplorer}
              aria-label="Open REST API explorer"
              title="Test REST API endpoints"
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#475569] bg-white border border-[#CBD5E1] rounded hover:bg-slate-50 transition-colors shadow-xs font-mono-geist"
            >
              <Terminal className="w-3.5 h-3.5 text-[#64748B]" />
              <span>APIs</span>
            </button>

            {/* Reset Seed Demo Data */}
            <button
              type="button"
              onClick={onResetDatabase}
              disabled={isResetting}
              aria-label="Reset demo data"
              title="Reset records to default university dataset"
              className="hidden xl:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-[#64748B] bg-white border border-[#CBD5E1] rounded hover:bg-slate-50 transition-colors shadow-xs disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#94A3B8] ${isResetting ? 'animate-spin' : ''}`} />
              <span>Reset</span>
            </button>

            {/* Add Student Primary Action in Variation 18 deep ink/accent */}
            <button
              type="button"
              onClick={onAddStudent}
              aria-label="Add new student"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs sm:text-sm font-semibold text-white bg-[#0F172A] hover:bg-[#6D28D9] rounded transition-all duration-200 transform hover:-translate-y-0.5 shadow-sm shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add Student</span>
            </button>

            {/* User Profile & Sign Out */}
            {userSession && (
              <div className="flex items-center gap-2 pl-2 border-l border-[#E2E8F0]">
                <div
                  className="w-8 h-8 rounded bg-[#0F172A] text-white font-mono-geist font-bold text-xs flex items-center justify-center shrink-0 cursor-default"
                  title={`${userSession.name} (${userSession.email})`}
                >
                  {userInitials}
                </div>
                {onSignOut && (
                  <button
                    type="button"
                    onClick={onSignOut}
                    aria-label="Sign out of student management system"
                    title="Sign Out"
                    className="p-1.5 text-[#64748B] hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
