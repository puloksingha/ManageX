import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ allow, children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!allow.includes(user.role)) {
    const redirect = user.role === "student" ? "/student" : user.role === "department" || user.role === "teacher" ? "/department" : "/admin";
    return <Navigate to={redirect} replace />;
  }

  return children;
};

export default ProtectedRoute;
