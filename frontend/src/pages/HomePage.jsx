import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function HomePage() {
  const { user, loading } = useAuth();
  if (loading) return <p className="p-8 text-gray-500">Loading...</p>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === "ADMIN") return <Navigate to="/admin/verification" replace />;
  if (user.role === "GUIDE") return <Navigate to="/guide-profile" replace />;
  return <Navigate to="/guides" replace />;
}
