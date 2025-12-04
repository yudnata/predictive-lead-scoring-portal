import React, { useState, useEffect } from 'react';
import CampaignService from '../../campaigns/api/campaign-service';

const TrackerFilter = ({ isOpen, initialFilters, onApply }) => {
  const [filters, setFilters] = useState(initialFilters);
  const [campaigns, setCampaigns] = useState([]);

  useEffect(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const res = await CampaignService.getOptions();
        setCampaigns(res || []);
      } catch (err) {
        console.error('Failed to load campaigns for filter:', err);
      }
    };
    if (isOpen) {
      fetchCampaigns();
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
      campaignId: '',
      minScore: '',
      maxScore: '',
    };
    setFilters(emptyFilters);
    onApply(emptyFilters);
  };

  const applyFilters = () => {
    onApply(filters);
  };

  if (!isOpen) return null;

  return (
    <div className="p-6 rounded-xl bg-dark-bg border border-white/10 animate-fade-in-down mb-6 flex flex-wrap items-end gap-2">
      <div className="flex flex-col space-y-1 w-full md:w-48">
        <label className="text-xs text-gray-400 ml-1">Campaign</label>
        <select
          name="campaignId"
          value={filters.campaignId}
          onChange={handleFilterChange}
          className="px-3 py-2 text-sm text-white bg-[#242424] rounded-xl border border-white/10 focus:border-blue-500 focus:outline-none"
        >
          <option value="">All Campaigns</option>
          {campaigns.map((c) => (
            <option
              key={c.campaign_id}
              value={c.campaign_id}
            >
              {c.campaign_name}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col space-y-1 w-full md:w-32">
        <label className="text-xs text-gray-400 ml-1">Min Score</label>
        <input
          type="number"
          name="minScore"
          min="0"
          max="100"
          value={filters.minScore}
          onChange={handleFilterChange}
          className="px-3 py-2 text-sm text-white bg-[#242424] rounded-xl border border-white/10 focus:border-blue-500 focus:outline-none"
          placeholder="0"
        />
      </div>
      <div className="flex flex-col space-y-1 w-full md:w-32">
        <label className="text-xs text-gray-400 ml-1">Max Score</label>
        <input
          type="number"
          name="maxScore"
          min="0"
          max="100"
          value={filters.maxScore}
          onChange={handleFilterChange}
          className="px-3 py-2 text-sm text-white bg-[#242424] rounded-xl border border-white/10 focus:border-blue-500 focus:outline-none"
          placeholder="100"
        />
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

export default TrackerFilter;
