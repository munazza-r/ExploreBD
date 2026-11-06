const prisma = require("../prisma");

// Fallback mock guides — only used if no REAL guides in the database match the
// requested destination yet. Keeps the demo working even before real guides
// have set up profiles for every city.
const MOCK_GUIDES = [
  { name: "Abrar Rahman", university: "Sylhet Agricultural University", rating: 4.9, reviews: 52, languages: ["Bengali", "English"], tags: ["Nature tours"], pricePerDay: 1200, location: "Sylhet" },
  { name: "Arisha Tabassum", university: "Shahjalal University", rating: 4.8, reviews: 37, languages: ["Bengali", "Hindi"], tags: ["Photography"], pricePerDay: 1000, location: "Sylhet" },
  { name: "Farhana Islam", university: "Cox's Bazar", rating: 4.5, reviews: 96, languages: ["Bengali", "English"], tags: ["Food", "Village"], pricePerDay: 800, location: "Cox's Bazar" },
  { name: "Rafiul Islam", university: "Chittagong University", rating: 4.7, reviews: 44, languages: ["Bengali", "English"], tags: ["Adventure", "Food"], pricePerDay: 900, location: "Chittagong" },
  { name: "Nusrat Jahan", university: "University of Chittagong", rating: 4.6, reviews: 58, languages: ["Bengali"], tags: ["Food", "History"], pricePerDay: 700, location: "Chittagong" },
  { name: "Proshanto Chakma", university: "Rangamati Science and Technology University", rating: 4.8, reviews: 29, languages: ["Bengali", "English"], tags: ["Nature", "Village"], pricePerDay: 850, location: "Rangamati" },
  { name: "Mitu Tanchangya", university: "Rangamati Government College", rating: 4.6, reviews: 21, languages: ["Bengali"], tags: ["Village", "Adventure"], pricePerDay: 650, location: "Rangamati" },
  { name: "Shahriar Kabir", university: "Chittagong University of Engineering & Technology", rating: 4.9, reviews: 33, languages: ["Bengali", "English"], tags: ["Adventure", "Nature"], pricePerDay: 1100, location: "Bandarban" },
  { name: "Ushai Marma", university: "Bandarban Government College", rating: 4.7, reviews: 19, languages: ["Bengali", "Marma"], tags: ["Nature", "Village"], pricePerDay: 750, location: "Bandarban" },
  { name: "Tanvir Ahmed", university: "University of Rajshahi", rating: 4.8, reviews: 41, languages: ["Bengali", "English"], tags: ["History", "Photography"], pricePerDay: 950, location: "Rajshahi" },
  { name: "Shirin Akter", university: "Rajshahi College", rating: 4.5, reviews: 27, languages: ["Bengali"], tags: ["Village", "History"], pricePerDay: 700, location: "Rajshahi" },
  { name: "Imran Hossain", university: "Varendra University", rating: 4.7, reviews: 24, languages: ["Bengali", "English"], tags: ["History"], pricePerDay: 800, location: "Paharpur" },
  { name: "Ayesha Siddika", university: "Naogaon Government College", rating: 4.4, reviews: 16, languages: ["Bengali"], tags: ["History", "Photography"], pricePerDay: 600, location: "Paharpur" },
  { name: "Rakibul Hasan", university: "University of Dhaka", rating: 4.8, reviews: 48, languages: ["Bengali", "English"], tags: ["History", "Photography"], pricePerDay: 1000, location: "Sonargaon" },
  { name: "Nazia Rahman", university: "Narayanganj Government College", rating: 4.6, reviews: 22, languages: ["Bengali"], tags: ["History"], pricePerDay: 700, location: "Sonargaon" },
  { name: "Sabbir Ahmed", university: "University of Dhaka", rating: 4.9, reviews: 87, languages: ["Bengali", "English", "Hindi"], tags: ["History", "Food"], pricePerDay: 1300, location: "Dhaka" },
  { name: "Rumana Karim", university: "Dhaka College", rating: 4.6, reviews: 39, languages: ["Bengali"], tags: ["Food", "Photography"], pricePerDay: 800, location: "Dhaka" },
  { name: "Jahidul Islam", university: "Patuakhali Science and Technology University", rating: 4.7, reviews: 25, languages: ["Bengali", "English"], tags: ["Nature", "Adventure"], pricePerDay: 900, location: "Kuakata" },
  { name: "Moushumi Begum", university: "Patuakhali Government College", rating: 4.5, reviews: 18, languages: ["Bengali"], tags: ["Village", "Nature"], pricePerDay: 650, location: "Kuakata" },
];

