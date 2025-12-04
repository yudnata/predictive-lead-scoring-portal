import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';

const MainLayout = ({ user }) => {
  const location = useLocation();

  return (
    <div className="flex min-h-screen bg-dark-bg select-none">
      <style>
        {`
          @keyframes slideRightFade {
            0% { opacity: 0; transform: translateX(-20px); }
            100% { opacity: 1; transform: translateX(0); }
          }
          .animate-slide-right-fade {
            animation: slideRightFade 0.5s ease-out forwards;
          }
        `}
      </style>
      <Sidebar user={user} />
      <main className="flex-1 w-full h-screen p-8 ml-64 overflow-y-auto">
        <div
          key={location.pathname}
          className="animate-slide-right-fade"
        >
          <Outlet context={{ user }} />
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
