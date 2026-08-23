import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { createBooking, fetchBookings, editBooking, updateBookingStatus } from "../api/bookingApi";
import { Calendar, Clock, Pencil, X } from "lucide-react";

const PACKAGES = ["Sundarbans Day Tour", "Cox's Bazar Adventure", "Sylhet Tea Garden Tour", "Bandarban Hill Trek"];

// Simulates the logged-in tourist, since there's no auth system yet.
// Only bookings made under this name are shown/editable on this page.
const CURRENT_TOURIST = "Sarah Ahmed";

export default function BookingPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null); // null = creating new, otherwise editing this booking's id
  const [form, setForm] = useState({
    touristName: CURRENT_TOURIST,
    guideName: "",
    packageName: PACKAGES[0],
    date: "",
    time: "",
  });
  const [message, setMessage] = useState(null);

  useEffect(() => {
    loadBookings();
  }, []);

  async function loadBookings() {
    try {
      setLoading(true);
      const data = await fetchBookings();
      // Tourists only ever see their own booking requests
      setBookings(data.filter((b) => b.touristName === CURRENT_TOURIST));
    } catch (err) {
      setMessage({ type: "error", text: "Could not load bookings. Is the backend running?" });
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setForm({ touristName: CURRENT_TOURIST, guideName: "", packageName: PACKAGES[0], date: "", time: "" });
    setEditingId(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.guideName || !form.date || !form.time) {
      setMessage({ type: "error", text: "Please fill in all fields." });
      return;
    }
    try {
      if (editingId) {
        await editBooking(editingId, form);
        setMessage({ type: "success", text: "Booking request updated." });
      } else {
        await createBooking(form);
        setMessage({ type: "success", text: "Booking request sent!" });
      }
      resetForm();
      loadBookings();
    } catch (err) {
      setMessage({ type: "error", text: "Something went wrong. Note: confirmed bookings can no longer be edited." });
    }
  }

  function startEdit(booking) {
    setEditingId(booking.id);
    setForm({
      touristName: booking.touristName,
      guideName: booking.guideName,
      packageName: booking.packageName,
      date: booking.date.slice(0, 10),
      time: booking.time,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleCancel(id) {
    try {
      await updateBookingStatus(id, "CANCELLED");
      loadBookings();
    } catch (err) {
      setMessage({ type: "error", text: "Could not cancel this booking." });
    }
  }

  const statusColor = {
    PENDING: "bg-yellow-100 text-yellow-700",
    CONFIRMED: "bg-green-100 text-green-700",
    CANCELLED: "bg-red-100 text-red-700",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar active="Bookings" />

      <div className="bg-gradient-to-r from-green-700 to-green-500 px-8 py-10 text-white">
        <h1 className="text-3xl font-bold mb-1">My bookings</h1>
        <p className="text-green-50">Send new requests, or edit and cancel ones that are still pending</p>
      </div>

      <div className="max-w-5xl mx-auto px-8 py-8 grid grid-cols-3 gap-8">
        {/* Booking form */}
        <div className="col-span-1 bg-white border border-gray-200 rounded-xl p-6 h-fit">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900">{editingId ? "Edit request" : "New booking request"}</h2>
            {editingId && (
              <button onClick={resetForm} className="text-xs text-gray-500 hover:text-gray-800">Cancel edit</button>
            )}
          </div>

          {message && (
            <div className={`mb-4 text-sm px-3 py-2 rounded-lg ${message.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Preferred guide</label>
              <input
                type="text"
                value={form.guideName}
                onChange={(e) => setForm({ ...form, guideName: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                placeholder="e.g. Muntasir Rahman"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Package</label>
              <select
                value={form.packageName}
                onChange={(e) => setForm({ ...form, packageName: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                {PACKAGES.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Date</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Time</label>
                <input
                  type="time"
                  value={form.time}
                  onChange={(e) => setForm({ ...form, time: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>
            <button type="submit" className="w-full bg-green-700 hover:bg-green-800 text-white font-semibold py-2.5 rounded-lg transition">
              {editingId ? "Save changes" : "Send booking request"}
            </button>
          </form>
        </div>

        {/* Bookings list - tourist's own requests only, no approve/decline controls */}
        <div className="col-span-2">
          <h2 className="font-bold text-gray-900 mb-4">{loading ? "Loading..." : `${bookings.length} of your bookings`}</h2>
          <div className="space-y-3">
            {bookings.map((b) => (
              <div key={b.id} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900">Guide: {b.guideName}</p>
                  <p className="text-sm text-gray-500">{b.packageName}</p>
                  <p className="text-xs text-gray-400 flex items-center gap-3 mt-1">
                    <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(b.date).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1"><Clock size={12} /> {b.time}</span>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${statusColor[b.status]}`}>{b.status}</span>
                  {b.status === "PENDING" && (
                    <>
                      <button onClick={() => startEdit(b)} title="Edit" className="text-gray-500 hover:text-green-700 p-1.5 rounded-lg hover:bg-gray-100">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => handleCancel(b.id)} title="Cancel" className="text-gray-500 hover:text-red-600 p-1.5 rounded-lg hover:bg-gray-100">
                        <X size={14} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
            {!loading && bookings.length === 0 && <p className="text-gray-500">You haven't made any booking requests yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}