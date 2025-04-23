import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = ({ isLoggedIn, redirectPath = "/login", children }) => {
 const user = JSON?.parse(localStorage?.getItem('user'));
  const expired = isLoggedIn();
  if (!user || expired) {
   
    return <Navigate to={redirectPath} replace />;
  }
 
  return children ? children : <Outlet />;
};

export default ProtectedRoute;