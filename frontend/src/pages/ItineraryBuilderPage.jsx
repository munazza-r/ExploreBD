import { useState } from "react";
import Navbar from "../components/Navbar";
import { generateItinerary } from "../api/itineraryApi";
import { Compass } from "lucide-react";

const INTEREST_OPTIONS = ["Nature tours", "Photography", "Food", "History", "Adventure", "Village"];

export default function ItineraryBuilderPage() {
  const [destination, setDestination] = useState("Sylhet");
  const [tripLength, setTripLength] = useState(3);
  const [budget, setBudget] = useState("");
  const [interests, setInterests] = useState(["Nature tours", "Photography"]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  function toggleInterest(interest) {
    setInterests((prev) => (prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]));
  }

  async function handleGenerate() {
    if (!destination || !tripLength || !budget || interests.length === 0) {
      setError("Please fill in destination, trip length, budget, and at least one interest.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      setResult(await generateItinerary({ destination, tripLength: Number(tripLength), budget: Number(budget), interests }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar active="Itinerary Builder" />
      <div className="max-w-6xl mx-auto px-8 py-8 grid grid-cols-3 gap-6">
        <div className="bg-gradient-to-b from-green-700 to-green-600 text-white rounded-xl p-6">
          <div className="bg-white/10 rounded-lg p-3 mb-4 flex items-center gap-2">
            <Compass size={18} /> <span className="font-bold">Smart Itinerary Builder</span>
          </div>
          <p className="text-xs font-semibold uppercase mb-2 text-green-100">Interests</p>
          <div className="flex flex-wrap gap-2 mb-5">
            {INTEREST_OPTIONS.map((i) => (
              <button key={i} onClick={() => toggleInterest(i)} className={`text-xs px-3 py-1.5 rounded-full border ${interests.includes(i) ? "bg-white text-green-700 border-white font-semibold" : "border-white/40 text-white"}`}>{i}</button>
            ))}
          </div>
          <label className="block text-xs font-semibold uppercase text-green-100 mb-1">Destination</label>
          <input value={destination} onChange={(e) => setDestination(e.target.value)} className="w-full rounded-lg px-3 py-2 text-sm text-gray-800 mb-4" />
          <label className="block text-xs font-semibold uppercase text-green-100 mb-1">Trip length (days)</label>
          <input type="number" min="1" max="14" value={tripLength} onChange={(e) => setTripLength(e.target.value)} className="w-full rounded-lg px-3 py-2 text-sm text-gray-800 mb-4" />
          <label className="block text-xs font-semibold uppercase text-green-100 mb-1">Budget per day (৳)</label>
          <input type="number" value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="e.g. 1000" className="w-full rounded-lg px-3 py-2 text-sm text-gray-800 mb-5" />
          {error && <p className="text-xs bg-red-500/20 text-white px-3 py-2 rounded-lg mb-3">{error}</p>}
          <button onClick={handleGenerate} disabled={loading} className="w-full bg-white text-green-700 font-semibold py-2.5 rounded-lg disabled:opacity-60">
            {loading ? "Planning your trip..." : "Generate itinerary"}
          </button>
        </div>

        <div className="col-span-2 space-y-6">
          {!result && !loading && <div className="bg-white border border-gray-200 rounded-xl p-10 text-center text-gray-400">Fill in your preferences and generate your trip.</div>}
          {result && (
            <>
              <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-5">
                <p className="font-bold text-gray-900 mb-3">Your suggested trip</p>
                {result.itinerary.map((d) => (
                  <div key={d.day} className="mb-4">
                    <p className="font-semibold text-gray-800 text-sm mb-2">DAY {d.day}</p>
                    {d.stops.map((s, idx) => (
                      <div key={idx} className="mb-2 text-sm text-gray-700">
                        <p className="font-medium">{s.time} — {s.name}</p>
                        <p className="text-gray-500 text-xs">{s.desc}</p>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
              <div>
                <p className="font-bold text-gray-900 mb-3">Recommended guides</p>
                <div className="space-y-3">
                  {result.guides.map((g) => (
                    <div key={g.name} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold">{g.name.charAt(0)}</div>
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{g.name}</p>
                          <p className="text-xs text-gray-500">★ {g.rating} ({g.reviews})</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs bg-green-100 text-green-700 font-semibold px-2 py-1 rounded-full">{g.matchPercent}% match</span>
                        <p className="text-sm font-semibold text-gray-900 mt-1">৳{g.pricePerDay}/day</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
