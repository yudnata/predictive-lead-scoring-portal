import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import LeadsTrackerService from '../../features/tracker/api/tracker-service';
import CampaignService from '../../features/campaigns/api/campaign-service';
import KanbanColumn from '../../components/KanbanColumn';

const KANBAN_STATUSES = [
  { name: 'Uncontacted', id: 3 },
  { name: 'Contacted', id: 4 },
];

const LeadsTrackerPage = () => {
  const navigate = useNavigate();
  const outletContext = useOutletContext?.() || {};
  const user = outletContext.user || outletContext || {};

  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  const [totalResults, setTotalResults] = useState(0);

  const [search, setSearch] = useState('');
  const [campaignFilter, setCampaignFilter] = useState('');

  const [campaigns, setCampaigns] = useState([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    if (!user.user_id) {
      setLoading(false);
      return;
    }
    try {
      const res = await LeadsTrackerService.getAll(
        1,
        500,
        search,
        campaignFilter || null,
        user.user_id
      );
      setList(res.data || []);
      setTotalResults(res.meta?.total || 0);
    } catch (err) {
      console.error('Failed to load leads tracker:', err);
    } finally {
      setLoading(false);
    }
  }, [search, campaignFilter, user.user_id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!user.user_id) return;
    import('../../features/campaigns/api/campaign-service')
      .then((module) => module.default.getAll(1, 100))
      .then((res) => {
        const activeCampaigns = res.data.filter((c) => c.campaign_is_active === true);
        setCampaigns(activeCampaigns || []);
      })
      .catch(() => {});
  }, [user.user_id]);

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

    // Get current status ID from the lead
    const currentStatusMap = {
      Uncontacted: 3,
      Contacted: 4,
      Deal: 5,
      Reject: 6,
    };
    const currentStatusId = currentStatusMap[lead.status];

    // Don't update if dropping in the same column
    if (currentStatusId === newStatusId) return;

    // Update status
    handleChangeStatus(leadCampaignId, newStatusId);
  };

  // Group leads by status for Kanban view and sort by score (highest first)
  const groupedLeads = KANBAN_STATUSES.reduce((acc, status) => {
    const leadsInStatus = list.filter((lead) => lead.status === status.name);
    // Sort by score descending (highest score first)
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
      <div className="flex items-center mb-6">
        <h1 className="text-3xl font-bold text-white">Leads Tracker</h1>

        <div className="relative ml-6">
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
            }}
            className="w-80 p-1 pl-10 bg-[#242424] text-white rounded-lg border border-white/20"
          />
          <img
            src="/search.png"
            className="absolute w-auto h-4 transform -translate-y-1/2 left-3 top-1/2"
          />
        </div>
      </div>

      {/* Filter Section */}
      <div className="flex items-center mb-5 gap-9">
        <span className="text-lg text-white/100">Campaign</span>
        <select
          value={campaignFilter}
          onChange={(e) => {
            setCampaignFilter(e.target.value);
          }}
          className="p-2 text-sm rounded-lg bg-[#242424] border border-white/20 text-white"
        >
          <option value="">All Campaign</option>
          {campaigns.map((c) => (
            <option
              key={c.campaign_id}
              value={c.campaign_id}
            >
              {c.campaign_name}
            </option>
          ))}
        </select>

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
