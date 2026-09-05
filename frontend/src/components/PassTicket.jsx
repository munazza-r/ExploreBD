import { CalendarDays, Clock3, MapPin, ShieldCheck, UsersRound } from "lucide-react";
import StatusPill from "./StatusPill";
import { formatDateTime } from "../utils/pass";

function Detail({ icon: Icon, label, children }) {
  return (
    <div className="flex gap-3">
      <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-700"><Icon size={15} /></span>
      <span className="min-w-0"><span className="block text-[9px] font-extrabold uppercase tracking-[0.13em] text-slate-400">{label}</span><span className="mt-0.5 block text-[12px] font-bold leading-snug text-slate-800">{children}</span></span>
    </div>
  );
}

export default function PassTicket({ booking, qrDataUrl }) {
  return (
    <article className="ticket-shell relative grid overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_28px_80px_rgba(15,62,52,0.14)] lg:grid-cols-[1.35fr_0.65fr]">
      <div className="relative px-6 py-7 sm:px-9 sm:py-9">
        <div className="absolute right-0 top-0 h-36 w-36 rounded-bl-[100%] bg-emerald-50/70" />
        <div className="relative">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-emerald-700">ExploreBD digital pass</p>
              <h2 className="font-display mt-2 max-w-[470px] text-[27px] font-extrabold leading-[1.18] tracking-[-0.045em] text-slate-950 sm:text-[32px]">{booking.packageName}</h2>
            </div>
            <StatusPill status={booking.pass.status} />
          </div>

          <div className="mt-7 grid gap-5 sm:grid-cols-2">
            <Detail icon={CalendarDays} label="Tour date">{formatDateTime(booking.startsAt, { weekday: "short", hour: undefined, minute: undefined })}</Detail>
            <Detail icon={Clock3} label="Meeting time">{formatDateTime(booking.startsAt, { month: undefined, day: undefined, year: undefined })} (BST)</Detail>
            <Detail icon={MapPin} label="Meeting point">{booking.meetingPoint}</Detail>
            <Detail icon={UsersRound} label="Travelers">{booking.travelers} guests · {booking.tourist.name}</Detail>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-dashed border-slate-200 pt-5">
            <div><p className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-slate-400">Booking reference</p><p className="font-display mt-1 text-lg font-extrabold tracking-[0.08em] text-slate-900">{booking.reference}</p></div>
            <div className="flex items-center gap-2.5 rounded-2xl bg-slate-50 px-3 py-2">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-emerald-800 text-[10px] font-bold text-white">{booking.guide.initials}</span>
              <span><span className="flex items-center gap-1 text-[10px] font-bold text-slate-800">{booking.guide.name} <ShieldCheck size={12} className="text-emerald-600" /></span><span className="block text-[9px] text-slate-400">Your verified local guide</span></span>
            </div>
          </div>
        </div>
      </div>

      <div className="ticket-divider relative flex flex-col items-center justify-center border-t border-dashed border-slate-200 bg-[#f7fbf9] px-6 py-8 lg:border-l lg:border-t-0">
        <p className="text-[9px] font-extrabold uppercase tracking-[0.18em] text-slate-500">Scan to verify</p>
        <div className="mt-3 rounded-[22px] border border-emerald-100 bg-white p-3 shadow-[0_12px_30px_rgba(16,116,91,0.12)]">
          {qrDataUrl ? <img src={qrDataUrl} alt={`QR pass for booking ${booking.reference}`} className="h-[176px] w-[176px] sm:h-[194px] sm:w-[194px]" /> : <div className="h-[176px] w-[176px] animate-pulse rounded-xl bg-slate-100 sm:h-[194px] sm:w-[194px]" />}
        </div>
        <p className="mt-3 text-center text-[9px] font-semibold leading-relaxed text-slate-400">Show this pass only to your assigned guide.<br />No private contact details are stored in the code.</p>
        <div className="mt-3 flex items-center gap-1.5 text-[9px] font-bold text-emerald-700"><ShieldCheck size={13} /> Securely signed by ExploreBD</div>
      </div>
    </article>
  );
}

