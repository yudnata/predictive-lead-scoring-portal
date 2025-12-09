/* eslint-disable no-unused-vars */
import React, { useState, useContext } from 'react';
import { toast } from 'react-hot-toast';
import UserFormModal from '../../features/users/components/UserFormModal';
import UserService from '../../features/users/api/user-service';
import Pagination from '../../components/Pagination';
import { ThemeContext } from '../../context/ThemeContext';
import SuccessModal from '../../components/SuccessModal';
import ConfirmationModal from '../../components/ConfirmationModal';
import SalesFilter from '../../features/sales/components/SalesFilter';
import ActionDropdown from '../../features/sales/components/ActionDropdown';
import StatusBadgeWithDropdown from '../../features/sales/components/StatusBadgeWithDropdown';
import { useSales } from '../../features/sales/hooks/useSales';

import { createPortal } from 'react-dom';
import { FaSearch } from 'react-icons/fa';

const SalesPage = () => {
  const {
    salesUsers,
    setSalesUsers,
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
    fetchSales,
  } = useSales();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const [showFilters, setShowFilters] = useState(false);

  const [showStatusDropdownId, setShowStatusDropdownId] = useState(null);

  const [successModal, setSuccessModal] = useState({ isOpen: false, message: '' });
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    isDangerous: false,
  });

  const handleOpenEditModal = async (id) => {
    setLoading(true);
    try {
      const user = await UserService.getById(id);
      setEditingUser(user);
      setModalOpen(true);
    } catch {
      toast.error('Failed to load Sales details');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSales = (userId) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Sales',
      message: 'Are you sure you want to delete this sales account?',
      isDangerous: true,
      onConfirm: async () => {
        try {
          await UserService.delete(userId);
          setSuccessModal({
            isOpen: true,
            message: 'Successfully deleted this sales account.',
          });
          fetchSales();
        } catch {
          toast.error('Failed to delete Sales.');
        }
      },
    });
  };

  const updateStatus = (userId, status) => {
    setShowStatusDropdownId(null);
    setConfirmModal({
      isOpen: true,
      title: 'Update Status',
      message: 'Are you sure you want to change this sales status?',
      isDangerous: false,
      onConfirm: async () => {
        try {
          await UserService.update(userId, { is_active: status });
          setSuccessModal({
            isOpen: true,
            message: 'Successfully updated sales status.',
          });
          fetchSales();
        } catch {
          toast.error('Failed to update status');
        }
      },
    });
  };

  return (
    <div>
      <div className="flex flex-col gap-4 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Sales</h1>
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
                className={`px-4 py-1 rounded-lg transition-all flex items-center gap-2 ${
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
                {(appliedFilters.isActive ||
                  appliedFilters.minLeadsHandled ||
                  appliedFilters.maxLeadsHandled) && (
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
                setEditingUser(null);
                setModalOpen(true);
              }}
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
              Add Sales
            </button>
          </div>
        </div>

        <SalesFilter
          isOpen={showFilters}
          initialFilters={appliedFilters}
          onApply={handleApplyFilters}
        />
      </div>

      <div className="p-4 rounded-lg shadow-lg bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-white/10">
        {loading ? (
          <p className="text-gray-500 dark:text-white">Loading data...</p>
        ) : salesUsers.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">No Sales Found.</p>
        ) : (
          <table className="min-w-full text-gray-900 dark:text-white">
            <thead className="hover:cursor-default">
              <tr className="text-sm uppercase border-b border-gray-300 dark:border-white/30 text-gray-500 dark:text-white/80">
                <th className="px-4 py-3 text-left font-bold">Sales Name & ID</th>
                <th className="px-4 py-3 text-left font-bold">Email</th>
                <th className="px-4 py-3 text-center font-bold">Status</th>
                <th className="px-4 py-3 text-center font-bold">Active Campaign</th>
                <th className="px-4 py-3 text-center font-bold">Leads Handler</th>
                <th className="px-4 py-3 text-center font-bold">Action</th>
              </tr>
            </thead>

            <tbody className="hover:cursor-default">
              {salesUsers.map((user) => (
                <tr
                  key={user.user_id}
                  className="text-sm border-b border-gray-200 dark:border-white/5 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                >
                  <td className="px-4 py-4">
                    <p className="font-semibold text-gray-800 dark:text-white/80">
                      {user.full_name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">#{user.user_id}</p>
                  </td>
                  <td className="px-4 py-4 text-gray-800 dark:text-white/80">{user.user_email}</td>
                  <td className="relative px-4 py-4 text-center">
                    <StatusBadgeWithDropdown
                      isActive={user.is_active}
                      userId={user.user_id}
                      showDropdown={showStatusDropdownId === user.user_id}
                      onToggle={(id) =>
                        setShowStatusDropdownId(showStatusDropdownId === id ? null : id)
                      }
                      onUpdate={(status) => updateStatus(user.user_id, status)}
                      onClose={() => setShowStatusDropdownId(null)}
                    />
                  </td>

                  <td className="px-4 py-4 text-center text-gray-800 dark:text-white/80">
                    {user.active_campaigns}
                  </td>

                  <td className="px-4 py-4 text-center text-gray-800 dark:text-white/80">
                    Total {user.leads_handled}
                  </td>

                  <td className="px-4 py-4 text-center">
                    <ActionDropdown
                      onEdit={() => handleOpenEditModal(user.user_id)}
                      onRequestDelete={() => handleDeleteSales(user.user_id)}
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

      <UserFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        initialData={editingUser}
        onSuccess={(message) => {
          fetchSales();
          setSuccessModal({
            isOpen: true,
            message: message || 'Successfully added sales account.',
          });
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

export default SalesPage;
