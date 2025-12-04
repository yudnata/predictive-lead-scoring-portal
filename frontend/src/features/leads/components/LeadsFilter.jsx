import React, { useState, useEffect } from 'react';
import MetaService from '../api/meta-service';

const LeadsFilter = ({ isOpen, initialFilters, onApply }) => {
  const [jobs, setJobs] = useState([]);
  const [maritalStatuses, setMaritalStatuses] = useState([]);
  const [educationLevels, setEducationLevels] = useState([]);

  const [filters, setFilters] = useState(initialFilters);
  useEffect(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

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
    <div className="p-6 rounded-xl bg-dark-bg border border-white/10 animate-fade-in-down flex flex-wrap items-end gap-2">
      <div className="flex flex-col space-y-1 w-full md:w-32">
        <label className="text-xs text-gray-400 ml-1">Min Score (0-100%)</label>
        <input
          type="number"
          name="minScore"
          step="1"
          min="0"
          max="100"
          value={filters.minScore}
          onChange={handleFilterChange}
          className="px-3 py-2 text-sm text-white bg-[#242424] rounded-xl border border-white/10 focus:border-blue-500 focus:outline-none"
          placeholder="0"
        />
      </div>
      <div className="flex flex-col space-y-1 w-full md:w-32">
        <label className="text-xs text-gray-400 ml-1">Max Score (0-100%)</label>
        <input
          type="number"
          name="maxScore"
          step="1"
          min="0"
          max="100"
          value={filters.maxScore}
          onChange={handleFilterChange}
          className="px-3 py-2 text-sm text-white bg-[#242424] rounded-xl border border-white/10 focus:border-blue-500 focus:outline-none"
          placeholder="100"
        />
      </div>

      <div className="flex flex-col space-y-1 w-full md:w-48">
        <label className="text-xs text-gray-400 ml-1">Job</label>
        <select
          name="jobId"
          value={filters.jobId}
          onChange={handleFilterChange}
          className="px-3 py-2 text-sm text-white bg-[#242424] rounded-xl border border-white/10 focus:border-blue-500 focus:outline-none"
        >
          <option value="">All Jobs</option>
          {jobs.map((job) => (
            <option
              key={job.job_id}
              value={job.job_id}
            >
              {job.job_name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col space-y-1 w-full md:w-48">
        <label className="text-xs text-gray-400 ml-1">Marital Status</label>
        <select
          name="maritalId"
          value={filters.maritalId}
          onChange={handleFilterChange}
          className="px-3 py-2 text-sm text-white bg-[#242424] rounded-xl border border-white/10 focus:border-blue-500 focus:outline-none"
        >
          <option value="">All Statuses</option>
          {maritalStatuses.map((status) => (
            <option
              key={status.marital_id}
              value={status.marital_id}
            >
              {status.marital_status}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col space-y-1 w-full md:w-48">
        <label className="text-xs text-gray-400 ml-1">Education</label>
        <select
          name="educationId"
          value={filters.educationId}
          onChange={handleFilterChange}
          className="px-3 py-2 text-sm text-white bg-[#242424] rounded-xl border border-white/10 focus:border-blue-500 focus:outline-none"
        >
          <option value="">All Levels</option>
          {educationLevels.map((edu) => (
            <option
              key={edu.education_id}
              value={edu.education_id}
            >
              {edu.education_level}
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-2 ml-auto">
        <button
          onClick={clearFilters}
          className="px-4 py-2 text-sm text-white bg-red-600 rounded-xl hover:text-white hover:bg-red-500 transition-colors h-[38px]"
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

export default LeadsFilter;
