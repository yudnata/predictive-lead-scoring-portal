import React, { useState, useEffect, useCallback } from 'react';
import UserFormModal from '../../features/users/components/UserFormModal';
import UserService from '../../features/users/api/user-service';
import Pagination from '../../components/Pagination';

import { createPortal } from 'react-dom';

const ActionDropdown = ({ userId, onEdit, onDelete }) => {
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

    if (!window.confirm('Are you sure you want to delete this Sales?')) return;

    try {
      await UserService.delete(userId);
      alert('Sales deleted successfully!');
      onDelete();
    } catch {
      alert('Failed to delete Sales.');
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
          onEdit();
        }}
        className="block w-full px-4 py-2 text-sm text-left text-white hover:bg-gray-700"
      >
        Edit Sales
      </button>
      <button
        onClick={handleDelete}
        className="block w-full px-4 py-2 text-sm text-left text-red-400 hover:bg-gray-700"
      >
        Delete Sales
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

const SalesPage = () => {
  const [salesUsers, setSalesUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [search, setSearch] = useState('');

  const [limit, setLimit] = useState(14);

  const fetchSales = useCallback(async () => {
    setLoading(true);
    try {
      const result = await UserService.getAllSales(currentPage, limit, search);
      setSalesUsers(result.data);
      setTotalPages(result.meta.totalPages);
      setTotalResults(result.meta.total);
    } catch (err) {
      console.error('Failed to load Sales data:', err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, search, limit]);

  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  const handleOpenEditModal = async (id) => {
    setLoading(true);
    try {
      const user = await UserService.getById(id);
      setEditingUser(user);
      setModalOpen(true);
    } catch {
      alert('Failed to load Sales details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (isActive) => {
    const base = 'px-3 py-1 text-xs font-semibold rounded-full';
    if (isActive) return `${base} bg-[#66BB6A]/10 text-[#66BB6A]`;
    return `${base} bg-[#EF5350]/10 text-[#EF5350]`;
  };

  return (
    <div>
      <div className="flex items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Sales</h1>
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
            setEditingUser(null);
            setModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 font-semibold text-black transition-all bg-white rounded-lg shadow hover:bg-gray-100"
        >
          Add Sales
        </button>
      </div>

      <div className="p-4 rounded-lg shadow-lg bg-dark-bg">
        {loading ? (
          <p className="text-white">Loading data...</p>
        ) : salesUsers.length === 0 ? (
          <p className="text-gray-300">No Sales Found.</p>
        ) : (
          <table className="min-w-full text-white">
            <thead className="hover:cursor-default">
              <tr className="text-sm text-white uppercase border-b border-white/30">
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
                  className="text-sm border-b border-white/10"
                >
                  <td className="px-4 py-4">
                    <p className="font-semibold text-white/80">{user.full_name}</p>
                    <p className="text-xs text-gray-500">#{user.user_id}</p>
                  </td>
                  <td className="px-4 py-4 text-white/80">{user.user_email}</td>
                  <td className="px-4 py-4 text-center">
                    <span className={getStatusBadge(user.is_active)}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>

                  <td className="px-4 py-4 text-center text-white/80">{user.active_campaigns}</td>

                  <td className="px-4 py-4 text-center text-white/80">
                    Total {user.leads_handled}
                  </td>

                  <td className="px-4 py-4 text-center">
                    <ActionDropdown
                      userId={user.user_id}
                      onEdit={() => handleOpenEditModal(user.user_id)}
                      onDelete={fetchSales}
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
        onSuccess={fetchSales}
      />
    </div>
  );
};

export default SalesPage;
