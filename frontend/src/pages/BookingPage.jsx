import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { createBooking, fetchBookings, editBooking, updateBookingStatus, checkAvailableGuides } from "../api/bookingApi";
import { fetchGuides } from "../api/guideApi";
import { useAuth } from "../context/AuthContext";
import { Calendar, Clock, Pencil, X, Check } from "lucide-react";

export default function BookingPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [allGuides, setAllGuides] = useState([]);
  const [availability, setAvailability] = useState({});
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ guideName: "", packageName: "Sundarbans Day Tour", date: "", time: "" });
  const [message, setMessage] = useState(null);

  const isGuide = user?.role === "GUIDE";
  const PACKAGES = ["Sundarbans Day Tour", "Cox's Bazar Adventure", "Sylhet Tea Garden Tour", "Bandarban Hill Trek"];

  useEffect(() => {
    load();
    if (!isGuide) fetchGuides().then(setAllGuides).catch(() => {});
  }, []);

  useEffect(() => {
    if (!isGuide && form.date && form.time && allGuides.length > 0) {
      checkAvailableGuides(allGuides.map((g) => g.name), form.date, form.time)
        .then((res) => {
          const map = {};
          res.guides.forEach((g) => (map[g.guideName] = g.available));
          setAvailability(map);
        })
        .catch(() => {});
    }
  }, [form.date, form.time, allGuides]);

  async function load() {
    try {
      setLoading(true);
      const data = await fetchBookings();
      setBookings(isGuide ? data.filter((b) => b.guideName === user.name) : data.filter((b) => b.touristName === user.name));
    } catch (err) {
      setMessage({ type: "error", text: "Could not load bookings." });
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setForm({ guideName: "", packageName: PACKAGES[0], date: "", time: "" });
    setEditingId(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      if (editingId) {
        await editBooking(editingId, form);
        setMessage({ type: "success", text: "Booking updated." });
      } else {
        await createBooking({ touristName: user.name, ...form });
        setMessage({ type: "success", text: "Booking request sent!" });
      }
      resetForm();
      load();
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    }
  }

  function startEdit(booking) {
    setEditingId(booking.id);
    setForm({ guideName: booking.guideName, packageName: booking.packageName, date: booking.date.slice(0, 10), time: booking.time });
  }

  async function handleCancel(id) {
    await updateBookingStatus(id, "CANCELLED");
    load();
  }

  async function handleGuideDecision(id, decision) {
    await updateBookingStatus(id, decision === "accept" ? "ACCEPT" : "CANCELLED");
    load();
  }

  const statusColor = (status) => status === "PENDING" ? "bg-yellow-100 text-yellow-700" : status === "CANCELLED" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700";

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar active="Bookings" />
      <div className="bg-gradient-to-r from-green-700 to-green-500 px-8 py-10 text-white">
        <h1 className="text-3xl font-bold mb-1">{isGuide ? "Booking requests" : "My bookings"}</h1>
        <p className="text-green-50">{isGuide ? "Accept or decline incoming tour requests" : "Send new requests, or edit/cancel pending ones"}</p>
      </div>

      <div className="max-w-5xl mx-auto px-8 py-8 grid grid-cols-3 gap-8">
        {!isGuide && (
          <div className="col-span-1 bg-white border border-gray-200 rounded-xl p-6 h-fit">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900">{editingId ? "Edit request" : "New booking request"}</h2>
              {editingId && <button onClick={resetForm} className="text-xs text-gray-500">Cancel edit</button>}
            </div>
            {message && <div className={`mb-4 text-sm px-3 py-2 rounded-lg ${message.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{message.text}</div>}
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Preferred guide</label>
                <select required value={form.guideName} onChange={(e) => setForm({ ...form, guideName: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                  <option value="">Select a guide</option>
                  {allGuides.map((g) => (
                    <option key={g.id} value={g.name} disabled={availability[g.name] === false}>
                      {g.name} {availability[g.name] === false ? "(unavailable)" : ""}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Package</label>
                <select value={form.packageName} onChange={(e) => setForm({ ...form, packageName: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                  {PACKAGES.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Date</label>
                  <input required type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Time</label>
                  <input required type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                </div>
              </div>
              <button type="submit" className="w-full bg-green-700 hover:bg-green-800 text-white font-semibold py-2.5 rounded-lg">
                {editingId ? "Save changes" : "Send booking request"}
              </button>
            </form>
          </div>
        )}

        <div className={isGuide ? "col-span-3" : "col-span-2"}>
          <h2 className="font-bold text-gray-900 mb-4">{loading ? "Loading..." : `${bookings.length} ${isGuide ? "requests" : "bookings"}`}</h2>
          <div className="space-y-3">
            {bookings.map((b) => (
              <div key={b.id} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900">{isGuide ? `Tourist: ${b.touristName}` : `Guide: ${b.guideName}`}</p>
                  <p className="text-sm text-gray-500">{b.packageName}</p>
                  <p className="text-xs text-gray-400 flex items-center gap-3 mt-1">
                    <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(b.date).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1"><Clock size={12} /> {b.time}</span>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${statusColor(b.status)}`}>{b.status}</span>
                  {!isGuide && b.status === "PENDING" && (
                    <>
                      <button onClick={() => startEdit(b)} className="text-gray-500 hover:text-green-700 p-1.5 rounded-lg hover:bg-gray-100"><Pencil size={14} /></button>
                      <button onClick={() => handleCancel(b.id)} className="text-gray-500 hover:text-red-600 p-1.5 rounded-lg hover:bg-gray-100"><X size={14} /></button>
                    </>
                  )}
                  {isGuide && b.status === "PENDING" && (
                    <>
                      <button onClick={() => handleGuideDecision(b.id, "accept")} className="text-white bg-green-700 hover:bg-green-800 text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1"><Check size={12} /> Accept</button>
                      <button onClick={() => handleGuideDecision(b.id, "decline")} className="text-gray-700 bg-gray-100 hover:bg-gray-200 text-xs font-semibold px-3 py-1.5 rounded-lg">Decline</button>
                    </>
                  )}
                </div>
              </div>
            ))}
            {!loading && bookings.length === 0 && <p className="text-gray-500">No bookings yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
