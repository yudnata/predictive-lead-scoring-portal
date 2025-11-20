import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Spinner from './Spinner';

const RouteLoader = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const timerStart = setTimeout(() => setLoading(true), 0); // set async
    const timerEnd = setTimeout(() => setLoading(false), 300); // spinner 300ms

    return () => {
      clearTimeout(timerStart);
      clearTimeout(timerEnd);
    };
  }, [location.pathname]);

  return (
    <>
      {loading && <Spinner />}
      {children}
    </>
  );
};

export default RouteLoader;
