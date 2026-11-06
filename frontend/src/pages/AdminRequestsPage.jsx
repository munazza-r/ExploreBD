import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { fetchAllCancellationRequests, fetchAllSosRequests, resolveCompensation } from "../api/cancellationApi";

export default function AdminRequestsPage() {
  const [cancellations, setCancellations] = useState([]);
  const [sos, setSos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      const [c, s] = await Promise.all([fetchAllCancellationRequests(), fetchAllSosRequests()]);
      setCancellations(c.data);
      setSos(s.data);
    } finally {
      setLoading(false);
    }
  }

  async function handleResolve(id, status) {
    await resolveCompensation(id, status);
    load();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar active="Support Requests" />
      <div className="bg-gradient-to-r from-green-700 to-green-500 px-8 py-8 text-white">
        <h1 className="text-2xl font-bold">Support Requests</h1>
      </div>

      <div className="max-w-4xl mx-auto px-8 py-8 space-y-10">
        <div>
          <h2 className="font-bold text-red-700 mb-3">🚨 SOS Alerts ({sos.length})</h2>
          <div className="space-y-2">
            {sos.map((r) => (
              <div key={r.id} className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm">
                <p className="font-semibold text-gray-900">{r.category} · Booking {r.bookingId}</p>
                <p className="text-gray-600">{r.claimDetails}</p>
                <p className="text-xs text-gray-400 mt-1">Contact: {r.contactNumber}</p>
              </div>
            ))}
            {sos.length === 0 && <p className="text-gray-500 text-sm">No SOS alerts.</p>}
          </div>
        </div>

        <div>
          <h2 className="font-bold text-gray-900 mb-3">Cancellations & Claims ({cancellations.length})</h2>
          <div className="space-y-2">
            {cancellations.map((r) => (
              <div key={r.id} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between text-sm">
                <div>
                  <p className="font-semibold text-gray-900">{r.requestKind} · Booking {r.bookingId}</p>
                  <p className="text-gray-500">{r.reason}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold bg-gray-100 px-2 py-1 rounded-full">{r.status}</span>
                  {r.status === "PENDING" && r.requestKind === "COMPENSATION_CLAIM" && (
                    <>
                      <button onClick={() => handleResolve(r.id, "APPROVED")} className="text-xs bg-green-700 text-white px-3 py-1.5 rounded-lg">Approve</button>
                      <button onClick={() => handleResolve(r.id, "REJECTED")} className="text-xs bg-red-100 text-red-700 px-3 py-1.5 rounded-lg">Reject</button>
                    </>
                  )}
                </div>
              </div>
            ))}
            {cancellations.length === 0 && <p className="text-gray-500 text-sm">No requests.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
