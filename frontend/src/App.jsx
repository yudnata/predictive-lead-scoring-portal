import { Routes, Route } from 'react-router-dom' 

import Login from './pages/LoginPage.jsx' 

import AdminDashboard from './pages/admin/AdminDashboard.jsx'; 
import SalesDashboard from './pages/SalesDashboard.jsx'; 
import CampaignPage from './pages/admin/CampaignPage.jsx'; 
import UserPage from './pages/admin/UserPage.jsx'; 
import PrivateRoute from './features/auth/components/PrivateRoute.jsx'; 
import LeadsPage from './pages/LeadsPage.jsx';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      
      <Route element={<PrivateRoute allowedRoles={['admin']} />}>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Route>

      <Route element={<PrivateRoute allowedRoles={['sales']} />}>
        <Route path="/sales/dashboard" element={<SalesDashboard />} />
      </Route>

      <Route element={<PrivateRoute allowedRoles={['admin']} />}>
        <Route path="/admin/campaigns" element={<CampaignPage />} />
      </Route>

      <Route element={<PrivateRoute allowedRoles={['admin']} />}>
        <Route path="/admin/sales-management" element={<UserPage />} />
      </Route>

      <Route element={<PrivateRoute allowedRoles={['admin']} />}>
        <Route path="/admin/leads" element={<LeadsPage />} />
      </Route>
    </Routes>
  )
}

export default App;