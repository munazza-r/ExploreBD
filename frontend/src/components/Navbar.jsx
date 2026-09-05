import { Bell, ChevronDown, LogOut, Menu, QrCode, TicketCheck, X } from "lucide-react";
import { useState } from "react";
import { getCurrentAuth, logout } from "../api/passApi";
import BrandMark from "./BrandMark";

export default function Navbar({ active }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const user = getCurrentAuth()?.user;
  const guideMode = user?.role === "GUIDE";
  const profileHref = "/";
  const initials = String(user?.name || "User").split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0].toUpperCase()).join("");
  const navItems = [
    { key: guideMode ? "verify" : "pass", label: guideMode ? "QR scanner" : "Booking pass", icon: guideMode ? QrCode : TicketCheck, href: "/" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl print:hidden">
      <nav className="mx-auto flex h-[72px] max-w-[1240px] items-center justify-between px-4 sm:px-6 lg:px-8">
        <a href={profileHref} aria-label="ExploreBD profile"><BrandMark compact /></a>

        <div className="hidden items-center gap-1 md:flex">
          {navItems.map(({ key, label, icon: Icon, href }) => (
            <a key={key} href={href} className={`flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-semibold transition ${active === key ? "bg-emerald-50 text-emerald-800" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"}`}>
              <Icon size={15} /> {label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2.5">
          <button className="relative hidden h-9 w-9 place-items-center rounded-full text-slate-500 transition hover:bg-slate-100 sm:grid" aria-label="Notifications">
            <Bell size={17} /><span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-white bg-amber-400" />
          </button>
          <button type="button" onClick={logout} className="grid h-9 w-9 place-items-center rounded-full text-slate-500 transition hover:bg-red-50 hover:text-red-600" aria-label="Sign out" title="Sign out"><LogOut size={16} /></button>
          <a href={profileHref} className="hidden items-center gap-2.5 rounded-full border border-slate-200 bg-white py-1.5 pl-1.5 pr-3 shadow-sm sm:flex">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-emerald-800 text-[10px] font-bold text-white">{initials || "U"}</span>
            <span><span className="block text-[11px] font-bold leading-tight text-slate-800">{user?.name || "ExploreBD user"}</span><span className="block text-[9px] font-semibold text-emerald-700">{guideMode ? "Guide mode" : "Tourist mode"}</span></span>
            <ChevronDown size={13} className="text-slate-400" />
          </a>
          <button type="button" onClick={() => setMobileOpen((value) => !value)} className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 text-slate-700 md:hidden" aria-label="Toggle navigation">
            {mobileOpen ? <X size={19} /> : <Menu size={19} />}
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <div className="border-t border-slate-100 bg-white px-4 py-3 md:hidden">
          {navItems.map(({ key, label, icon: Icon, href }) => (
            <a key={key} href={href} onClick={() => setMobileOpen(false)} className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold ${active === key ? "bg-emerald-50 text-emerald-800" : "text-slate-600"}`}>
              <Icon size={17} /> {label}
            </a>
          ))}
        </div>
      )}
    </header>
  );
}
