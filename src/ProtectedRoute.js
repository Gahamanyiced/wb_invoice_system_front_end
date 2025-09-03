import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ isLoggedIn, redirectPath = '/login', children }) => {
  const isAuthenticated = isLoggedIn();

  // If not authenticated (expired/invalid token), redirect to login
  if (!isAuthenticated) {
    return <Navigate to={redirectPath} replace />;
  }

  return children ? children : <Outlet />;
};

export default ProtectedRoute;
