import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { createMeeting, fetchMeetings, getRouteInfo, updateMeetingPoint, confirmMeeting } from "../api/meetingApi";
import { Search, MapPin, ArrowLeftRight, Clock, Car } from "lucide-react";

const MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

// Wraps the browser geolocation callback API in a Promise so we can await it.
function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation not supported"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => reject(err)
    );
  });
}

export default function MeetingPointPage() {
  const [meeting, setMeeting] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [touristCoords, setTouristCoords] = useState(null);

  useEffect(() => {
    initMeeting();
  }, []);

  async function initMeeting() {
    try {
      // Try to get the tourist's real location first. If denied/unavailable,
      // we fall back to the stored text location and let the backend geocode it.
      let coords = null;
      try {
        coords = await getCurrentPosition();
        setTouristCoords(coords);
      } catch (geoErr) {
        console.warn("Location permission denied or unavailable, falling back to stored location.", geoErr);
      }

      // For this demo, load (or create) a sample meeting so the page has something to show.
      const existing = await fetchMeetings();
      let current = existing[0];
      if (!current) {
        const created = await createMeeting({
          touristName: "Sarah Ahmed",
          guideName: "Muntasir Rahman",
          tourDetails: "Sundarbans day tour - 25 May, 2026",
          touristLocation: "Dhanmondi",
          guideLocation: "Mirpur 10",
        });
        current = created.meeting;
      }
      setMeeting(current);

      const route = await getRouteInfo(current.touristLocation, current.guideLocation, coords);
      setSuggestions(route.suggestedMeetingPoints);
      setSelected(route.suggestedMeetingPoints[0]);
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
        meetingPoint: `${selected.name}, Dhaka`,
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
        <p className="p-8 text-gray-500">Loading meeting details...</p>
      </div>
    );
  }

  // Route always goes from the tourist's real location to whichever
  // suggested meeting point is currently selected (not to the guide).
  const origin = touristCoords
    ? `${touristCoords.lat},${touristCoords.lng}`
    : `${meeting.touristLocation},Dhaka`;

  const destination = selected
    ? `${selected.name},Dhaka`
    : `${meeting.guideLocation},Dhaka`;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar active="Bookings" />

      <div className="bg-gradient-to-r from-green-700 to-green-500 px-8 py-8 text-white">
        <h1 className="text-2xl font-bold mb-1">Meeting point & route</h1>
        <p className="text-green-50 mb-5">Select a convenient meeting point and view the best route</p>

        <div className="bg-white rounded-xl px-5 py-3 flex items-center gap-6 max-w-3xl text-gray-800">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-green-100 flex items-center justify-center text-green-700">👤</div>
            <div>
              <p className="text-xs text-gray-500">Tourist</p>
              <p className="font-semibold text-sm">{meeting.touristName}</p>
            </div>
          </div>
          <div className="w-px h-8 bg-gray-200" />
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-green-100 flex items-center justify-center text-green-700">👤</div>
            <div>
              <p className="text-xs text-gray-500">Guide</p>
              <p className="font-semibold text-sm">{meeting.guideName}</p>
            </div>
          </div>
          <div className="w-px h-8 bg-gray-200" />
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-green-100 flex items-center justify-center text-green-700">📅</div>
            <div>
              <p className="text-xs text-gray-500">Tour</p>
              <p className="font-semibold text-sm">{meeting.tourDetails}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 py-8 grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <div className="flex items-center gap-2 border border-gray-300 rounded-xl px-4 py-3 bg-white mb-4">
            <Search size={16} className="text-gray-400" />
            <input placeholder="Search location for meeting point..." className="flex-1 outline-none text-sm" />
          </div>

          {/* Real Google Maps embed if a key is provided, otherwise the illustrated placeholder map */}
          {MAPS_KEY ? (
            <iframe
              title="map"
              className="w-full h-80 rounded-xl border border-gray-200"
              loading="lazy"
              src={`https://www.google.com/maps/embed/v1/directions?key=${MAPS_KEY}&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}`}
            />
          ) : (
            <div className="w-full h-80 rounded-xl bg-gradient-to-br from-green-100 to-blue-50 border border-gray-200 relative overflow-hidden">
              <div className="absolute bottom-6 left-8 bg-green-800 text-white text-xs font-semibold px-3 py-1.5 rounded-lg">
                You are here · {meeting.touristLocation}
              </div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-red-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg">
                Meeting point · {selected?.name}
              </div>
              <div className="absolute top-8 right-10 bg-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg">
                Guide · {meeting.guideLocation}
              </div>
            </div>
          )}

          <p className="font-semibold text-gray-900 mt-6 mb-3">Suggested meeting points</p>
          <div className="grid grid-cols-4 gap-3">
            {suggestions.map((s) => (
              <button
                key={s.name}
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

          <button
            onClick={handleConfirm}
            disabled={confirmed}
            className="w-full mt-6 bg-green-700 hover:bg-green-800 disabled:opacity-60 text-white font-semibold py-3 rounded-lg transition"
          >
            {confirmed ? "Meeting point confirmed ✓" : "Confirm meeting point"}
          </button>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 h-fit">
          <h3 className="font-bold text-gray-900 mb-4">Route information</h3>
          <div className="space-y-4 text-sm">
            <div className="flex items-center gap-3">
              <MapPin size={16} className="text-green-700" />
              <div>
                <p className="text-xs text-gray-500">Meeting point</p>
                <p className="font-semibold">{selected?.name}, Dhaka</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ArrowLeftRight size={16} className="text-green-700" />
              <div>
                <p className="text-xs text-gray-500">Distance</p>
                <p className="font-semibold">{selected?.distance}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock size={16} className="text-green-700" />
              <div>
                <p className="text-xs text-gray-500">Estimated time</p>
                <p className="font-semibold">{selected?.time}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Car size={16} className="text-green-700" />
              <div>
                <p className="text-xs text-gray-500">Traffic</p>
                <p className="font-semibold">Light</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
