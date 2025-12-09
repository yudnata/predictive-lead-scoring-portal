import React, { useState, useEffect } from 'react';

const SalesFilter = ({ isOpen, initialFilters, onApply }) => {
  const [filters, setFilters] = useState(initialFilters);

  useEffect(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const clearFilters = () => {
    const emptyFilters = {
      isActive: '',
      minLeadsHandled: '',
      maxLeadsHandled: '',
    };
    setFilters(emptyFilters);
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

      <div className="flex flex-col space-y-1 w-full md:w-48">
        <label className="text-xs text-gray-600 dark:text-gray-400 ml-1">Min Leads Handled</label>
        <input
          type="number"
          name="minLeadsHandled"
          min="0"
          value={filters.minLeadsHandled}
          onChange={handleFilterChange}
          className="px-3 py-2 text-sm text-gray-800 bg-white rounded-xl border border-gray-300 focus:border-blue-500 focus:outline-none dark:bg-[#242424] dark:text-white dark:border-white/10"
          placeholder="0"
        />
      </div>
      <div className="flex flex-col space-y-1 w-full md:w-48">
        <label className="text-xs text-gray-600 dark:text-gray-400 ml-1">Max Leads Handled</label>
        <input
          type="number"
          name="maxLeadsHandled"
          min="0"
          value={filters.maxLeadsHandled}
          onChange={handleFilterChange}
          className="px-3 py-2 text-sm text-gray-800 bg-white rounded-xl border border-gray-300 focus:border-blue-500 focus:outline-none dark:bg-[#242424] dark:text-white dark:border-white/10"
          placeholder="100"
        />
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

export default SalesFilter;