const MOCK_ATTRACTIONS = {
  Sylhet: [
    { time: "9:00 AM", name: "Ratargul Swamp Forest", desc: "Boat ride through the green forest, best sunlight during the early hours of morning." },
    { time: "2:00 PM", name: "Jaflong Zero Point", desc: "Mesmerizing riverside stones and hills along the border." },
    { time: "10:00 AM", name: "Lalakhal Boat Ride", desc: "Emerald-green and turquoise waters of the Sharee River originating from India's Meghalaya hills." },
  ],
  "Cox's Bazar": [
    { time: "6:00 AM", name: "Laboni Beach Sunrise", desc: "Watch the sunrise over the world's longest natural sea beach." },
    { time: "11:00 AM", name: "Himchari National Park", desc: "Waterfalls and hilltop viewpoints overlooking the Bay of Bengal." },
    { time: "4:00 PM", name: "Inani Beach", desc: "Quieter stretch of coastline with coral rock formations." },
  ],
  Chittagong: [
    { time: "5:30 PM", name: "Patenga Beach", desc: "Watch the sunset where the Karnaphuli River meets the Bay of Bengal." },
    { time: "10:00 AM", name: "Foy's Lake", desc: "Hilltop lake with an amusement park, popular for boating and views." },
    { time: "2:00 PM", name: "Ethnological Museum", desc: "Explore the culture and heritage of the Chittagong Hill Tracts' tribal communities." },
  ],
  Rangamati: [
    { time: "9:00 AM", name: "Kaptai Lake Boat Ride", desc: "Glide across Bangladesh's largest man-made lake, surrounded by hills." },
    { time: "1:00 PM", name: "Jhulonto Shetu (Hanging Bridge)", desc: "Iconic 335-foot suspension bridge over the lake, a symbol of Rangamati." },
    { time: "4:00 PM", name: "Shuvolong Waterfall", desc: "One of the region's largest waterfalls, reachable by boat." },
  ],
  Bandarban: [
    { time: "7:00 AM", name: "Nilgiri Hill", desc: "Sunrise above the clouds from one of Bangladesh's highest viewpoints." },
    { time: "11:00 AM", name: "Buddha Dhatu Jadi (Golden Temple)", desc: "The largest Buddhist temple in Bangladesh, housing sacred relics." },
    { time: "3:00 PM", name: "Chimbuk Hill", desc: "Panoramic hill-tract views and nearby indigenous villages." },
  ],
  Rajshahi: [
    { time: "9:00 AM", name: "Bagha Mosque", desc: "16th-century terracotta mosque, a masterpiece of Sultanate-era architecture." },
    { time: "12:00 PM", name: "Varendra Museum", desc: "Bangladesh's oldest museum, housing ancient sculptures and artifacts." },
    { time: "3:30 PM", name: "Puthia Temple Complex", desc: "Largest cluster of historic Hindu temples in the Bengal region." },
  ],
  Paharpur: [
    { time: "9:00 AM", name: "Somapura Mahavihara", desc: "UNESCO World Heritage 8th-century Buddhist monastery ruins, one of the largest south of the Himalayas." },
    { time: "12:30 PM", name: "Paharpur Museum", desc: "Terracotta plaques and artifacts excavated from the site." },
    { time: "3:00 PM", name: "Satyapir Bhita Ruins", desc: "Smaller nearby ruins tied to local folklore and legend." },
  ],
  Sonargaon: [
    { time: "9:00 AM", name: "Panam City", desc: "Row of preserved 19th-century merchant mansions from the old capital of Bengal." },
    { time: "12:00 PM", name: "Folk Art and Crafts Museum", desc: "Traditional Bengali art, crafts, and rural heritage exhibits." },
    { time: "2:30 PM", name: "Goaldi Mosque", desc: "Early 16th-century mosque, one of the oldest in the region." },
  ],
  Dhaka: [
    { time: "9:00 AM", name: "Lalbagh Fort", desc: "Unfinished 17th-century Mughal fort complex in the heart of Old Dhaka." },
    { time: "12:00 PM", name: "Ahsan Manzil", desc: "The pink Nawab's palace, now a museum on the Buriganga riverbank." },
    { time: "4:00 PM", name: "Sadarghat", desc: "Bustling river terminal on the Buriganga, alive with launches and river life." },
  ],
  Kuakata: [
    { time: "6:00 AM", name: "Kuakata Sea Beach", desc: "The rare beach where both sunrise and sunset can be seen over the water." },
    { time: "11:00 AM", name: "Rakhine Village", desc: "Visit local Rakhine communities and their distinct culture and weaving." },
    { time: "3:00 PM", name: "Fatrar Char", desc: "Mangrove forest and char land, a quieter nature escape near the coast." },
  ],
  default: [
    { time: "9:00 AM", name: "Local heritage site", desc: "Start the day exploring the area's most iconic landmark." },
    { time: "1:00 PM", name: "Local food tour", desc: "Sample authentic regional cuisine with your guide." },
    { time: "4:00 PM", name: "Scenic viewpoint", desc: "Wind down with a relaxed evening at a scenic spot." },
  ],
};

