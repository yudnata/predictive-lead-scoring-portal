import React, { useState, useEffect, useCallback } from 'react';
import UserFormModal from '../../features/users/components/UserFormModal';
import UserService from '../../services/UserService';
import Sidebar from '../../layouts/Sidebar'; 
import axios from 'axios';

const API_BASE_URL_AUTH = 'http://localhost:5000/api/v1/auth'; 

// Dropdown Component
const ActionDropdown = ({ userId, onEdit, onDelete }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = React.useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleDelete = async () => {
    setDropdownOpen(false);

    if (!window.confirm("Yakin ingin menghapus Sales ini?")) return;

    try {
      await UserService.delete(userId);
      alert("Sales berhasil dihapus!");
      onDelete(); 
    } catch (err) {
      alert("Gagal menghapus Sales.");
    }
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="text-gray-400 hover:text-white px-2"
      >
        ...
      </button>

      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-40 bg-gray-800 rounded-md shadow-lg border border-gray-700 z-20">
          <button
            onClick={() => {
              setDropdownOpen(false);
              onEdit();
            }}
            className="block w-full px-4 py-2 text-left text-sm text-white hover:bg-gray-700"
          >
            Edit Sales
          </button>
          <button
            onClick={handleDelete}
            className="block w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-gray-700"
          >
            Hapus Sales
          </button>
        </div>
      )}
    </div>
  );
};

const UserPage = () => {
  const [salesUsers, setSalesUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [search, setSearch] = useState("");

  const limit = 14; 
  
// Sidebar Component 
  const [userProfile, setUserProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true); 

  const fetchProfile = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) {
          setLoadingProfile(false);
          return;
      }
      try {
          const response = await axios.get(`${API_BASE_URL_AUTH}/me`, {
              headers: { Authorization: `Bearer ${token}` },
          });
          setUserProfile(response.data.data);
      } catch (error) {
          console.error("Gagal mengambil profil user:", error);
      } finally {
          setLoadingProfile(false);
      }
  };

  useEffect(() => {
      fetchProfile();
  }, []);

  const fetchSales = useCallback(async () => {
    setLoading(true);
    try {
      const result = await UserService.getAllSales(currentPage, limit, search);
      setSalesUsers(result.data);
      setTotalPages(result.meta.totalPages);
      setTotalResults(result.meta.total);
    } catch (err) {
      console.error("Gagal memuat data Sales:", err);
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
    } catch (err) {
      alert("Gagal memuat detail Sales");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (isActive) => {
    const base = "px-3 py-1 text-xs font-semibold rounded-full";
    if (isActive) return `${base} bg-green-900 text-green-300`;
    return `${base} bg-red-900 text-red-300`;
  };

  const startResult = (currentPage - 1) * limit + 1;
  const endResult = Math.min(currentPage * limit, totalResults);

  if (loadingProfile) {
    return (
        <div className="flex justify-center items-center min-h-screen bg-black text-white">
            <p>Memuat profil pengguna...</p>
        </div>
    );
  }

  return (
    <div className="flex bg-[#121212] min-h-screen">
      <Sidebar user={userProfile} />

      <main className="p-8 w-full overflow-y-auto" style={{ paddingLeft: "290px" }}>

        {/* HEADER */}
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
            className="w-80 p-2 pl-10 bg-[#242424] text-white rounded-lg 
                      border border-gray-700 focus:border-gray-500"
          />
          <img
            src="/search.png"
            className="h-4 w-auto absolute left-3 top-1/2 transform -translate-y-1/2"
          />
        </div>
      </div>

      <div className="flex justify-end mb-6">
        <button
          onClick={() => {
            setEditingUser(null);
            setModalOpen(true);
          }}
          className="px-4 py-2 bg-white 
                    text-black rounded-lg font-semibold shadow 
                    hover:bg-gray-100 transition-all flex items-center gap-2"
        >
          Add Sales
        </button>
      </div>

        {/* USER TABLE */}
        <div className="bg-gray-900 rounded-lg shadow-lg p-4 border border-gray-800">
          {loading ? (
            <p className="text-white">Memuat data...</p>
          ) : salesUsers.length === 0 ? (
            <p className="text-gray-400">Tidak ada Sales ditemukan.</p>
          ) : (
            <table className="min-w-full text-white">
              <thead>
                <tr className="text-gray-400 text-sm border-b border-gray-700 uppercase">
                  <th className="py-3 px-4 text-left">Nama Sales & ID</th>
                  <th className="py-3 px-4 text-left">Email</th>
                  <th className="py-3 px-4 text-left">Status</th>
                  <th className="py-3 px-4 text-left">Campaign Aktif</th>
                  <th className="py-3 px-4 text-left">Leads Ditangani</th>
                  <th className="py-3 px-4 text-left">Action</th>
                </tr>
              </thead>

              <tbody>
                {salesUsers.map((user) => (
                  <tr key={user.user_id} className="border-b border-gray-800 text-sm">
                    <td className="py-4 px-4">
                        <p className="font-semibold">{user.full_name}</p>
                        <p className="text-xs text-gray-500">#{user.user_id}</p>
                    </td>
                    <td className="py-4 px-4">{user.user_email}</td>
                    <td className="py-4 px-4">
                      <span className={getStatusBadge(user.is_active)}>
                        {user.is_active ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td className="py-4 px-4">1</td>
                    <td className="py-4 px-4">Total 21</td>
                    <td className="py-4 px-4">
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

        {/* PAGINATION */}
        <div className="mt-6 flex justify-between items-center text-gray-400 text-sm">
        <div className="flex items-center gap-2">
          <button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1} className="px-3 py-1 border border-gray-700 rounded-lg disabled:opacity-30 hover:bg-gray-700">Back</button>
          {[1, 2, 3, 4].map(page => (
            <button key={page} onClick={() => setCurrentPage(page)} className={`w-9 h-9 flex items-center justify-center rounded-md text-sm ${currentPage === page ? 'bg-gray-700 text-white' : 'border border-gray-700 hover:bg-gray-700'}`}>{page}</button>
          ))}
          {totalPages > 4 && <span>...</span>}
          <button onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages} className="px-3 py-1 border border-gray-700 rounded-lg disabled:opacity-30 hover:bg-gray-700">Next</button>
         </div>

        <div className="flex items-center gap-4">
          <span>{startResult} to {endResult} of {totalResults} Result</span>
          <select className="bg-[#242424] border border-gray-700 rounded-lg p-1 text-white">
            <option value="14">Show {limit}</option>
            <option value="25">Show 25</option>
          </select>
        </div>
      </div>
      </main>

      <UserFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        initialData={editingUser}
        onSuccess={fetchSales}
      />
    </div>
  );
};


export default UserPage;