import React from 'react';
import { Users, Award, AlertTriangle, GraduationCap } from 'lucide-react';
import { StudentStats } from '../types/student';

interface StatsCardsProps {
  stats: StudentStats;
}

export const StatsCards: React.FC<StatsCardsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Students */}
      <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Enrolled</span>
          <Users className="w-4 h-4 text-slate-400" />
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-slate-900">{stats.totalStudents}</span>
          <span className="text-xs text-slate-500">
            {stats.activeStudents} active
          </span>
        </div>
        <div className="mt-2 text-xs text-slate-500">
          Across {Object.keys(stats.departmentCounts).length} academic departments
        </div>
      </div>

      {/* Average GPA */}
      <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Average GPA</span>
          <GraduationCap className="w-4 h-4 text-indigo-500" />
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-slate-900">{stats.averageGpa.toFixed(2)}</span>
          <span className="text-xs text-slate-500">/ 4.00 scale</span>
        </div>
        <div className="mt-2 text-xs text-slate-500">
          Cohort academic performance
        </div>
      </div>

      {/* Honors Students */}
      <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Dean's Honors</span>
          <Award className="w-4 h-4 text-amber-500" />
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-slate-900">{stats.honorsCount}</span>
          <span className="text-xs text-slate-500">
            {stats.totalStudents > 0 ? `${Math.round((stats.honorsCount / stats.totalStudents) * 100)}%` : '0%'}
          </span>
        </div>
        <div className="mt-2 text-xs text-slate-500">
          GPA ≥ 3.50 (Cum Laude or higher)
        </div>
      </div>

      {/* Academic Warning / At-Risk */}
      <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Academic Warning</span>
          <AlertTriangle className="w-4 h-4 text-rose-500" />
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-slate-900">{stats.atRiskCount}</span>
          <span className="text-xs text-slate-500">
            {stats.totalStudents > 0 ? `${Math.round((stats.atRiskCount / stats.totalStudents) * 100)}%` : '0%'}
          </span>
        </div>
        <div className="mt-2 text-xs text-slate-500">
          GPA &lt; 2.50 requiring advisory support
        </div>
      </div>
    </div>
  );
};
