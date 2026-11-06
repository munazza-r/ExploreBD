import { useState, useRef, useEffect } from "react";
import Navbar from "../components/Navbar";
import { createPackage } from "../api/tourPackageApi";
import { fetchMyGuideProfile } from "../api/guideApi";
import { useAuth } from "../context/AuthContext";

const emptyPlace = { place: "", day: "1" };

export default function TourPackagePage() {
  const { user } = useAuth();
  const [guideInfo, setGuideInfo] = useState(null);
  const [displayPhoto, setDisplayPhoto] = useState(null);
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [places, setPlaces] = useState([{ ...emptyPlace }]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchMyGuideProfile().then(setGuideInfo).catch(() => setGuideInfo(null));
  }, []);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setDisplayPhoto(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const updatePlace = (index, field, value) => {
    const updated = [...places];
    updated[index] = { ...updated[index], [field]: value };
    setPlaces(updated);
  };

  const addStop = () => {
    const nextDay = duration ? String(Math.min(Number(duration) || 1, places.length + 1)) : String(places.length + 1);
    setPlaces([...places, { place: "", day: nextDay }]);
  };

  const removeStop = (index) => setPlaces(places.filter((_, i) => i !== index));

  const resetForm = () => {
    setTitle(""); setDuration(""); setPrice(""); setDescription(""); setDisplayPhoto(null);
    setPlaces([{ ...emptyPlace }]);
  };

  const savePackage = async (status) => {
    if (!guideInfo) {
      setMessage({ type: "error", text: "Create your guide profile first before adding packages." });
      return;
    }
    if (!displayPhoto) {
      setMessage({ type: "error", text: "Please upload a display picture." });
      return;
    }
    if (!title || !duration || !price || !description || places.some((p) => !p.place.trim())) {
      setMessage({ type: "error", text: "Please fill in all package details before saving." });
      return;
    }

    setSaving(true);
    setMessage(null);
    try {
      await createPackage({
        title, description, price: Number(price), duration: Number(duration),
        places: places.map((p) => ({ place: p.place, day: Number(p.day || 1) })),
        coverPhoto: displayPhoto, status,
      });
      setMessage({ type: "success", text: status === "PUBLISHED" ? "Package published successfully!" : "Draft saved successfully!" });
      resetForm();
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const placesByDay = places.reduce((acc, p) => {
    const day = p.day || "1";
    if (!acc[day]) acc[day] = [];
    if (p.place.trim()) acc[day].push(p.place.trim());
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar active="Tour Packages" />

      <main className="max-w-5xl mx-auto p-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500 font-medium">Tour Package Management</p>
            <h1 className="text-2xl font-semibold text-gray-900">Create a New Package</h1>
            <p className="text-sm text-gray-500 mt-1">Set your pricing, duration, included places and description — tourists will see this exact card live!</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => savePackage("PUBLISHED")} disabled={saving} className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 text-sm font-medium px-4 py-2 rounded-md disabled:opacity-50">
              {saving ? "Saving..." : "Publish Package"}
            </button>
            <button onClick={() => savePackage("DRAFT")} disabled={saving} className="bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 text-sm font-medium px-4 py-2 rounded-md disabled:opacity-50">
              {saving ? "Saving..." : "Save as Draft"}
            </button>
          </div>
        </div>

        {message && (
          <div className={`mb-4 text-sm px-4 py-2 rounded-md ${message.type === "success" ? "bg-green-100 text-green-700 border border-green-200" : "bg-red-100 text-red-700 border border-red-200"}`}>
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 bg-white rounded-lg border border-gray-200 p-6 space-y-5">
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase">Guide Display Picture *</label>
              <div className="mt-3 flex items-center gap-6">
                {displayPhoto ? (
                  <img src={displayPhoto} alt="Preview" className="w-24 h-24 rounded-full object-cover border-4 border-green-600 shadow-md shrink-0" />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center text-xs text-gray-400 font-medium shrink-0">No Photo</div>
                )}
                <input type="file" ref={fileInputRef} accept="image/*" onChange={handleImageUpload} className="hidden" />
                <button type="button" onClick={() => fileInputRef.current?.click()} className="bg-green-50 hover:bg-green-100 text-green-700 text-xs font-semibold px-4 py-2.5 rounded-md border border-green-200">
                  {displayPhoto ? "Change Photo" : "Upload Photo"}
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-500 uppercase">Package Title *</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Sylhet Tea Gardens & Waterfalls" className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase">Duration (Days) *</label>
                <input type="text" value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="e.g. 8" className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase">Price (Per Day) *</label>
                <input type="text" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="e.g. 4500" className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-500 uppercase">Included Places *</label>
              <div className="mt-2 space-y-2">
                {places.map((p, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <input type="text" value={p.place} onChange={(e) => updatePlace(index, "place", e.target.value)} placeholder="Place name (e.g. Jaflong)" className="flex-1 border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                    <input type="text" value={p.day} onChange={(e) => updatePlace(index, "day", e.target.value)} className="w-20 border border-gray-300 rounded-md px-2 py-1.5 text-sm text-center" placeholder="Day" />
                    <span className="text-xs text-gray-400 w-10">Day {p.day || "-"}</span>
                    {places.length > 1 && <button onClick={() => removeStop(index)} className="text-red-400 hover:text-red-600 text-sm font-bold px-1">✕</button>}
                  </div>
                ))}
              </div>
              <button onClick={addStop} className="mt-2 text-sm text-blue-600 hover:underline font-medium">+ Add Another Stop</button>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-500 uppercase">Description *</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} placeholder="Describe the experience..." className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase mb-3 text-center tracking-wider">Live Preview</p>
            <div className="bg-green-600 text-white rounded-2xl p-5 shadow-lg relative overflow-hidden">
              <div className="absolute top-4 right-4 flex flex-col items-end gap-2.5 z-10">
                {guideInfo?.verified && <span className="bg-yellow-400 text-gray-900 text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm">Verified guide ✓</span>}
                {displayPhoto ? (
                  <img src={displayPhoto} alt="Guide" className="w-16 h-16 rounded-full object-cover border-2 border-white/90 shadow-md" />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-green-800 text-white flex items-center justify-center font-bold text-xl shrink-0 border-2 border-white/40 shadow-md">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <h3 className="text-xl font-bold pr-36 break-words leading-tight">{title.trim() ? title : "Your package title"}</h3>
              <div className="mt-2 text-xs text-green-100 font-medium pr-36">
                {user?.name} <span className="mx-1">•</span> {guideInfo?.location || "Location"}
              </div>
              <div className="mt-4 border-t border-green-500/50 pt-3">
                <ul className="text-sm space-y-1.5 text-green-50 font-medium">
                  <li>✓ {duration.trim() ? `${duration} Days` : "- Days"}</li>
                </ul>
                <div className="mt-4 bg-white/15 backdrop-blur-sm rounded-lg px-3.5 py-1.5 text-sm font-semibold inline-block border border-white/20">
                  {price.trim() ? `${price} Tk / day` : "Price / day"}
                </div>
              </div>
              {Object.keys(placesByDay).some((d) => placesByDay[d].length > 0) && (
                <div className="mt-4 pt-3 border-t border-green-500/50 text-xs text-green-50 space-y-1.5">
                  <p className="font-semibold uppercase text-[10px] text-green-200 tracking-wider">Itinerary Highlights:</p>
                  {Object.entries(placesByDay).sort(([a], [b]) => Number(a) - Number(b)).map(([day, list]) =>
                    list.length > 0 ? (
                      <div key={day} className="flex gap-1.5">
                        <span className="font-bold text-yellow-300">Day {day}:</span>
                        <span className="truncate">{list.join(", ")}</span>
                      </div>
                    ) : null
                  )}
                </div>
              )}
            </div>
            <div className="mt-4 bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                {description.trim() ? description : "This preview updates in real time as you fill out the form."}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
