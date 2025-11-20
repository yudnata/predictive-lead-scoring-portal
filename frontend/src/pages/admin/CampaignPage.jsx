import React, { useState, useEffect, useCallback } from 'react';
import CampaignFormModal from '../../features/campaigns/components/CampaignFormModal';
import CampaignService from '../../features/campaigns/api/campaign-service';
import Sidebar from '../../layouts/Sidebar';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/v1/auth';

// FORMAT TANGGAL
const formatDate = (dateString) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// DROPDOWN ACTION (EDIT / DELETE)
const ActionDropdown = ({ campaignId, onEdit, onDelete }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = React.useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleDelete = async () => {
    setDropdownOpen(false);

    if (!window.confirm('Yakin ingin menghapus campaign ini?')) return;

    try {
      await CampaignService.delete(campaignId);
      alert('Campaign berhasil dihapus!');
      onDelete();
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      alert('Gagal menghapus campaign');
    }
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
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
            Edit Campaign
          </button>

          <button
            onClick={handleDelete}
            className="block w-full px-4 py-2 text-sm text-left text-red-400 hover:bg-gray-700"
          >
            Hapus Campaign
          </button>
        </div>
      )}
    </div>
  );
};

// BADGE STATUS
const getStatusBadge = (isActive) => {
  const base = 'px-3 py-1 text-xs font-semibold rounded-full';
  if (isActive) return `${base} bg-green-900 text-green-300`;
  return `${base} bg-red-900 text-red-300`;
};

// DROPDOWN STATUS (AKTIF / NONAKTIF)
const StatusDropdown = ({ onChange }) => {
  return (
    <div className="absolute z-30 w-32 p-2 bg-gray-800 border border-gray-700 rounded-md shadow">
      <button
        onClick={() => onChange(true)}
        className="w-full px-3 py-2 text-sm text-left text-white hover:bg-gray-700"
      >
        Aktif
      </button>
      <button
        onClick={() => onChange(false)}
        className="w-full px-3 py-2 text-sm text-left text-white hover:bg-gray-700"
      >
        Nonaktif
      </button>
    </div>
  );
};

const CampaignPage = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState(null);

  const [showStatusDropdownId, setShowStatusDropdownId] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [search, setSearch] = useState('');

  const limit = 14;

  const [userProfile, setUserProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // GET PROFILE
  const fetchProfile = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      setLoadingProfile(false);
      return;
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserProfile(response.data.data);
    } catch (error) {
      console.error('Gagal mengambil profil user:', error);
    } finally {
      setLoadingProfile(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // GET CAMPAIGN LIST
  const fetchCampaigns = useCallback(async () => {
    setLoading(true);
    try {
      const result = await CampaignService.getAll(currentPage, limit, search);
      setCampaigns(result.data);
      setTotalPages(result.meta.totalPages);
      setTotalResults(result.meta.total);
    } catch (err) {
      console.error('Gagal memuat campaign:', err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, search]);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  // OPEN EDIT MODAL
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
      alert('Gagal memuat detail campaign');
    } finally {
      setLoading(false);
    }
  };

  // UPDATE STATUS
  const updateStatus = async (id, status) => {
    try {
      await CampaignService.update(id, { campaign_is_active: status });
      setShowStatusDropdownId(null);
      fetchCampaigns();
    } catch {
      alert('Gagal mengubah status');
    }
  };

  const startResult = (currentPage - 1) * limit + 1;
  const endResult = Math.min(currentPage * limit, totalResults);

  if (loadingProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen text-white bg-black">
        <p>Memuat profil pengguna...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-dark-bg">
      <Sidebar user={userProfile} />

      <main className="w-full overflow-y-auto">
        {/* Header */}
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
              className="w-80 p-2 pl-10 bg-[#242424] text-white rounded-lg 
                         border border-gray-700 focus:border-gray-500"
            />
            <img
              src="/search.png"
              className="absolute w-auto h-4 transform -translate-y-1/2 left-3 top-1/2"
            />
          </div>
        </div>

        {/* ADD BUTTON */}
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

        {/* TABLE */}
        <div className="p-4 border border-gray-800 rounded-lg shadow-lg bg-dark-card">
          {loading ? (
            <p className="text-white">Memuat data...</p>
          ) : campaigns.length === 0 ? (
            <p className="text-gray-400">Tidak ada campaign ditemukan.</p>
          ) : (
            <table className="min-w-full text-white">
              <thead>
                <tr className="text-sm text-gray-400 uppercase border-b border-gray-700">
                  <th className="px-4 py-3 text-left">Nama Campaign</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Tanggal Mulai</th>
                  <th className="px-4 py-3 text-left">Tanggal Selesai</th>
                  <th className="px-4 py-3 text-left">Action</th>
                </tr>
              </thead>

              <tbody>
                {campaigns.map((c) => (
                  <tr key={c.campaign_id} className="text-sm border-b border-gray-800">
                    <td className="px-4 py-4">{c.campaign_name}</td>

                    {/* DROPDOWN STATUS */}
                    <td className="relative px-4 py-4">
                      <button
                        onClick={() =>
                          setShowStatusDropdownId(
                            showStatusDropdownId === c.campaign_id ? null : c.campaign_id
                          )
                        }
                        className={getStatusBadge(c.campaign_is_active)}
                      >
                        {c.campaign_is_active ? 'Aktif' : 'Nonaktif'}
                      </button>

                      {showStatusDropdownId === c.campaign_id && (
                        <StatusDropdown
                          value={c.campaign_is_active}
                          onChange={(v) => updateStatus(c.campaign_id, v)}
                        />
                      )}
                    </td>

                    <td className="px-4 py-4">{formatDate(c.campaign_start_date)}</td>

                    <td className="px-4 py-4">{formatDate(c.campaign_end_date)}</td>

                    <td className="px-4 py-4">
                      <ActionDropdown
                        campaignId={c.campaign_id}
                        onEdit={() => handleOpenEditModal(c.campaign_id)}
                        onDelete={fetchCampaigns}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* PAGINATION */}
        <div className="flex items-center justify-between mt-6 text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-700 rounded-lg disabled:opacity-30 hover:bg-gray-700"
            >
              Back
            </button>

            {[1, 2, 3, 4].map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-9 h-9 flex items-center justify-center rounded-md text-sm ${
                  currentPage === page
                    ? 'bg-gray-700 text-white'
                    : 'border border-gray-700 hover:bg-gray-700'
                }`}
              >
                {page}
              </button>
            ))}

            {totalPages > 4 && <span>...</span>}

            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-gray-700 rounded-lg disabled:opacity-30 hover:bg-gray-700"
            >
              Next
            </button>
          </div>

          <div className="flex items-center gap-4">
            <span>
              {startResult} to {endResult} of {totalResults} Result
            </span>

            <select className="bg-[#242424] border border-gray-700 rounded-lg p-1 text-white">
              <option value="14">Show {limit}</option>
              <option value="25">Show 25</option>
            </select>
          </div>
        </div>
      </main>

      <CampaignFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        initialData={editingCampaign}
        onSuccess={fetchCampaigns}
      />
    </div>
  );
};

export default CampaignPage;
