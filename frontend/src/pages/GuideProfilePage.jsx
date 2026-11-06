import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { fetchMyGuideProfile, updateMyGuideProfile } from "../api/guideApi";

export default function GuideProfilePage() {
  const [form, setForm] = useState({
    location: "", languages: "", bio: "", budget: "", experience: "",
    specialties: "", availableDays: "", startTime: "10:00 A.M", endTime: "06:00 P.M", isPublic: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      const guide = await fetchMyGuideProfile();
      setForm({
        location: guide.location || "",
        languages: (guide.languages || []).join(", "),
        bio: guide.bio || "",
        budget: guide.budget || "",
        experience: guide.experience || "",
        specialties: (guide.specialties || []).join(", "),
        availableDays: (guide.availableDays || []).join(", "),
        startTime: guide.startTime || "10:00 A.M",
        endTime: guide.endTime || "06:00 P.M",
        isPublic: guide.isPublic ?? true,
      });
    } catch (err) {
      // No profile yet - that's fine, they'll create one on first save
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      await updateMyGuideProfile({
        location: form.location,
        languages: form.languages.split(",").map((l) => l.trim()).filter(Boolean),
        bio: form.bio,
        budget: Number(form.budget),
        experience: Number(form.experience),
        specialties: form.specialties.split(",").map((s) => s.trim()).filter(Boolean),
        availableDays: form.availableDays.split(",").map((d) => d.trim()).filter(Boolean),
        startTime: form.startTime,
        endTime: form.endTime,
        isPublic: form.isPublic,
      });
      setMessage({ type: "success", text: "Profile saved successfully." });
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  }

  if (loading) return (<div className="min-h-screen bg-gray-50"><Navbar active="My Profile" /><p className="p-8 text-gray-500">Loading...</p></div>);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar active="My Profile" />
      <div className="bg-gradient-to-r from-green-700 to-green-500 px-8 py-10 text-white">
        <h1 className="text-3xl font-bold mb-1">Your guide profile</h1>
        <p className="text-green-50">Manage your languages, expertise, rates and availability</p>
      </div>

      <div className="max-w-2xl mx-auto px-8 py-8">
        {message && (
          <div className={`mb-4 text-sm px-3 py-2 rounded-lg ${message.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Location</label>
            <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="e.g. Sylhet" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Languages (comma-separated)</label>
            <input value={form.languages} onChange={(e) => setForm({ ...form, languages: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="English, Bangla" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Bio</label>
            <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={3} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Hourly rate (৳)</label>
              <input type="number" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Years of experience</label>
              <input type="number" value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Specialties (comma-separated)</label>
            <input value={form.specialties} onChange={(e) => setForm({ ...form, specialties: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="Nature tours, Photography" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Available days (comma-separated)</label>
            <input value={form.availableDays} onChange={(e) => setForm({ ...form, availableDays: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="Saturday, Sunday, Friday" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Start time</label>
              <input value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">End time</label>
              <input value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={form.isPublic} onChange={(e) => setForm({ ...form, isPublic: e.target.checked })} />
            Show my profile in tourist search results
          </label>

          <button type="submit" disabled={saving} className="w-full bg-green-700 hover:bg-green-800 text-white font-semibold py-2.5 rounded-lg transition disabled:opacity-60">
            {saving ? "Saving..." : "Save profile"}
          </button>
        </form>
      </div>
    </div>
  );
}
