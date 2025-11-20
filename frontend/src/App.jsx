import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import LoginPage from './pages/LoginPage.jsx';
import AdminDashboardPage from './pages/admin/AdminDashboardPage.jsx';
import SalesDashboardPage from './pages/sales/SalesDashboardPage.jsx';
import CampaignPage from './pages/admin/CampaignPage.jsx';
import UserPage from './pages/admin/UserPage.jsx';
import LeadsPage from './pages/LeadsPage.jsx';

import PrivateRoute from './features/auth/components/PrivateRoute.jsx';
import MainLayout from './layouts/MainLayout.jsx';
import RouteLoader from './components/RouteLoader.jsx';
import axiosClient from './api/axiosClient';

function App() {
  const [userProfile, setUserProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
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
    fetchProfile();
  }, []);

  if (loadingProfile) return null; // Bisa ditambah spinner global di sini

  return (
    <>
      <Toaster position="top-right" />
      <RouteLoader>
        <Routes>
          <Route
            path="/"
            element={<LoginPage />}
          />
          <Route
            path="/login"
            element={<LoginPage />}
          />

          <Route element={<PrivateRoute allowedRoles={['admin']} />}>
            <Route element={<MainLayout user={userProfile} />}>
              <Route
                path="/admin/dashboard"
                element={<AdminDashboardPage />}
              />
              <Route
                path="/admin/campaigns"
                element={<CampaignPage />}
              />
              <Route
                path="/admin/sales-management"
                element={<UserPage />}
              />
              <Route
                path="/admin/leads"
                element={<LeadsPage />}
              />
            </Route>
          </Route>

          <Route element={<PrivateRoute allowedRoles={['sales']} />}>
            <Route element={<MainLayout user={userProfile} />}>
              <Route
                path="/sales/dashboard"
                element={<SalesDashboardPage />}
              />
              {/* Tambahkan halaman sales lainnya di sini */}
            </Route>
          </Route>
        </Routes>
      </RouteLoader>
    </>
  );
}

export default App;
