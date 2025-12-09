/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate, useOutletContext } from 'react-router-dom';
import LeadsTrackerService from '../../features/tracker/api/tracker-service';
import CampaignService from '../../features/campaigns/api/campaign-service';
import KanbanColumn from '../../features/tracker/components/KanbanColumn';
import LeadDetailModal from '../../features/leads/components/LeadDetailModal';
import SuccessModal from '../../components/SuccessModal';
import ConfirmationModal from '../../components/ConfirmationModal';
import TrackerFilter from '../../features/tracker/components/TrackerFilter';
import { useTracker } from '../../features/tracker/hooks/useTracker';
import { FaSearch } from 'react-icons/fa';

const KANBAN_STATUSES = [
  { name: 'Uncontacted', id: 3 },
  { name: 'Contacted', id: 4 },
];

const LeadsTrackerPage = () => {
  const navigate = useNavigate();
  const outletContext = useOutletContext?.() || {};
  const user = outletContext.user || outletContext || {};

  const {
    list,
    setList,
    loading,
    setLoading,
    totalResults,
    search,
    setSearch,
    appliedFilters,
    handleApplyFilters,
    fetchData,
    filterSelf,
    setFilterSelf,
  } = useTracker(user.user_id);

  const [showFilters, setShowFilters] = useState(false);

  const [selectedLead, setSelectedLead] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [successModal, setSuccessModal] = useState({ isOpen: false, message: '' });
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    isDangerous: false,
  });

  const executeStatusChange = async (leadCampaignId, newStatusId) => {
    try {
      await LeadsTrackerService.updateStatus(leadCampaignId, {
        status_id: newStatusId,
      });
      fetchData();
      setSuccessModal({
        isOpen: true,
        message: 'Successfully changed lead status.',
      });
    } catch (err) {
      console.error(err);
      toast.error('Failed to update status.');
    }
  };

  const requestStatusChange = (leadCampaignId, newStatusId) => {
    setConfirmModal({
      isOpen: true,
      title: 'Change Status',
      message: "Are you sure you want to change this lead's status?",
      isDangerous: false,
      onConfirm: () => executeStatusChange(leadCampaignId, newStatusId),
    });
  };

  const handleDelete = async (lead) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Lead',
      message: 'Are you sure you want to delete this lead?',
      isDangerous: true,
      onConfirm: async () => {
        try {
          await LeadsTrackerService.delete(lead.lead_campaign_id);
          fetchData();
          setSuccessModal({
            isOpen: true,
            message: 'Successfully deleted this lead.',
          });
        } catch (err) {
          console.error(err);
          toast.error('Failed to remove lead.');
        }
      },
    });
  };

  const handleAddOutbound = (lead) => {
    navigate('/sales/outbound-detail', { state: { lead } });
  };

  const handleDrop = (leadCampaignId, newStatusId) => {
    const lead = list.find((l) => l.lead_campaign_id === leadCampaignId);
    if (!lead) return;

    if (lead.user_id !== user.user_id) {
      toast.error('You do not have permission to modify this lead.');
      return;
    }

    const currentStatusMap = {
      Uncontacted: 3,
      Contacted: 4,
    };
    const currentStatusId = currentStatusMap[lead.status];

    if (currentStatusId === newStatusId) return;

    if (newStatusId === 5 || newStatusId === 6) {
      toast.error('Please use the Outbound Detail page to finalize (Deal/Reject) a lead.');
      return;
    }

    requestStatusChange(leadCampaignId, newStatusId);
  };

  const handleCardClick = (lead) => {
    if (lead.user_id !== user.user_id) {
      toast.error('You can only view details of your own leads.');
      return;
    }
    setSelectedLead(lead);
    setIsModalOpen(true);
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
    <div
      className="min-h-screen"
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
      }}
    >
      {/* Header Section */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Leads Tracker</h1>
            <div className="flex items-center ml-6 space-x-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                  }}
                  className="w-80 p-1 pl-10 bg-white dark:bg-[#242424] text-gray-900 dark:text-white rounded-lg border border-gray-300 dark:border-white/10 focus:outline-none focus:border-blue-500 dark:focus:border-white/50 transition-colors"
                />
                <FaSearch className="absolute w-4 h-4 transform -translate-y-1/2 opacity-50 left-3 top-1/2 text-gray-500 dark:text-gray-400" />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-1 rounded-lg border transition-all flex items-center gap-2 ${
                  showFilters
                    ? 'bg-blue-600 border border-blue-600 text-white'
                    : 'bg-white dark:bg-[#242424] border border-gray-300 dark:border-white/10 text-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#2a2a2a]'
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

        <TrackerFilter
          isOpen={showFilters}
          initialFilters={appliedFilters}
          onApply={handleApplyFilters}
          userId={user.user_id}
        />
      </div>

      <div className="flex items-center mb-5 gap-9">
        <div className="ml-auto text-sm text-gray-400">
          Total: <span className="text-gray-900 dark:text-white font-semibold">{totalResults}</span>{' '}
          leads
        </div>
      </div>

      {/* Kanban Board */}
      {loading ? (
        <div className="flex items-center justify-center h-96 text-gray-400">
          <div className="text-center">
            <div className="inline-block w-8 h-8 border-4 border-gray-300 dark:border-gray-400 border-t-blue-600 dark:border-t-white rounded-full animate-spin mb-2"></div>
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
              onClick={handleCardClick}
            />
          ))}
        </div>
      )}

      <LeadDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        lead={selectedLead}
        showNotes={true}
        onStatusChange={requestStatusChange}
        user={user}
        allowFinalize={false}
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

export default LeadsTrackerPage;
