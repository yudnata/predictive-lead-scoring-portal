import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import LeadFormModal from '../features/leads/components/LeadFormModal';
import AddToCampaignModal from '../features/leads/components/AddToCampaignModal';
import LeadDetailModal from '../features/leads/components/LeadDetailModal';
import LeadService from '../features/leads/api/lead-service';
import LeadsFilter from '../features/leads/components/LeadsFilter';
import Pagination from '../components/Pagination';
import CampaignHoverCard from '../features/leads/components/CampaignHoverCard';

import { createPortal } from 'react-dom';

const ActionDropdown = ({ role, leadId, onEdit, onDelete, onAddToCampaign }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (dropdownOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 4,
        left: rect.left - 160,
      });
    }
  }, [dropdownOpen]);

  const handleDelete = async () => {
    setDropdownOpen(false);
    if (window.confirm('Are you sure you want to delete this Lead?')) {
      try {
        await LeadService.delete(leadId);
        alert('Lead deleted successfully.');
        onDelete();
      } catch {
        alert('Failed to delete Lead.');
      }
    }
  };

  const dropdownContent = (
    <div
      ref={dropdownRef}
      className="fixed z-50 w-48 mt-2 bg-dark-card rounded-md shadow-lg"
      style={{ top: `${position.top}px`, left: `${position.left}px` }}
    >
      {role === 'admin' && (
        <>
          <button
            onClick={() => {
              setDropdownOpen(false);
              onEdit();
            }}
            className="block w-full px-4 py-2 text-sm text-left text-white hover:bg-gray-700"
          >
            Edit Lead
          </button>

          <button
            onClick={handleDelete}
            className="block w-full px-4 py-2 text-sm text-left text-red-400 hover:bg-gray-700"
          >
            Delete Lead
          </button>
        </>
      )}
      {role === 'sales' && (
        <>
          <button
            onClick={() => {
              setDropdownOpen(false);
              onAddToCampaign(leadId);
            }}
            className="block w-full px-4 py-2 text-sm text-left text-white hover:bg-gray-700"
          >
            Add to Campaign
          </button>
        </>
      )}
    </div>
  );

  return (
    <>
      <button
        ref={buttonRef}
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-md transition-all"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"
          />
        </svg>
      </button>
      {dropdownOpen && createPortal(dropdownContent, document.body)}
    </>
  );
};

const getStatusBadge = (status) => {
  const base = 'px-3 py-1 text-xs font-semibold rounded-full';
  if (status === 'Tracked') return `${base} bg-[#66BB6A]/10 text-[#66BB6A]`;
  if (status === 'Available') return `${base} bg-[#FFCA28]/10 text-[#FFCA28]`;
  return `${base} bg-gray-600 text-gray-300`;
};

const getScoreColor = (score) => {
  const displayScore = score * 100;
  if (displayScore === 0) return 'bg-white/10 text-white';
  if (displayScore > 70) return 'text-[#66BB6A]';
  if (displayScore >= 20) return 'text-[#FFCA28]';
  if (displayScore < 20) return 'text-[#EF5350]';
  return 'bg-white/10 text-white';
};

