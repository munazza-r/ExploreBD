import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { AlertTriangle, Camera, Check, CheckCircle2, FileImage, Keyboard, LoaderCircle, MapPin, ScanLine, ShieldCheck, UserRound, XCircle } from "lucide-react";
import Navbar from "../components/Navbar";
import { getCurrentAuth, verifyBookingPass } from "../api/passApi";
import { extractToken, formatDateTime, tokenFromHash } from "../utils/pass";

function ResultCard({ result }) {
  if (!result) return null;
  const valid = result.valid;
  const booking = result.booking;

  return (
    <section className={`animate-rise overflow-hidden rounded-[26px] border bg-white shadow-[0_22px_70px_rgba(15,23,42,0.12)] ${valid ? "border-emerald-200" : "border-red-200"}`}>
      <div className={`px-6 py-6 text-white sm:px-8 ${valid ? "bg-gradient-to-r from-emerald-700 to-teal-700" : "bg-gradient-to-r from-red-600 to-rose-600"}`}>
        <div className="flex items-start gap-4">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/15">{valid ? <CheckCircle2 size={27} /> : <XCircle size={27} />}</span>
          <div><p className="text-[9px] font-extrabold uppercase tracking-[0.18em] text-white/70">{valid ? "ExploreBD verified" : "Verification failed"}</p><h2 className="font-display mt-1 text-2xl font-extrabold tracking-[-0.035em]">{result.message}</h2>{result.alreadyVerified && <p className="mt-2 text-[11px] text-white/75">No duplicate check-in was created.</p>}</div>
        </div>
      </div>

      {booking && (
        <div className="p-6 sm:p-8">
          <div className="flex flex-col justify-between gap-5 border-b border-slate-100 pb-6 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3"><span className="grid h-12 w-12 place-items-center rounded-full bg-emerald-50 text-sm font-extrabold text-emerald-800">{booking.tourist.initials}</span><div><p className="text-[9px] font-extrabold uppercase tracking-[0.12em] text-slate-400">Lead tourist</p><p className="mt-0.5 text-base font-bold text-slate-900">{booking.tourist.name}</p><p className="text-[10px] text-slate-400">{booking.travelers} travelers</p></div></div>
            <span className="w-fit rounded-full bg-emerald-50 px-4 py-2 text-[10px] font-extrabold uppercase tracking-[0.12em] text-emerald-700"><Check size={13} className="mr-1 inline" /> Identity matched</span>
          </div>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <div><p className="text-[9px] font-extrabold uppercase tracking-[0.12em] text-slate-400">Tour package</p><p className="mt-1 text-sm font-bold leading-snug text-slate-800">{booking.packageName}</p></div>
            <div><p className="text-[9px] font-extrabold uppercase tracking-[0.12em] text-slate-400">Booking reference</p><p className="font-display mt-1 text-sm font-extrabold tracking-[0.08em] text-slate-800">{booking.reference}</p></div>
            <div><p className="text-[9px] font-extrabold uppercase tracking-[0.12em] text-slate-400">Meeting point</p><p className="mt-1 flex gap-1.5 text-xs font-semibold text-slate-700"><MapPin size={14} className="shrink-0 text-emerald-600" />{booking.meetingPoint}</p></div>
            <div><p className="text-[9px] font-extrabold uppercase tracking-[0.12em] text-slate-400">Check-in recorded</p><p className="mt-1 text-xs font-semibold text-slate-700">{formatDateTime(booking.pass.verifiedAt)}</p></div>
          </div>
        </div>
      )}
    </section>
  );
}

