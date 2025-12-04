import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import OutboundModal from '../../features/outbound/components/OutboundModal';
import Pagination from '../../components/Pagination';
import CampaignService from '../../features/campaigns/api/campaign-service';
import LeadsTrackerService from '../../features/tracker/api/tracker-service';
import toast from 'react-hot-toast';

import OutboundFilter from '../../features/outbound/components/OutboundFilter';

const OutboundDetailPage = () => {
  const outletContext = useOutletContext?.() || {};
  const user = outletContext.user || outletContext || {};

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');

  const [selectedLead, setSelectedLead] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState({
    campaignId: '',
  });

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
          campaignFilter: appliedFilters.campaignId || null,
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
  }, [currentPage, limit, search, appliedFilters, user.user_id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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

  const handleFilterApply = (newFilters) => {
    setAppliedFilters(newFilters);
    setCurrentPage(1);
    setIsFilterOpen(false);
  };

  return (
    <div className="text-white">
      <div className="flex flex-col gap-4 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <h1 className="text-3xl font-bold text-white">Outbound Detail</h1>
            <div className="flex items-center ml-6 space-x-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search..."
                  value={search}
                  onChange={handleSearchChange}
                  className="w-80 p-1 pl-10 bg-[#242424] text-white rounded-lg border border-white/10 focus:outline-none focus:border-white/50 transition-colors"
                />
                <img
                  src="/search.png"
                  className="absolute w-auto h-4 transform -translate-y-1/2 opacity-50 left-3 top-1/2"
                  alt="Search"
                />
              </div>
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`px-4 py-1 rounded-lg transition-all flex items-center gap-2 ${
                  isFilterOpen
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
                Filter
                {appliedFilters.campaignId && (
                  <span className="flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-blue-500 rounded-full">
                    !
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <OutboundFilter
        isOpen={isFilterOpen}
        initialFilters={appliedFilters}
        onApply={handleFilterApply}
      />
      <div className="overflow-hidden rounded-lg shadow-lg bg-dark-bg">
        <div className="overflow-x-auto">
          <table className="min-w-full text-center text-white table-auto">
            <thead>
              <tr className="text-sm uppercase border-b border-white/30 text-gray hover:cursor-default">
                <th className="px-4 py-5 font-bold tracking-wider hover:cursor-default">ID</th>
                <th className="px-4 py-5 font-bold tracking-wider hover:cursor-default">
                  Lead Name
                </th>
                <th className="px-4 py-5 font-bold tracking-wider hover:cursor-default">
                  Campaign
                </th>
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
                    <td className="px-4 py-3 text-white/80 hover:cursor-default">
                      #{lead.lead_id}
                    </td>
                    <td className="px-4 py-3 hover:cursor-default">
                      <p className="font-semibold truncate text-white/80">{lead.lead_name}</p>
                    </td>
                    <td className="px-4 py-3 text-white/80 hover:cursor-default">
                      {lead.campaign_name}
                    </td>
                    <td className="px-4 py-3 text-white/80 hover:cursor-default">
                      {lead.score ?? '-'}
                    </td>

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
