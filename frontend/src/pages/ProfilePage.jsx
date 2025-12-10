import { useState } from 'react';
import { createPortal } from 'react-dom';

const ProfilePage = ({ user }) => {
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/login';
  };

  if (!user) return (
    <div className="flex items-center justify-center h-96 text-gray-400">
      <div className="text-center">
        <div className="inline-block w-8 h-8 border-4 border-gray-300 dark:border-gray-400 border-t-blue-600 dark:border-t-white rounded-full animate-spin mb-2"></div>
        <p>Loading profile...</p>
      </div>
    </div>
  );

  return (
    <div className="flex items-center justify-center h-full dark:bg-dark-bg">
      <div className="w-full max-w-lg p-8 border shadow-xl rounded-xl bg-white dark:bg-dark-card border-gray-200 dark:border-white/10">
        <h1 className="mb-6 text-3xl font-bold text-center text-gray-900 dark:text-white">
          My Profile
        </h1>

        <div className="space-y-4 text-base text-gray-900 dark:text-white">
          <div className="flex justify-between">
            <span className="font-medium text-gray-600 dark:text-gray-400">Full Name</span>
            <span className="font-semibold">{user.full_name}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium text-gray-600 dark:text-gray-400">Status:</span>
            <span className="font-semibold">#{user.user_id}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium text-gray-400">Email</span>
            <span className="font-semibold">{user.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium text-gray-400">Role</span>
            <span className="font-semibold capitalize">{user.role}</span>
          </div>
        </div>

        <div className="flex items-center justify-between mt-8">
          <button
            onClick={handleLogout}
            className="px-6 py-1 font-semibold text-white transition-all bg-red-600 rounded-lg text-md hover:bg-red-700"
          >
            Logout
          </button>

          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-400">Status:</span>
            <span
              className={`px-3 py-1 text-sm rounded-full ${
                user.is_active ? 'bg-green-600/25 text-green-400' : 'bg-red-600/25 text-red-400'
              }`}
            >
              {user.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
      </div>
      {showLogoutModal &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
            <div className="bg-white dark:bg-[#1E1E1E] w-full max-w-sm p-6 rounded-2xl shadow-lg text-gray-900 dark:text-white">
              <h3 className="mb-4 text-xl font-bold">Logout Confirmation</h3>
              <p className="mb-6 text-gray-600 dark:text-gray-300">
                Are you sure you want to logout?
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmLogout}
                  className="px-3 py-2 bg-red-600 rounded-lg hover:bg-red-700"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

export default ProfilePage;
