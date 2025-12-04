import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import { createPortal } from 'react-dom';
import toast from 'react-hot-toast';
import HistoryService from '../features/history/api/history-service';
import Pagination from '../components/Pagination';
import HistoryFilter from '../features/history/components/HistoryFilter';

const ActionDropdown = ({ row, onRemove, isAdmin }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const buttonRef = useRef(null);
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
      {isAdmin && (
        <button
          onClick={() => {
            setOpen(false);
            onRemove(row);
          }}
          className="block w-full px-4 py-2 text-sm text-left text-red-400 hover:bg-gray-700"
        >
          Remove
        </button>
      )}
    </div>
  );

  return (
    <>
      <button
        ref={buttonRef}
        onClick={(e) => {
          e.stopPropagation();
          setOpen(!open);
        }}
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

  const [showFilters, setShowFilters] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState({
    startDate: '',
    endDate: '',
    campaignId: '',
    statusId: '',
  });

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const res = await HistoryService.getAll(currentPage, limit, search, appliedFilters);
      setHistoryList(res.data || []);
      setTotalPages(res.meta?.totalPages || 1);
      setTotalResults(res.meta?.total || 0);
    } catch (err) {
      console.error('Failed to load history:', err);
      setHistoryList([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, limit, search, appliedFilters]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleApplyFilters = (newFilters) => {
    setAppliedFilters(newFilters);
    setCurrentPage(1);
  };

  const handleRemove = async (row) => {
    if (
      window.confirm(
        'Are you sure you want to remove this history record? This will revert the lead status to "Contacted".'
      )
    ) {
      try {
        await HistoryService.delete(row.history_id);
        toast.success('History removed and lead status reverted');
        fetchHistory();
      } catch (error) {
        console.error('Failed to remove history:', error);
        toast.error('Failed to remove history');
      }
    }
  };

  return (
    <div>
      <div className="flex flex-col gap-4 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <h1 className="text-3xl font-bold text-white">Outcome</h1>
            <div className="flex items-center ml-6 space-x-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by lead or sales..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-80 p-1 pl-10 bg-[#242424] text-white rounded-lg border border-white/10 focus:outline-none focus:border-white/50 transition-colors"
                />
                <img
                  src="/search.png"
                  className="absolute w-auto h-4 transform -translate-y-1/2 opacity-50 left-3 top-1/2"
                  alt="Search"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-1 rounded-lg border border-white/10 transition-all flex items-center gap-2 ${
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
                {(appliedFilters.startDate ||
                  appliedFilters.endDate ||
                  appliedFilters.campaignId ||
                  appliedFilters.statusId) && (
                  <span className="flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-blue-500 rounded-full">
                    !
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        <HistoryFilter
          isOpen={showFilters}
          initialFilters={appliedFilters}
          onApply={handleApplyFilters}
        />
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
                      className="text-sm transition-colors border-t border-b border-white/5 hover:bg-white/5"
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
                            onRemove={handleRemove}
                            isAdmin={isAdmin}
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
    </div>
  );
};

export default HistoryPage;
