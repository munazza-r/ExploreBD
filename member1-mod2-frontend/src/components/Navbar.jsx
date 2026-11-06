import { Compass, Bell } from "lucide-react";

export default function Navbar({ active }) {
  const links = ["Dashboard", "Explore Guides", "Bookings", "Messages"];
  return (
    <nav className="bg-white border-b border-gray-200 px-8 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-green-700 to-green-500 flex items-center justify-center">
          <Compass size={20} className="text-green-100" />
        </div>
        <span className="text-lg font-bold text-gray-900">
          Explore<span className="text-green-600">BD</span>
        </span>
      </div>

      <div className="flex items-center gap-6 text-sm font-medium text-gray-500">
        {links.map((link) => (
          <span
            key={link}
            className={
              link === active
                ? "text-green-700 border-b-2 border-green-700 pb-1 cursor-pointer"
                : "cursor-pointer hover:text-gray-900"
            }
          >
            {link}
          </span>
        ))}
      </div>

      <div className="flex items-center gap-4">
        <Bell size={20} className="text-gray-500" />
        <div className="w-9 h-9 rounded-full bg-green-700 text-white flex items-center justify-center text-sm font-semibold">
          MR
        </div>
      </div>
    </nav>
  );
}
