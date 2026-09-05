import { Link, useNavigate } from "react-router-dom";
import { Compass, Bell, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Navbar({ active }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const touristLinks = [
    { label: "Explore Guides", to: "/guides" },
    { label: "Bookings", to: "/bookings" },
    { label: "Meeting Point", to: "/meeting-point" },
    { label: "Messages", to: "/messages" },
    { label: "Itinerary Builder", to: "/itinerary" },
    { label: "My Payments", to: "/payments" },
    { label: "QR Pass", to: "/qr-pass" },
    { label: "Support", to: "/support" },
  ];

  const guideLinks = [
    { label: "My Profile", to: "/guide-profile" },
    { label: "Bookings", to: "/bookings" },
    { label: "Meeting Approvals", to: "/meeting-approvals" },
    { label: "Tour Packages", to: "/tour-packages" },
    { label: "Verification", to: "/verification" },
    { label: "Messages", to: "/messages" },
    { label: "Earnings", to: "/earnings" },
    { label: "Scan QR Pass", to: "/scan-qr" },
    { label: "Support", to: "/support" },
  ];

  const adminLinks = [
    { label: "Verification Queue", to: "/admin/verification" },
    { label: "All Payments", to: "/admin/payments" },
    { label: "Support Requests", to: "/admin/requests" },
  ];

  const links = user?.role === "ADMIN" ? adminLinks : user?.role === "GUIDE" ? guideLinks : touristLinks;

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <nav className="bg-white border-b border-gray-200 px-8 py-3 flex items-center justify-between overflow-x-auto">
      <Link to="/" className="flex items-center gap-2 shrink-0">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-green-700 to-green-500 flex items-center justify-center">
          <Compass size={20} className="text-green-100" />
        </div>
        <span className="text-lg font-bold text-gray-900">
          Explore<span className="text-green-600">BD</span>
        </span>
      </Link>

      <div className="flex items-center gap-5 text-sm font-medium text-gray-500 whitespace-nowrap px-4">
        {links.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className={
              link.label === active
                ? "text-green-700 border-b-2 border-green-700 pb-1"
                : "hover:text-gray-900"
            }
          >
            {link.label}
          </Link>
        ))}
      </div>

      <div className="flex items-center gap-4 shrink-0">
        <Bell size={20} className="text-gray-500" />
        {user && (
          <div className="w-9 h-9 rounded-full bg-green-700 text-white flex items-center justify-center text-sm font-semibold" title={user.name}>
            {user.name?.charAt(0).toUpperCase()}
          </div>
        )}
        <button onClick={handleLogout} className="text-gray-400 hover:text-red-600" title="Log out">
          <LogOut size={18} />
        </button>
      </div>
    </nav>
  );
}
