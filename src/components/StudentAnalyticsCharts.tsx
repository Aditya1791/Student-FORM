import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  Line,
  ComposedChart,
  Area,
  Legend,
} from 'recharts';
import { BarChart3, TrendingUp, Award, Layers } from 'lucide-react';
import { Student } from '../types/student';
import { computeGpaDistribution, computeCohortTrends } from '../utils/studentLogic';

interface StudentAnalyticsChartsProps {
  students: Student[];
}

export const StudentAnalyticsCharts: React.FC<StudentAnalyticsChartsProps> = ({ students }) => {
  const [activeTab, setActiveTab] = useState<'distribution' | 'cohort' | 'department'>('distribution');

  // GPA Distribution Data
  const gpaData = useMemo(() => computeGpaDistribution(students), [students]);

  // Cohort Performance Trends (Year 1 to Year 4)
  const cohortData = useMemo(() => computeCohortTrends(students), [students]);

  // Department Performance Breakdown
  const departmentData = useMemo(() => {
    const deptMap: Record<string, { totalGpa: number; count: number }> = {};
    for (const s of students) {
      const dept = s.department || 'Other';
      if (!deptMap[dept]) {
        deptMap[dept] = { totalGpa: 0, count: 0 };
      }
      deptMap[dept].totalGpa += s.gpa;
      deptMap[dept].count += 1;
    }

    return Object.entries(deptMap)
      .map(([name, data]) => ({
        department: name.length > 18 ? `${name.substring(0, 16)}...` : name,
        fullDepartment: name,
        avgGpa: Number((data.totalGpa / data.count).toFixed(2)),
        studentCount: data.count,
      }))
      .sort((a, b) => b.avgGpa - a.avgGpa);
  }, [students]);

  // Most populated GPA bracket
  const modalBracket = useMemo(() => {
    if (gpaData.length === 0) return null;
    return [...gpaData].sort((a, b) => b.count - a.count)[0];
  }, [gpaData]);

  // Highest performing cohort
  const topCohort = useMemo(() => {
    const valid = cohortData.filter((c) => c.count > 0);
    if (valid.length === 0) return null;
    return [...valid].sort((a, b) => b.avgGpa - a.avgGpa)[0];
  }, [cohortData]);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs">
      {/* Top Header & Tab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Academic Analytics & Performance Trends
            </h3>
            <span className="text-xs text-slate-500">
              · {students.length} students analyzed
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Visual distribution of grade point averages and longitudinal cohort progression
          </p>
        </div>

        {/* Segmented Tab Controls */}
        <div className="flex items-center p-1 bg-slate-100 rounded-lg border border-slate-200 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('distribution')}
            aria-label="View GPA Distribution Chart"
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'distribution'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            GPA Distribution
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('cohort')}
            aria-label="View Cohort Trends Chart"
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'cohort'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            Cohort Progression
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('department')}
            aria-label="View Department Performance Chart"
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'department'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            By Department
          </button>
        </div>
      </div>

      {/* Main Content Grid: Chart + Quick Insights */}
      <div className="mt-4 grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Left / Center: Interactive Recharts Surface */}
        <div className="lg:col-span-9 min-h-[280px]">
          {activeTab === 'distribution' && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-700">
                  Student Count by GPA Bracket
                </span>
                <span className="text-[11px] text-slate-500">
                  Grading Scale: 0.00 – 4.00
                </span>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={gpaData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 25 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                      dataKey="bracket"
                      tick={{ fill: '#64748b', fontSize: 11 }}
                      interval={0}
                      angle={-15}
                      textAnchor="end"
                      height={40}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fill: '#64748b', fontSize: 11 }}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-slate-900 text-white p-2.5 rounded-lg text-xs shadow-lg border border-slate-800">
                              <div className="font-semibold">{data.bracket} GPA</div>
                              <div className="text-slate-400 mt-0.5">{data.standing}</div>
                              <div className="mt-1.5 text-indigo-300 font-bold">
                                {data.count} {data.count === 1 ? 'student' : 'students'} ({data.percentage}% of cohort)
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar
                      dataKey="count"
                      name="Students"
                      radius={[4, 4, 0, 0]}
                    >
                      {gpaData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {activeTab === 'cohort' && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-700">
                  Progression Over Academic Years: Average GPA & Attendance
                </span>
                <span className="text-[11px] text-slate-500">
                  Cohort Longitudinal Trend
                </span>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={cohortData}
                    margin={{ top: 10, right: 20, left: -20, bottom: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                      dataKey="year"
                      tick={{ fill: '#64748b', fontSize: 11 }}
                    />
                    <YAxis
                      yAxisId="gpa"
                      domain={[0, 4.0]}
                      ticks={[0, 1.0, 2.0, 3.0, 4.0]}
                      tick={{ fill: '#64748b', fontSize: 11 }}
                    />
                    <YAxis
                      yAxisId="att"
                      orientation="right"
                      domain={[0, 100]}
                      ticks={[0, 50, 75, 100]}
                      tick={{ fill: '#94a3b8', fontSize: 10 }}
                      unit="%"
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-slate-900 text-white p-2.5 rounded-lg text-xs shadow-lg border border-slate-800">
                              <div className="font-semibold">{data.year} Cohort</div>
                              <div className="text-slate-400">{data.count} enrolled students</div>
                              <div className="mt-1 text-emerald-400 font-bold">
                                Avg GPA: {data.avgGpa.toFixed(2)} / 4.00
                              </div>
                              <div className="text-indigo-300 font-medium">
                                Avg Attendance: {data.avgAttendance}%
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    <Bar
                      yAxisId="gpa"
                      dataKey="avgGpa"
                      name="Average GPA"
                      fill="#6366f1"
                      radius={[4, 4, 0, 0]}
                      barSize={32}
                    />
                    <Line
                      yAxisId="att"
                      type="monotone"
                      dataKey="avgAttendance"
                      name="Attendance Rate (%)"
                      stroke="#10b981"
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: '#10b981' }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {activeTab === 'department' && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-700">
                  Average GPA by Academic Department
                </span>
                <span className="text-[11px] text-slate-500">
                  Departmental Standing
                </span>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={departmentData}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                    <XAxis
                      type="number"
                      domain={[0, 4.0]}
                      ticks={[0, 1.0, 2.0, 3.0, 4.0]}
                      tick={{ fill: '#64748b', fontSize: 11 }}
                    />
                    <YAxis
                      type="category"
                      dataKey="department"
                      tick={{ fill: '#475569', fontSize: 11 }}
                      width={110}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-slate-900 text-white p-2.5 rounded-lg text-xs shadow-lg border border-slate-800">
                              <div className="font-semibold">{data.fullDepartment}</div>
                              <div className="mt-1 text-emerald-400 font-bold">
                                Avg GPA: {data.avgGpa.toFixed(2)} / 4.00
                              </div>
                              <div className="text-slate-400 text-[11px]">
                                {data.studentCount} enrolled students
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar
                      dataKey="avgGpa"
                      name="Average GPA"
                      fill="#4f46e5"
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>

        {/* Right: Key Analytics Insights */}
        <div className="lg:col-span-3 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-slate-100 pt-4 lg:pt-0 lg:pl-5 space-y-3">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Cohort Insights
            </span>

            {/* Modal bracket */}
            <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">
                Modal GPA Bracket
              </span>
              <div className="text-base font-bold text-slate-900 mt-0.5">
                {modalBracket ? `${modalBracket.bracket} GPA` : 'N/A'}
              </div>
              <div className="text-xs text-slate-600 mt-0.5">
                {modalBracket ? `${modalBracket.count} students (${modalBracket.percentage}%)` : ''}
              </div>
            </div>

            {/* Top Cohort */}
            <div className="mt-2.5 p-3 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">
                Top Performing Year
              </span>
              <div className="text-base font-bold text-slate-900 mt-0.5">
                {topCohort ? topCohort.year : 'N/A'}
              </div>
              <div className="text-xs text-emerald-700 font-medium mt-0.5">
                {topCohort ? `Avg GPA: ${topCohort.avgGpa.toFixed(2)}` : ''}
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 border-t border-slate-100 pt-3">
            Real-time visual computation updated with every CRUD operation.
          </div>
        </div>
      </div>
    </div>
  );
};
