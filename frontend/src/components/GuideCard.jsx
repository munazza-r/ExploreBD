import { Link } from "react-router-dom";

export default function GuideCard({ guide }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 flex gap-5">
      {guide.imageUrl ? (
        <img src={guide.imageUrl} alt={guide.name} className="w-28 h-28 rounded-lg object-cover shrink-0" />
      ) : (
        <div className="w-28 h-28 bg-green-600 rounded-lg flex items-center justify-center shrink-0 text-white text-3xl font-bold">
          {guide.name.charAt(0)}
        </div>
      )}

      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-lg font-bold text-gray-900">{guide.name}</h3>
          {guide.verified && (
            <span className="text-xs bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded-full">Verified guide</span>
          )}
        </div>

        <div className="flex items-center gap-3 text-sm text-gray-600 mb-2">
          <span className="flex items-center gap-1">
            <span className="text-yellow-500">★</span>
            <span className="font-semibold text-gray-900">{guide.rating}</span>
            <span>({guide.reviewCount} reviews)</span>
          </span>
          <span>📍 {guide.location}</span>
        </div>

        <div className="flex flex-wrap gap-2 mb-2">
          {guide.languages.map((lang) => (
            <span key={lang} className="text-xs bg-blue-100 text-blue-700 font-medium px-2 py-1 rounded">{lang}</span>
          ))}
        </div>

        <p className="text-sm text-gray-500 mb-3">{guide.experience} years experience · ৳{guide.budget}/hour</p>

        <Link to={`/guides/${guide.id}`} className="inline-block bg-green-700 hover:bg-green-800 text-white font-semibold px-5 py-2 rounded-lg transition">
          View profile
        </Link>
      </div>
    </div>
  );
}
