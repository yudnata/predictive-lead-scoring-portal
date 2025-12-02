import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import AppRoutes from './routes/AppRoutes';
import RouteLoader from './components/RouteLoader';
import axiosClient from './api/axiosClient';

function App() {
  const [userProfile, setUserProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');

    if (!token) {
      setLoadingProfile(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        const response = await axiosClient.get('/auth/me');
        setUserProfile(response.data.data);
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
        setUserProfile(null);
      } finally {
        setLoadingProfile(false);
      }
    };
    fetchProfile();
  }, []);

  if (loadingProfile)
    return (
      <div className="flex items-center justify-center min-h-screen text-white bg-dark-bg">
        Loading profile...
      </div>
    );

  return (
    <>
      <Toaster position="top-right" />
      <RouteLoader>
        <AppRoutes userProfile={userProfile} />
      </RouteLoader>
    </>
  );
}

export default App;
