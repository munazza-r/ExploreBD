import { useState } from "react";
import Navbar from "../components/Navbar";
import { issuePass } from "../api/qrPassApi";
import { ShieldCheck } from "lucide-react";

export default function BookingPassPage() {
  const [bookingId, setBookingId] = useState("");
  const [pass, setPass] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleGetPass(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      setPass(await issuePass(bookingId));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar active="QR Pass" />
      <div className="bg-gradient-to-r from-green-700 to-green-500 px-8 py-10 text-white">
        <h1 className="text-3xl font-bold mb-1">Your booking pass</h1>
        <p className="text-green-50">Show this to your guide at the start of the tour</p>
      </div>

      <div className="max-w-lg mx-auto px-8 py-8">
        {!pass && (
          <form onSubmit={handleGetPass} className="bg-white border border-gray-200 rounded-xl p-6 space-y-3">
            <p className="text-sm text-gray-500">Enter your accepted, paid booking's ID to get your pass.</p>
            <input required placeholder="Booking ID" value={bookingId} onChange={(e) => setBookingId(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button type="submit" disabled={loading} className="w-full bg-green-700 hover:bg-green-800 text-white font-semibold py-2.5 rounded-lg disabled:opacity-60">
              {loading ? "Issuing pass..." : "Get my pass"}
            </button>
          </form>
        )}

        {pass && (
          <div className="bg-white border-2 border-green-600 rounded-xl p-6 text-center">
            <ShieldCheck className="mx-auto text-green-700 mb-3" size={32} />
            <p className="font-bold text-gray-900 mb-1">{pass.pass.passCode}</p>
            <p className="text-sm text-gray-500 mb-4">Guide: {pass.guideName}</p>
            <p className="text-xs text-gray-400 mb-2">Show this code to your guide (they'll paste it into their scanner):</p>
            <div className="bg-gray-100 rounded-lg p-3 text-xs font-mono break-all text-gray-700">{pass.token}</div>
            <p className="text-xs text-gray-400 mt-4">Valid until {new Date(pass.pass.expiresAt).toLocaleDateString()}</p>
          </div>
        )}
      </div>
    </div>
  );
}
