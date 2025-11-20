import { Routes, Route, Navigate } from 'react-router-dom';

import Login from './pages/LoginPage.jsx';
import AdminDashboardPage from './pages/admin/AdminDashboardPage.jsx'; 
import SalesDashboardPage from './pages/sales/SalesDashboardPage.jsx'; 

import CampaignPage from './pages/admin/CampaignPage.jsx';
import UserPage from './pages/admin/UserPage.jsx';
import PrivateRoute from './features/auth/components/PrivateRoute.jsx';
import LeadsPage from './pages/LeadsPage.jsx';
import LoginPage from './pages/LoginPage.jsx';

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LoginPage />} />
      <Route path="/login" element={<LoginPage />} />
      
      {/* Protected Admin Routes */}
      <Route element={<PrivateRoute allowedRoles={['admin']} />}>
        <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
        <Route path="/admin/campaigns" element={<CampaignPage />} />
        <Route path="/admin/sales-management" element={<UserPage />} />
        <Route path="/admin/leads" element={<LeadsPage />} />
      </Route>

      {/* Protected Sales Routes */}
      <Route element={<PrivateRoute allowedRoles={['sales']} />}>
        <Route path="/sales/dashboard" element={<SalesDashboardPage />} />
      </Route>

      {/* Catch all - Redirect to login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;