import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const CampaignFilter = ({ isOpen, initialFilters, onApply }) => {
  const [filters, setFilters] = useState(initialFilters);
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;

  const parseDateSafe = (dateString) => {
    if (!dateString) return null;
    const datePart = dateString.includes('T') ? dateString.split('T')[0] : dateString;
    const [year, month, day] = datePart.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  useEffect(() => {
    setFilters(initialFilters);
    const start = parseDateSafe(initialFilters.startDate);
    const end = parseDateSafe(initialFilters.endDate);
    setDateRange([start, end]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(initialFilters)]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const formatDateToString = (date) => {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleDateChange = (update) => {
    setDateRange(update);
    const [start, end] = update;
    setFilters((prev) => ({
      ...prev,
      startDate: formatDateToString(start),
      endDate: formatDateToString(end),
    }));
  };

  const clearFilters = () => {
    const emptyFilters = {
      isActive: '',
      startDate: '',
      endDate: '',
    };
    setFilters(emptyFilters);
    setDateRange([null, null]);
    onApply(emptyFilters);
  };

  const applyFilters = () => {
    onApply(filters);
  };

  if (!isOpen) return null;

  return (
    <div className="p-6 rounded-xl bg-gray-100 dark:bg-[#121212] border border-gray-300 dark:border-white/10 animate-fade-in-down mb-6 flex flex-wrap items-end gap-2 transition-colors">
      <div className="flex flex-col space-y-1 w-full md:w-48">
        <label className="text-xs text-gray-600 dark:text-gray-400 ml-1">Status</label>
        <select
          name="isActive"
          value={filters.isActive}
          onChange={handleFilterChange}
          className="px-3 py-2 text-sm text-gray-800 bg-white rounded-xl border border-gray-300 focus:border-blue-500 focus:outline-none dark:bg-[#242424] dark:text-white dark:border-white/10"
        >
          <option value="">All Statuses</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
      </div>
      <div className="flex flex-col space-y-1 w-full md:w-64">
        <label className="text-xs text-gray-600 dark:text-gray-400 ml-1">Date Range (Active During)</label>
        <div className="relative w-full">
          <DatePicker
            selectsRange={true}
            startDate={startDate}
            endDate={endDate}
            onChange={handleDateChange}
            isClearable={true}
            placeholderText="Select date range"
            className="w-full px-3 py-2 text-sm text-gray-800 bg-white rounded-xl border border-gray-300 focus:border-blue-500 focus:outline-none cursor-pointer dark:bg-[#242424] dark:text-white dark:border-white/10"
            wrapperClassName="w-full"
            dateFormat="yyyy-MM-dd"
          />
        </div>
      </div>
      <div className="flex gap-2 ml-auto">
        <button
          onClick={clearFilters}
          className="px-4 py-2 text-sm text-white bg-red-600 rounded-xl hover:bg-red-500 transition-colors h-[38px]"
        >
          Clear
        </button>
        <button
          onClick={applyFilters}
          className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-500 transition-colors h-[38px]"
        >
          Apply
        </button>
      </div>
    </div>
  );
};

export default CampaignFilter;
