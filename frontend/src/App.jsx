import { useState, useRef } from "react";
import api from "./api";

const emptyPlace = { place: "", day: "1" };

export default function App() {
  const [guideName, setGuideName] = useState("Adnan Rashid");
  const [guideLocation, setGuideLocation] = useState("Sylhet");
  const [displayPhoto, setDisplayPhoto] = useState(null);
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [places, setPlaces] = useState([{ ...emptyPlace }]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const fileInputRef = useRef(null);

  const guideId = "650000000000000000000001";

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setDisplayPhoto(reader.result);
      };
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
    setPlaces([
      ...places, 
      { place: "", day: nextDay }
    ]);
  };

  const removeStop = (index) => {
    setPlaces(places.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setTitle("");
    setDuration("");
    setPrice("");
    setDescription("");
    setDisplayPhoto(null);
    setPlaces([{ ...emptyPlace }]);
  };

  const savePackage = async (status) => {
    if (!guideName.trim()) {
      setMessage({ type: "error", text: "Please enter your Guide Name." });
      return;
    }
    if (!guideLocation.trim()) {
      setMessage({ type: "error", text: "Please enter your Location." });
      return;
    }
    if (!displayPhoto) {
      setMessage({ type: "error", text: "Please upload your Display Picture." });
      return;
    }
    if (!title || !duration || !price || !description || places.some((p) => !p.place.trim())) {
      setMessage({ type: "error", text: "Please fill in all package details before saving." });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      await api.post("/tour-packages", {
        title,
        description,
        price: Number(price),
        duration: Number(duration),
        places: places.map((p) => ({ place: p.place, day: Number(p.day || 1) })),
        coverPhoto: displayPhoto,
        status,
        guideId,
      });

      setMessage({
        type: "success",
        text: status === "PUBLISHED" ? "Package published successfully!" : "Draft saved successfully!",
      });
      resetForm();
    } catch (err) {
      console.error(err);
      setMessage({ 
        type: "error", 
        text: err.response?.data?.error || "Something went wrong while saving. Ensure backend server is running." 
      });
    } finally {
      setSaving(false);
    }
  };

  // Group valid places by day for live preview
  const placesByDay = places.reduce((acc, p) => {
    const day = p.day || "1";
    if (!acc[day]) acc[day] = [];
    if (p.place.trim()) acc[day].push(p.place.trim());
    return acc;
  }, {});

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-56 bg-green-600 text-white flex flex-col justify-between">
        <div>
          <div className="px-6 py-6 text-lg font-semibold border-b border-green-500">
            ExploreBD
          </div>
          <nav className="mt-4 flex flex-col text-sm">
            {["Overview", "Booking", "Tour Packages", "Availability", "Earnings", "Messages"].map(
              (item) => (
                <span
                  key={item}
                  className={`px-6 py-2 cursor-default ${
                    item === "Tour Packages" ? "bg-green-700 font-medium" : "hover:bg-green-700/50"
                  }`}
                >
                  {item}
                </span>
              )
            )}
          </nav>
        </div>

        {/* Sidebar Guide Info */}
        <div className="px-6 py-4 border-t border-green-500 text-xs flex items-center gap-3">
          {displayPhoto ? (
            <img 
              src={displayPhoto} 
              alt="Guide Profile" 
              className="w-11 h-11 rounded-full object-cover border-2 border-white/80 shadow-sm shrink-0"
            />
          ) : (
            <div className="w-11 h-11 rounded-full bg-green-800 flex items-center justify-center font-bold text-white text-sm shrink-0 border border-white/40">
              {guideName ? guideName.charAt(0).toUpperCase() : "G"}
            </div>
          )}
          <div className="overflow-hidden min-w-0">
            <div className="font-medium truncate text-sm">{guideName || "Guide Name"}</div>
            <div className="text-green-100 truncate text-xs">
              Verified Guide | {guideLocation || "Location"}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500 font-medium">
              Tour Package Management
            </p>
            <h1 className="text-2xl font-semibold text-gray-900">Create a New Package</h1>
            <p className="text-sm text-gray-500 mt-1">
              Set your pricing, duration, included places and description — tourists will see this exact card live!
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => savePackage("PUBLISHED")}
              disabled={saving}
              className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 text-sm font-medium px-4 py-2 rounded-md disabled:opacity-50 transition-colors cursor-pointer"
            >
              {saving ? "Saving..." : "Publish Package"}
            </button>
            <button
              onClick={() => savePackage("DRAFT")}
              disabled={saving}
              className="bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 text-sm font-medium px-4 py-2 rounded-md disabled:opacity-50 transition-colors cursor-pointer"
            >
              {saving ? "Saving..." : "Save as Draft"}
            </button>
          </div>
        </div>

        {message && (
          <div
            className={`mb-4 text-sm px-4 py-2 rounded-md ${
              message.type === "success"
                ? "bg-green-100 text-green-700 border border-green-200"
                : "bg-red-100 text-red-700 border border-red-200"
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-3 gap-6">
          {/* Form Controls */}
          <div className="col-span-2 bg-white rounded-lg border border-gray-200 p-6 space-y-5">
            {/* Guide Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase">Guide Name *</label>
                <input
                  type="text"
                  value={guideName}
                  onChange={(e) => setGuideName(e.target.value)}
                  placeholder="Enter full name"
                  className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase">Guide Location / City *</label>
                <input
                  type="text"
                  value={guideLocation}
                  onChange={(e) => setGuideLocation(e.target.value)}
                  placeholder="e.g. Sylhet, Cox's Bazar"
                  className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            {/* Display Picture Upload */}
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase">Guide Display Picture *</label>
              <div className="mt-3 flex items-center gap-6">
                {displayPhoto ? (
                  <img
                    src={displayPhoto}
                    alt="Preview"
                    className="w-24 h-24 rounded-full object-cover border-4 border-green-600 shadow-md shrink-0"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center text-xs text-gray-400 font-medium shrink-0">
                    No Photo
                  </div>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-green-50 hover:bg-green-100 text-green-700 text-xs font-semibold px-4 py-2.5 rounded-md border border-green-200 transition-colors cursor-pointer"
                >
                  {displayPhoto ? "Change Photo" : "Upload Photo"}
                </button>
              </div>
            </div>

            {/* Package Title */}
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase">Package Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Sylhet Tea Gardens & Waterfalls"
                className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Duration & Price */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase">Duration (Days) *</label>
                <input
                  type="text"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="e.g. 8"
                  className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase">Price (Per Day) *</label>
                <input
                  type="text"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="e.g. 4500"
                  className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            {/* Included Places */}
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase">Included Places *</label>
              <div className="mt-2 space-y-2">
                {places.map((p, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={p.place}
                      onChange={(e) => updatePlace(index, "place", e.target.value)}
                      placeholder="Place name (e.g. Jaflong)"
                      className="flex-1 border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <input
                      type="text"
                      value={p.day}
                      onChange={(e) => updatePlace(index, "day", e.target.value)}
                      className="w-20 border border-gray-300 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 text-center"
                      placeholder="Day"
                    />
                    <span className="text-xs text-gray-400 w-10">Day {p.day || "-"}</span>
                    {places.length > 1 && (
                      <button
                        onClick={() => removeStop(index)}
                        className="text-red-400 hover:text-red-600 text-sm font-bold px-1 cursor-pointer"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                onClick={addStop}
                className="mt-2 text-sm text-blue-600 hover:underline font-medium cursor-pointer"
              >
                + Add Another Stop
              </button>
            </div>

            {/* Description */}
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase">Description *</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="Describe the experience, what's included, and what makes it special..."
                className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          {/* REAL-TIME LIVE PREVIEW PANEL */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase mb-3 text-center tracking-wider">
              Live Preview
            </p>

            {/* Green Package Card */}
            <div className="bg-green-600 text-white rounded-2xl p-5 shadow-lg relative overflow-hidden transition-all duration-200">
              
              {/* TOP-RIGHT CONTAINER: Verified Badge + LARGER Guide Circle Photo */}
              <div className="absolute top-4 right-4 flex flex-col items-end gap-2.5 z-10">
                <span className="bg-yellow-400 text-gray-900 text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm">
                  Verified guide ✓
                </span>

                {displayPhoto ? (
                  <img
                    src={displayPhoto}
                    alt="Guide"
                    className="w-16 h-16 rounded-full object-cover border-2 border-white/90 shadow-md"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-green-800 text-white flex items-center justify-center font-bold text-xl shrink-0 border-2 border-white/40 shadow-md">
                    {guideName ? guideName.charAt(0).toUpperCase() : "G"}
                  </div>
                )}
              </div>

              {/* Editable Package Title */}
              <h3 className="text-xl font-bold pr-36 break-words leading-tight">
                {title.trim() ? title : "Your package title"}
              </h3>

              {/* Guide Name & Location */}
              <div className="mt-2 text-xs text-green-100 font-medium pr-36">
                {guideName || "Guide Name"} <span className="mx-1">•</span> {guideLocation || "Location"}
              </div>

              {/* Divider & Features */}
              <div className="mt-4 border-t border-green-500/50 pt-3">
                <ul className="text-sm space-y-1.5 text-green-50 font-medium">
                  <li>✓ {duration.trim() ? `${duration} Days` : "- Days"}</li>
                </ul>

                {/* Price Tag */}
                <div className="mt-4 bg-white/15 backdrop-blur-sm rounded-lg px-3.5 py-1.5 text-sm font-semibold inline-block border border-white/20">
                  {price.trim() ? `${price} Tk / day` : "Price / day"}
                </div>
              </div>

              {/* Included Places Breakdown */}
              {Object.keys(placesByDay).some((d) => placesByDay[d].length > 0) && (
                <div className="mt-4 pt-3 border-t border-green-500/50 text-xs text-green-50 space-y-1.5">
                  <p className="font-semibold uppercase text-[10px] text-green-200 tracking-wider">
                    Itinerary Highlights:
                  </p>
                  {Object.entries(placesByDay)
                    .sort(([a], [b]) => Number(a) - Number(b))
                    .map(([day, list]) =>
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

            {/* Description Box Preview */}
            <div className="mt-4 bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                Description
              </p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                {description.trim()
                  ? description
                  : "This preview updates in real time as the guide fills out pricing, duration, and included places."}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}