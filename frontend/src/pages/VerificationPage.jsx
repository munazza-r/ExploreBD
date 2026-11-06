import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { submitVerification, fetchMyVerificationStatus } from "../api/verificationApi";
import { ShieldCheck, Clock, CheckCircle2, XCircle } from "lucide-react";

export default function VerificationPage() {
  const [status, setStatus] = useState(null);
  const [form, setForm] = useState({ universityName: "", studentIdNumber: "", nidOrPassportNumber: "" });
  const [studentIdCard, setStudentIdCard] = useState(null);
  const [nidOrPassport, setNidOrPassport] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => { loadStatus(); }, []);

  async function loadStatus() {
    try {
      const data = await fetchMyVerificationStatus();
      setStatus(data.data);
    } catch (err) {
      setStatus(null); // no submission yet
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!studentIdCard || !nidOrPassport) {
      setMessage({ type: "error", text: "Both document images are required." });
      return;
    }
    setSubmitting(true);
    setMessage(null);
    try {
      const formData = new FormData();
      formData.append("universityName", form.universityName);
      formData.append("studentIdNumber", form.studentIdNumber);
      formData.append("nidOrPassportNumber", form.nidOrPassportNumber);
      formData.append("studentIdCard", studentIdCard);
      formData.append("nidOrPassport", nidOrPassport);
      await submitVerification(formData);
      setMessage({ type: "success", text: "Documents submitted! An admin will review them soon." });
      loadStatus();
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar active="Verification" />
      <div className="bg-gradient-to-r from-green-700 to-green-500 px-8 py-10 text-white">
        <h1 className="text-3xl font-bold mb-1">Guide Verification</h1>
        <p className="text-green-50">Submit your documents to become a verified, bookable guide</p>
      </div>

      <div className="max-w-xl mx-auto px-8 py-8">
        {status && (
          <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6 flex items-center gap-3">
            {status.status === "PENDING" && <Clock className="text-amber-600" size={20} />}
            {status.status === "APPROVED" && <CheckCircle2 className="text-green-700" size={20} />}
            {status.status === "REJECTED" && <XCircle className="text-red-600" size={20} />}
            <div>
              <p className="font-semibold text-gray-900">Status: {status.status}</p>
              {status.status === "REJECTED" && <p className="text-sm text-red-600">{status.rejectionReason}</p>}
            </div>
          </div>
        )}

        {message && (
          <div className={`mb-4 text-sm px-3 py-2 rounded-lg ${message.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">University Name</label>
            <input required value={form.universityName} onChange={(e) => setForm({ ...form, universityName: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Student ID Number (8 digits)</label>
            <input required pattern="\d{8}" value={form.studentIdNumber} onChange={(e) => setForm({ ...form, studentIdNumber: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">NID / Passport Number (12 digits)</label>
            <input required pattern="\d{12}" value={form.nidOrPassportNumber} onChange={(e) => setForm({ ...form, nidOrPassportNumber: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Student ID Card Image</label>
            <input type="file" accept="image/*" required onChange={(e) => setStudentIdCard(e.target.files[0])} className="w-full text-sm" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">NID / Passport Image</label>
            <input type="file" accept="image/*" required onChange={(e) => setNidOrPassport(e.target.files[0])} className="w-full text-sm" />
          </div>
          <button type="submit" disabled={submitting} className="w-full bg-green-700 hover:bg-green-800 text-white font-semibold py-2.5 rounded-lg transition disabled:opacity-60 flex items-center justify-center gap-2">
            <ShieldCheck size={16} /> {submitting ? "Submitting..." : "Submit for verification"}
          </button>
        </form>
      </div>
    </div>
  );
}
