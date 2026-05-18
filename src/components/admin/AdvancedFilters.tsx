import React, { useState } from 'react';
import { X, Calendar, Filter, ChevronDown, ChevronUp } from 'lucide-react';

interface AdvancedFiltersProps {
  onFilterChange: (filters: any) => void;
  onClear: () => void;
}

export default function AdvancedFilters({ onFilterChange, onClear }: AdvancedFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState({
    dateRange: 'all',
    paymentStatus: 'all',
    educationLevel: 'all',
    hasNotes: false,
    hasCallHistory: false
  });

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleClear = () => {
    const clearedFilters = {
      dateRange: 'all',
      paymentStatus: 'all',
      educationLevel: 'all',
      hasNotes: false,
      hasCallHistory: false
    };
    setFilters(clearedFilters);
    onClear();
  };

  const hasActiveFilters = Object.values(filters).some(value => 
    value !== 'all' && value !== false
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Advanced Filters</h3>
            {hasActiveFilters && (
              <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 text-xs font-semibold rounded-full">
                Active
              </span>
            )}
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-600 dark:text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-600 dark:text-gray-400" />}
          </button>
        </div>
      </div>

      {/* Filters */}
      {isExpanded && (
        <div className="p-4 space-y-4">
          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Date Range
            </label>
            <select
              value={filters.dateRange}
              onChange={(e) => handleFilterChange('dateRange', e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>
          </div>

          {/* Payment Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Payment Status
            </label>
            <select
              value={filters.paymentStatus}
              onChange={(e) => handleFilterChange('paymentStatus', e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="PAID">Paid</option>
              <option value="PENDING">Pending</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>

          {/* Education Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Education Level
            </label>
            <select
              value={filters.educationLevel}
              onChange={(e) => handleFilterChange('educationLevel', e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Levels</option>
              <option value="SSC">SSC</option>
              <option value="HSC">HSC</option>
              <option value="Diploma">Diploma</option>
              <option value="Bachelor">Bachelor</option>
              <option value="Master">Master</option>
            </select>
          </div>

          {/* Checkbox Filters */}
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.hasNotes}
                onChange={(e) => handleFilterChange('hasNotes', e.target.checked)}
                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Has Notes</span>
            </label>
            
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.hasCallHistory}
                onChange={(e) => handleFilterChange('hasCallHistory', e.target.checked)}
                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Has Call History</span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleClear}
              className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium flex items-center justify-center gap-2"
            >
              <X className="w-4 h-4" />
              Clear All
            </button>
            <button
              onClick={() => setIsExpanded(false)}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all font-medium"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
