import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { createBooking, fetchBookings, editBooking, updateBookingStatus, checkGuideAvailability } from "../api/bookingApi";
import { generateTimeSlots, formatTimeLabel } from "../utils/timeSlots";
import { Calendar, Clock, Pencil, X, CheckCircle2, XCircle } from "lucide-react";

const PACKAGES = ["Sundarbans Day Tour", "Cox's Bazar Adventure", "Sylhet Tea Garden Tour", "Bandarban Hill Trek"];
const TIME_SLOTS = generateTimeSlots(9, 20); // 9:00 AM – 8:30 PM, 30-minute steps

// TODO (merge time): replace this hardcoded list with real verified guides
// pulled from Module 1's GuideVerification data (status === "APPROVED").
// That model currently has no display "name" field — only email/university —
// so Module 1 needs a `name` field added before a real integration can
// show guide names here instead of emails/IDs.
const SEED_GUIDES = [
  "Muntasir Rahman",
  "Nujaira Islam",
  "Rafiq Hasan",
  "Ayesha Karim",
  "Tanvir Ahmed",
];

// Simulates the logged-in tourist, since there's no auth system yet.
const CURRENT_TOURIST = "Sarah Ahmed";

export default function BookingPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    touristName: CURRENT_TOURIST,
    guideName: "",
    packageName: PACKAGES[0],
    date: "",
    time: "",
  });
  const [message, setMessage] = useState(null);

  // Availability status per guide, keyed by guide name, once date+time are picked
  const [guideAvailability, setGuideAvailability] = useState({}); // { "Muntasir Rahman": true/false }
  const [checkingSlots, setCheckingSlots] = useState(false);

  useEffect(() => {
    loadBookings();
  }, []);

  // Whenever date+time change, check ALL seed guides' availability for that slot
  useEffect(() => {
    const { date, time } = form;
    if (!date || !time) {
      setGuideAvailability({});
      return;
    }

    let cancelled = false;
    setCheckingSlots(true);

    const timeoutId = setTimeout(async () => {
      try {
        const results = await Promise.all(
          SEED_GUIDES.map(async (name) => {
            try {
              const available = await checkGuideAvailability(name, date, time);
              return [name, available];
            } catch {
              return [name, true]; // fail open — don't block the UI on a network hiccup
            }
          })
        );
        if (!cancelled) setGuideAvailability(Object.fromEntries(results));
      } finally {
        if (!cancelled) setCheckingSlots(false);
      }
    }, 400);

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [form.date, form.time]);

  async function loadBookings() {
    try {
      setLoading(true);
      const data = await fetchBookings();
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
    setGuideAvailability({});
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.guideName || !form.date || !form.time) {
      setMessage({ type: "error", text: "Please fill in all fields, including selecting an available guide." });
      return;
    }
    if (guideAvailability[form.guideName] === false) {
      setMessage({ type: "error", text: `${form.guideName} is already booked for that slot. Choose another guide or time.` });
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
      setMessage({ type: "error", text: err.message || "Something went wrong." });
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

  function statusBadge(status) {
    if (status === "PENDING") return <span className="text-xs font-semibold px-2 py-1 rounded-full bg-yellow-100 text-yellow-700">PENDING</span>;
    if (status === "CANCELLED") return <span className="text-xs font-semibold px-2 py-1 rounded-full bg-red-100 text-red-700">CANCELLED</span>;
    if (status.startsWith("booked-")) {
      const guide = status.replace("booked-", "");
      return <span className="text-xs font-semibold px-2 py-1 rounded-full bg-green-100 text-green-700">Booked — {guide}</span>;
    }
    return <span className="text-xs font-semibold px-2 py-1 rounded-full bg-gray-100 text-gray-700">{status}</span>;
  }

  const slotChosen = form.date && form.time;

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
                  onChange={(e) => setForm({ ...form, date: e.target.value, guideName: "" })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Time</label>
                <select
                  value={form.time}
                  onChange={(e) => setForm({ ...form, time: e.target.value, guideName: "" })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="">Select time</option>
                  {TIME_SLOTS.map((slot) => (
                    <option key={slot} value={slot}>{formatTimeLabel(slot)}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Guide list — only meaningful once a slot is picked */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Preferred guide</label>
              {!slotChosen ? (
                <p className="text-xs text-gray-400 italic px-1">Pick a date and time to see which guides are available.</p>
              ) : checkingSlots ? (
                <p className="text-xs text-gray-400 italic px-1">Checking guide availability...</p>
              ) : (
                <div className="space-y-1.5">
                  {SEED_GUIDES.map((name) => {
                    const isAvailable = guideAvailability[name] !== false;
                    const isSelected = form.guideName === name;
                    return (
                      <button
                        type="button"
                        key={name}
                        disabled={!isAvailable}
                        onClick={() => setForm({ ...form, guideName: name })}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm border transition ${
                          isSelected ? "border-green-600 bg-green-50" :
                          isAvailable ? "border-gray-200 hover:border-green-400 bg-white" :
                          "border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed"
                        }`}
                      >
                        <span>{name}</span>
                        {isAvailable ? (
                          <CheckCircle2 size={14} className="text-green-600" />
                        ) : (
                          <XCircle size={14} className="text-red-400" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={!form.guideName}
              className="w-full bg-green-700 hover:bg-green-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg transition"
            >
              {editingId ? "Save changes" : "Send booking request"}
            </button>
          </form>
        </div>

        {/* Bookings list */}
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
                    <span className="flex items-center gap-1"><Clock size={12} /> {formatTimeLabel(b.time)}</span>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {statusBadge(b.status)}
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