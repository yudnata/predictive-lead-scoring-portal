import { useState, useEffect } from 'react';

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
    <div className="p-4 rounded-lg bg-white dark:bg-[#242424] border border-gray-300 dark:border-white/10 animate-fade-in-down mb-6 transition-colors">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="flex flex-col space-y-1">
          <label className="text-xs text-gray-600 dark:text-gray-400">Status</label>
          <select
            name="isActive"
            value={filters.isActive || ''}
            onChange={handleFilterChange}
            className="px-3 py-2 text-sm text-gray-800 bg-gray-100 rounded border border-gray-300 focus:border-blue-500 focus:outline-none dark:text-white dark:bg-[#1A1A1A] dark:border-white/10 transition-colors"
          >
            <option value="">All</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>
        <div className="flex flex-col space-y-1">
          <label className="text-xs text-gray-600 dark:text-gray-400">Min Leads Handled</label>
          <input
            type="number"
            name="minLeads"
            min="0"
            value={filters.minLeads || ''}
            onChange={handleFilterChange}
            className="px-3 py-2 text-sm text-gray-800 bg-gray-100 rounded border border-gray-300 focus:border-blue-500 focus:outline-none dark:text-white dark:bg-[#1A1A1A] dark:border-white/10 transition-colors"
            placeholder="0"
          />
        </div>
        <div className="flex flex-col space-y-1">
          <label className="text-xs text-gray-600 dark:text-gray-400">Max Leads Handled</label>
          <input
            type="number"
            name="maxLeads"
            min="0"
            value={filters.maxLeads || ''}
            onChange={handleFilterChange}
            className="px-3 py-2 text-sm text-gray-800 bg-gray-100 rounded border border-gray-300 focus:border-blue-500 focus:outline-none dark:text-white dark:bg-[#1A1A1A] dark:border-white/10 transition-colors"
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
