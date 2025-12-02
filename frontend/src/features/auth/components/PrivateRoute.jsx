import { Navigate, Outlet } from 'react-router-dom';
import UnauthorizedModal from './UnauthorizedModal';

const PrivateRoute = ({ allowedRoles }) => {
  const userRole = localStorage.getItem('userRole') || sessionStorage.getItem('userRole');
  const authToken = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');

  if (!authToken) {
    return <UnauthorizedModal />;
  }

  if (!userRole || (allowedRoles && !allowedRoles.includes(userRole))) {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  return <Outlet />;
};

export default PrivateRoute;
