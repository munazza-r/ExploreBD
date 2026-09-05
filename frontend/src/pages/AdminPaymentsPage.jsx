import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { fetchAllPayments, releasePayment, refundPayment } from "../api/paymentApi";

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      const data = await fetchAllPayments();
      setPayments(data.payments);
    } finally {
      setLoading(false);
    }
  }

  async function handleRelease(id) {
    await releasePayment(id);
    load();
  }

  async function handleRefund(id) {
    const reason = prompt("Refund reason:") || "Booking cancelled";
    await refundPayment(id, reason);
    load();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar active="All Payments" />
      <div className="bg-gradient-to-r from-green-700 to-green-500 px-8 py-8 text-white">
        <h1 className="text-2xl font-bold">All Payments</h1>
      </div>

      <div className="max-w-5xl mx-auto px-8 py-8 space-y-3">
        {loading && <p className="text-gray-500">Loading...</p>}
        {payments.map((p) => (
          <div key={p.id} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="font-semibold text-gray-900 text-sm">Booking {p.bookingId} · ৳{p.amount}</p>
              <p className="text-xs text-gray-500">{p.method} · {p.tourCompleted ? "Tour completed" : "Tour not completed"}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold bg-gray-100 text-gray-700 px-2 py-1 rounded-full">{p.status}</span>
              {p.status === "ESCROW_HELD" && p.tourCompleted && (
                <button onClick={() => handleRelease(p.id)} className="text-xs bg-green-700 text-white px-3 py-1.5 rounded-lg">Release funds</button>
              )}
              {p.status === "ESCROW_HELD" && (
                <button onClick={() => handleRefund(p.id)} className="text-xs bg-red-100 text-red-700 px-3 py-1.5 rounded-lg">Refund</button>
              )}
            </div>
          </div>
        ))}
        {!loading && payments.length === 0 && <p className="text-gray-500">No payments yet.</p>}
      </div>
    </div>
  );
}
