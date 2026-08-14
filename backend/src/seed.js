// Run with: npm run seed
// Populates the database with sample guides so the search/filter UI has data to show.
require("dotenv").config();
const prisma = require("./db");

const sampleGuides = [
  {
    name: "Muntasir Rahman",
    location: "Dhaka, Bangladesh",
    languages: ["English", "Bangla", "French"],
    rating: 4.9,
    experience: 8,
    budget: 650,
    availability: "Available",
    reviewCount: 128,
    verified: true,
    imageUrl: "https://i.pravatar.cc/300?img=12",
  },
  {
    name: "Farhana Islam",
    location: "Cox's Bazaar",
    languages: ["English", "Bangla"],
    rating: 4.5,
    experience: 4,
    budget: 500,
    availability: "Available",
    reviewCount: 96,
    verified: true,
    imageUrl: "https://i.pravatar.cc/300?img=19",
  },
  {
    name: "Rafid Hasan",
    location: "Sylhet, Bangladesh",
    languages: ["English", "Bangla", "Hindi"],
    rating: 4.7,
    experience: 5,
    budget: 550,
    availability: "Available",
    reviewCount: 74,
    verified: true,
    imageUrl: "https://i.pravatar.cc/300?img=25",
  },
];

async function main() {
  await prisma.guide.deleteMany({}); // clear old data first (safe for dev/testing only)
  await prisma.guide.createMany({ data: sampleGuides });
  console.log("Seeded", sampleGuides.length, "guides successfully.");
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
