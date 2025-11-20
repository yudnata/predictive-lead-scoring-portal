import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const PrivateRoute = ({ allowedRoles }) => {
  const userRole = localStorage.getItem('userRole');
  const authToken = localStorage.getItem('authToken');
  
  if (!authToken) {
    return <Navigate to="/login" replace />; 
  }

  if (!userRole || !allowedRoles.includes(userRole)) {
    // Bisa membuat komponen 403 Forbidden di sini
    return <Navigate to="/" replace />; 
  }

  return <Outlet />; 
};

export default PrivateRoute;