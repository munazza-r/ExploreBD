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
    imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ-_5fKpWis8HyvrIv2Hr0B7ZCYhrjeO-1E3Y-DpQMjrg&s=10",
  },
  {
    name: "Munazza Binte Rafiq",
    location: "Cox's Bazaar",
    languages: ["English", "Bangla"],
    rating: 4.5,
    experience: 4,
    budget: 500,
    availability: "Available",
    reviewCount: 96,
    verified: true,
    imageUrl: "https://img.magnific.com/free-photo/lifestyle-business-people-holding-laptop-computer-office-desk_1150-10180.jpg?semt=ais_test_b&w=740&q=80",
  },
  {
    name: "Asif Al Mahfuz",
    location: "Sylhet, Bangladesh",
    languages: ["English", "Bangla", "Hindi"],
    rating: 4.7,
    experience: 5,
    budget: 550,
    availability: "Available",
    reviewCount: 74,
    verified: true,
    imageUrl: "https://static.vecteezy.com/system/resources/thumbnails/075/014/694/small/portrait-of-a-smiling-man-in-a-blue-shirt-standing-near-a-window-in-an-office-setting-with-natural-light-free-photo.jpg",
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
