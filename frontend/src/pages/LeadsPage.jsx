import React, { useState, useEffect, useCallback, useRef } from 'react';
import Sidebar from '../layouts/Sidebar';
import LeadFormModal from '../features/leads/components/LeadFormModal';
import LeadService from '../features/leads/api/lead-service';
import axiosClient from '../api/axiosClient'; // Import axiosClient
import Pagination from '../components/Pagination';
// Dropdown Component
const ActionDropdown = ({ leadId, onEdit, onDelete }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDelete = async () => {
    setDropdownOpen(false);
    if (window.confirm('Yakin ingin menghapus Lead ini?')) {
      try {
        await LeadService.delete(leadId);
        alert('Lead berhasil dihapus.');
        onDelete();
      } catch {
        alert('Gagal menghapus Lead.');
      }
    }
  };

  return (
    <div
      className="relative inline-block text-left"
      ref={dropdownRef}
    >
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="px-2 text-gray-400 hover:text-white"
      >
        ...
      </button>
      {dropdownOpen && (
        <div className="absolute right-0 z-20 w-40 mt-2 bg-gray-800 border border-gray-700 rounded-md shadow-lg">
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
            Hapus Lead
          </button>
        </div>
      )}
    </div>
  );
};

// Helper Functions untuk Styling
const getStatusBadge = (status) => {
  const base = 'px-3 py-1 text-xs font-semibold rounded-full';
  if (status === 'Tracked') return `${base} bg-[#66BB6A]/10 text-[#66BB6A]`;
  if (status === 'Available') return `${base} bg-[#FFCA28]/10 text-[#FFCA28]`;
  return `${base} bg-gray-600 text-gray-300`;
};

const getScoreColor = (score) => {
  const displayScore = score * 10;

  if (displayScore === 0) return 'bg-white/10 text-white';
  if (displayScore >= 80) return 'bg-[#66BB6A]/10 text-[#66BB6A]';
  if (displayScore >= 50) return 'bg-[#FFCA28]/10 text-[#FFCA28]';
  if (displayScore < 50) return 'bg-[#EF5350]/10 text-[#EF5350]';

  return 'bg-white/10 text-white'; // fallback
};

const LeadsPage = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState(null);

  const [limit, setLimit] = useState(14);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  const [userProfile, setUserProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // 1. Fetch Profile menggunakan axiosClient (lebih bersih)
  const fetchProfile = async () => {
    try {
      const response = await axiosClient.get('/auth/me');
      setUserProfile(response.data.data);
    } catch (error) {
      console.error('Gagal mengambil profil user:', error);
    } finally {
      setLoadingProfile(false);
    }
  };

  // 2. Fetch Leads
  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const result = await LeadService.getAll(currentPage, limit, search);
      setLeads(result.data);
      setTotalPages(result.meta.totalPages);
      setTotalResults(result.meta.total);
    } catch (error) {
      console.error('Gagal memuat leads:', error);
      setLeads([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, search, limit]);

  // Effect Calls
  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  // Handlers
  const handleOpenAddModal = () => {
    setEditingLead(null);
    setModalOpen(true);
  };

  const handleOpenEditModal = async (leadId) => {
    setLoading(true); // Tampilkan loading saat fetch detail
    try {
      const lead = await LeadService.getById(leadId);
      setEditingLead(lead);
      setModalOpen(true);
    } catch {
      alert('Gagal memuat detail Lead.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  if (loadingProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen text-white bg-black">
        <p>Memuat profil...</p>
      </div>
    );
  }

  const userRole = userProfile?.role;

  return (
    <div className="min-h-screen bg-dark-bg">
      <Sidebar user={userProfile} />
      <main
        className="overflow-y-auto"
      >
        <header className="mb-8">
          <div className="flex items-center">
            <h1 className="text-3xl font-bold text-white">All Leads</h1>

            <div className="flex items-center ml-6 space-x-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search..."
                  value={search}
                  onChange={handleSearchChange}
                  className="w-80 p-1 pl-10 bg-[#242424] text-white rounded-lg border border-white/20 focus:outline-none"
                />
                <img
                  src="/search.png"
                  className="absolute w-auto h-4 transform -translate-y-1/2 left-3 top-1/2"
                  alt="Search"
                />
              </div>

              <button className="px-4 py-1 font-semibold text-white border rounded-lg border-white/50 hover:bg-white hover:text-black">
                Filter
              </button>

              <button className="px-4 py-1 font-semibold text-white border rounded-lg border-white/50 hover:bg-white hover:text-black">
                Sort-by
              </button>
            </div>
            
          </div>
        </header>

        <div className="flex justify-end mb-6">
          {userRole === 'admin' && (
            <button
              onClick={handleOpenAddModal}
              className="flex items-center gap-2 px-4 py-2 font-semibold text-black transition-all bg-white rounded-lg shadow hover:bg-gray-100"
            >
              Add Leads
            </button>
          )}
        </div>

        {/* LEADS TABLE */}
        <div className="overflow-x-auto rounded-lg shadow-lg bg-dark-bg">
          {loading ? (
            <p className="p-4 text-center text-white">Memuat data...</p>
          ) : leads.length === 0 ? (
            <p className="p-4 text-center text-gray-400">Tidak ada Leads ditemukan.</p>
          ) : (
            <table className="min-w-full text-center text-white table-auto">
              <thead>
                <tr className="text-sm uppercase border-b border-white/30 text-gray">
                  {['Skor', 'Nama Lead & ID', 'Pekerjaan', 'Age', 'Status', 'Action'].map(
                    (header) => (
                      <th
                        key={header}
                        className="px-4 py-5"
                      >
                        {header}
                      </th>
                    )
                  )}
                </tr>
              </thead>

              <tbody>
                {leads.map((lead) => (
                  <tr
                    key={lead.lead_id}
                    className="text-sm border-t border-b border-white/10"
                  >
                    <td className="px-4 py-4">
                      <span
                        className={`px-2 py-1 rounded-md text-sm ${getScoreColor(lead.lead_score)}`}
                      >
                        {lead.lead_score * 10}
                      </span>
                    </td>

                    <td className="px-4 py-2">
                      <div className="flex flex-col">
                        <p className="items-center font-semibold truncate text-white/80">{lead.lead_name}</p>
                      </div>
                    </td>

                    <td className="px-4 py-2 text-white/80">{lead.job_name}</td>

                    <td className="px-4 py-2 text-white/80">{lead.lead_age}</td>

                    <td className="px-4 py-2">
                      <span
                        className={getStatusBadge(
                          lead.pOutcome_name === 'success' ? 'Tracked' : 'Available'
                        )}
                      >
                        {lead.pOutcome_name || 'Available'}
                      </span>
                    </td>

                    <td className="px-4 py-2">
                      <ActionDropdown
                        leadId={lead.lead_id}
                        onEdit={() => handleOpenEditModal(lead.lead_id)}
                        onDelete={fetchLeads}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* PAGINATION & RESULT INFO */}
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
      </main>

      <LeadFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        initialData={editingLead}
        onSuccess={fetchLeads}
      />
    </div>
  );
};

export default LeadsPage;
