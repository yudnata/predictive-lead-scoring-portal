import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import LeadFormModal from '../features/leads/components/LeadFormModal';
import LeadService from '../features/leads/api/lead-service';
import Pagination from '../components/Pagination';
import TableLoaderWrapper from '../components/TableLoaderWrapper';

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

const getStatusBadge = (status) => {
  const base = 'px-3 py-1 text-xs font-semibold rounded-full';
  if (status === 'Tracked') return `${base} bg-[#66BB6A]/10 text-[#66BB6A]`;
  if (status === 'Available') return `${base} bg-[#FFCA28]/10 text-[#FFCA28]`;
  return `${base} bg-gray-600 text-gray-300`;
};

const getScoreColor = (score) => {
  const displayScore = score * 100;
  if (displayScore === 0) return 'bg-white/10 text-white';
  if (displayScore >= 80) return 'bg-[#66BB6A]/10 text-[#66BB6A]';
  if (displayScore >= 50) return 'bg-[#FFCA28]/10 text-[#FFCA28]';
  if (displayScore < 50) return 'bg-[#EF5350]/10 text-[#EF5350]';
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
      setTimeout(() => setLoading(false), 300);
      setLoading(false);
    }
  }, [currentPage, search, limit]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

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
      alert('Gagal memuat detail Lead.');
    }
  };

  return (
    <div>
      <header className="mb-8">
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
                  className="w-80 p-1 pl-10 bg-[#242424] text-white rounded-lg border border-white/20 focus:outline-none focus:border-white/50 transition-colors"
                />
                <img
                  src="/search.png"
                  className="absolute w-auto h-4 transform -translate-y-1/2 opacity-50 left-3 top-1/2"
                  alt="Search"
                />
              </div>
            </div>
          </div>

          {isAdmin && (
            <button
              onClick={handleOpenAddModal}
              className="flex items-center gap-2 px-4 py-2 font-semibold text-black transition-all bg-white rounded-lg shadow hover:bg-gray-200"
            >
              Add Leads
            </button>
          )}
        </div>
      </header>

      <div className="overflow-hidden rounded-lg shadow-lg bg-dark-bg">
        <TableLoaderWrapper loading={loading}>
          <div className="overflow-x-auto">
            <table className="min-w-full text-center text-white table-auto">
              <thead>
                <tr className="text-sm uppercase border-b border-white/30 text-gray">
                  <th className="px-4 py-5 font-semibold tracking-wider">Skor</th>
                  <th className="px-4 py-5 font-semibold tracking-wider">Nama Lead & ID</th>
                  <th className="px-4 py-5 font-semibold tracking-wider">Pekerjaan</th>
                  <th className="px-4 py-5 font-semibold tracking-wider">Age</th>
                  <th className="px-4 py-5 font-semibold tracking-wider">Status</th>
                  {isAdmin && <th className="px-4 py-5 font-semibold tracking-wider">Action</th>}
                </tr>
              </thead>

              <tbody>
                {leads.length > 0
                  ? leads.map((lead) => (
                      <tr
                        key={lead.lead_id}
                        className="text-sm transition-colors border-t border-b border-white/10 hover:bg-white/5"
                      >
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-1 rounded-md text-sm font-bold ${getScoreColor(
                              lead.lead_score
                            )}`}
                          >
                            {lead.lead_score * 100}
                          </span>
                        </td>
                        <td className="px-4 py-2">
                          <p className="font-semibold truncate text-white/90">{lead.lead_name}</p>
                        </td>
                        <td className="px-4 py-2 text-white/70">{lead.job_name}</td>
                        <td className="px-4 py-2 text-white/70">{lead.lead_age}</td>
                        <td className="px-4 py-2">
                          <span
                            className={getStatusBadge(
                              lead.pOutcome_name === 'success' ? 'Tracked' : 'Available'
                            )}
                          >
                            {lead.pOutcome_name || 'Available'}
                          </span>
                        </td>

                        {isAdmin && (
                          <td className="px-4 py-2">
                            <ActionDropdown
                              leadId={lead.lead_id}
                              onEdit={() => handleOpenEditModal(lead.lead_id)}
                              onDelete={fetchLeads}
                            />
                          </td>
                        )}
                      </tr>
                    ))
                  :
                    !loading && (
                      <tr>
                        <td
                          colSpan={isAdmin ? 6 : 5}
                          className="py-12 text-center text-gray-400"
                        >
                          Tidak ada Leads ditemukan.
                        </td>
                      </tr>
                    )}
              </tbody>
            </table>
          </div>
        </TableLoaderWrapper>
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
    </div>
  );
};

export default LeadsPage;
