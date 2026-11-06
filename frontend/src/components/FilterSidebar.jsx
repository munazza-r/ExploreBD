const LANGUAGE_OPTIONS = ["English", "Bangla", "Hindi", "French"];

export default function FilterSidebar({ filters, setFilters, onApply, onReset }) {
  function toggleLanguage(lang) {
    setFilters((prev) => {
      const already = prev.languages.includes(lang);
      return { ...prev, languages: already ? prev.languages.filter((l) => l !== lang) : [...prev.languages, lang] };
    });
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 w-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-gray-900">Filters</h3>
        <button onClick={onReset} className="text-sm text-blue-600 hover:underline">Reset</button>
      </div>

      <label className="block text-sm font-semibold text-gray-700 mb-1">📍 Location</label>
      <input
        type="text"
        placeholder="e.g. Cox's Bazar"
        value={filters.location}
        onChange={(e) => setFilters({ ...filters, location: e.target.value })}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4 text-sm"
      />

      <label className="block text-sm font-semibold text-gray-700 mb-2">🌐 Languages</label>
      <div className="mb-4 space-y-1">
        {LANGUAGE_OPTIONS.map((lang) => (
          <label key={lang} className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={filters.languages.includes(lang)} onChange={() => toggleLanguage(lang)} />
            {lang}
          </label>
        ))}
      </div>

      <label className="block text-sm font-semibold text-gray-700 mb-1">★ Minimum rating</label>
      <select value={filters.minRating} onChange={(e) => setFilters({ ...filters, minRating: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4 text-sm">
        <option value="0">Any</option>
        <option value="3">3 stars & up</option>
        <option value="4">4 stars & up</option>
        <option value="5">5 stars</option>
      </select>

      <label className="block text-sm font-semibold text-gray-700 mb-1">৳ Max budget / hour</label>
      <input type="range" min="300" max="2000" step="50" value={filters.maxBudget} onChange={(e) => setFilters({ ...filters, maxBudget: e.target.value })} className="w-full mb-1" />
      <div className="flex justify-between text-xs text-gray-500 mb-4">
        <span>৳300</span>
        <span>৳{filters.maxBudget}</span>
      </div>

      <label className="block text-sm font-semibold text-gray-700 mb-1">📅 Min experience</label>
      <select value={filters.minExperience} onChange={(e) => setFilters({ ...filters, minExperience: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-5 text-sm">
        <option value="0">Any</option>
        <option value="1">1+ years</option>
        <option value="3">3+ years</option>
        <option value="5">5+ years</option>
      </select>

      <button onClick={onApply} className="w-full bg-green-700 hover:bg-green-800 text-white font-semibold py-2.5 rounded-lg transition">
        Apply filters
      </button>
    </div>
  );
}
