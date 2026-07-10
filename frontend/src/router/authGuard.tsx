import { Outlet, Navigate } from "react-router-dom";

const AuthGuard = () => {
  const isAuthenticated = true; 

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default AuthGuard;
