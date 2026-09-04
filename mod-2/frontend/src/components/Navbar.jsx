import { Bell } from "lucide-react";
import { getCurrentAuth } from "../api/messageApi";

export default function Navbar({ active }) {
  const user = getCurrentAuth()?.user;
  const profileHref = user?.role === "GUIDE" ? "/guide-profile.html" : "/tourist-profile.html";
  const initials = String(user?.name || "User").split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0].toUpperCase()).join("");
  const links = [
    { label: "Dashboard", href: "/" },
    { label: "My profile", href: profileHref },
    { label: user?.role === "GUIDE" ? "QR scanner" : "Booking pass", href: "/qr/" },
    { label: "Messages", href: "/messages/" },
  ];

  return (
    <nav className="h-16 border-t-[3px] border-t-[#343434] border-b border-b-[#e5e9ed] bg-white px-4 sm:px-7">
      <div className="mx-auto grid h-full max-w-[1440px] grid-cols-[1fr_auto_1fr] items-center">
        <a href="/" className="flex w-fit items-center gap-4" aria-label="ExploreBD home">
          <span className="flex h-7 w-7 items-center justify-center rounded-[7px] bg-[#108a70] text-sm font-semibold text-white">E</span>
          <span className="text-[17px] font-semibold tracking-[-0.02em] text-[#182033]">ExploreBD</span>
        </a>

        <div className="hidden items-stretch gap-5 text-sm text-[#4b5565] md:flex">
          {links.map((link) => {
            const isActive = link.label === active;
            return (
              <a key={link.label} href={link.href} className={`relative flex h-10 items-center rounded-lg px-3 transition-colors hover:text-[#111827] ${isActive ? "bg-[#eef8f5] text-[#455260]" : ""}`}>
                {link.label}
                {isActive && <span className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-[#69d9c0]" />}
              </a>
            );
          })}
        </div>

        <div className="ml-auto flex items-center gap-5">
          <button type="button" aria-label="Notifications" className="rounded-full p-1.5 text-[#b38a00] transition-colors hover:bg-amber-50">
            <Bell size={17} fill="currentColor" strokeWidth={1.5} />
          </button>
          <a href={profileHref} aria-label="Open profile" title={user?.name} className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0e806a] text-[11px] font-semibold text-white">
            {initials || "U"}
          </a>
        </div>
      </div>
    </nav>
  );
}
