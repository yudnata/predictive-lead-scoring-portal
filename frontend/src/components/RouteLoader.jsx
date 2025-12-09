import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const RouteLoader = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const animationFrame = requestAnimationFrame(() => setLoading(true));
    const timerEnd = setTimeout(() => setLoading(false), 1000);

    return () => {
      cancelAnimationFrame(animationFrame);
      clearTimeout(timerEnd);
    };
  }, [location.pathname]);

  return (
    <>
      <style>
        {`
          @keyframes slideRight {
            0% { transform: translateX(-100%); }
            50% { transform: translateX(150%); }
            100% { transform: translateX(400%); }
          }
          .animate-slide-right {
            animation: slideRight 1.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
            box-shadow: 0 0 15px rgba(255, 255, 255, 0.5);
          }
        `}
      </style>
      {loading && (
        <div className="fixed left-64 top-0 right-0 h-0.5 bg-blue-500 dark:bg-gray-900 z-50 overflow-hidden transition-colors duration-300">
          <div className="h-full w-1/2 bg-gradient-to-r from-transparent via-white/80 to-transparent animate-slide-right"></div>
        </div>
      )}
      {children}
    </>
  );
};

export default RouteLoader;