function buildMockItinerary(destination, tripLength) {
  const pool = MOCK_ATTRACTIONS[destination] || MOCK_ATTRACTIONS.default;
  const days = [];
  for (let day = 1; day <= tripLength; day++) {
    const stop = pool[(day - 1) % pool.length];
    days.push({ day, stops: [stop] });
  }
  return days;
}

// Now checks the REAL Guide table first (Phase 2), falling back to the mock
// pool only if no real guides match this destination yet.
async function recommendGuides(interests, budget, destination) {
  const realGuides = await prisma.guide.findMany({
    where: {
      isPublic: true,
      location: { contains: destination, mode: "insensitive" },
    },
  });

  const usingReal = realGuides.length > 0;
  const pool = usingReal
    ? realGuides.map((g) => ({
        name: g.name,
        university: "", // real Guide model doesn't track university - GuideVerification does
        rating: g.rating,
        reviews: g.reviewCount,
        languages: g.languages,
        tags: g.specialties,
        pricePerDay: g.budget,
        location: g.location,
      }))
    : (destination ? MOCK_GUIDES.filter((g) => g.location === destination) : MOCK_GUIDES).length > 0
    ? MOCK_GUIDES.filter((g) => g.location === destination)
    : MOCK_GUIDES;

  return pool
    .map((g) => {
      const overlap = g.tags.filter((t) => interests.includes(t)).length;
      const matchScore = Math.min(99, 60 + overlap * 15 + (g.pricePerDay <= budget ? 10 : 0));
      return { ...g, matchPercent: matchScore };
    })
    .sort((a, b) => b.matchPercent - a.matchPercent)
    .slice(0, 2);
}

async function generateWithGemini(destination, tripLength, budget, interests) {
    const apiKey = process.env.GEMINI_API_KEY;
    const prompt = `Create a ${tripLength}-day travel itinerary for ${destination}, Bangladesh, for a tourist interested in ${interests.join(", ")}, with a budget of ${budget} taka per day. Return ONLY valid JSON: an array of {day, stops: [{time, name, desc}]}. No explanation, just JSON.`;
  
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      }
    );
  
    const data = await res.json();
  
    if (!res.ok) {
      throw new Error(`Gemini API error (${res.status}): ${data?.error?.message || "unknown error"}`);
    }
  
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    if (!text) {
      throw new Error("Gemini returned an empty response (possibly blocked by safety filters)");
    }
  
    const cleaned = text.replace(/```json|```/g, "").trim();
    return JSON.parse(cleaned);
  }

// POST /api/itinerary/generate
async function generateItinerary(req, res) {
  try {
    const { destination, tripLength, budget, interests } = req.body;

    if (!destination || !tripLength || !budget || !interests?.length) {
      return res.status(400).json({ error: "destination, tripLength, budget, and interests are all required" });
    }

    let itinerary;
    try {
      if (process.env.GEMINI_API_KEY) {
        itinerary = await generateWithGemini(destination, tripLength, budget, interests);
      } else {
        itinerary = buildMockItinerary(destination, tripLength);
      }
    } catch (aiErr) {
      console.warn("Gemini call failed, falling back to mock itinerary:", aiErr.message);
      itinerary = buildMockItinerary(destination, tripLength);
    }

    const guides = await recommendGuides(interests, budget, destination);

    const saved = await prisma.itineraryRequest.create({
      data: { destination, tripLength, budget, interests, itinerary, guides },
    });

    res.status(201).json(saved);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong while generating the itinerary" });
  }
}

module.exports = { generateItinerary };