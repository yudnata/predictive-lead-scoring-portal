import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const MainLayout = ({ user }) => {
  return (
    <div className="flex min-h-screen">
      <Sidebar user={user} />
      <main className="flex-1 p-8 ml-64">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
