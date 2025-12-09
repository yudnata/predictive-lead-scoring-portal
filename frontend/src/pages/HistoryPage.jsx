/* eslint-disable no-unused-vars */
import React, { useState, useContext } from 'react';
import { useOutletContext } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { toast } from 'react-hot-toast';
import HistoryService from '../features/history/api/history-service';
import Pagination from '../components/Pagination';
import HistoryFilter from '../features/history/components/HistoryFilter';
import { ThemeContext } from '../context/ThemeContext';
import SuccessModal from '../components/SuccessModal';
import ConfirmationModal from '../components/ConfirmationModal';
import ActionDropdown from '../features/history/components/ActionDropdown';
import { useHistory } from '../features/history/hooks/useHistory';
import { FaSearch } from 'react-icons/fa';

const HistoryPage = () => {
  const outletContext = useOutletContext?.() || {};
  const user = outletContext.user || outletContext;
  const isAdmin = user?.role === 'admin';

  const {
    historyList,
    setHistoryList,
    loading,
    setLoading,
    currentPage,
    setCurrentPage,
    limit,
    setLimit,
    totalPages,
    totalResults,
    search,
    setSearch,
    appliedFilters,
    handleApplyFilters,
    fetchHistory,
  } = useHistory();

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

  const handleRemove = (row) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Log',
      message: 'Are you sure you want to delete this outcome log?',
      isDangerous: true,
      onConfirm: async () => {
        try {
          await HistoryService.delete(row.history_id);
          setSuccessModal({
            isOpen: true,
            message: 'Successfully deleted this log.',
          });
          fetchHistory();
        } catch (error) {
          console.error('Failed to remove history:', error);
          toast.error('Failed to remove history');
        }
      },
    });
  };

  return (
    <div>
      <div className="flex flex-col gap-4 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Outcome</h1>
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
                  className="w-80 p-1 pl-10 bg-gray-100 text-gray-900 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500 transition-colors dark:bg-[#242424] dark:text-white dark:border-white/10"
                />
                <FaSearch className="absolute w-4 h-4 transform -translate-y-1/2 opacity-50 left-3 top-1/2 text-gray-500 dark:text-gray-400" />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-1 rounded-lg border border-white/10 transition-all flex items-center gap-2 ${
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

      <div className="overflow-hidden rounded-lg shadow-lg bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-white/10">
        <div className="overflow-x-auto">
          <table className="min-w-full text-center text-gray-900 dark:text-white table-auto">
            <thead className="hover:cursor-default">
              <tr className="text-sm uppercase border-b border-gray-300 dark:border-white/30 text-gray-500 dark:text-gray-400 hover:cursor-default">
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
                      className="text-sm transition-colors border-t border-b border-gray-200 dark:border-white/5 hover:bg-gray-100 dark:hover:bg-white/5"
                    >
                      <td className="px-4 py-3 text-gray-800 dark:text-white/80">
                        {new Date(row.changed_at).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-semibold truncate text-gray-800 dark:text-white/80">
                          {row.lead_name}
                        </p>
                        <p className="text-xs text-gray-500">#{row.lead_id}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-800 dark:text-white/80">
                        {row.sales_name || '-'}
                      </td>
                      <td className="px-4 py-3 text-gray-800 dark:text-white/80">
                        {row.campaign_name || '-'}
                      </td>
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

export default HistoryPage;