export default function VerifyPassPage() {
  const guide = getCurrentAuth()?.user;
  const [token, setToken] = useState(() => tokenFromHash());
  const [scannerState, setScannerState] = useState("idle");
  const [message, setMessage] = useState("");
  const [result, setResult] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const scannerRef = useRef(null);
  const fileInputRef = useRef(null);

  async function stopScanner() {
    const scanner = scannerRef.current;
    if (!scanner) return;
    try {
      if (scanner.isScanning) await scanner.stop();
      await scanner.clear();
    } catch {
      // The scanner may already have released the camera.
    }
    scannerRef.current = null;
    setScannerState("idle");
  }

  useEffect(() => () => {
    const scanner = scannerRef.current;
    if (scanner?.isScanning) scanner.stop().catch(() => {});
  }, []);

  async function submitForVerification(value) {
    const normalized = extractToken(value);
    if (!normalized || isVerifying) {
      if (!normalized) setMessage("Scan or enter a booking pass first.");
      return;
    }

    setIsVerifying(true);
    setMessage("");
    setResult(null);
    try {
      const data = await verifyBookingPass(normalized);
      setToken(normalized);
      setResult(data);
    } catch (error) {
      setResult({ valid: false, code: error.code, message: error.message });
    } finally {
      setIsVerifying(false);
    }
  }

  async function handleDetected(decodedText) {
    await stopScanner();
    const detectedToken = extractToken(decodedText);
    setToken(detectedToken);
    setMessage("QR detected. Checking the secure signature...");
    await submitForVerification(detectedToken);
  }

  async function startCamera() {
    setResult(null);
    setMessage("");
    try {
      await stopScanner();
      const scanner = new Html5Qrcode("qr-camera-reader");
      scannerRef.current = scanner;
      setScannerState("starting");
      await scanner.start({ facingMode: "environment" }, { fps: 10, qrbox: { width: 230, height: 230 }, aspectRatio: 1 }, handleDetected, () => {});
      setScannerState("scanning");
    } catch (error) {
      scannerRef.current = null;
      setScannerState("error");
      setMessage(error?.message?.includes("Permission") ? "Camera permission was blocked. Allow camera access or upload a QR image." : "Camera is unavailable. Upload a QR image or use the demo pass.");
    }
  }

  async function scanFile(file) {
    if (!file) return;
    await stopScanner();
    setResult(null);
    setMessage("Reading QR image...");
    const scanner = new Html5Qrcode("qr-file-reader");
    scannerRef.current = scanner;
    try {
      const decodedText = await scanner.scanFile(file, true);
      await handleDetected(decodedText);
    } catch {
      setMessage("No readable QR code was found in that image. Try a sharper screenshot.");
      await stopScanner();
    }
  }

  return (
    <div className="min-h-screen bg-[#f4f8f6] text-slate-900">
      <Navbar active="verify" />
      <main className="mx-auto max-w-[1160px] px-4 pb-20 pt-8 sm:px-6 lg:px-8 lg:pt-12">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div><div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[9px] font-extrabold uppercase tracking-[0.15em] text-emerald-700"><ShieldCheck size={12} /> Guide verification workspace</div><h1 className="font-display mt-4 text-4xl font-extrabold tracking-[-0.055em] text-slate-950 sm:text-5xl">Verify a booking pass</h1><p className="mt-3 max-w-[620px] text-sm leading-6 text-slate-500">Scan the tourist's ExploreBD QR at the meeting point. The system checks the payment, signature, assigned guide, pass validity, and previous check-in state.</p></div>
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm"><span className="grid h-10 w-10 place-items-center rounded-full bg-emerald-800 text-[11px] font-extrabold text-white">{String(guide?.name || "Guide").split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0].toUpperCase()).join("")}</span><span><span className="flex items-center gap-1 text-xs font-bold text-slate-800">{guide?.name || "Guide"} <ShieldCheck size={13} className="text-emerald-600" /></span><span className="text-[9px] font-semibold text-slate-400">Authenticated guide</span></span></div>
        </div>

        <section className="mt-8 grid gap-7 lg:grid-cols-[0.92fr_1.08fr]">
          <div className="overflow-hidden rounded-[28px] bg-[#082f29] p-5 text-white shadow-[0_25px_70px_rgba(6,48,41,0.19)] sm:p-7">
            <div className="flex items-center justify-between gap-4"><div><p className="text-[9px] font-extrabold uppercase tracking-[0.16em] text-emerald-300/70">Live scanner</p><h2 className="font-display mt-1 text-xl font-extrabold">Align QR inside the frame</h2></div><span className={`h-2.5 w-2.5 rounded-full ${scannerState === "scanning" ? "animate-pulse bg-emerald-300" : "bg-white/25"}`} /></div>
            <div className="scanner-stage relative mt-5 aspect-square overflow-hidden rounded-[24px] border border-white/10 bg-[#041f1b]">
              <div id="qr-camera-reader" className="h-full w-full" />
              {scannerState !== "scanning" && <div className="absolute inset-0 grid place-items-center p-8 text-center"><div><span className="mx-auto grid h-16 w-16 place-items-center rounded-3xl border border-white/10 bg-white/[0.06] text-emerald-300"><ScanLine size={28} /></span><p className="mt-4 text-sm font-bold">Camera scanner is ready</p><p className="mx-auto mt-2 max-w-[250px] text-[10px] leading-5 text-white/45">Camera access works on localhost. You can also upload a saved QR screenshot.</p></div></div>}
              {scannerState === "scanning" && <div className="scan-line pointer-events-none absolute inset-x-[12%] top-1/2 h-px bg-emerald-300 shadow-[0_0_18px_3px_rgba(110,231,183,0.65)]" />}
            </div>
            <div id="qr-file-reader" className="hidden" />
            <div className="mt-4 grid grid-cols-2 gap-3">
              <button onClick={scannerState === "scanning" ? stopScanner : startCamera} className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-400 px-4 py-3 text-[11px] font-extrabold text-emerald-950 transition hover:bg-emerald-300">{scannerState === "starting" ? <LoaderCircle size={15} className="animate-spin" /> : <Camera size={15} />}{scannerState === "scanning" ? "Stop camera" : "Start camera"}</button>
              <button onClick={() => fileInputRef.current?.click()} className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.06] px-4 py-3 text-[11px] font-bold text-white transition hover:bg-white/10"><FileImage size={15} /> Upload QR</button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(event) => scanFile(event.target.files?.[0])} />
            </div>
          </div>

          <div className="space-y-5">
            <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-[9px] font-extrabold uppercase tracking-[0.16em] text-emerald-700">Verification code</p><h2 className="font-display mt-1 text-xl font-extrabold tracking-[-0.03em]">Scanned pass details</h2></div></div>
              <label className="mt-5 block"><span className="mb-2 flex items-center gap-2 text-[10px] font-bold text-slate-500"><Keyboard size={13} /> Manual fallback</span><textarea value={token} onChange={(event) => setToken(extractToken(event.target.value))} rows="4" placeholder="Scan a QR code or paste its secure token here..." className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-mono text-[9px] leading-5 text-slate-600 outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100" /></label>
              {message && <div className="mt-3 flex items-start gap-2 rounded-xl bg-amber-50 px-3 py-2 text-[10px] font-semibold leading-4 text-amber-800"><AlertTriangle size={13} className="mt-0.5 shrink-0" />{message}</div>}
              <button onClick={() => submitForVerification(token)} disabled={!token || isVerifying} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-700 px-5 py-4 text-sm font-extrabold text-white shadow-[0_12px_26px_rgba(4,120,87,0.22)] transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-45">{isVerifying ? <LoaderCircle size={18} className="animate-spin" /> : <ShieldCheck size={18} />}{isVerifying ? "Checking secure pass..." : "Verify booking pass"}</button>
              <div className="mt-5 grid grid-cols-3 gap-2 border-t border-slate-100 pt-5">{["Paid booking", "Assigned guide", "Valid signature"].map((label) => <div key={label} className="rounded-xl bg-slate-50 px-2 py-3 text-center"><Check size={13} className="mx-auto text-emerald-600" /><span className="mt-1 block text-[8px] font-bold text-slate-500">{label}</span></div>)}</div>
            </div>
          </div>
        </section>

        <div className="mt-7"><ResultCard result={result} /></div>
        <section className="mt-7 grid gap-4 sm:grid-cols-3">
          {[{ icon: UserRound, title: "Match the tourist", text: "Confirm the lead tourist's name and traveler count shown after a valid scan." }, { icon: MapPin, title: "Confirm the meeting point", text: "Verification is intended for the scheduled trip meeting point and date." }, { icon: ShieldCheck, title: "One secure check-in", text: "Repeated scans display the prior verification instead of duplicating attendance." }].map(({ icon: Icon, title, text }) => <div key={title} className="rounded-2xl border border-slate-200 bg-white p-5"><span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-50 text-emerald-700"><Icon size={16} /></span><h3 className="mt-3 text-xs font-bold text-slate-800">{title}</h3><p className="mt-1.5 text-[10px] leading-5 text-slate-500">{text}</p></div>)}
        </section>
      </main>
    </div>
  );
}
