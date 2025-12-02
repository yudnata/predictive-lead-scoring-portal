import React, { useState, useEffect, useCallback } from 'react';
import CampaignFormModal from '../../features/campaigns/components/CampaignFormModal';
import CampaignDetailModal from '../../features/campaigns/components/CampaignDetailModal';
import CampaignService from '../../features/campaigns/api/campaign-service';
import Pagination from '../../components/Pagination';

const formatDate = (dateString) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

import { createPortal } from 'react-dom';

const ActionDropdown = ({ campaignId, onEdit, onDelete, onDetail }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = React.useRef(null);
  const buttonRef = React.useRef(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    const handleClick = (e) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(e.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    if (dropdownOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 4,
        left: rect.left - 128,
      });
    }
  }, [dropdownOpen]);

  const handleDelete = async () => {
    setDropdownOpen(false);

    if (!window.confirm('Are you sure you want to delete this campaign?')) return;

    try {
      await CampaignService.delete(campaignId);
      alert('Campaign deleted successfully!');
      onDelete();
    } catch {
      alert('Failed to delete campaign');
    }
  };

  const dropdownContent = (
    <div
      ref={dropdownRef}
      className="fixed z-50 w-40 mt-2 bg-dark-card rounded-md shadow-lg"
      style={{ top: `${position.top}px`, left: `${position.left}px` }}
    >
      <button
        onClick={() => {
          setDropdownOpen(false);
          onDetail();
        }}
        className="block w-full px-4 py-2 text-sm text-left text-white hover:bg-gray-700"
      >
        Detail
      </button>
      <button
        onClick={() => {
          setDropdownOpen(false);
          onEdit();
        }}
        className="block w-full px-4 py-2 text-sm text-left text-white hover:bg-gray-700"
      >
        Edit Campaign
      </button>

      <button
        onClick={handleDelete}
        className="block w-full px-4 py-2 text-sm text-left text-red-400 hover:bg-gray-700"
      >
        Delete Campaign
      </button>
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

const StatusBadgeWithDropdown = ({ isActive, campaignId, showDropdown, onToggle, onUpdate, onClose }) => {
  const buttonRef = React.useRef(null);

  const getStatusBadge = (active) => {
    const base = 'px-3 py-1 text-xs font-semibold rounded-full';
    if (active) return `${base} bg-[#66BB6A]/10 text-[#66BB6A]`;
    return `${base} bg-[#EF5350]/10 text-[#EF5350]`;
  };

  return (
    <>
      <button
        ref={buttonRef}
        onClick={() => onToggle(campaignId)}
        className={getStatusBadge(isActive)}
      >
        {isActive ? 'Active' : 'Inactive'}
      </button>

      {showDropdown && (
        // StatusDropdown must be defined before this component or hoisted
        <StatusDropdown
          anchorRef={buttonRef}
          onChange={onUpdate}
          onClose={onClose}
        />
      )}
    </>
  );
};

const StatusDropdown = ({ onChange, anchorRef, onClose }) => {
  const dropdownRef = React.useRef(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (anchorRef.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 4,
        left: rect.left,
      });
    }
  }, [anchorRef]);

  useEffect(() => {
    const handleClick = (e) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(e.target) &&
        anchorRef.current &&
        !anchorRef.current.contains(e.target)
      ) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [onClose, anchorRef]);

  return createPortal(
    <div 
      ref={dropdownRef}
      className="fixed z-50 w-32 p-2 rounded-md shadow bg-dark-card border border-gray-700"
      style={{ top: `${position.top}px`, left: `${position.left}px` }}
    >
      <button
        onClick={() => onChange(true)}
        className="w-full px-3 py-2 text-sm text-left text-white hover:bg-gray-700"
      >
        Active
      </button>
      <button
        onClick={() => onChange(false)}
        className="w-full px-3 py-2 text-sm text-left text-white hover:bg-gray-700"
      >
        Inactive
      </button>
    </div>,
    document.body
  );
};

const CampaignPage = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailCampaign, setDetailCampaign] = useState(null);

  const [showStatusDropdownId, setShowStatusDropdownId] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [search, setSearch] = useState('');

  const [limit, setLimit] = useState(14);

  const fetchCampaigns = useCallback(async () => {
    setLoading(true);
    try {
      const result = await CampaignService.getAll(currentPage, limit, search);
      setCampaigns(result.data);
      setTotalPages(result.meta.totalPages);
      setTotalResults(result.meta.total);
    } catch (err) {
      console.error('Failed to load campaigns:', err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, search, limit]);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  const handleOpenEditModal = async (id) => {
    setLoading(true);
    try {
      const campaign = await CampaignService.getById(id);

      campaign.campaign_start_date = campaign.campaign_start_date?.split('T')[0];
      campaign.campaign_end_date = campaign.campaign_end_date?.split('T')[0];
      campaign.campaign_is_active = Boolean(campaign.campaign_is_active);

      setEditingCampaign(campaign);
      setModalOpen(true);
    } catch {
      alert('Failed to load campaign details');
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
      alert('Failed to update status');
    }
  };

  return (
    <div>
      <div className="flex items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Campaign</h1>

        <div className="relative ml-6">
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-80 p-1 pl-10 bg-[#242424] text-white rounded-lg border border-white/20 focus:outline-none"
          />
          <img
            src="/search.png"
            className="absolute w-auto h-4 transform -translate-y-1/2 left-3 top-1/2"
          />
        </div>
      </div>

      <div className="flex justify-end mb-6">
        <button
          onClick={() => {
            setEditingCampaign(null);
            setModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 font-semibold text-black transition-all bg-white rounded-lg shadow hover:bg-gray-100"
        >
          Add Campaign
        </button>
      </div>

      <div className="p-4 rounded-lg shadow-lg bg-dark-bg">
        {loading ? (
          <p className="text-white">Loading data...</p>
        ) : campaigns.length === 0 ? (
          <p className="text-gray-400">No Campaign Found</p>
        ) : (
          <table className="min-w-full text-white">
            <thead className="hover:cursor-default">
              <tr className="text-sm uppercase border-b border-white/30">
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
                  className="text-sm border-b border-white/10"
                >
                  <td className="px-4 py-4 text-white/80 hover:cursor-default">
                    {c.campaign_name}
                  </td>
                  <td className="relative px-4 py-6 text-center hover:cursor-default">
                    <StatusBadgeWithDropdown 
                      isActive={c.campaign_is_active} 
                      campaignId={c.campaign_id}
                      showDropdown={showStatusDropdownId === c.campaign_id}
                      onToggle={(id) => setShowStatusDropdownId(showStatusDropdownId === id ? null : id)}
                      onUpdate={(status) => updateStatus(c.campaign_id, status)}
                      onClose={() => setShowStatusDropdownId(null)}
                    />
                  </td>

                  <td className="px-4 py-4 text-center text-white/80 hover:cursor-default">
                    {formatDate(c.campaign_start_date)}
                  </td>

                  <td className="px-4 py-4 text-center text-white/80 hover:cursor-default">
                    {formatDate(c.campaign_end_date)}
                  </td>

                  <td className="px-4 py-2 text-center">
                    <ActionDropdown
                      campaignId={c.campaign_id}
                      onEdit={() => handleOpenEditModal(c.campaign_id)}
                      onDelete={fetchCampaigns}
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
        onSuccess={fetchCampaigns}
      />

      <CampaignDetailModal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        campaign={detailCampaign}
      />
    </div>
  );
};

export default CampaignPage;
