import { useState } from "react";
import Navbar from "../components/Navbar";
import { verifyPass } from "../api/qrPassApi";
import { CheckCircle2, XCircle } from "lucide-react";

export default function VerifyPassPage() {
  const [token, setToken] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleVerify(e) {
    e.preventDefault();
    setLoading(true);
    try {
      setResult(await verifyPass(token));
    } catch (err) {
      setResult({ valid: false, message: err.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar active="Scan QR Pass" />
      <div className="bg-gradient-to-r from-green-700 to-green-500 px-8 py-10 text-white">
        <h1 className="text-3xl font-bold mb-1">Verify booking pass</h1>
        <p className="text-green-50">Paste the tourist's QR pass code to check them in</p>
      </div>

      <div className="max-w-lg mx-auto px-8 py-8">
        <form onSubmit={handleVerify} className="bg-white border border-gray-200 rounded-xl p-6 space-y-3">
          <textarea required rows={3} placeholder="Paste the pass token here" value={token} onChange={(e) => setToken(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs font-mono" />
          <button type="submit" disabled={loading} className="w-full bg-green-700 hover:bg-green-800 text-white font-semibold py-2.5 rounded-lg disabled:opacity-60">
            {loading ? "Verifying..." : "Verify pass"}
          </button>
        </form>

        {result && (
          <div className={`mt-4 rounded-xl p-5 flex items-center gap-3 ${result.valid ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}>
            {result.valid ? <CheckCircle2 className="text-green-700" size={20} /> : <XCircle className="text-red-600" size={20} />}
            <p className={`text-sm ${result.valid ? "text-green-800" : "text-red-800"}`}>{result.message}</p>
          </div>
        )}
      </div>
    </div>
  );
}
