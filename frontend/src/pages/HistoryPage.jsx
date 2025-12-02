import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import HistoryService from '../features/history/api/history-service';
import Pagination from '../components/Pagination';
import CampaignService from '../features/campaigns/api/campaign-service';
import toast from 'react-hot-toast';

import { createPortal } from 'react-dom';

const ActionDropdown = ({ row, onEdit }) => {
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
        left: rect.left - 136,
      });
    }
  }, [open]);

  const dropdownContent = (
    <div
      ref={ref}
      className="fixed z-50 mt-2 bg-dark-card border border-gray-700 rounded-md shadow-lg w-44"
      style={{ top: `${position.top}px`, left: `${position.left}px` }}
    >
      <button
        onClick={() => {
          setOpen(false);
          onEdit(row);
        }}
        className="block w-full px-4 py-2 text-sm text-left text-white hover:bg-gray-700"
      >
        Change Status
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

const HistoryPage = () => {
  const outletContext = useOutletContext?.() || {};
  const user = outletContext.user || outletContext;
  const isAdmin = user?.role === 'admin';

  const [historyList, setHistoryList] = useState([]);
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  const [search, setSearch] = useState('');
  const [campaignFilter, setCampaignFilter] = useState('');
  const [campaigns, setCampaigns] = useState([]);

  const [editingRow, setEditingRow] = useState(null);
  const [statusChanging, setStatusChanging] = useState(false);
  const [newStatusId, setNewStatusId] = useState(null);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const res = await HistoryService.getAll(currentPage, limit, search, campaignFilter || null);
      setHistoryList(res.data || []);
      setTotalPages(res.meta?.totalPages || 1);
      setTotalResults(res.meta?.total || 0);
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, limit, search, campaignFilter]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const result = await CampaignService.getAll(1, 100);
        if (mounted) {
          setCampaigns(result.data || []);
        }
      } catch (err) {
        console.error('Failed to load campaign list for history:', err);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const handleEditStatus = (row) => {
    setEditingRow(row);
    setNewStatusId(row.status === 'Deal' ? 3 : 4);
  };

  const submitStatusChange = async () => {
    if (!editingRow) return;
    setStatusChanging(true);
    try {
      const payload = {
        lead_id: editingRow.lead_id,
        campaign_id: editingRow.campaign_id || null,
        status_id: Number(newStatusId),
        changed_by: user?.user_id,
      };

      await HistoryService.create(payload);
      toast.success('Status changed and history added successfully!');

      await fetchHistory();
      setEditingRow(null);
    } catch (err) {
      console.error('Failed to change status:', err);
      toast.error('Failed to change history status.');
    } finally {
      setStatusChanging(false);
    }
  };

  return (
    <div>
      <div className="flex items-center mb-8">
        <h1 className="text-3xl font-bold text-white">History</h1>

        <div className="relative ml-6">
          <input
            type="text"
            placeholder="Search by lead or sales..."
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
          <option value="">All Campaigns</option>
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
            <thead className="hover:cursor-default">
              <tr className="text-sm uppercase border-b border-white/30 text-gray hover:cursor-default">
                <th className="px-4 py-5 font-bold tracking-wider hover:cursor-default">
                  Date & Time
                </th>
                <th className="px-4 py-5 font-bold tracking-wider hover:cursor-default">
                  Lead Name
                </th>
                <th className="px-4 py-5 font-bold tracking-wider hover:cursor-default">Sales</th>
                <th className="px-4 py-5 font-bold tracking-wider hover:cursor-default">
                  Campaign
                </th>
                <th className="px-4 py-5 font-bold tracking-wider">Status</th>
                {isAdmin && <th className="px-4 py-5 font-bold tracking-wider">Action</th>}
              </tr>
            </thead>

            <tbody>
              {historyList.length > 0
                ? historyList.map((row) => (
                    <tr
                      key={row.history_id}
                      className="text-sm transition-colors border-t border-b border-white/10 hover:bg-white/5"
                    >
                      <td className="px-4 py-3 text-white/80">
                        {new Date(row.changed_at).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-semibold truncate text-white/80">{row.lead_name}</p>
                        <p className="text-xs text-gray-500">#{row.lead_id}</p>
                      </td>
                      <td className="px-4 py-3 text-white/80">{row.sales_name || '-'}</td>
                      <td className="px-4 py-3 text-white/80">{row.campaign_name || '-'}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-3 py-1 text-xs font-semibold rounded-full ${
                            row.status === 'Deal'
                              ? 'bg-[#66BB6A]/10 text-[#66BB6A]'
                              : 'bg-[#EF5350]/10 text-[#EF5350]'
                          }`}
                        >
                          {row.status}
                        </span>
                      </td>
                      {isAdmin && (
                        <td className="px-4 py-3">
                          <ActionDropdown
                            row={row}
                            onEdit={handleEditStatus}
                          />
                        </td>
                      )}
                    </tr>
                  ))
                : !loading && (
                    <tr>
                      <td
                        colSpan={isAdmin ? 6 : 5}
                        className="py-12 text-center text-gray-400"
                      >
                        No History Found.
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

      {editingRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
          <div className="bg-[#242424] w-full max-w-md rounded-xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="text-xl font-bold text-white">Change Status</h2>
              <button
                onClick={() => setEditingRow(null)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-6">
              <p className="mb-4 text-sm text-gray-300">
                Lead: <span className="font-semibold text-white">{editingRow.lead_name}</span> (#
                {editingRow.lead_id})
              </p>

              <label className="block mb-2 text-sm text-gray-300">Select Final Status</label>
              <select
                value={newStatusId}
                onChange={(e) => setNewStatusId(Number(e.target.value))}
                className="w-full p-2.5 bg-[#1A1A1A] rounded-lg text-white"
              >
                <option value={3}>Deal</option>
                <option value={4}>Reject</option>
              </select>
            </div>

            <div className="flex justify-end p-6 border-t border-white/10 gap-3 bg-[#242424]">
              <button
                type="button"
                onClick={() => setEditingRow(null)}
                className="px-5 py-2 text-sm font-semibold text-white transition bg-gray-600 rounded-lg hover:bg-gray-500"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submitStatusChange}
                disabled={statusChanging}
                className="px-5 py-2 text-sm font-semibold text-white transition rounded-lg bg-brand hover:bg-brand-hover disabled:opacity-50"
              >
                {statusChanging ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoryPage;
