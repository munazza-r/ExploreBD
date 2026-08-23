const prisma = require("../db");

// A small mock dataset of guides used for the recommendation logic.
// In a full merge, this would instead query the real Guide collection from Module 1.
const MOCK_GUIDES = [
  { name: "Abrar Rahman", university: "Sylhet Agricultural University", rating: 4.9, reviews: 52, languages: ["Bengali", "English"], tags: ["Nature tours"], pricePerDay: 1200 },
  { name: "Arisha Tabassum", university: "Shahjalal University", rating: 4.8, reviews: 37, languages: ["Bengali", "Hindi"], tags: ["Photography"], pricePerDay: 1000 },
  { name: "Farhana Islam", university: "Cox's Bazar", rating: 4.5, reviews: 96, languages: ["Bengali", "English"], tags: ["Food", "Village"], pricePerDay: 800 },
];

// A small mock dataset of attractions per destination, used when no Gemini API key is set.
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

function recommendGuides(interests, budget) {
  return MOCK_GUIDES
    .map((g) => {
      const overlap = g.tags.filter((t) => interests.includes(t)).length;
      const matchScore = Math.min(99, 60 + overlap * 15 + (g.pricePerDay <= budget ? 10 : 0));
      return { ...g, matchPercent: matchScore };
    })
    .sort((a, b) => b.matchPercent - a.matchPercent)
    .slice(0, 2);
}

// Optional real AI integration: calls Google Gemini if GEMINI_API_KEY is set
async function generateWithGemini(destination, tripLength, budget, interests) {
  const apiKey = process.env.GEMINI_API_KEY;
  const prompt = `Create a ${tripLength}-day travel itinerary for ${destination}, Bangladesh, for a tourist interested in ${interests.join(", ")}, with a budget of ${budget} taka per day. Return ONLY valid JSON: an array of {day, stops: [{time, name, desc}]}. No explanation, just JSON.`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    }
  );

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
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

    const guides = recommendGuides(interests, budget);

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
