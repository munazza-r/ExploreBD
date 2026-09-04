import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { fetchGuideEarnings } from "../api/paymentApi";
import { Wallet, Clock, Percent } from "lucide-react";

// Simulates the logged-in guide, since there's no auth system yet.
const CURRENT_GUIDE = "Muntasir Rahman";

export default function GuideEarningsPage() {
  const [payments, setPayments] = useState([]);
  const [summary, setSummary] = useState({ totalReleased: 0, totalPending: 0, totalCommissionPaid: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
    const interval = setInterval(load, 4000); // poll so this page updates once the tourist marks a tour complete
    return () => clearInterval(interval);
  }, []);

  async function load() {
    try {
      const data = await fetchGuideEarnings(CURRENT_GUIDE);
      setPayments(data.payments);
      setSummary(data.summary);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar active="Dashboard" />

      <div className="bg-gradient-to-r from-green-700 to-green-500 px-8 py-10 text-white">
        <h1 className="text-3xl font-bold mb-1">Your earnings</h1>
        <p className="text-green-50">Payouts are released automatically once a tour is marked complete</p>
      </div>

      <div className="max-w-4xl mx-auto px-8 py-8">
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-center gap-2 text-green-700 mb-1">
              <Wallet size={16} /> <span className="text-xs font-semibold uppercase">Released</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">৳{summary.totalReleased}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-center gap-2 text-amber-600 mb-1">
              <Clock size={16} /> <span className="text-xs font-semibold uppercase">Pending (in escrow)</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">৳{summary.totalPending}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-center gap-2 text-gray-500 mb-1">
              <Percent size={16} /> <span className="text-xs font-semibold uppercase">Commission paid</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">৳{summary.totalCommissionPaid}</p>
          </div>
        </div>

        <h2 className="font-bold text-gray-900 mb-3">Payment history</h2>
        <div className="space-y-3">
          {payments.map((p) => (
            <div key={p.id} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900 text-sm">{p.tourDetails}</p>
                <p className="text-xs text-gray-500">Tourist: {p.touristName}</p>
              </div>

              {p.status === "RELEASED" ? (
                <div className="text-right">
                  <span className="text-xs font-semibold bg-green-100 text-green-700 px-2 py-1 rounded-full">Released</span>
                  <p className="text-sm font-bold text-gray-900 mt-1">৳{p.payoutAmount}</p>
                  <p className="text-xs text-gray-400">
                    ৳{p.totalAmount} − {p.commissionPercent}% commission (৳{p.commissionAmount})
                  </p>
                </div>
              ) : (
                <div className="text-right">
                  <span className="text-xs font-semibold bg-amber-100 text-amber-700 px-2 py-1 rounded-full">Pending</span>
                  <p className="text-sm text-gray-500 mt-1">৳{p.totalAmount} in escrow</p>
                </div>
              )}
            </div>
          ))}
          {!loading && payments.length === 0 && (
            <p className="text-gray-500">No payment history yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
