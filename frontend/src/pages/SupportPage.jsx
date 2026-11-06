import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { cancelAsTourist, cancelAsGuide, submitCompensationClaim, submitSosRequest, fetchMyRequests } from "../api/cancellationApi";
import { useAuth } from "../context/AuthContext";
import { AlertTriangle } from "lucide-react";

export default function SupportPage() {
  const { user } = useAuth();
  const isGuide = user?.role === "GUIDE";
  const [tab, setTab] = useState("cancel");
  const [myRequests, setMyRequests] = useState({ cancellations: [], sos: [] });
  const [message, setMessage] = useState(null);

  const [cancelForm, setCancelForm] = useState({ bookingId: "", reason: "", bookingDate: "", totalPrice: "" });
  const [claimForm, setClaimForm] = useState({ bookingId: "", reason: "", category: "NO_SHOW", claimAmount: "" });
  const [sosForm, setSosForm] = useState({ bookingId: "", category: "SAFETY_CONCERN", contactNumber: "", claimDetails: "" });

  useEffect(() => { load(); }, []);
  async function load() {
    const data = await fetchMyRequests();
    setMyRequests(data.data);
  }

  async function handleCancel(e) {
    e.preventDefault();
    try {
      const fn = isGuide ? cancelAsGuide : cancelAsTourist;
      await fn(cancelForm);
      setMessage({ type: "success", text: "Cancellation submitted." });
      load();
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    }
  }

  async function handleClaim(e) {
    e.preventDefault();
    try {
      await submitCompensationClaim(claimForm);
      setMessage({ type: "success", text: "Compensation claim submitted." });
      load();
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    }
  }

  async function handleSos(e) {
    e.preventDefault();
    try {
      await submitSosRequest(sosForm);
      setMessage({ type: "success", text: "🚨 SOS alert sent!" });
      load();
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar active="Support" />
      <div className="bg-gradient-to-r from-green-700 to-green-500 px-8 py-8 text-white">
        <h1 className="text-2xl font-bold">Support & Emergency</h1>
      </div>

      <div className="max-w-2xl mx-auto px-8 py-8">
        <div className="flex gap-2 mb-6">
          {["cancel", "claim", "sos"].map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-lg text-sm font-semibold ${tab === t ? "bg-green-700 text-white" : "bg-white border border-gray-200 text-gray-700"}`}>
              {t === "cancel" ? "Cancel booking" : t === "claim" ? "Compensation claim" : "🚨 SOS"}
            </button>
          ))}
        </div>

        {message && <p className={`mb-4 text-sm px-3 py-2 rounded-lg ${message.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{message.text}</p>}

        {tab === "cancel" && (
          <form onSubmit={handleCancel} className="bg-white border border-gray-200 rounded-xl p-6 space-y-3">
            <input required placeholder="Booking ID" value={cancelForm.bookingId} onChange={(e) => setCancelForm({ ...cancelForm, bookingId: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            <input required type="date" value={cancelForm.bookingDate} onChange={(e) => setCancelForm({ ...cancelForm, bookingDate: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            <input required type="number" placeholder="Total price" value={cancelForm.totalPrice} onChange={(e) => setCancelForm({ ...cancelForm, totalPrice: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            <textarea required placeholder="Reason" value={cancelForm.reason} onChange={(e) => setCancelForm({ ...cancelForm, reason: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" rows={3} />
            <button type="submit" className="w-full bg-green-700 hover:bg-green-800 text-white font-semibold py-2.5 rounded-lg">Submit cancellation</button>
          </form>
        )}

        {tab === "claim" && (
          <form onSubmit={handleClaim} className="bg-white border border-gray-200 rounded-xl p-6 space-y-3">
            <input required placeholder="Booking ID" value={claimForm.bookingId} onChange={(e) => setClaimForm({ ...claimForm, bookingId: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            <select value={claimForm.category} onChange={(e) => setClaimForm({ ...claimForm, category: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
              <option value="NO_SHOW">No show</option>
              <option value="INCOMPLETE_TOUR">Incomplete tour</option>
              <option value="SERVICE_QUALITY_ISSUE">Service quality issue</option>
              <option value="SAFETY_CONCERN">Safety concern</option>
            </select>
            <input type="number" placeholder="Claim amount (optional)" value={claimForm.claimAmount} onChange={(e) => setClaimForm({ ...claimForm, claimAmount: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            <textarea required placeholder="Reason" value={claimForm.reason} onChange={(e) => setClaimForm({ ...claimForm, reason: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" rows={3} />
            <button type="submit" className="w-full bg-green-700 hover:bg-green-800 text-white font-semibold py-2.5 rounded-lg">Submit claim</button>
          </form>
        )}

        {tab === "sos" && (
          <form onSubmit={handleSos} className="bg-red-50 border-2 border-red-200 rounded-xl p-6 space-y-3">
            <div className="flex items-center gap-2 text-red-700 font-semibold mb-2"><AlertTriangle size={18} /> Emergency request - handled with priority</div>
            <input required placeholder="Booking ID" value={sosForm.bookingId} onChange={(e) => setSosForm({ ...sosForm, bookingId: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            <select value={sosForm.category} onChange={(e) => setSosForm({ ...sosForm, category: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
              <option value="SAFETY_CONCERN">Safety concern</option>
              <option value="NO_SHOW">No show</option>
              <option value="SERVICE_QUALITY_ISSUE">Service quality issue</option>
            </select>
            <input required placeholder="Contact number" value={sosForm.contactNumber} onChange={(e) => setSosForm({ ...sosForm, contactNumber: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            <textarea required placeholder="What's happening?" value={sosForm.claimDetails} onChange={(e) => setSosForm({ ...sosForm, claimDetails: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" rows={3} />
            <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 rounded-lg">🚨 Send SOS alert</button>
          </form>
        )}

        <div className="mt-8">
          <h2 className="font-bold text-gray-900 mb-3">Your requests</h2>
          <div className="space-y-2">
            {myRequests.cancellations.map((r) => (
              <div key={r.id} className="bg-white border border-gray-200 rounded-lg px-4 py-3 text-sm flex justify-between">
                <span>{r.requestKind} - Booking {r.bookingId}</span>
                <span className="text-xs font-semibold">{r.status}</span>
              </div>
            ))}
            {myRequests.sos.map((r) => (
              <div key={r.id} className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm flex justify-between">
                <span>🚨 SOS - Booking {r.bookingId}</span>
                <span className="text-xs font-semibold">{r.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
