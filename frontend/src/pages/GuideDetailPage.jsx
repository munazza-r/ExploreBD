import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { fetchGuideDetails } from "../api/guideApi";
import { MapPin, Star, Clock, Wallet, Calendar } from "lucide-react";

export default function GuideDetailPage() {
  const { id } = useParams();
  const [guide, setGuide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchGuideDetails(id)
      .then(setGuide)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (<div className="min-h-screen bg-gray-50"><Navbar active="Explore Guides" /><p className="p-8 text-gray-500">Loading...</p></div>);
  if (error || !guide) return (<div className="min-h-screen bg-gray-50"><Navbar active="Explore Guides" /><p className="p-8 text-red-600">{error || "Guide not found."}</p></div>);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar active="Explore Guides" />

      <div className="bg-gradient-to-r from-green-700 to-green-500 px-8 py-10 text-white">
        <Link to="/guides" className="text-sm text-green-100 hover:text-white">← Back to Explore Guides</Link>
      </div>

      <div className="max-w-3xl mx-auto px-8 py-8">
        <div className="bg-white border border-gray-200 rounded-xl p-6 flex gap-6 mb-6">
          {guide.imageUrl ? (
            <img src={guide.imageUrl} alt={guide.name} className="w-32 h-32 rounded-xl object-cover shrink-0" />
          ) : (
            <div className="w-32 h-32 bg-green-600 rounded-xl flex items-center justify-center shrink-0 text-white text-4xl font-bold">
              {guide.name.charAt(0)}
            </div>
          )}

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold text-gray-900">{guide.name}</h1>
              {guide.verified && <span className="text-xs bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded-full">Verified guide</span>}
              {guide.isTopRated && <span className="text-xs bg-yellow-100 text-yellow-700 font-semibold px-2 py-0.5 rounded-full">Top rated</span>}
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
              <span className="flex items-center gap-1"><Star size={14} className="text-yellow-500" /> {guide.rating} ({guide.reviewCount} reviews)</span>
              <span className="flex items-center gap-1"><MapPin size={14} /> {guide.location}</span>
            </div>

            <div className="flex flex-wrap gap-2 mb-3">
              {guide.languages.map((lang) => (
                <span key={lang} className="text-xs bg-blue-100 text-blue-700 font-medium px-2 py-1 rounded">{lang}</span>
              ))}
              {guide.specialties?.map((s) => (
                <span key={s} className="text-xs bg-purple-100 text-purple-700 font-medium px-2 py-1 rounded">{s}</span>
              ))}
            </div>

            {guide.bio && <p className="text-sm text-gray-600 mb-3">{guide.bio}</p>}

            <Link to="/bookings" className="inline-block bg-green-700 hover:bg-green-800 text-white font-semibold px-6 py-2.5 rounded-lg transition">
              Book this guide
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><Wallet size={12} /> Hourly rate</p>
            <p className="text-xl font-bold text-gray-900">৳{guide.budget}/hr</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><Clock size={12} /> Experience</p>
            <p className="text-xl font-bold text-gray-900">{guide.experience} years</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-xs text-gray-500 mb-1">Tours completed</p>
            <p className="text-xl font-bold text-gray-900">{guide.toursDone}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><Calendar size={12} /> Availability</p>
            <p className="text-xl font-bold text-gray-900">{guide.availability}</p>
          </div>
        </div>

        {(guide.availableDays?.length > 0 || guide.startTime) && (
          <div className="bg-white border border-gray-200 rounded-xl p-4 mt-4">
            <p className="text-sm font-semibold text-gray-900 mb-2">Availability schedule</p>
            {guide.availableDays?.length > 0 && (
              <p className="text-sm text-gray-600 mb-1">Days: {guide.availableDays.join(", ")}</p>
            )}
            {guide.startTime && <p className="text-sm text-gray-600">Hours: {guide.startTime} – {guide.endTime}</p>}
          </div>
        )}
      </div>
    </div>
  );
}