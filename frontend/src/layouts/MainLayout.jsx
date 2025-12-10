import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import AIChatbot from '../features/ai/components/AIChatbot';

const MainLayout = ({ user }) => {
  const location = useLocation();

  return (
    <div className="flex min-h-screen bg-white dark:bg-[#121212]">
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
      <main className="flex-1 w-full h-screen p-8 ml-20 overflow-y-auto duration-300 transition-all">
        <div
          key={location.pathname}
          className="animate-slide-right-fade"
        >
          <Outlet context={{ user }} />
        </div>
      </main>
      {user?.role !== 'admin' && <AIChatbot />}
    </div>
  );
};

export default MainLayout;
