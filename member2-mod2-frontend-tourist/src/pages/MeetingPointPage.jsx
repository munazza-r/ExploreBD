import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { fetchTouristMeetings, updateMeetingPoint, confirmMeeting } from "../api/meetingApi";
import { MapPin, ArrowLeftRight, Clock, Hourglass, CheckCircle2 } from "lucide-react";

// Simulates the logged-in tourist, since there's no auth system yet.
const CURRENT_TOURIST = "Sarah Ahmed";

export default function MeetingPointPage() {
  const [meeting, setMeeting] = useState(null);
  const [selected, setSelected] = useState(null);
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
    const interval = setInterval(load, 4000); // picks up guide approval automatically
    return () => clearInterval(interval);
  }, []);

  async function load() {
    try {
      const meetings = await fetchTouristMeetings(CURRENT_TOURIST);
      const current = meetings[0];
      setMeeting(current || null);
      if (current?.guideApprovedPoints?.length > 0 && !selected) {
        setSelected(current.guideApprovedPoints[0]);
      }
      if (current?.status === "Confirmed") setConfirmed(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirm() {
    if (!meeting || !selected) return;
    try {
      await updateMeetingPoint(meeting.id, {
        meetingPoint: selected.name,
        distance: selected.distance,
        duration: selected.time,
        traffic: "Light",
      });
      await confirmMeeting(meeting.id);
      setConfirmed(true);
    } catch (err) {
      console.error(err);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar active="Bookings" />
        <p className="p-8 text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!meeting) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar active="Bookings" />
        <p className="p-8 text-gray-500">No confirmed bookings yet.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar active="Bookings" />

      <div className="bg-gradient-to-r from-green-700 to-green-500 px-8 py-8 text-white">
        <h1 className="text-2xl font-bold mb-1">Meeting point & route</h1>
        <p className="text-green-50 mb-5">
          {meeting.status === "Awaiting Guide Approval"
            ? "Waiting for your guide to approve suggested meeting points"
            : "Select a convenient meeting point and view the best route"}
        </p>

        <div className="bg-white rounded-xl px-5 py-3 flex items-center gap-6 max-w-3xl text-gray-800">
          <div>
            <p className="text-xs text-gray-500">Tourist</p>
            <p className="font-semibold text-sm">{meeting.touristName}</p>
          </div>
          <div className="w-px h-8 bg-gray-200" />
          <div>
            <p className="text-xs text-gray-500">Guide</p>
            <p className="font-semibold text-sm">{meeting.guideName}</p>
          </div>
          <div className="w-px h-8 bg-gray-200" />
          <div>
            <p className="text-xs text-gray-500">Tour</p>
            <p className="font-semibold text-sm">{meeting.tourDetails}</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-8 py-8">
        {meeting.status === "Awaiting Guide Approval" && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 flex items-center gap-3">
            <Hourglass className="text-amber-600" size={20} />
            <p className="text-sm text-amber-800">
              We've sent {meeting.suggestedPoints?.points?.length || "a few"} suggested meeting points to your guide for approval.
              This page updates automatically once they respond.
            </p>
          </div>
        )}

        {(meeting.status === "Approved" || meeting.status === "Fallback Used") && !confirmed && (
          <>
            {meeting.status === "Fallback Used" && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4 text-sm text-blue-800">
                Your guide didn't respond in time, so the platform automatically selected the closest pre-approved fallback points.
              </div>
            )}
            <p className="font-semibold text-gray-900 mb-3">Guide-approved meeting points</p>
            <div className="grid grid-cols-3 gap-3 mb-6">
              {meeting.guideApprovedPoints.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelected(s)}
                  className={`border rounded-lg p-3 text-left text-sm ${
                    selected?.name === s.name ? "border-green-600 bg-green-50" : "border-gray-200 bg-white"
                  }`}
                >
                  <p className="font-semibold text-gray-900">{s.name}</p>
                  <p className="text-xs text-gray-500">{s.distance} · {s.time}</p>
                </button>
              ))}
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6 grid grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2"><MapPin size={16} className="text-green-700" /> {selected?.name}</div>
              <div className="flex items-center gap-2"><ArrowLeftRight size={16} className="text-green-700" /> {selected?.distance}</div>
              <div className="flex items-center gap-2"><Clock size={16} className="text-green-700" /> {selected?.time}</div>
            </div>

            <button
              onClick={handleConfirm}
              className="w-full bg-green-700 hover:bg-green-800 text-white font-semibold py-3 rounded-lg transition"
            >
              Confirm meeting point
            </button>
          </>
        )}

        {confirmed && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 flex items-center gap-3">
            <CheckCircle2 className="text-green-700" size={20} />
            <p className="text-sm text-green-800">
              Meeting point confirmed: <strong>{selected?.name || meeting.meetingPoint}</strong>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
