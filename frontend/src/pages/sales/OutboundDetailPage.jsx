import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext, useLocation } from 'react-router-dom';
import OutboundModal from '../../features/outbound/components/OutboundModal';
import Pagination from '../../components/Pagination';
import CampaignService from '../../features/campaigns/api/campaign-service';
import LeadsTrackerService from '../../features/tracker/api/tracker-service';
import toast from 'react-hot-toast';

import OutboundFilter from '../../features/outbound/components/OutboundFilter';
import { getScoreColor, getStatusBadge } from '../../utils/formatters';
import SuccessModal from '../../components/SuccessModal';
import { FaSearch } from 'react-icons/fa';

import { useAIContext } from '../../context/useAIContext';

const OutboundDetailPage = () => {
  const outletContext = useOutletContext?.() || {};
  const user = outletContext.user || outletContext || {};

  const { setOutboundContext } = useAIContext();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setOutboundContext(data);
  }, [data, setOutboundContext]);

  const [search, setSearch] = useState('');

  const [selectedLead, setSelectedLead] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState({
    campaignId: '',
  });
  const [filterSelf, setFilterSelf] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(20);
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
        'EXCLUDE_UNCONTACTED',
        filterSelf
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
  }, [currentPage, limit, search, appliedFilters, user.user_id, filterSelf]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const location = useLocation();
  useEffect(() => {
    if (location.state?.lead) {
      setSelectedLead(location.state.lead);
      setIsModalOpen(true);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const openModal = (lead) => {
    if (lead.user_id !== user.user_id) {
      toast.error("You cannot view details of other sales' outbound activities.");
      return;
    }
    setSelectedLead(lead);
    setIsModalOpen(true);
  };

  const handleUpdate = () => {
    setIsModalOpen(false);
    setSelectedLead(null);
    fetchData();
    setSuccessMessage('Activity has been logged successfully.');
    setIsSuccessModalOpen(true);
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
    <div className="animate-fade-in">
      <div className="flex flex-col gap-4 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Outbound Detail</h1>
            <div className="flex items-center ml-6 space-x-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search..."
                  value={search}
                  onChange={handleSearchChange}
                  className="w-80 p-1 pl-10 bg-gray-100 text-gray-900 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500 transition-colors dark:bg-[#242424] dark:text-white dark:border-white/10"
                />
                <FaSearch className="absolute w-4 h-4 transform -translate-y-1/2 opacity-50 left-3 top-1/2 text-gray-500 dark:text-gray-400" />
              </div>
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`px-4 py-1 rounded-lg border transition-all flex items-center gap-2 ${
                  isFilterOpen
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'bg-gray-100 border border-gray-300 text-gray-700 hover:bg-gray-200 dark:bg-[#242424] dark:border-white/10 dark:text-gray-400 dark:hover:bg-[#2a2a2a]'
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
              </button>

              <div className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-[#242424] rounded-lg border border-gray-300 dark:border-white/10">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Only Show My Leads
                </span>
                <button
                  onClick={() => setFilterSelf(!filterSelf)}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${
                    filterSelf ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                      filterSelf ? 'translate-x-5' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <OutboundFilter
        isOpen={isFilterOpen}
        initialFilters={appliedFilters}
        onApply={handleFilterApply}
      />
      <div className="overflow-hidden rounded-lg shadow-lg bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-white/10">
        <div className="overflow-x-auto">
          <table className="min-w-full text-center text-gray-900 dark:text-white table-auto">
            <thead>
              <tr className="text-sm uppercase border-b border-gray-300 dark:border-white/30 text-gray-500 dark:text-gray-400 select-none">
                <th className="px-4 py-5 font-bold tracking-wider hover:cursor-default">ID</th>
                <th className="px-4 py-5 font-bold tracking-wider hover:cursor-default">
                  Lead Name
                </th>
                <th className="px-4 py-5 font-bold tracking-wider hover:cursor-default">
                  Campaign
                </th>
                <th className="px-4 py-5 font-bold tracking-wider hover:cursor-default">Sales</th>
                <th className="px-4 py-5 font-bold tracking-wider hover:cursor-default">Score</th>
                <th className="px-4 py-5 font-bold tracking-wider hover:cursor-default">Status</th>
                <th className="px-4 py-5 font-bold tracking-wider">Action</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12">
                    <div className="flex items-center justify-center text-gray-400">
                      <div className="text-center">
                        <div className="inline-block w-8 h-8 border-4 border-gray-300 dark:border-gray-400 border-t-blue-600 dark:border-t-white rounded-full animate-spin mb-2"></div>
                        <p>Loading outbound data...</p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : data.length > 0 ? (
                data.map((lead) => (
                  <tr
                    key={lead.lead_campaign_id}
                    onClick={() => openModal(lead)}
                    className="text-sm transition-colors border-t border-b border-gray-200 dark:border-white/5 hover:bg-gray-100 dark:hover:bg-white/5 cursor-pointer"
                  >
                    <td className="px-4 py-3 text-gray-800 dark:text-white/80">#{lead.lead_id}</td>
                    <td className="px-4 py-3">
                      <p className="font-semibold truncate text-gray-800 dark:text-white/80">
                        {lead.lead_name}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-gray-800 dark:text-white/80">
                      {lead.campaign_name}
                    </td>
                    <td className="px-4 py-3 text-gray-800 dark:text-white/80">
                      {lead.tracked_by_name || '-'}
                    </td>
                    <td className="px-4 py-3 text-gray-800 dark:text-white/80">
                      <span
                        className={`px-2 py-1 rounded-md text-sm font-bold ${getScoreColor(
                          lead.score
                        )}`}
                      >
                        {lead.score ? `${(parseFloat(lead.score) * 100).toFixed(2)}%` : '-'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={getStatusBadge(lead.latest_outcome || lead.status)}>
                        {(lead.latest_outcome || lead.status || 'Contacted').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openModal(lead);
                        }}
                        className="px-2 text-gray-400 hover:text-gray-600 dark:hover:text-white text-lg"
                      >
                        ...
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={7}
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

      <SuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        message={successMessage}
      />

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
