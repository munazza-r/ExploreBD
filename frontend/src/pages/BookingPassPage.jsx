import { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import { Check, CircleAlert, Download, LoaderCircle, Printer, ShieldCheck, Sparkles } from "lucide-react";
import Navbar from "../components/Navbar";
import PassTicket from "../components/PassTicket";
import { fetchBookingPass, fetchMyBooking } from "../api/passApi";
import { formatDateTime, formatMoney } from "../utils/pass";

function Step({ state, label, detail, last }) {
  const complete = state === "complete";
  const current = state === "current";
  return (
    <div className="relative flex min-w-[150px] flex-1 gap-3">
      {!last && <span className={`absolute left-[13px] top-7 h-[calc(100%_-_4px)] w-px sm:left-7 sm:top-[13px] sm:h-px sm:w-[calc(100%_-_28px)] ${complete ? "bg-emerald-300" : "bg-slate-200"}`} />}
      <span className={`relative z-10 grid h-7 w-7 shrink-0 place-items-center rounded-full border-2 ${complete ? "border-emerald-600 bg-emerald-600 text-white" : current ? "border-emerald-600 bg-white text-emerald-700" : "border-slate-200 bg-white text-slate-300"}`}>{complete ? <Check size={13} strokeWidth={3} /> : <span className={`h-1.5 w-1.5 rounded-full ${current ? "bg-emerald-600" : "bg-slate-300"}`} />}</span>
      <span className="relative z-10 bg-white pr-2 sm:-ml-10 sm:pt-8"><span className={`block text-[11px] font-bold ${complete || current ? "text-slate-800" : "text-slate-400"}`}>{label}</span><span className="mt-0.5 block text-[9px] text-slate-400">{detail}</span></span>
    </div>
  );
}

export default function BookingPassPage() {
  const [passData, setPassData] = useState(null);
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const current = await fetchMyBooking();
        const data = await fetchBookingPass(current.booking.id);
        if (active) setPassData(data);
      } catch (requestError) {
        if (requestError.status === 401 || requestError.status === 403) window.location.replace("/login.html");
        if (active) setError(requestError.message);
      }
    }
    load();
    return () => { active = false; };
  }, []);

  const verificationUrl = useMemo(() => passData?.token ? `${window.location.origin}/qr/#/verify?token=${encodeURIComponent(passData.token)}` : "", [passData]);

  useEffect(() => {
    let active = true;
    if (!verificationUrl) return undefined;
    QRCode.toDataURL(verificationUrl, { errorCorrectionLevel: "H", margin: 2, width: 420, color: { dark: "#063c32", light: "#ffffff" } }).then((url) => { if (active) setQrDataUrl(url); });
    return () => { active = false; };
  }, [verificationUrl]);

  function downloadPass() {
    if (!qrDataUrl || !passData) return;
    const link = document.createElement("a");
    link.download = `ExploreBD-${passData.booking.reference}-QR-pass.png`;
    link.href = qrDataUrl;
    link.click();
  }

  const booking = passData?.booking;

  return (
    <div className="min-h-screen bg-[#f4f8f6] text-slate-900">
      <Navbar active="pass" />

      <section className="hero-grid relative overflow-hidden bg-[#073c32] px-4 pb-28 pt-12 text-white sm:px-6 sm:pt-16 lg:px-8">
        <div className="pointer-events-none absolute -right-16 -top-24 h-80 w-80 rounded-full border-[60px] border-emerald-400/10" />
        <div className="pointer-events-none absolute -bottom-20 left-[8%] h-52 w-52 rounded-full bg-teal-300/5 blur-2xl" />
        <div className="relative mx-auto flex max-w-[1120px] flex-col justify-between gap-8 md:flex-row md:items-end">
          <div className="max-w-[690px]">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-emerald-200"><Sparkles size={13} /> Payment complete · Pass ready</div>
            <h1 className="font-display text-4xl font-extrabold leading-[1.08] tracking-[-0.055em] sm:text-5xl lg:text-[58px]">Your trip is confirmed.<br /><span className="text-emerald-300">Carry the adventure.</span></h1>
            <p className="mt-5 max-w-[570px] text-sm leading-7 text-emerald-50/70 sm:text-[15px]">Your secure QR pass is ready for guide verification. Keep it close, arrive at the meeting point, and let ExploreBD handle the trust layer.</p>
          </div>
          {booking && <div className="flex shrink-0 gap-7 rounded-2xl border border-white/10 bg-white/[0.06] px-5 py-4 backdrop-blur"><div><p className="text-[9px] font-bold uppercase tracking-[0.16em] text-emerald-200/60">Paid via</p><p className="mt-1 text-sm font-bold">{booking.payment.provider}</p></div><div className="w-px bg-white/10" /><div><p className="text-[9px] font-bold uppercase tracking-[0.16em] text-emerald-200/60">Total</p><p className="mt-1 text-sm font-bold">{formatMoney(booking.payment.amount)}</p></div></div>}
        </div>
      </section>

      <main className="relative mx-auto -mt-20 max-w-[1120px] px-4 pb-20 sm:px-6 lg:px-8">
        {error ? (
          <div className="rounded-3xl border border-red-200 bg-white p-10 text-center shadow-xl"><CircleAlert className="mx-auto text-red-500" size={30} /><h2 className="font-display mt-3 text-xl font-bold">Pass could not be loaded</h2><p className="mt-2 text-sm text-slate-500">{error}</p></div>
        ) : !booking ? (
          <div className="flex min-h-[380px] items-center justify-center rounded-3xl bg-white shadow-xl"><LoaderCircle className="animate-spin text-emerald-700" size={28} /></div>
        ) : (
          <>
            <PassTicket booking={booking} qrDataUrl={qrDataUrl} />
            <div className="mt-5 flex flex-col justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm sm:flex-row sm:items-center">
              <div className="flex items-start gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-emerald-50 text-emerald-700"><ShieldCheck size={17} /></span><span><span className="block text-xs font-bold text-slate-800">Saved securely to this booking</span><span className="mt-0.5 block text-[10px] text-slate-400">Valid until {formatDateTime(booking.pass.expiresAt)}</span></span></div>
              <div className="flex flex-wrap gap-2 print:hidden">
                <button onClick={downloadPass} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-[11px] font-bold text-slate-700 transition hover:border-emerald-300 hover:text-emerald-800"><Download size={14} /> Download QR</button>
                <button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-[11px] font-bold text-slate-700 transition hover:border-emerald-300 hover:text-emerald-800"><Printer size={14} /> Print pass</button>
              </div>
            </div>

            <section className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
              <div className="rounded-[24px] border border-slate-200 bg-white p-6 sm:p-7">
                <div className="flex items-center justify-between gap-4"><div><p className="text-[9px] font-extrabold uppercase tracking-[0.16em] text-emerald-700">Booking journey</p><h3 className="font-display mt-1 text-xl font-extrabold tracking-[-0.035em] text-slate-900">From payment to check-in</h3></div><span className="rounded-full bg-emerald-50 px-3 py-1.5 text-[9px] font-bold text-emerald-700">2 of 4 complete</span></div>
                <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:gap-0"><Step state="complete" label="Payment confirmed" detail={formatDateTime(booking.payment.paidAt)} /><Step state="complete" label="QR pass issued" detail="Signed securely" /><Step state="current" label="Guide verification" detail="At meeting point" /><Step state="upcoming" label="Tour begins" detail={formatDateTime(booking.startsAt, { month: "short", year: undefined })} last /></div>
              </div>
              <aside className="overflow-hidden rounded-[24px] bg-[#e8f3ee] p-6"><div className="grid h-9 w-9 place-items-center rounded-xl bg-white text-emerald-700 shadow-sm"><ShieldCheck size={17} /></div><h3 className="font-display mt-4 text-lg font-extrabold tracking-[-0.03em] text-slate-900">Pass safety</h3><p className="mt-2 text-[11px] leading-5 text-slate-600">Only your assigned guide can validate this signed pass. A duplicate scan shows the original check-in time instead of creating a second entry.</p><p className="mt-4 rounded-xl border border-emerald-200/80 bg-white/60 px-3 py-2 text-[9px] font-semibold leading-4 text-emerald-900">Never share the raw pass link publicly. Show the QR only at the meeting point.</p></aside>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
