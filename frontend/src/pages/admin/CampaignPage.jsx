/* eslint-disable no-unused-vars */
import React, { useState, useContext, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import CampaignFormModal from '../../features/campaigns/components/CampaignFormModal';
import CampaignDetailModal from '../../features/campaigns/components/CampaignDetailModal';
import CampaignService from '../../features/campaigns/api/campaign-service';
import Pagination from '../../components/Pagination';
import SuccessModal from '../../components/SuccessModal';
import ConfirmationModal from '../../components/ConfirmationModal';
import ActionDropdown from '../../features/campaigns/components/ActionDropdown';
import StatusBadgeWithDropdown from '../../features/campaigns/components/StatusBadgeWithDropdown';
import CampaignFilter from '../../features/campaigns/components/CampaignFilter';
import { useCampaigns } from '../../features/campaigns/hooks/useCampaigns';
import { formatDate } from '../../utils/formatters';
import { FaSearch } from 'react-icons/fa';
import { useAIContext } from '../../context/useAIContext';

const CampaignPage = () => {
  const {
    campaigns,
    setCampaigns,
    loading,
    setLoading,
    currentPage,
    setCurrentPage,
    totalPages,
    totalResults,
    search,
    setSearch,
    limit,
    setLimit,
    appliedFilters,
    handleApplyFilters,
    fetchCampaigns,
  } = useCampaigns();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailCampaign, setDetailCampaign] = useState(null);

  const [showStatusDropdownId, setShowStatusDropdownId] = useState(null);

  const [showFilters, setShowFilters] = useState(false);

  const [successModal, setSuccessModal] = useState({ isOpen: false, message: '' });
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    isDangerous: false,
  });

  const { setCampaignsContext } = useAIContext();

  useEffect(() => {
    setCampaignsContext(campaigns);
  }, [campaigns, setCampaignsContext]);

  const handleOpenEditModal = async (id) => {
    setLoading(true);
    try {
      const campaign = await CampaignService.getById(id);
      campaign.campaign_is_active = Boolean(campaign.campaign_is_active);

      setEditingCampaign(campaign);
      setModalOpen(true);
    } catch {
      toast.error('Failed to load campaign details');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await CampaignService.update(id, { campaign_is_active: status });
      setShowStatusDropdownId(null);
      fetchCampaigns();
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleDeleteCampaign = (campaignId) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Campaign',
      message: 'Are you sure you want to delete this campaign?',
      isDangerous: true,
      onConfirm: async () => {
        try {
          await CampaignService.delete(campaignId);
          setSuccessModal({
            isOpen: true,
            message: 'Successfully deleted this campaign.',
          });
          fetchCampaigns();
        } catch {
          toast.error('Failed to delete campaign');
        }
      },
    });
  };

  return (
    <div>
      <div className="flex flex-col gap-4 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Campaign</h1>
            <div className="flex items-center ml-6 space-x-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-80 p-1 pl-10 bg-gray-100 dark:bg-[#242424] text-gray-900 dark:text-white rounded-lg border border-gray-300 dark:border-white/10 focus:outline-none focus:border-blue-500 transition-colors"
                />
                <FaSearch className="absolute w-4 h-4 transform -translate-y-1/2 opacity-50 left-3 top-1/2 text-gray-500 dark:text-gray-400" />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-1 rounded-lg border border-white/10 transition-all flex items-center gap-2 ${
                  showFilters
                    ? 'bg-blue-600 border border-white/10 text-white'
                    : 'bg-gray-100 dark:bg-[#242424] text-gray-700 dark:text-gray-400 border-gray-300 dark:border-white/10 hover:bg-gray-200 dark:hover:bg-[#2a2a2a]'
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
                {(appliedFilters.isActive ||
                  appliedFilters.startDate ||
                  appliedFilters.endDate) && (
                  <span className="flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-blue-500 rounded-full">
                    !
                  </span>
                )}
              </button>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                setEditingCampaign(null);
                setModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2 font-semibold text-black transition-all bg-white rounded-lg shadow-lg hover:bg-gray-200 border border-gray-300 dark:border-white/20"
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
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add Campaign
            </button>
          </div>
        </div>

        <CampaignFilter
          isOpen={showFilters}
          initialFilters={appliedFilters}
          onApply={handleApplyFilters}
        />
      </div>

      <div className="p-4 rounded-lg shadow-lg bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-white/10">
        {loading ? (
          <div className="flex items-center justify-center h-48 text-gray-400">
            <div className="text-center">
              <div className="inline-block w-8 h-8 border-4 border-gray-300 dark:border-gray-400 border-t-blue-600 dark:border-t-white rounded-full animate-spin mb-2"></div>
              <p>Loading campaigns...</p>
            </div>
          </div>
        ) : campaigns.length === 0 ? (
          <p className="text-gray-400 dark:text-gray-500">No Campaign Found</p>
        ) : (
          <table className="min-w-full text-gray-800 dark:text-white">
            <thead className="hover:cursor-default">
              <tr className="text-sm uppercase border-b border-gray-300 dark:border-white/30 text-gray-500 dark:text-gray-400">
                <th className="px-4 py-3 text-left font-bold">Campaign Name</th>
                <th className="px-4 py-3 text-center font-bold">Status</th>
                <th className="px-4 py-3 text-center font-bold">Start Date</th>
                <th className="px-4 py-3 text-center font-bold">End Date</th>
                <th className="px-4 py-3 text-center font-bold">Action</th>
              </tr>
            </thead>

            <tbody>
              {campaigns.map((c) => (
                <tr
                  key={c.campaign_id}
                  className="text-sm border-b border-gray-200 dark:border-white/5 hover:bg-gray-100 dark:hover:bg-white/5"
                >
                  <td className="px-4 py-4 text-gray-700 dark:text-white/80 hover:cursor-default">
                    {c.campaign_name}
                  </td>
                  <td className="relative px-4 py-6 text-center hover:cursor-default">
                    <StatusBadgeWithDropdown
                      isActive={c.campaign_is_active}
                      campaignId={c.campaign_id}
                      showDropdown={showStatusDropdownId === c.campaign_id}
                      onToggle={(id) =>
                        setShowStatusDropdownId(showStatusDropdownId === id ? null : id)
                      }
                      onUpdate={(status) => updateStatus(c.campaign_id, status)}
                      onClose={() => setShowStatusDropdownId(null)}
                    />
                  </td>

                  <td className="px-4 py-4 text-center text-gray-700 dark:text-white/80 hover:cursor-default">
                    {formatDate(c.campaign_start_date)}
                  </td>

                  <td className="px-4 py-4 text-center text-gray-700 dark:text-white/80 hover:cursor-default">
                    {formatDate(c.campaign_end_date)}
                  </td>

                  <td className="px-4 py-2 text-center">
                    <ActionDropdown
                      onEdit={() => handleOpenEditModal(c.campaign_id)}
                      onRequestDelete={() => handleDeleteCampaign(c.campaign_id)}
                      onDetail={async () => {
                        const data = await CampaignService.getById(c.campaign_id);
                        setDetailCampaign(data);
                        setDetailOpen(true);
                      }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

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

      <CampaignFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        initialData={editingCampaign}
        onSuccess={(message) => {
          fetchCampaigns();
          setSuccessModal({
            isOpen: true,
            message: message || 'Successfully added campaign.',
          });
        }}
      />

      <CampaignDetailModal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        campaign={detailCampaign}
      />

      <SuccessModal
        isOpen={successModal.isOpen}
        onClose={() => setSuccessModal({ ...successModal, isOpen: false })}
        message={successModal.message}
      />

      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        isDangerous={confirmModal.isDangerous}
      />
    </div>
  );
};

export default CampaignPage;