const LeadsPage = () => {
  const { user } = useOutletContext();
  const isAdmin = user?.role === 'admin';

  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState(null);

  const [limit, setLimit] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  const [addToCampaignOpen, setAddToCampaignOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);

  const [selectedLeads, setSelectedLeads] = useState([]);
  const [isDeleting, setIsDeleting] = useState(false);

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLead, setDetailLead] = useState(null);

  const [showFilters, setShowFilters] = useState(false);

  const [appliedFilters, setAppliedFilters] = useState({
    minScore: '',
    maxScore: '',
    jobId: '',
    maritalId: '',
    educationId: '',
  });

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const queryParams = {
        page: currentPage,
        limit,
        search,
        ...appliedFilters,
      };

      Object.keys(queryParams).forEach((key) => {
        if (queryParams[key] === '' || queryParams[key] === null) {
          delete queryParams[key];
        }
      });

      if (queryParams.minScore) {
        queryParams.minScore = parseFloat(queryParams.minScore) / 100;
      }
      if (queryParams.maxScore) {
        queryParams.maxScore = parseFloat(queryParams.maxScore) / 100;
      }

      const result = await LeadService.getAll(
        queryParams.page,
        queryParams.limit,
        queryParams.search,
        queryParams
      );
      setLeads(result.data);
      setTotalPages(result.meta.totalPages);
      setTotalResults(result.meta.total);
    } catch (error) {
      console.error('Failed to load leads:', error);
      setLeads([]);
    } finally {
      setTimeout(() => setLoading(false), 300);
      setLoading(false);
    }
  }, [currentPage, search, limit, appliedFilters]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const handleApplyFilters = (newFilters) => {
    setAppliedFilters(newFilters);
    setCurrentPage(1);
  };

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
      alert('Failed to load Lead details.');
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

  const handleBatchDelete = async () => {
    if (selectedLeads.length === 0) {
      alert('Please select at least one lead to delete.');
      return;
    }

    const confirmMessage = `Are you sure you want to delete ${selectedLeads.length} lead(s)?`;
    if (!window.confirm(confirmMessage)) return;

    setIsDeleting(true);
    try {
      await LeadService.batchDelete(selectedLeads);
      alert(`Successfully deleted ${selectedLeads.length} lead(s).`);
      setSelectedLeads([]);
      fetchLeads();
    } catch (error) {
      console.error('Batch delete failed:', error);
      alert('Failed to delete leads. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      <header className="mb-8">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <h1 className="text-3xl font-bold text-white">All Leads</h1>
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
                    className="w-80 p-1 pl-10 bg-[#242424] border border-white/10 text-white rounded-lg focus:outline-none focus:border-white/50 transition-colors"
                  />
                  <img
                    src="/search.png"
                    className="absolute w-auto h-4 transform -translate-y-1/2 opacity-50 left-3 top-1/2"
                    alt="Search"
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
                  {(appliedFilters.minScore ||
                    appliedFilters.maxScore ||
                    appliedFilters.jobId ||
                    appliedFilters.maritalId ||
                    appliedFilters.educationId) && (
                    <span className="flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-blue-500 rounded-full">
                      !
                    </span>
                  )}
                </button>
              </div>
            </div>

            {isAdmin && (
              <div className="flex gap-3">
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
                  className="flex items-center gap-2 px-4 py-2 font-semibold text-black transition-all bg-white rounded-lg shadow-lg hover:bg-gray-200 border border-white/20"
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

      <div className="overflow-hidden rounded-lg shadow-lg bg-dark-bg">
        <div className="overflow-x-auto">
          <table className="min-w-full text-center text-white table-auto">
            <thead className="select-none">
              <tr className="text-sm uppercase border-b border-white/30 text-gray">
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
                        <div className="w-4 h-4 bg-dark-card border border-[#505050] rounded peer-checked:bg-[#505050] peer-checked:border-[#606060] peer-hover:border-[#606060] transition-all flex items-center justify-center">
                          {selectedLeads.length === leads.length && leads.length > 0 && (
                            <svg
                              className="w-3 h-3 text-[#C0C0C0]"
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
                <th className="px-4 py-5 font-bold tracking-wider hover:cursor-default">Score</th>
                <th className="px-4 py-5 font-bold tracking-wider hover:cursor-default">Status</th>
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
                  @keyframes slideRightFade {
                    0% { opacity: 0; transform: translateX(0px); }
                    100% { opacity: 1; transform: translateX(0); }
                  }
                  .animate-row {
                    opacity: 0; /* Start invisible */
                    animation: slideRightFade 0.3s ease-out forwards;
                  }
                `}
              </style>
              {leads.length > 0
                ? leads.map((lead, index) => (
                    <tr
                      key={lead.lead_id}
                      className="text-sm transition-colors border-t border-b border-white/5 hover:bg-white/5 select-none animate-row cursor-pointer"
                      style={{ animationDelay: `${index * 0.03}s` }}
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
                              <div className="w-4 h-4 bg-dark-card border border-[#505050]/80 rounded peer-checked:bg-[#505050] peer-checked:border-[#606060] peer-hover:border-[#606060] transition-all flex items-center justify-center">
                                {selectedLeads.includes(lead.lead_id) && (
                                  <svg
                                    className="w-3 h-3 text-[#C0C0C0]"
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
                      <td className="px-4 py-3 text-white/80 hover:pointer">#{lead.lead_id}</td>
                      <td className="px-4 py-2 hover:pointer">
                        <p className="font-semibold truncate text-white/80">{lead.lead_name}</p>
                      </td>
                      <td className="px-4 py-2 text-white/80 hover:pointer">{lead.job_name}</td>
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
                      {(user?.role === 'admin' || user?.role === 'sales') && (
                        <td className="px-4 py-2">
                          <ActionDropdown
                            role={user?.role}
                            leadId={lead.lead_id}
                            onEdit={() => handleOpenEditModal(lead.lead_id)}
                            onDelete={fetchLeads}
                            onAddToCampaign={(leadId) => {
                              setSelectedLead(leads.find((l) => l.lead_id === leadId));
                              setAddToCampaignOpen(true);
                            }}
                          />
                        </td>
                      )}
                    </tr>
                  ))
                : !loading && (
                    <tr>
                      <td
                        colSpan={isAdmin ? 7 : 5}
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
        onSuccess={fetchLeads}
      />

      <AddToCampaignModal
        open={addToCampaignOpen}
        onClose={() => setAddToCampaignOpen(false)}
        lead={selectedLead}
        user={user}
        onAdded={fetchLeads}
      />

      <LeadDetailModal
        isOpen={detailOpen}
        onClose={() => setDetailOpen(false)}
        lead={detailLead}
      />
    </div>
  );
};

export default LeadsPage;
