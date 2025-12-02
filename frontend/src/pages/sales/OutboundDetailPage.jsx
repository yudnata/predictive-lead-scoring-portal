import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import OutboundModal from '../../features/outbound/components/OutboundModal';
import Pagination from '../../components/Pagination';
import CampaignService from '../../features/campaigns/api/campaign-service';
import LeadsTrackerService from '../../features/tracker/api/tracker-service';
import toast from 'react-hot-toast';

const OutboundDetailPage = () => {
  const outletContext = useOutletContext?.() || {};
  const user = outletContext.user || outletContext || {};

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');

  const [selectedLead, setSelectedLead] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [campaignFilter, setCampaignFilter] = useState('');
  const [campaigns, setCampaigns] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  const fetchData = useCallback(async () => {
    setLoading(true);
    if (!user.user_id) {
      setLoading(false);
      return;
    }
    try {
      const res = await LeadsTrackerService.queryLeads(
        {
          page: currentPage,
          limit: limit,
          search: search,
          campaignFilter: campaignFilter || null,
        },
        user.user_id,
        'NOT_BELUM_DIHUBUNGI'
      );
      setData(res.data || []);
      setTotalPages(res.meta?.totalPages || 1);
      setTotalResults(res.meta?.total || 0);
    } catch (err) {
      console.error('Failed to load outbound leads:', err);
      if (err.response) {
        toast.error(err.response.data?.message || 'Failed to load outbound leads data.');
      }
    } finally {
      setLoading(false);
    }
  }, [currentPage, limit, search, campaignFilter, user.user_id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!user.user_id) return;
    const loadCampaigns = async () => {
      try {
        const res = await CampaignService.getAll(1, 100);

        if (Array.isArray(res.data)) {
          const activeCampaigns = res.data.filter((c) => c.campaign_is_active === true);
          setCampaigns(activeCampaigns);
        } else {
          setCampaigns([]);
        }
      } catch (error) {
        console.error('Failed to load campaigns for filter:', error);
      }
    };
    loadCampaigns();
  }, [user.user_id]);

  const openModal = (lead) => {
    setSelectedLead(lead);
    setIsModalOpen(true);
  };

  const handleUpdate = () => {
    setIsModalOpen(false);
    setSelectedLead(null);
    fetchData();
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  const handleCampaignFilterChange = (e) => {
    setCampaignFilter(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="text-white">
      <div className="flex items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Outbound Detail</h1>
        <div className="relative ml-6">
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={handleSearchChange}
            className="w-80 p-1 pl-10 bg-[#242424] text-white rounded-lg border border-white/20"
          />
          <img
            src="/search.png"
            className="absolute w-auto h-4 transform -translate-y-1/2 left-3 top-1/2"
          />
        </div>
      </div>
      <div className="flex items-center mb-5 gap-9">
        <span className="text-lg text-white/100">Campaign</span>
        <select
          value={campaignFilter}
          onChange={handleCampaignFilterChange}
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
      </div>
      <div className="overflow-hidden rounded-lg shadow-lg bg-dark-bg">
        <div className="overflow-x-auto">
          <table className="min-w-full text-center text-white table-auto">
            <thead>
              <tr className="text-sm uppercase border-b border-white/30 text-gray hover:cursor-default">
                <th className="px-4 py-5 font-bold tracking-wider hover:cursor-default">ID</th>
                <th className="px-4 py-5 font-bold tracking-wider hover:cursor-default">Lead Name</th>
                <th className="px-4 py-5 font-bold tracking-wider hover:cursor-default">Campaign</th>
                <th className="px-4 py-5 font-bold tracking-wider hover:cursor-default">Score</th>
                <th className="px-4 py-5 font-bold tracking-wider hover:cursor-default">Status</th>
                <th className="px-4 py-5 font-bold tracking-wider">Action</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-12 text-center text-gray-400"
                  >
                    Loading outbound data...
                  </td>
                </tr>
              ) : data.length > 0 ? (
                data.map((lead) => (
                  <tr
                    key={lead.lead_campaign_id}
                    className="text-sm transition-colors border-t border-b border-white/10 hover:bg-white/5 hover:cursor-default"
                  >
                    <td className="px-4 py-3 text-white/80 hover:cursor-default">#{lead.lead_id}</td>
                    <td className="px-4 py-3 hover:cursor-default">
                      <p className="font-semibold truncate text-white/80">{lead.lead_name}</p>
                    </td>
                    <td className="px-4 py-3 text-white/80 hover:cursor-default">{lead.campaign_name}</td>
                    <td className="px-4 py-3 text-white/80 hover:cursor-default">{lead.score ?? '-'}</td>

                    <td className="px-4 py-3 hover:cursor-default">
                      <span
                        className={`px-3 py-1 text-xs font-semibold rounded-full ${
                          lead.status === 'Belum Dihubungi'
                            ? 'bg-amber-500/10 text-amber-400'
                            : 'bg-green-500/10 text-green-400'
                        }`}
                      >
                        {lead.status}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <button
                        onClick={() => openModal(lead)}
                        className="px-2 text-gray-400 hover:text-white text-lg"
                      >
                        ...
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="py-12 text-center text-gray-400 hover:cursor-default"
                  >
                    No outbound data to display.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <OutboundModal
          lead={selectedLead}
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleUpdate}
        />
      )}

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        limit={limit}
        totalResults={totalResults}
        onPageChange={(page) => setCurrentPage(page)}
        onLimitChange={(newLimit) => {
          setLimit(newLimit);
          setCurrentPage(1);
        }}
      />
    </div>
  );
};

export default OutboundDetailPage;
