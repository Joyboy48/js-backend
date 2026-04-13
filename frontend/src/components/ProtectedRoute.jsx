import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = () => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-primary"></div>
      </div>
    );
  }

  // If not authenticated, silently redirect to login via Navigate
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // If authenticated, render the child routes (Outlet)
  return <Outlet />;
};

export default ProtectedRoute;
