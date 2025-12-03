import React, { useState, useEffect } from 'react';
import MetaService from '../api/meta-service';

const LeadsFilter = ({ isOpen, initialFilters, onApply }) => {
  const [jobs, setJobs] = useState([]);
  const [maritalStatuses, setMaritalStatuses] = useState([]);
  const [educationLevels, setEducationLevels] = useState([]);

  const [filters, setFilters] = useState(initialFilters);

  // Sync with initialFilters when they change (e.g. on clear from parent if needed, or just init)
  useEffect(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  // Fetch Metadata
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [jobsData, maritalData, educationData] = await Promise.all([
          MetaService.getJobs(),
          MetaService.getMaritalStatus(),
          MetaService.getEducationLevels(),
        ]);
        setJobs(jobsData.data || []);
        setMaritalStatuses(maritalData.data || []);
        setEducationLevels(educationData.data || []);
      } catch (error) {
        console.error('Failed to load metadata:', error);
      }
    };
    if (isOpen) {
        fetchMetadata();
    }
  }, [isOpen]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const clearFilters = () => {
    const emptyFilters = {
      minScore: '',
      maxScore: '',
      jobId: '',
      maritalId: '',
      educationId: '',
    };
    setFilters(emptyFilters);
    onApply(emptyFilters);
  };

  const applyFilters = () => {
    onApply(filters);
  };

  if (!isOpen) return null;

  return (
    <div className="p-4 rounded-lg bg-[#242424] border border-white/10 animate-fade-in-down">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
        {/* Score Range */}
        <div className="flex flex-col space-y-1">
          <label className="text-xs text-gray-400">Min Score (0-100%)</label>
          <input
            type="number"
            name="minScore"
            step="1"
            min="0"
            max="100"
            value={filters.minScore}
            onChange={handleFilterChange}
            className="px-3 py-2 text-sm text-white bg-dark-bg rounded border border-white/10 focus:border-blue-500 focus:outline-none"
            placeholder="0"
          />
        </div>
        <div className="flex flex-col space-y-1">
          <label className="text-xs text-gray-400">Max Score (0-100%)</label>
          <input
            type="number"
            name="maxScore"
            step="1"
            min="0"
            max="100"
            value={filters.maxScore}
            onChange={handleFilterChange}
            className="px-3 py-2 text-sm text-white bg-dark-bg rounded border border-white/10 focus:border-blue-500 focus:outline-none"
            placeholder="100"
          />
        </div>

        {/* Job Filter */}
        <div className="flex flex-col space-y-1">
          <label className="text-xs text-gray-400">Job</label>
          <select
            name="jobId"
            value={filters.jobId}
            onChange={handleFilterChange}
            className="px-3 py-2 text-sm text-white bg-dark-bg rounded border border-white/10 focus:border-blue-500 focus:outline-none"
          >
            <option value="">All Jobs</option>
            {jobs.map((job) => (
              <option key={job.job_id} value={job.job_id}>
                {job.job_name}
              </option>
            ))}
          </select>
        </div>

        {/* Marital Filter */}
        <div className="flex flex-col space-y-1">
          <label className="text-xs text-gray-400">Marital Status</label>
          <select
            name="maritalId"
            value={filters.maritalId}
            onChange={handleFilterChange}
            className="px-3 py-2 text-sm text-white bg-dark-bg rounded border border-white/10 focus:border-blue-500 focus:outline-none"
          >
            <option value="">All Statuses</option>
            {maritalStatuses.map((status) => (
              <option key={status.marital_id} value={status.marital_id}>
                {status.marital_status}
              </option>
            ))}
          </select>
        </div>

        {/* Education Filter */}
        <div className="flex flex-col space-y-1">
          <label className="text-xs text-gray-400">Education</label>
          <select
            name="educationId"
            value={filters.educationId}
            onChange={handleFilterChange}
            className="px-3 py-2 text-sm text-white bg-dark-bg rounded border border-white/10 focus:border-blue-500 focus:outline-none"
          >
            <option value="">All Levels</option>
            {educationLevels.map((edu) => (
              <option key={edu.education_id} value={edu.education_id}>
                {edu.education_level}
              </option>
            ))}
          </select>
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

export default LeadsFilter;
