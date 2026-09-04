import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { fetchCustomerPayments, releasePayment } from "../api/paymentApi";
import { ShieldCheck, CheckCircle2 } from "lucide-react";

// Simulates the logged-in tourist, since there's no auth system yet.
const CURRENT_TOURIST = "Sarah Ahmed";

export default function CustomerPaymentPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      setLoading(true);
      const data = await fetchCustomerPayments(CURRENT_TOURIST);
      setPayments(data);
    } catch (err) {
      setMessage("Could not load payments. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }

  async function handleMarkComplete(id) {
    try {
      await releasePayment(id);
      load();
    } catch (err) {
      setMessage("Could not release this payment.");
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar active="Bookings" />

      <div className="bg-gradient-to-r from-green-700 to-green-500 px-8 py-10 text-white">
        <h1 className="text-3xl font-bold mb-1">Your payments</h1>
        <p className="text-green-50">Payments stay securely held until your tour is marked complete</p>
      </div>

      <div className="max-w-3xl mx-auto px-8 py-8">
        {message && <p className="text-red-600 text-sm mb-4">{message}</p>}
        {loading && <p className="text-gray-500">Loading...</p>}

        <div className="space-y-4">
          {payments.map((p) => (
            <div key={p.id} className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-gray-900">{p.tourDetails}</p>
                  <p className="text-sm text-gray-500">Guide: {p.guideName}</p>
                </div>
                {p.status === "IN_ESCROW" ? (
                  <span className="flex items-center gap-1 text-xs font-semibold bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full">
                    <ShieldCheck size={12} /> Payment pending
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs font-semibold bg-green-100 text-green-700 px-2.5 py-1 rounded-full">
                    <CheckCircle2 size={12} /> Payment released
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                <div>
                  <p className="text-xs text-gray-500">Amount paid</p>
                  <p className="text-lg font-bold text-gray-900">৳{p.totalAmount}</p>
                </div>

                {p.status === "IN_ESCROW" ? (
                  <button
                    onClick={() => handleMarkComplete(p.id)}
                    className="bg-green-700 hover:bg-green-800 text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
                  >
                    Mark tour as completed
                  </button>
                ) : (
                  <p className="text-xs text-gray-400">
                    Released to guide on {new Date(p.completedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          ))}
          {!loading && payments.length === 0 && (
            <p className="text-gray-500">You don't have any payments yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
