import { useState } from "react";
import { Compass, LoaderCircle, LockKeyhole, ShieldCheck } from "lucide-react";
import { login } from "../api/passApi";

export default function LoginPage({ onSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const auth = await login(email, password);
      onSuccess(auth);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[#073c32] px-4 py-12 text-slate-900">
      <div className="w-full max-w-md rounded-[30px] border border-white/15 bg-white p-7 shadow-[0_30px_90px_rgba(0,0,0,0.28)] sm:p-9">
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-700 text-emerald-100"><Compass size={25} /></span>
          <div><p className="font-display text-xl font-extrabold tracking-[-0.04em]">Explore<span className="text-emerald-600">BD</span></p><p className="text-[9px] font-extrabold uppercase tracking-[0.16em] text-slate-400">Module 3 · QR verification</p></div>
        </div>

        <div className="mt-8">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-emerald-50 text-emerald-700"><LockKeyhole size={20} /></span>
          <h1 className="font-display mt-4 text-3xl font-extrabold tracking-[-0.05em]">Sign in to continue</h1>
          <p className="mt-2 text-xs leading-5 text-slate-500">Use an existing ExploreBD tourist or guide account from the shared MongoDB database.</p>
        </div>

        <form className="mt-7 space-y-4" onSubmit={handleSubmit}>
          {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-bold text-red-700">{error}</div>}
          <label className="block"><span className="mb-1.5 block text-[11px] font-bold text-slate-700">Email address</span><input type="email" required autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100" /></label>
          <label className="block"><span className="mb-1.5 block text-[11px] font-bold text-slate-700">Password</span><input type="password" required autoComplete="current-password" value={password} onChange={event => setPassword(event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100" /></label>
          <button disabled={loading} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-3.5 text-sm font-extrabold text-white transition hover:bg-emerald-800 disabled:opacity-60">{loading ? <LoaderCircle size={17} className="animate-spin" /> : <ShieldCheck size={17} />}{loading ? "Signing in..." : "Sign in as Tourist or Guide"}</button>
        </form>
      </div>
    </main>
  );
}
