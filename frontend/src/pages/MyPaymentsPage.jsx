import { useState } from "react";
import Navbar from "../components/Navbar";
import { initiatePayment, markTourCompleted } from "../api/paymentApi";
import { apiRequest } from "../api/client";
import { ShieldCheck, CheckCircle2 } from "lucide-react";

export default function MyPaymentsPage() {
  const [form, setForm] = useState({ bookingId: "", guideId: "", amount: "" });
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  async function handleInitiate(e) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const data = await initiatePayment(form);
      setMessage({ type: "success", text: "Payment session created. Complete checkout, or ask your admin to confirm escrow for testing." });
      await refreshStatus(data.paymentId);
      if (data.gatewayURL) window.open(data.gatewayURL, "_blank");
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  }

  async function refreshStatus(id) {
    const data = await apiRequest(`/payments/${id}`);
    setPayment(data.payment);
  }

  async function handleMarkComplete() {
    await markTourCompleted(payment.id);
    refreshStatus(payment.id);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar active="My Payments" />
      <div className="bg-gradient-to-r from-green-700 to-green-500 px-8 py-10 text-white">
        <h1 className="text-3xl font-bold mb-1">Your payments</h1>
        <p className="text-green-50">Payments stay securely held in escrow until your tour is complete</p>
      </div>

      <div className="max-w-xl mx-auto px-8 py-8">
        {message && <p className={`mb-4 text-sm px-3 py-2 rounded-lg ${message.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{message.text}</p>}

        {!payment && (
          <form onSubmit={handleInitiate} className="bg-white border border-gray-200 rounded-xl p-6 space-y-3">
            <p className="text-sm text-gray-500 mb-2">Enter your accepted booking's details to pay for it.</p>
            <input required placeholder="Booking ID" value={form.bookingId} onChange={(e) => setForm({ ...form, bookingId: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            <input required placeholder="Guide ID" value={form.guideId} onChange={(e) => setForm({ ...form, guideId: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            <input required type="number" placeholder="Amount (৳)" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            <button type="submit" disabled={loading} className="w-full bg-green-700 hover:bg-green-800 text-white font-semibold py-2.5 rounded-lg disabled:opacity-60">
              {loading ? "Starting checkout..." : "Pay now"}
            </button>
          </form>
        )}

        {payment && (
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="font-semibold text-gray-900">Payment for booking {payment.bookingId}</p>
              {payment.status === "RELEASED" ? (
                <span className="flex items-center gap-1 text-xs font-semibold bg-green-100 text-green-700 px-2.5 py-1 rounded-full"><CheckCircle2 size={12} /> Released</span>
              ) : (
                <span className="flex items-center gap-1 text-xs font-semibold bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full"><ShieldCheck size={12} /> {payment.status}</span>
              )}
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-4">৳{payment.amount}</p>
            <div className="flex gap-2">
              <button onClick={() => refreshStatus(payment.id)} className="text-sm bg-gray-100 text-gray-700 px-4 py-2 rounded-lg">Refresh status</button>
              {payment.status === "ESCROW_HELD" && !payment.tourCompleted && (
                <button onClick={handleMarkComplete} className="text-sm bg-green-700 text-white px-4 py-2 rounded-lg">Mark tour as completed</button>
              )}
              <button onClick={() => setPayment(null)} className="text-sm text-gray-500 px-4 py-2">Start a new payment</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
