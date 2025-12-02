import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import LeadsTrackerService from '../../features/tracker/api/tracker-service';
import Pagination from '../../components/Pagination';
import CampaignService from '../../features/campaigns/api/campaign-service';

import { createPortal } from 'react-dom';

const ActionDropdown = ({ row, onChangeStatus, onAddOutbound, onDelete }) => {
  const [open, setOpen] = useState(false);
  const ref = React.useRef(null);
  const buttonRef = React.useRef(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    const handleClick = (e) => {
      if (
        ref.current &&
        !ref.current.contains(e.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    if (open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 4,
        left: rect.left - 160,
      });
    }
  }, [open]);

  const getStatusOptions = () => {
    if (row.status === 'Uncontacted') {
      return [{ label: 'Change to Contacted', status_id: 4 }];
    } else if (row.status === 'Contacted') {
      return [
        { label: 'Change to Deal', status_id: 5 },
        { label: 'Change to Reject', status_id: 6 },
      ];
    }
    return [];
  };

  const statusOptions = getStatusOptions();

  const dropdownContent = (
    <div
      ref={ref}
      className="fixed z-50 mt-2 bg-dark-card rounded-md shadow-lg w-56"
      style={{ top: `${position.top}px`, left: `${position.left}px` }}
    >
      {statusOptions.map((option) => (
        <React.Fragment key={option.status_id}>
          <button
            onClick={() => {
              setOpen(false);
              onChangeStatus(row, option.status_id);
            }}
            className="block w-full px-4 py-2 text-sm text-left text-white hover:bg-gray-700"
          >
            {option.label}
          </button>
          <hr className="border-gray-700" />
        </React.Fragment>
      ))}

      <button
        onClick={() => {
          setOpen(false);
          onAddOutbound(row);
        }}
        className="block w-full px-4 py-2 text-sm text-left text-white hover:bg-gray-700"
      >
        Add Outbound Detail
      </button>

      <hr className="border-gray-700" />

      <button
        onClick={() => {
          setOpen(false);
          onDelete(row);
        }}
        className="block w-full px-4 py-2 text-sm text-left text-red-400 hover:bg-red-500/10"
      >
        Remove from Tracking
      </button>
    </div>
  );

  return (
    <>
      <button
        ref={buttonRef}
        onClick={() => setOpen(!open)}
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
      {open && createPortal(dropdownContent, document.body)}
    </>
  );
};

const LeadsTrackerPage = () => {
  const navigate = useNavigate();
  const outletContext = useOutletContext?.() || {};
  const user = outletContext.user || outletContext || {};

  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
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
        currentPage,
        limit,
        search,
        campaignFilter || null,
        user.user_id
      );
      setList(res.data || []);
      setTotalPages(res.meta?.totalPages || 1);
      setTotalResults(res.meta?.total || 0);
    } catch (err) {
      console.error('Failed to load leads tracker:', err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, limit, search, campaignFilter, user.user_id]);

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

  const handleChangeStatus = async (row, newStatusId) => {
    try {
      await LeadsTrackerService.updateStatus(row.lead_campaign_id, {
        status_id: newStatusId,
      });
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Failed to update status.');
    }
  };

  const handleDelete = async (row) => {
    if (window.confirm('Are you sure you want to remove this lead from tracking?')) {
      try {
        await LeadsTrackerService.delete(row.lead_campaign_id);
        fetchData();
      } catch (err) {
        console.error(err);
        alert('Failed to remove lead.');
      }
    }
  };

  const handleAddOutbound = (row) => {
    navigate(`/sales/outbound/${row.lead_campaign_id}`, { state: row });
  };

  return (
    <div>
      <div className="flex items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Leads Tracker</h1>

        <div className="relative ml-6">
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
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
          onChange={(e) => {
            setCampaignFilter(e.target.value);
            setCurrentPage(1);
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
      </div>
      <div className="overflow-hidden rounded-lg shadow-lg bg-dark-bg">
        <div className="overflow-x-auto">
          <table className="min-w-full text-center text-white table-auto">
            <thead>
              <tr className="text-sm uppercase border-b border-white/30 text-gray">
                <th className="px-4 py-5 font-bold tracking-wider hover:cursor-default">Lead ID</th>
                <th className="px-4 py-5 font-bold tracking-wider hover:cursor-default">
                  Lead Name
                </th>
                <th className="px-4 py-5 font-bold tracking-wider hover:cursor-default">
                  Campaign
                </th>
                <th className="px-4 py-5 font-bold tracking-wider hover:cursor-default">Score</th>
                <th className="px-4 py-5 font-bold tracking-wider hover:cursor-default">Status</th>
                <th className="px-4 py-5 font-bold tracking-wider hover:cursor-default">Action</th>
              </tr>
            </thead>

            <tbody>
              {list.length > 0
                ? list.map((row) => (
                    <tr
                      key={row.lead_campaign_id}
                      className="text-sm transition-colors border-t border-b border-white/10 hover:bg-white/5 hover:cursor-default"
                    >
                      <td className="px-4 py-3 text-white/80 hover:cursor-default">
                        #{row.lead_id}
                      </td>
                      <td className="px-4 py-3 text-left hover:cursor-default">
                        <p className="font-semibold truncate text-white/80">{row.lead_name}</p>
                      </td>
                      <td className="px-4 py-3 text-white/80 hover:cursor-default">
                        {row.campaign_name}
                      </td>
                      <td className="px-4 py-3 text-white/80 hover:cursor-default">
                        {row.score ?? '-'}
                      </td>

                      <td className="px-4 py-3 hover:cursor-default">
                        <span
                          className={`px-3 py-1 text-xs font-semibold rounded-full ${
                            {
                              Uncontacted: 'bg-[#FFCA28]/10 text-[#FFCA28]',
                              Contacted: 'bg-[#42A5F5]/10 text-[#42A5F5]',
                              Deal: 'bg-[#66BB6A]/10 text-[#66BB6A]',
                              Reject: 'bg-[#EF5350]/10 text-[#EF5350]',
                            }[row.status]
                          }`}
                        >
                          {row.status}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <ActionDropdown
                          row={row}
                          onChangeStatus={handleChangeStatus}
                          onAddOutbound={handleAddOutbound}
                          onDelete={handleDelete}
                        />
                      </td>
                    </tr>
                  ))
                : !loading && (
                    <tr>
                      <td
                        colSpan={6}
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

export default LeadsTrackerPage;
