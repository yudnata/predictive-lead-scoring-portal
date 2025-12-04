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
      minLeads: '',
      maxLeads: '',
    };
    setFilters(emptyFilters);
    onApply(emptyFilters);
  };

  const applyFilters = () => {
    onApply(filters);
  };

  if (!isOpen) return null;

  return (
    <div className="p-4 rounded-lg bg-[#242424] border border-white/10 animate-fade-in-down mb-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* Is Active Filter */}
        <div className="flex flex-col space-y-1">
          <label className="text-xs text-gray-400">Status</label>
          <select
            name="isActive"
            value={filters.isActive || ''}
            onChange={handleFilterChange}
            className="px-3 py-2 text-sm text-white bg-dark-bg rounded border border-white/10 focus:border-blue-500 focus:outline-none"
          >
            <option value="">All</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>

        {/* Leads Handled Range */}
        <div className="flex flex-col space-y-1">
          <label className="text-xs text-gray-400">Min Leads Handled</label>
          <input
            type="number"
            name="minLeads"
            min="0"
            value={filters.minLeads || ''}
            onChange={handleFilterChange}
            className="px-3 py-2 text-sm text-white bg-dark-bg rounded border border-white/10 focus:border-blue-500 focus:outline-none"
            placeholder="0"
          />
        </div>
        <div className="flex flex-col space-y-1">
          <label className="text-xs text-gray-400">Max Leads Handled</label>
          <input
            type="number"
            name="maxLeads"
            min="0"
            value={filters.maxLeads || ''}
            onChange={handleFilterChange}
            className="px-3 py-2 text-sm text-white bg-dark-bg rounded border border-white/10 focus:border-blue-500 focus:outline-none"
            placeholder="100"
          />
        </div>
      </div>

      <div className="flex justify-end mt-4 gap-2">
        <button
          onClick={clearFilters}
          className="px-4 py-1 text-sm text-white bg-red-600 rounded hover:text-red-300 hover:bg-red-500 transition-colors"
        >
          Clear Filters
        </button>
        <button
          onClick={applyFilters}
          className="px-4 py-1 text-sm font-semibold text-white bg-blue-600 rounded hover:bg-blue-500 transition-colors"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
};

export default SalesFilter;
