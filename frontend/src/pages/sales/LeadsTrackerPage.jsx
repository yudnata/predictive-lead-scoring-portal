import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import LeadsTrackerService from '../../features/tracker/api/tracker-service';
import CampaignService from '../../features/campaigns/api/campaign-service';
import KanbanColumn from '../../features/tracker/components/KanbanColumn';

const KANBAN_STATUSES = [
  { name: 'Uncontacted', id: 3 },
  { name: 'Contacted', id: 4 },
];

import TrackerFilter from '../../features/tracker/components/TrackerFilter';

const LeadsTrackerPage = () => {
  const navigate = useNavigate();
  const outletContext = useOutletContext?.() || {};
  const user = outletContext.user || outletContext || {};

  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  const [totalResults, setTotalResults] = useState(0);

  const [search, setSearch] = useState('');

  const [showFilters, setShowFilters] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState({
    campaignId: '',
    minScore: '',
    maxScore: '',
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    if (!user.user_id) {
      setLoading(false);
      return;
    }
    try {
      const res = await LeadsTrackerService.getAll(1, 500, search, appliedFilters, user.user_id);

      setList(res.data || []);
      setTotalResults(res.meta?.total || 0);
    } catch (err) {
      console.error('Gagal memuat leads tracker:', err);
      if (err.response) {
        console.error(err.response.data?.message || 'Gagal memuat data leads tracker.');
      }
    } finally {
      setLoading(false);
    }
  }, [search, appliedFilters, user.user_id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleApplyFilters = (newFilters) => {
    setAppliedFilters(newFilters);
  };

  const handleChangeStatus = async (leadCampaignId, newStatusId) => {
    try {
      await LeadsTrackerService.updateStatus(leadCampaignId, {
        status_id: newStatusId,
      });
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Failed to update status.');
    }
  };

  const handleDelete = async (lead) => {
    if (window.confirm('Are you sure you want to remove this lead from tracking?')) {
      try {
        await LeadsTrackerService.delete(lead.lead_campaign_id);
        fetchData();
      } catch (err) {
        console.error(err);
        alert('Failed to remove lead.');
      }
    }
  };

  const handleAddOutbound = (lead) => {
    navigate(`/sales/outbound/${lead.lead_campaign_id}`, { state: lead });
  };

  const handleDrop = (leadCampaignId, newStatusId) => {
    const lead = list.find((l) => l.lead_campaign_id === leadCampaignId);
    if (!lead) return;

    const currentStatusMap = {
      Uncontacted: 3,
      Contacted: 4,
      Deal: 5,
      Reject: 6,
    };
    const currentStatusId = currentStatusMap[lead.status];

    if (currentStatusId === newStatusId) return;

    handleChangeStatus(leadCampaignId, newStatusId);
  };

  const groupedLeads = KANBAN_STATUSES.reduce((acc, status) => {
    const leadsInStatus = list.filter((lead) => lead.status === status.name);
    acc[status.name] = leadsInStatus.sort((a, b) => {
      const scoreA = a.score ?? 0;
      const scoreB = b.score ?? 0;
      return scoreB - scoreA;
    });
    return acc;
  }, {});

  return (
    <div>
      {/* Header Section */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <h1 className="text-3xl font-bold text-white">Leads Tracker</h1>
            <div className="flex items-center ml-6 space-x-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                  }}
                  className="w-80 p-1 pl-10 bg-[#242424] text-white rounded-lg border border-white/10 focus:outline-none focus:border-white/50 transition-colors"
                />
                <img
                  src="/search.png"
                  className="absolute w-auto h-4 transform -translate-y-1/2 left-3 top-1/2"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-1 rounded-lg border transition-all flex items-center gap-2 ${
                  showFilters
                    ? 'bg-blue-600 border border-white/10 text-white'
                    : 'bg-[#242424] border border-white/10 text-gray-400 hover:bg-[#2a2a2a]'
                }`}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                  />
                </svg>
                Filters
                {(appliedFilters.campaignId ||
                  appliedFilters.minScore ||
                  appliedFilters.maxScore) && (
                  <span className="flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-blue-500 rounded-full">
                    !
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        <TrackerFilter
          isOpen={showFilters}
          initialFilters={appliedFilters}
          onApply={handleApplyFilters}
          userId={user.user_id}
        />
      </div>

      <div className="flex items-center mb-5 gap-9">
        <div className="ml-auto text-sm text-gray-400">
          Total: <span className="text-white font-semibold">{totalResults}</span> leads
        </div>
      </div>

      {/* Kanban Board */}
      {loading ? (
        <div className="flex items-center justify-center h-96 text-gray-400">
          <div className="text-center">
            <div className="inline-block w-8 h-8 border-4 border-gray-400 border-t-white rounded-full animate-spin mb-2"></div>
            <p>Loading leads...</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4 pb-4">
          {KANBAN_STATUSES.map((status) => (
            <KanbanColumn
              key={status.id}
              status={status.name}
              statusId={status.id}
              leads={groupedLeads[status.name] || []}
              onDrop={handleDrop}
              onAddOutbound={handleAddOutbound}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default LeadsTrackerPage;
