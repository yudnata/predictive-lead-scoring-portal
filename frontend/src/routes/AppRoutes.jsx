import React from 'react';
import { Routes, Route } from 'react-router-dom';

import LoginPage from '../pages/LoginPage';
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
import SalesDashboardPage from '../pages/sales/SalesDashboardPage';
import CampaignPage from '../pages/admin/CampaignPage';
import SalesPage from '../pages/admin/SalesPage';
import LeadsPage from '../pages/LeadsPage';
import NotFoundPage from '../pages/NotFoundPage';

import PrivateRoute from '../features/auth/components/PrivateRoute';
import MainLayout from '../layouts/MainLayout';

const AppRoutes = ({ userProfile }) => (
  <Routes>
    <Route path="/" element={<LoginPage />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="*" element={<NotFoundPage message="Halaman tidak ditemukan" />} />

    <Route element={<PrivateRoute allowedRoles={['admin']} />}>
      <Route element={<MainLayout user={userProfile} />}>
        <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
        <Route path="/admin/campaigns" element={<CampaignPage />} />
        <Route path="/admin/sales-management" element={<SalesPage />} />
        <Route path="/admin/leads" element={<LeadsPage />} />
      </Route>
    </Route>

    <Route element={<PrivateRoute allowedRoles={['sales']} />}>
      <Route element={<MainLayout user={userProfile} />}>
        <Route path="/sales/dashboard" element={<SalesDashboardPage />} />
      </Route>
    </Route>
  </Routes>
);

export default AppRoutes;
