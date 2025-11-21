import React from 'react';
import { useNavigate } from 'react-router-dom';

const ProfilePage = ({ user }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate('/login');
  };

  if (!user) return <div className="p-4 text-white">Memuat data profil...</div>;

  return (
    <div className="flex items-center justify-center min-h-screen bg-dark-bg">
      <div className="w-full max-w-lg p-8 border shadow-xl rounded-xl bg-dark-card border-white/10">
        {/* Header */}
        <h1 className="mb-6 text-3xl font-bold text-center text-white">Profil Saya</h1>

        {/* User Info */}
        <div className="space-y-4 text-base text-white">
          <div className="flex justify-between">
            <span className="font-medium text-gray-400">Nama Lengkap</span>
            <span className="font-semibold">{user.full_name}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium text-gray-400">User ID</span>
            <span className="font-semibold">#{user.user_id}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium text-gray-400">Email</span>
            <span className="font-semibold">{user.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium text-gray-400">Negara</span>
            <span className="font-semibold">{user.country || '-'}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium text-gray-400">Alamat</span>
            <span className="font-semibold">{user.address || '-'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-medium text-gray-400">Status Akun</span>
            <span
              className={`px-3 py-1 text-sm rounded-full ${
                user.is_active ? 'bg-green-600/25 text-green-400' : 'bg-red-600/25 text-red-400'
              }`}
            >
              {user.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>

        {/* Logout Button */}
        <div className="flex justify-center mt-8">
          <button
            onClick={handleLogout}
            className="px-6 py-3 text-lg font-semibold text-white transition-all bg-red-600 rounded-lg hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
