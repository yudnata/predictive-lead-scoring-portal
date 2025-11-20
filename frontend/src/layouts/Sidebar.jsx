import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const Sidebar = ({ user }) => { 
  const location = useLocation();
  const navigate = useNavigate();

  const userRole = user?.role || ''; 
  const isAdmin = userRole === 'admin';
  const isSales = userRole === 'sales';

  const adminNavItems = [
    { name: 'Main', path: '/admin/dashboard', iconUrl: '/home.png' },
    { name: 'Leads', path: '/admin/leads', iconUrl: '/leads.png' },
    { name: 'History', path: '/admin/history', iconUrl: '/history.png' },
    { name: 'Campaigns', path: '/admin/campaigns', iconUrl: '/campaign.png' },
    { name: 'Sales Management', path: '/admin/sales-management', iconUrl: '/sales.png' },
  ];
    
  const salesNavItems = [
    { name: 'Main', path: '/sales/dashboard', iconUrl: '/home.png' }, 
    { name: 'Leads', path: '/sales/leads', iconUrl: '/leads.png' }, 
    { name: 'Leads Tracker', path: '/sales/leads-tracker', iconUrl: '/tracker.png' }, 
    { name: 'Outbound Detail', path: '/sales/outbound-detail', iconUrl: '/outbound.png' }, 
    { name: 'History', path: '/sales/history', iconUrl: '/history.png' }, 
  ];
    
  let currentNavItems;
    if (isAdmin) {
        currentNavItems = adminNavItems;
    } else if (isSales) {
        currentNavItems = salesNavItems;
    } else {
        currentNavItems = []; 
    }

  const otherItems = [
    { name: 'Profile', path: `/${userRole}/profile`, iconUrl: '/profile.png' }, 
    { name: 'Settings', path: `/${userRole}/settings`, iconUrl: '/settings.png' }
  ];

  return (
    <div className="w-64 bg-[#1e1e1e] h-screen text-white flex flex-col justify-between p-6 fixed top-0 left-0 z-10">   
      <div> 
        <div className="flex items-center space-x-2 mb-10 cursor-pointer"
        onClick={() => {
          if (userRole === "admin") navigate("/admin/dashboard");
          else if (userRole === "sales") navigate("/sales/dashboard");
        }}>
          <img src="/logo.png" alt="Accenture Logo" className="h-6 w-auto" />
          <span className="text-xl font-semibold">accenture</span>
        </div>

        <h3 className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-6">
        {isAdmin ? 'Admin Dashboard' : 'Leads'} 
        </h3>
                
        {/* Main Navigation */}
        <nav className="space-y-1">
          <ul className="space-y-1 text-sm">
            {currentNavItems.map(item => (
              <li 
                key={item.name} 
                onClick={() => navigate(item.path)}
                className={`p-2 rounded-lg cursor-pointer transition-colors ${
                  location.pathname.startsWith(item.path) 
                  ? 'bg-[#585858] font-semibold' 
                  : 'hover:bg-gray-800 text-gray-300'
                }`}
              >
                <div className="flex items-center space-x-3"> 
                  <img 
                    src={item.iconUrl} 
                    alt={`${item.name} Icon`} 
                    className="w-5 h-5" 
                  />
                  <span>{item.name}</span>
                </div>
              </li>
            ))}
          </ul>

          <h3 className="text-gray-400 text-sm font-semibold uppercase tracking-wider pt-6">Other</h3>
            <ul className="space-y-1 text-sm">
              {otherItems.map(item => (
                <li 
                  key={item.name} 
                  onClick={() => navigate(item.path)}
                  className="p-2 rounded-lg cursor-pointer hover:bg-gray-800 text-gray-300"
                >
                  <div className="flex items-center space-x-3"> 
                    <img src={item.iconUrl} alt={`${item.name} Icon`} className="w-5 h-5" />
                    <span>{item.name}</span>
                  </div>
                </li>
              ))}
            </ul>
          </nav>
        </div> 

        <div className="border-t border-gray-800 pt-4">
          {user ? (
            <div>
              <p className="font-semibold text-sm">{user.full_name}</p>
              <p className="text-gray-400 text-xs">{user.email}</p> 
            </div>
              ) : (
                <p className="text-gray-400 text-sm">Pengguna tidak ditemukan</p>
              )}
            </div> 
        </div>
    );
};

export default Sidebar;