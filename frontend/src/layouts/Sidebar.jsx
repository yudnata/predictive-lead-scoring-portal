import { useLocation, useNavigate } from 'react-router-dom';
import React, { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import {
  FaTachometerAlt,
  FaBullhorn,
  FaListAlt,
  FaPhoneAlt,
  FaHistory,
  FaUsers,
  FaCog,
  FaUserCircle,
  FaCalendarAlt,
  FaChartLine,
  FaUserFriends,
} from 'react-icons/fa';
import { useState } from 'react';

const Sidebar = ({ user }) => {
  const [isHovered, setIsHovered] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const { theme } = useContext(ThemeContext);
  const isDarkMode = theme === 'dark';

  const userRole = user?.role || '';
  const isAdmin = userRole === 'admin';
  const isSales = userRole === 'sales';

  const adminNavItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: <FaTachometerAlt className="w-5 h-5" /> },
    { name: 'All Leads', path: '/admin/leads', icon: <FaUserFriends className="w-5 h-5" /> },
    { name: 'Outcome', path: '/admin/history', icon: <FaHistory className="w-5 h-5" /> },
    { name: 'Campaigns', path: '/admin/campaigns', icon: <FaBullhorn className="w-5 h-5" /> },
    {
      name: 'Sales Management',
      path: '/admin/sales-management',
      icon: <FaUsers className="w-5 h-5" />,
    },
  ];

  const salesNavItems = [
    { name: 'Dashboard', path: '/sales/dashboard', icon: <FaTachometerAlt className="w-5 h-5" /> },
    { name: 'All Leads', path: '/sales/leads', icon: <FaUserFriends className="w-5 h-5" /> },
    {
      name: 'Leads Tracker',
      path: '/sales/leads-tracker',
      icon: <FaChartLine className="w-5 h-5" />,
    },
    {
      name: 'Outbound Detail',
      path: '/sales/outbound-detail',
      icon: <FaPhoneAlt className="w-5 h-5" />,
    },
    { name: 'Outcome', path: '/sales/history', icon: <FaHistory className="w-5 h-5" /> },
    { name: 'Calendar', path: '/sales/calendar', icon: <FaCalendarAlt className="w-5 h-5" /> },
  ];

  const currentNavItems = isAdmin ? adminNavItems : isSales ? salesNavItems : [];

  const otherItems = [
    { name: 'Profile', path: `/${userRole}/profile`, icon: <FaUserCircle className="w-5 h-5" /> },
    { name: 'Settings', path: `/${userRole}/settings`, icon: <FaCog className="w-5 h-5" /> },
  ];

  const allNavItems = [...currentNavItems, ...otherItems];

  const sidebarBg = isDarkMode ? 'bg-[#1e1e1e]' : 'bg-white border-r border-gray-200';
  const textColor = isDarkMode ? 'text-white' : 'text-gray-900';
  const primaryText = isDarkMode ? 'text-gray-300' : 'text-gray-700';
  const secondaryText = isDarkMode ? 'text-gray-400' : 'text-gray-500';
  const activeBg = isDarkMode ? 'bg-[#585858]' : 'bg-blue-100';
  const activeText = isDarkMode ? 'text-white' : 'text-blue-600 font-semibold';
  const headerBg = isDarkMode ? 'text-gray' : 'text-gray-600';
  const borderDiv = isDarkMode ? 'border-white/30' : 'border-gray-300';

  return (
    <div
      className={` ${
        isHovered ? 'w-64' : 'w-20'
      } ${sidebarBg} h-screen ${textColor} flex flex-col justify-between p-6 fixed top-0 left-0 z-10 select-none transition-all duration-500 ease-in-out shadow-lg overflow-hidden`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <style>
        {`
          @keyframes smoothHighlight {
            from {
              background-color: transparent;
              transform: scale(1);
            }
            to {
              background-color: ${isDarkMode ? '#585858' : '#D1E5FF'}; /* Warna active light mode */
              transform: scale(1.02);
            }
          }
          .sidebar-item {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }

          .sidebar-item.active {
            animation: smoothHighlight 0.3s ease-out forwards;
          }
        `}
      </style>
      <div>
        <div
          className="flex items-center pb-4 mb-10 space-x-2 text-center cursor-pointer whitespace-nowrap overflow-hidden"
          onClick={() => navigate(isAdmin ? '/admin/dashboard' : '/sales/dashboard')}
        >
          <img
            src="/logo.png"
            alt="Accenture Logo"
            className="w-8 h-8 object-contain min-w-[2rem]"
          />
          <span
            className={`text-xl font-semibold transition-all duration-500 ease-in-out ${
              isHovered ? 'max-w-[200px] opacity-100 ml-2' : 'max-w-0 opacity-0 ml-0'
            }`}
          >
            accenture
          </span>
        </div>
        <h3
          className={`mb-6 text-sm font-semibold tracking-wider uppercase ${headerBg} transition-all duration-500 ease-in-out whitespace-nowrap overflow-hidden ${
            isHovered ? 'max-w-[200px] opacity-100' : 'max-w-0 opacity-0'
          }`}
        >
          {isAdmin ? 'Admin Dashboard' : 'Sales Dashboard'}
        </h3>
        <nav className="space-y-1">
          <ul className="space-y-1 text-sm">
            {allNavItems.map((item) => (
              <li
                key={item.name}
                onClick={() => navigate(item.path)}
                className={`sidebar-item p-2 rounded-lg cursor-pointer transition-all duration-300 relative group flex items-center
                  ${
                    location.pathname === item.path
                      ? `active ${activeBg} ${activeText}`
                      : `${primaryText} hover:translate-x-1 hover:bg-gray-700/30 dark:hover:bg-white/10`
                  }`}
                title={!isHovered ? item.name : ''}
              >
                <div className="flex items-center w-full">
                  <div className="min-w-[20px] flex justify-center">{item.icon}</div>
                  <span
                    className={`whitespace-nowrap overflow-hidden transition-all duration-500 ease-in-out ${
                      isHovered ? 'max-w-[200px] opacity-100 ml-3' : 'max-w-0 opacity-0 ml-0'
                    }`}
                  >
                    {item.name}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className={`flex items-center pt-4 border-t ${borderDiv}`}>
        {!isHovered && <FaUserCircle className={`w-8 h-8 ${secondaryText} min-w-[2rem]`} />}
        <div
          className={`transition-all duration-500 ease-in-out overflow-hidden flex flex-col justify-center whitespace-nowrap ${
            isHovered ? 'max-w-[200px] opacity-100 ml-2' : 'max-w-0 opacity-0 ml-0'
          }`}
        >
          {user ? (
            <>
              <p className={`text-sm font-semibold ${textColor}`}>{user.full_name}</p>
              <p className={`text-xs ${secondaryText}`}>{user.email}</p>
            </>
          ) : (
            <p className={`text-sm ${secondaryText}`}>Pengguna tidak ditemukan</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
