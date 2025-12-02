import { Routes, Route } from 'react-router-dom';

import LoginPage from '../pages/LoginPage';
import DashboardPage from '../pages/DashboardPage';

import CampaignPage from '../pages/admin/CampaignPage';
import SalesPage from '../pages/admin/SalesPage';
import LeadsPage from '../pages/LeadsPage';
import HistoryPage from '../pages/HistoryPage';
import NotFoundPage from '../pages/NotFoundPage';
import ProfilePage from '../pages/ProfilePage';
import LeadsTrackerPage from '../pages/sales/LeadsTrackerPage';
import OutboundDetailPage from '../pages/sales/OutboundDetailPage';

import PrivateRoute from '../features/auth/components/PrivateRoute';
import MainLayout from '../layouts/MainLayout';
import RouteLoader from '../components/RouteLoader';

const AppRoutes = ({ userProfile }) => (
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
      <Route
        path="*"
        element={<NotFoundPage message="Halaman tidak ditemukan" />}
      />

      {/* Routes untuk Admin */}
      <Route element={<PrivateRoute allowedRoles={['admin']} />}>
        <Route element={<MainLayout user={userProfile} />}>
          <Route
            path="/admin/dashboard"
            element={<DashboardPage />}
          />
          <Route
            path="/admin/campaigns"
            element={<CampaignPage />}
          />
          <Route
            path="/admin/sales-management"
            element={<SalesPage />}
          />
          <Route
            path="/admin/leads"
            element={<LeadsPage />}
          />
          <Route
            path="/admin/history"
            element={<HistoryPage />}
          />
          <Route
            path="/admin/profile"
            element={<ProfilePage user={userProfile} />}
          />
        </Route>
      </Route>

      {/* Routes untuk Sales */}
      <Route element={<PrivateRoute allowedRoles={['sales']} />}>
        <Route element={<MainLayout user={userProfile} />}>
          <Route
            path="/sales/dashboard"
            element={<DashboardPage />}
          />
          <Route
            path="/sales/leads"
            element={<LeadsPage />}
          />
          <Route
            path="/sales/history"
            element={<HistoryPage />}
          />
          <Route
            path="/sales/leads-tracker"
            element={<LeadsTrackerPage />}
          />
          <Route
            path="/sales/outbound-detail"
            element={<OutboundDetailPage />}
          />
          <Route
            path="/sales/profile"
            element={<ProfilePage user={userProfile} />}
          />
        </Route>
      </Route>
    </Routes>
  </RouteLoader>
);

export default AppRoutes;
