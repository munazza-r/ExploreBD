import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import {
  fetchGuidePendingApprovals, approveMeetingPoints,
  fetchFallbackPoints, addFallbackPoint, deleteFallbackPoint,
} from "../api/meetingApi";
import { CheckSquare, Square, Trash2, Plus } from "lucide-react";

// Simulates the logged-in guide, since there's no auth system yet.
const CURRENT_GUIDE = "Muntasir Rahman";

export default function GuideDashboardPage() {
  const [pending, setPending] = useState([]);
  const [checkedPoints, setCheckedPoints] = useState({}); // { meetingId: Set of point names }
  const [fallbackPoints, setFallbackPoints] = useState([]);
  const [newPoint, setNewPoint] = useState({ area: "Dhaka", pointName: "", lat: "", lng: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
    const interval = setInterval(loadPending, 4000); // new booking requests can arrive anytime
    return () => clearInterval(interval);
  }, []);

  async function load() {
    await Promise.all([loadPending(), loadFallbackPoints()]);
    setLoading(false);
  }

  async function loadPending() {
    try {
      const data = await fetchGuidePendingApprovals(CURRENT_GUIDE);
      setPending(data);
    } catch (err) {
      console.error(err);
    }
  }

  async function loadFallbackPoints() {
    try {
      const data = await fetchFallbackPoints(CURRENT_GUIDE);
      setFallbackPoints(data);
    } catch (err) {
      console.error(err);
    }
  }

  function togglePoint(meetingId, point) {
    setCheckedPoints((prev) => {
      const current = new Set(prev[meetingId] || []);
      current.has(point.name) ? current.delete(point.name) : current.add(point.name);
      return { ...prev, [meetingId]: current };
    });
  }

  async function handleApprove(meeting) {
    const chosenNames = checkedPoints[meeting.id] || new Set();
    const approvedPoints = meeting.suggestedPoints.points.filter((p) => chosenNames.has(p.name));
    if (approvedPoints.length === 0) {
      alert("Select at least one meeting point to approve.");
      return;
    }
    try {
      await approveMeetingPoints(meeting.id, approvedPoints);
      loadPending();
    } catch (err) {
      console.error(err);
    }
  }

  async function handleAddFallbackPoint(e) {
    e.preventDefault();
    if (!newPoint.pointName) return;
    try {
      await addFallbackPoint({
        guideName: CURRENT_GUIDE,
        area: newPoint.area,
        pointName: newPoint.pointName,
        lat: newPoint.lat ? Number(newPoint.lat) : null,
        lng: newPoint.lng ? Number(newPoint.lng) : null,
      });
      setNewPoint({ area: "Dhaka", pointName: "", lat: "", lng: "" });
      loadFallbackPoints();
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDeleteFallbackPoint(id) {
    try {
      await deleteFallbackPoint(id);
      loadFallbackPoints();
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar active="Bookings" />

      <div className="bg-gradient-to-r from-green-700 to-green-500 px-8 py-8 text-white">
        <h1 className="text-2xl font-bold mb-1">Meeting point approvals</h1>
        <p className="text-green-50">Review suggested points, and manage your fallback locations</p>
      </div>

      <div className="max-w-4xl mx-auto px-8 py-8 space-y-10">
        {/* Pending approvals */}
        <div>
          <h2 className="font-bold text-gray-900 mb-4">
            {loading ? "Loading..." : `${pending.length} pending approval${pending.length === 1 ? "" : "s"}`}
          </h2>
          <div className="space-y-4">
            {pending.map((meeting) => (
              <div key={meeting.id} className="bg-white border border-gray-200 rounded-xl p-5">
                <p className="font-semibold text-gray-900">{meeting.tourDetails}</p>
                <p className="text-sm text-gray-500 mb-3">Tourist: {meeting.touristName}</p>

                <p className="text-xs font-semibold text-gray-600 mb-2">Select points you're okay meeting at:</p>
                <div className="space-y-2 mb-4">
                  {meeting.suggestedPoints?.points?.map((p, idx) => {
                    const isChecked = checkedPoints[meeting.id]?.has(p.name);
                    return (
                      <button
                        key={idx}
                        onClick={() => togglePoint(meeting.id, p)}
                        className="flex items-center gap-2 text-sm w-full text-left border border-gray-200 rounded-lg px-3 py-2 hover:bg-gray-50"
                      >
                        {isChecked ? <CheckSquare size={16} className="text-green-700" /> : <Square size={16} className="text-gray-400" />}
                        <span className="font-medium text-gray-900">{p.name}</span>
                        <span className="text-xs text-gray-500 ml-auto">{p.distance} · {p.time}</span>
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => handleApprove(meeting)}
                  className="bg-green-700 hover:bg-green-800 text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
                >
                  Approve selected points
                </button>
              </div>
            ))}
            {!loading && pending.length === 0 && (
              <p className="text-gray-500">No pending meeting point requests right now.</p>
            )}
          </div>
        </div>

        {/* Fallback point settings */}
        <div>
          <h2 className="font-bold text-gray-900 mb-1">Your fallback meeting points</h2>
          <p className="text-sm text-gray-500 mb-4">
            Used automatically if you don't respond to an approval request in time.
          </p>

          <form onSubmit={handleAddFallbackPoint} className="bg-white border border-gray-200 rounded-xl p-4 flex gap-2 mb-4 flex-wrap">
            <input
              value={newPoint.area}
              onChange={(e) => setNewPoint({ ...newPoint, area: e.target.value })}
              placeholder="Area / city"
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-32"
            />
            <input
              value={newPoint.pointName}
              onChange={(e) => setNewPoint({ ...newPoint, pointName: e.target.value })}
              placeholder="Point name (e.g. Shahbagh)"
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm flex-1 min-w-[160px]"
            />
            <input
              value={newPoint.lat}
              onChange={(e) => setNewPoint({ ...newPoint, lat: e.target.value })}
              placeholder="Lat (optional)"
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-28"
            />
            <input
              value={newPoint.lng}
              onChange={(e) => setNewPoint({ ...newPoint, lng: e.target.value })}
              placeholder="Lng (optional)"
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-28"
            />
            <button type="submit" className="bg-green-700 hover:bg-green-800 text-white p-2.5 rounded-lg">
              <Plus size={16} />
            </button>
          </form>

          <div className="space-y-2">
            {fallbackPoints.map((p) => (
              <div key={p.id} className="bg-white border border-gray-200 rounded-xl px-4 py-3 flex items-center justify-between text-sm">
                <div>
                  <span className="font-semibold text-gray-900">{p.pointName}</span>
                  <span className="text-gray-500"> · {p.area}</span>
                  {p.lat && <span className="text-gray-400 text-xs ml-2">({p.lat}, {p.lng})</span>}
                </div>
                <button onClick={() => handleDeleteFallbackPoint(p.id)} className="text-gray-400 hover:text-red-600">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            {fallbackPoints.length === 0 && (
              <p className="text-gray-500 text-sm">No fallback points saved yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
