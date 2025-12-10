import { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import AppRoutes from './routes/AppRoutes';
import RouteLoader from './components/RouteLoader';
import axiosClient from './api/axiosClient';
import { UploadProgressProvider } from './context/UploadProgressContext';
import UploadProgressToast from './components/UploadProgressToast';

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
    <UploadProgressProvider>
      <Toaster position="top-right" />
      <UploadProgressToast />
      <RouteLoader>
        <AppRoutes userProfile={userProfile} />
      </RouteLoader>
    </UploadProgressProvider>
  );
}

export default App;

