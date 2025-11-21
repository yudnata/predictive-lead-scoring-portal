import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const MainLayout = ({ user }) => {
  return (
    <div className="flex min-h-screen bg-dark-bg">
      <Sidebar user={user} />
      <main className="flex-1 w-full h-screen p-8 ml-64 overflow-y-auto">
        <Outlet context={{ user }} />
      </main>
    </div>
  );
};

export default MainLayout;
