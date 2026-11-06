import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { fetchAllVerifications, updateVerificationStatus } from "../api/verificationApi";
import { BASE_URL } from "../api/client";

export default function AdminVerificationPage() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      const data = await fetchAllVerifications();
      setRecords(data.data);
    } finally {
      setLoading(false);
    }
  }

  async function handleDecision(id, status) {
    const reason = status === "REJECTED" ? prompt("Rejection reason:") : undefined;
    await updateVerificationStatus(id, status, reason);
    load();
  }

  const attachmentsBase = BASE_URL.replace("/api", "");

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar active="Verification Queue" />
      <div className="bg-gradient-to-r from-green-700 to-green-500 px-8 py-8 text-white">
        <h1 className="text-2xl font-bold">Guide Verification Queue</h1>
      </div>

      <div className="max-w-4xl mx-auto px-8 py-8 space-y-4">
        {loading && <p className="text-gray-500">Loading...</p>}
        {!loading && records.length === 0 && <p className="text-gray-500">No submissions yet.</p>}
        {records.map((r) => (
          <div key={r.id} className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="font-semibold text-gray-900">{r.universityName}</p>
                <p className="text-sm text-gray-500">{r.email}</p>
              </div>
              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                r.status === "PENDING" ? "bg-amber-100 text-amber-700" : r.status === "APPROVED" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
              }`}>{r.status}</span>
            </div>
            <div className="flex gap-4 mb-3">
              <img src={`${attachmentsBase}/attachments/${r.studentIdCardUrl}`} alt="Student ID" className="w-32 h-20 object-cover rounded-lg border" />
              <img src={`${attachmentsBase}/attachments/${r.nidOrPassportUrl}`} alt="NID/Passport" className="w-32 h-20 object-cover rounded-lg border" />
            </div>
            {r.status === "PENDING" && (
              <div className="flex gap-2">
                <button onClick={() => handleDecision(r.id, "APPROVED")} className="bg-green-700 text-white text-sm font-semibold px-4 py-2 rounded-lg">Approve</button>
                <button onClick={() => handleDecision(r.id, "REJECTED")} className="bg-red-100 text-red-700 text-sm font-semibold px-4 py-2 rounded-lg">Reject</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
