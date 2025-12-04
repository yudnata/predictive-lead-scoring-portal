import React, { useState, useEffect } from 'react';
import CampaignService from '../../campaigns/api/campaign-service';

const OutboundFilter = ({ isOpen, initialFilters, onApply }) => {
  const [campaigns, setCampaigns] = useState([]);
  const [filters, setFilters] = useState(initialFilters);

  useEffect(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const result = await CampaignService.getOptions();
        if (result && Array.isArray(result)) {
          setCampaigns(result);
        } else {
          setCampaigns([]);
        }
      } catch (error) {
        console.error('Failed to load campaigns:', error);
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
      <div className="flex flex-col space-y-1 w-full md:w-64">
        <label className="text-xs text-gray-400 ml-1">Campaign</label>
        <select
          name="campaignId"
          value={filters.campaignId}
          onChange={handleFilterChange}
          className="px-3 py-2 text-sm text-white bg-[#242424] rounded-xl border border-white/10 focus:border-blue-500 focus:outline-none"
        >
          <option value="">All Campaigns</option>
          {campaigns.map((campaign) => (
            <option
              key={campaign.campaign_id}
              value={campaign.campaign_id}
            >
              {campaign.campaign_name}
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

export default OutboundFilter;
