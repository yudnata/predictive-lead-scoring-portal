import { useLocation, useNavigate } from 'react-router-dom';

const Sidebar = ({ user }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const userRole = user?.role || '';
  const isAdmin = userRole === 'admin';
  const isSales = userRole === 'sales';

  const adminNavItems = [
    { name: 'Dashboard', path: '/admin/dashboard', iconUrl: '/home.png' },
    { name: 'All Leads', path: '/admin/leads', iconUrl: '/leads.png' },
    { name: 'Outcome', path: '/admin/history', iconUrl: '/history.png' },
    { name: 'Campaigns', path: '/admin/campaigns', iconUrl: '/campaign.png' },
    { name: 'Sales Management', path: '/admin/sales-management', iconUrl: '/sales.png' },
  ];

  const salesNavItems = [
    { name: 'Main', path: '/sales/dashboard', iconUrl: '/home.png' },
    { name: 'All Leads', path: '/sales/leads', iconUrl: '/leads.png' },
    { name: 'Leads Tracker', path: '/sales/leads-tracker', iconUrl: '/tracker.png' },
    { name: 'Outbound Detail', path: '/sales/outbound-detail', iconUrl: '/outbound.png' },
    { name: 'Outcome', path: '/sales/history', iconUrl: '/history.png' },
  ];

  const currentNavItems = isAdmin ? adminNavItems : isSales ? salesNavItems : [];

  const otherItems = [
    { name: 'Profile', path: `/${userRole}/profile`, iconUrl: '/profile.png' },
    { name: 'Settings', path: `/${userRole}/settings`, iconUrl: '/settings.png' },
  ];

  return (
    <div className="w-64 bg-[#1e1e1e] h-screen text-white flex flex-col justify-between p-6 fixed top-0 left-0 z-10 select-none">
      <style>
        {`
          @keyframes smoothHighlight {
            from {
              background-color: transparent;
              transform: scale(1);
            }
            to {
              background-color: #585858;
              transform: scale(1.02);
            }
          }

          .sidebar-item {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }

          .sidebar-item.active {
            animation: smoothHighlight 0.3s ease-out forwards;
          }

          .sidebar-item:hover:not(.active) {
            background-color: rgba(88, 88, 88, 0.3);
            transform: translateX(4px);
          }
        `}
      </style>
      <div>
        <div
          className="flex pb-4 mb-10 space-x-2 text-center cursor-pointer"
          onClick={() => navigate(isAdmin ? '/admin/dashboard' : '/sales/dashboard')}
        >
          <img
            src="/logo.png"
            alt="Accenture Logo"
            className="w-auto h-6"
          />
          <span className="text-xl font-semibold ">accenture</span>
        </div>

        <h3 className="mb-6 text-sm font-semibold tracking-wider uppercase text-gray">
          {isAdmin ? 'Admin Dashboard' : 'Sales Dashboard'}
        </h3>

        <nav className="space-y-1">
          <ul className="space-y-1 text-sm">
            {currentNavItems.map((item) => (
              <li
                key={item.name}
                onClick={() => navigate(item.path)}
                className={`sidebar-item p-2 rounded-lg cursor-pointer ${
                  location.pathname === item.path
                    ? 'active bg-[#585858] font-semibold'
                    : 'text-gray-300'
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

          <h3 className="pt-6 pb-3 text-sm font-semibold tracking-wider uppercase text-white/80">
            Other
          </h3>
          <ul className="space-y-1 text-sm">
            {otherItems.map((item) => (
              <li
                key={item.name}
                onClick={() => navigate(item.path)}
                className={`sidebar-item p-2 rounded-lg cursor-pointer ${
                  location.pathname === item.path
                    ? 'active bg-[#585858] font-semibold'
                    : 'text-gray-300'
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
        </nav>
      </div>

      <div className="flex pt-4 border-t border-white/30">
        {user ? (
          <div>
            <p className="text-sm font-semibold">{user.full_name}</p>
            <p className="text-xs text-gray-400">{user.email}</p>
          </div>
        ) : (
          <p className="text-sm text-gray-400">Pengguna tidak ditemukan</p>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
