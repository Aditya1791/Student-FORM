import React from 'react';
import { Search, X, ArrowUpDown, Filter } from 'lucide-react';
import { StudentFilters } from '../types/student';

interface StudentFiltersProps {
  filters: StudentFilters;
  onChange: (newFilters: StudentFilters) => void;
  departments: string[];
}

export const StudentFiltersBar: React.FC<StudentFiltersProps> = ({
  filters,
  onChange,
  departments,
}) => {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...filters, search: e.target.value });
  };

  const handleClearSearch = () => {
    onChange({ ...filters, search: '' });
  };

  const handleDepartmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({ ...filters, department: e.target.value });
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({ ...filters, status: e.target.value });
  };

  const handleSortByChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({ ...filters, sortBy: e.target.value as any });
  };

  const handleToggleSortOrder = () => {
    onChange({ ...filters, sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc' });
  };

  const handleResetFilters = () => {
    onChange({
      search: '',
      department: 'All',
      status: 'All',
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
  };

  const isFiltered =
    filters.search !== '' ||
    filters.department !== 'All' ||
    filters.status !== 'All' ||
    filters.sortBy !== 'createdAt' ||
    filters.sortOrder !== 'desc';

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-3 sm:p-4 shadow-xs space-y-3">
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search input */}
        <div className="relative flex-1">
          <label htmlFor="search-input" className="sr-only">
            Search students
          </label>
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            id="search-input"
            type="text"
            value={filters.search}
            onChange={handleSearchChange}
            placeholder="Search by name, roll number, email, or department..."
            className="block w-full pl-9 pr-9 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
          />
          {filters.search && (
            <button
              type="button"
              onClick={handleClearSearch}
              aria-label="Clear search"
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Dropdowns & controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Department selector */}
          <div className="flex items-center">
            <label htmlFor="department-filter" className="sr-only">
              Filter by Department
            </label>
            <select
              id="department-filter"
              value={filters.department}
              onChange={handleDepartmentChange}
              className="px-3 py-2 border border-slate-300 rounded-lg text-xs sm:text-sm text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="All">All Departments</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          {/* Status selector */}
          <div className="flex items-center">
            <label htmlFor="status-filter" className="sr-only">
              Filter by Status
            </label>
            <select
              id="status-filter"
              value={filters.status}
              onChange={handleStatusChange}
              className="px-3 py-2 border border-slate-300 rounded-lg text-xs sm:text-sm text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="On Leave">On Leave</option>
              <option value="Graduated">Graduated</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>

          {/* Sort By selector */}
          <div className="flex items-center">
            <label htmlFor="sort-by" className="sr-only">
              Sort by
            </label>
            <select
              id="sort-by"
              value={filters.sortBy}
              onChange={handleSortByChange}
              className="px-3 py-2 border border-slate-300 rounded-lg text-xs sm:text-sm text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="createdAt">Date Added</option>
              <option value="name">Student Name</option>
              <option value="rollNumber">Roll Number</option>
              <option value="gpa">GPA Score</option>
            </select>
          </div>

          {/* Sort Order Toggle */}
          <button
            type="button"
            onClick={handleToggleSortOrder}
            title={filters.sortOrder === 'asc' ? 'Ascending Order' : 'Descending Order'}
            aria-label={`Sort order: ${filters.sortOrder === 'asc' ? 'Ascending' : 'Descending'}`}
            className="p-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <ArrowUpDown className="w-4 h-4 text-slate-600" />
          </button>

          {/* Reset Filters button if active */}
          {isFiltered && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="px-2.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 border border-dashed border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Reset
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
