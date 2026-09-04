import { useEffect, useState } from "react";
import { fetchAllGuides, searchGuides } from "../api/guideApi";
import GuideCard from "../components/GuideCard";
import FilterSidebar from "../components/FilterSidebar";
import { Compass, Bell } from "lucide-react";

const DEFAULT_FILTERS = {
  location: "",
  languages: [],
  minRating: "0",
  maxBudget: "2000",
  minExperience: "0",
};

export default function ExploreGuides() {
  const [guides, setGuides] = useState([]);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load all guides once on page load
  useEffect(() => {
    loadAllGuides();
  }, []);

  async function loadAllGuides() {
    try {
      setLoading(true);
      const data = await fetchAllGuides();
      setGuides(data);
      setError(null);
    } catch (err) {
      setError("Could not load guides. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }

  async function handleApplyFilters() {
    try {
      setLoading(true);
      // Only send filters that are actually set, so we don't over-filter
      const payload = {};
      if (filters.location) payload.location = filters.location;
      if (filters.languages.length > 0) payload.languages = filters.languages; // send all selected languages
      if (Number(filters.minRating) > 0) payload.minRating = filters.minRating;
      if (Number(filters.minExperience) > 0) payload.minExperience = filters.minExperience;
      payload.maxBudget = filters.maxBudget;

      const data = await searchGuides(payload);
      setGuides(data);
      setError(null);
    } catch (err) {
      setError("Search failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setFilters(DEFAULT_FILTERS);
    loadAllGuides();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-green-700 to-green-500 flex items-center justify-center">
            <Compass size={20} className="text-green-100" />
          </div>
          <span className="text-lg font-bold text-gray-900">
            Explore<span className="text-green-600">BD</span>
          </span>
        </div>

        <div className="flex items-center gap-6 text-sm font-medium text-gray-500">
          <span className="cursor-pointer hover:text-gray-900">Dashboard</span>
          <span className="text-green-700 border-b-2 border-green-700 pb-1 cursor-pointer">Explore Guides</span>
          <span className="cursor-pointer hover:text-gray-900">Bookings</span>
          <span className="cursor-pointer hover:text-gray-900">Messages</span>
        </div>

        <div className="flex items-center gap-4">
          <Bell size={20} className="text-gray-500" />
          <div className="w-9 h-9 rounded-full bg-green-700 text-white flex items-center justify-center text-sm font-semibold">
            MR
          </div>
        </div>
      </nav>
      
      {/* Hero / search banner */}
      <div className="bg-gradient-to-r from-green-700 to-green-500 px-8 py-10 text-white">
        <h1 className="text-3xl font-bold mb-1">Find your perfect local guide</h1>
        <p className="text-green-50 mb-5">
          Search by location, language, ratings, experience and budget
        </p>
        <div className="flex max-w-2xl bg-white rounded-lg overflow-hidden">
          <input
            type="text"
            placeholder="Where are you going?"
            value={filters.location}
            onChange={(e) => setFilters({ ...filters, location: e.target.value })}
            className="flex-1 px-4 py-3 text-gray-800 outline-none"
          />
          <button
            onClick={handleApplyFilters}
            className="bg-green-800 hover:bg-green-900 text-white font-semibold px-6"
          >
            🔍 Search
          </button>
        </div>
      </div>

      {/* Filters + results */}
      <div className="max-w-6xl mx-auto px-8 py-8 flex gap-8">
        <div className="w-72 shrink-0">
          <FilterSidebar
            filters={filters}
            setFilters={setFilters}
            onApply={handleApplyFilters}
            onReset={handleReset}
          />
        </div>

        <div className="flex-1">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-900">
              {loading ? "Searching..." : `${guides.length} guides found`}
            </h2>
          </div>

          {error && <p className="text-red-600 mb-4">{error}</p>}

          <div className="space-y-4">
            {!loading && guides.length === 0 && (
              <p className="text-gray-500">No guides match your filters. Try adjusting them.</p>
            )}
            {guides.map((guide) => (
              <GuideCard key={guide.id} guide={guide} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
