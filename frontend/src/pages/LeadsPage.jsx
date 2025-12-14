/* eslint-disable no-unused-vars */
import { useState, useContext, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import LeadFormModal from '../features/leads/components/LeadFormModal';
import AddToCampaignModal from '../features/leads/components/AddToCampaignModal';
import LeadDetailModal from '../features/leads/components/LeadDetailModal';
import LeadService from '../features/leads/api/lead-service';
import LeadsFilter from '../features/leads/components/LeadsFilter';
import Pagination from '../components/Pagination';
import CampaignHoverCard from '../features/leads/components/CampaignHoverCard';
import ActionDropdown from '../features/leads/components/ActionDropdown';
import HistoryBadge from '../features/leads/components/HistoryBadge';
import { ThemeContext } from '../context/ThemeContext';
import { useAIContext } from '../context/useAIContext';
import { getScoreColor, getStatusBadge } from '../utils/formatters';

import SuccessModal from '../components/SuccessModal';
import ConfirmationModal from '../components/ConfirmationModal';
import { FaSearch } from 'react-icons/fa';

import { useLeads } from '../features/leads/hooks/useLeads';

const LeadsPage = () => {
  const { user } = useOutletContext();
  const isAdmin = user?.role === 'admin';

  const {
    leads,
    setLeads,
    loading,
    search,
    setSearch,
    limit,
    setLimit,
    currentPage,
    setCurrentPage,
    totalPages,
    totalResults,
    appliedFilters,
    handleApplyFilters,
    fetchLeads,
  } = useLeads();

  const { setLeadsContext } = useAIContext();

  useEffect(() => {
    setLeadsContext(leads);
  }, [leads, setLeadsContext]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState(null);

  const [addToCampaignOpen, setAddToCampaignOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);

  const [selectedLeads, setSelectedLeads] = useState([]);
  const [isDeleting, setIsDeleting] = useState(false);

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLead, setDetailLead] = useState(null);

  const [showFilters, setShowFilters] = useState(false);

  const { theme } = useContext(ThemeContext);
  const isDarkMode = theme === 'dark';

  const [successModal, setSuccessModal] = useState({ isOpen: false, message: '' });
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    isDangerous: false,
  });


  const handleOpenAddModal = () => {
    setEditingLead(null);
    setModalOpen(true);
  };

  const handleOpenEditModal = async (leadId) => {
    try {
      const lead = await LeadService.getById(leadId);
      setEditingLead(lead);
      setModalOpen(true);
    } catch {
      toast.error('Failed to load Lead details.');
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedLeads(leads.map((lead) => lead.lead_id));
    } else {
      setSelectedLeads([]);
    }
  };

  const handleSelectLead = (leadId) => {
    setSelectedLeads((prev) => {
      if (prev.includes(leadId)) {
        return prev.filter((id) => id !== leadId);
      } else {
        return [...prev, leadId];
      }
    });
  };

  const handleBatchDelete = () => {
    if (selectedLeads.length === 0) {
      toast.error('Please select at least one lead to delete.');
      return;
    }

    setConfirmModal({
      isOpen: true,
      title: 'Delete Leads',
      message: 'Are you sure you want to delete all selected leads?',
      isDangerous: true,
      onConfirm: async () => {
        setIsDeleting(true);
        try {
          await LeadService.batchDelete(selectedLeads);
          setSuccessModal({
            isOpen: true,
            message: 'Successfully deleted leads.',
          });
          setSelectedLeads([]);
          fetchLeads();
        } catch (error) {
          console.error('Batch delete failed:', error);
          toast.error('Failed to delete leads. Please try again.');
        } finally {
          setIsDeleting(false);
        }
      },
    });
  };

  const handleDeleteLead = (leadId) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Lead',
      message: 'Are you sure you want to delete this lead?',
      isDangerous: true,
      onConfirm: async () => {
        try {
          await LeadService.delete(leadId);
          setSuccessModal({
            isOpen: true,
            message: 'Successfully deleted lead.',
          });
          fetchLeads();
        } catch {
          toast.error('Failed to delete Lead.');
        }
      },
    });
  };

  return (
    <div className="animate-fade-in">
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in {
            animation: fadeIn 0.4s ease-out forwards;
          }
          @keyframes slideRightFade {
            0% { opacity: 0; transform: translateX(-10px); }
            100% { opacity: 1; transform: translateX(0); }
          }
          .animate-row {
            opacity: 0;
            animation: slideRightFade 0.3s ease-out forwards;
          }
        `}
      </style>
      <header className="mb-8">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">All Leads</h1>
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
                    className="w-80 p-1 pl-10 bg-gray-100 text-gray-900 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500 transition-colors dark:bg-[#242424] dark:text-white dark:border-white/10"
                  />
                  <FaSearch className="absolute w-4 h-4 transform -translate-y-1/2 opacity-50 left-3 top-1/2 text-gray-500 dark:text-gray-400" />
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`px-4 py-1 rounded-lg border transition-all flex items-center gap-2 ${
                    showFilters
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
                  Filters
                  {(appliedFilters.minScore ||
                    appliedFilters.maxScore ||
                    appliedFilters.jobId ||
                    appliedFilters.maritalId ||
                    appliedFilters.educationId ||
                    appliedFilters.crmStatus) && (
                    <span className="flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-blue-500 rounded-full">
                      !
                    </span>
                  )}
                </button>
              </div>
            </div>

            {isAdmin && (
              <div className="flex gap-3 items-center">
                {selectedLeads.length > 0 && (
                  <button
                    onClick={handleBatchDelete}
                    disabled={isDeleting}
                    className="flex items-center gap-2 px-4 py-2 font-semibold text-white transition-all bg-[#C62828] rounded-lg shadow-lg hover:bg-[#B71C1C] disabled:opacity-50 disabled:cursor-not-allowed border border-[#EF5350]/20"
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
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                    {isDeleting ? 'Deleting...' : `Delete (${selectedLeads.length})`}
                  </button>
                )}
                <button
                  onClick={handleOpenAddModal}
                  className="flex items-center gap-2 px-4 py-2 font-semibold text-gray-900 transition-all bg-white rounded-lg shadow-lg hover:bg-gray-200 border border-gray-300 dark:border-white/20 dark:text-gray-900"
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
                  Add Leads
                </button>
              </div>
            )}
          </div>

          <LeadsFilter
            isOpen={showFilters}
            initialFilters={appliedFilters}
            onApply={handleApplyFilters}
          />
        </div>
      </header>

      <div className="overflow-hidden rounded-lg shadow-lg bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-white/10">
        <div className="overflow-x-auto">
          <table className="min-w-full text-center text-gray-900 dark:text-white table-auto">
            <thead className="select-none">
              <tr className="text-sm uppercase border-b border-gray-300 dark:border-white/30 text-gray-500 dark:text-gray-400">
                {isAdmin && (
                  <th className="px-4 py-5 font-bold tracking-wider hover:cursor-default w-16">
                    <div className="flex items-center justify-center select-none">
                      <label className="relative inline-block cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={selectedLeads.length === leads.length && leads.length > 0}
                          onChange={handleSelectAll}
                          className="sr-only peer"
                        />
                        <div className="w-4 h-4 bg-white border border-gray-400 rounded peer-checked:bg-blue-600 dark:bg-dark-card dark:border-[#505050] peer-checked:dark:bg-[#505050] peer-checked:dark:border-[#606060] peer-hover:border-blue-600 transition-all flex items-center justify-center">
                          {selectedLeads.length === leads.length && leads.length > 0 && (
                            <svg
                              className="w-3 h-3 text-white dark:text-[#C0C0C0]"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={3}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          )}
                        </div>
                      </label>
                    </div>
                  </th>
                )}
                <th className="px-4 py-5 font-bold tracking-wider hover:cursor-default">Lead ID</th>
                <th className="px-4 py-5 font-bold tracking-wider hover:cursor-default">
                  Lead Name
                </th>
                <th className="px-4 py-5 font-bold tracking-wider hover:cursor-default">Job</th>
                <th className="px-4 py-5 font-bold tracking-wider hover:cursor-default">Group</th>
                <th className="px-4 py-5 font-bold tracking-wider hover:cursor-default">Score</th>
                <th className="px-4 py-5 font-bold tracking-wider hover:cursor-default">Status</th>
                <th className="px-4 py-5 font-bold tracking-wider hover:cursor-default">History</th>
                {(user?.role === 'admin' || user?.role === 'sales') && (
                  <th className="px-4 py-5 font-semibold tracking-wider hover:cursor-default">
                    Action
                  </th>
                )}
              </tr>
            </thead>

            <tbody>
              <style>
                {`
                  @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                  }
                  .animate-fade-in {
                    animation: fadeIn 0.4s ease-out forwards;
                  }
                  @keyframes slideRightFade {
                    0% { opacity: 0; transform: translateX(0px); }
                    100% { opacity: 1; transform: translateX(0); }
                  }
                  .animate-row {
                    opacity: 0;
                    animation: slideRightFade 0.3s ease-out forwards;
                  }
                `}
              </style>
              {loading ? (
                <tr>
                  <td colSpan={isAdmin ? 9 : 8} className="py-12">
                    <div className="flex items-center justify-center text-gray-400">
                      <div className="text-center">
                        <div className="inline-block w-8 h-8 border-4 border-gray-300 dark:border-gray-400 border-t-blue-600 dark:border-t-white rounded-full animate-spin mb-2"></div>
                        <p>Loading leads...</p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : leads.length > 0
                ? leads.map((lead, index) => (
                    <tr
                      key={lead.lead_id}
                      className="text-sm transition-colors border-t border-b border-gray-200 dark:border-white/5 hover:bg-gray-100 dark:hover:bg-white/5 select-none animate-row cursor-pointer"
                      style={{ animationDelay: `${Math.min(index * 0.02, 0.5)}s` }}
                      onClick={(e) => {
                        if (e.target.closest('button')) return;
                        setDetailLead(lead);
                        setDetailOpen(true);
                      }}
                    >
                      {isAdmin && (
                        <td
                          className="px-4 py-3 text-center hover:pointer"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-center select-none">
                            <label className="relative inline-block cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={selectedLeads.includes(lead.lead_id)}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  handleSelectLead(lead.lead_id);
                                }}
                                className="sr-only peer"
                              />
                              <div
                                className="w-4 h-4 rounded transition-all flex items-center justify-center
                                bg-white border border-gray-400 peer-checked:bg-blue-600 peer-checked:border-blue-600 peer-hover:border-blue-600
                                dark:bg-[#1A1A1A] dark:border-[#505050]/80 dark:peer-checked:bg-blue-600 dark:peer-checked:border-brand dark:peer-hover:border-brand
                              "
                              >
                                {selectedLeads.includes(lead.lead_id) && (
                                  <svg
                                    className="w-3 h-3 text-white dark:text-[#C0C0C0]"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={3}
                                      d="M5 13l4 4L19 7"
                                    />
                                  </svg>
                                )}
                              </div>
                            </label>
                          </div>
                        </td>
                      )}
                      <td className="px-4 py-3 text-gray-800 dark:text-white/80 hover:pointer">
                        #{lead.lead_id}
                      </td>
                      <td className="px-4 py-2 hover:pointer">
                        <p className="font-semibold truncate text-gray-800 dark:text-white/80">
                          {lead.lead_name}
                        </p>
                      </td>
                      <td className="px-4 py-2 text-gray-800 dark:text-white/80 hover:pointer">
                        {lead.job_name}
                      </td>
                      <td className="px-4 py-2 text-gray-800 dark:text-white/80 hover:pointer">
                        {lead.lead_segment || '-'}
                      </td>
                      <td className="px-4 py-3 hover:pointer">
                        <span
                          className={`px-2 py-1 rounded-md text-sm font-bold ${getScoreColor(
                            lead.lead_score
                          )}`}
                        >
                          {(lead.lead_score * 100).toFixed(2)}%
                        </span>
                      </td>
                      <td className="px-4 py-2 hover:pointer">
                        {lead.crm_status === 'Tracked' ? (
                          <CampaignHoverCard leadId={lead.lead_id}>
                            <span className={getStatusBadge(lead.crm_status || 'Available')}>
                              {lead.crm_status || 'Available'}
                            </span>
                          </CampaignHoverCard>
                        ) : (
                          <span className={getStatusBadge(lead.crm_status || 'Available')}>
                            {lead.crm_status || 'Available'}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2" onClick={(e) => e.stopPropagation()}>
                        <HistoryBadge history={lead.outcome_history} />
                      </td>
                      {(user?.role === 'admin' || user?.role === 'sales') && (
                        <td className="px-4 py-2">
                          <ActionDropdown
                            role={user?.role}
                            leadId={lead.lead_id}
                            onEdit={() => handleOpenEditModal(lead.lead_id)}
                            onRequestDelete={() => handleDeleteLead(lead.lead_id)}
                            onAddToCampaign={(leadId) => {
                              setSelectedLead(leads.find((l) => l.lead_id === leadId));
                              setAddToCampaignOpen(true);
                            }}
                          />
                        </td>
                      )}
                    </tr>
                  ))
                : (
                    <tr>
                      <td
                        colSpan={isAdmin ? 9 : 8}
                        className="py-12 text-center text-gray-400"
                      >
                        No Leads Found.
                      </td>
                    </tr>
                  )}
            </tbody>
          </table>
        </div>
      </div>

      {(totalResults > 0 || loading) && (
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
      )}

      <LeadFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        initialData={editingLead}
        onSuccess={(message) => {
          fetchLeads();
          if (message) {
            setSuccessModal({
              isOpen: true,
              message,
            });
          }
        }}
      />

      <AddToCampaignModal
        open={addToCampaignOpen}
        onClose={() => setAddToCampaignOpen(false)}
        lead={selectedLead}
        user={user}
        onAdded={() => {
          fetchLeads();
          setSuccessModal({
            isOpen: true,
            message: 'Successfully tracked this lead.',
          });
        }}
      />

      <LeadDetailModal
        isOpen={detailOpen}
        onClose={() => setDetailOpen(false)}
        lead={detailLead}
        user={user}
        onTrack={(lead) => {
          setSelectedLead(lead);
          setAddToCampaignOpen(true);
          setDetailOpen(false);
        }}
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

export default LeadsPage;
