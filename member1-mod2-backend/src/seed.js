require("dotenv").config();
const prisma = require("./db");

const sampleBookings = [
  {
    touristName: "Sarah Ahmed",
    guideName: "Muntasir Rahman",
    packageName: "Sundarbans Day Tour",
    date: new Date("2026-09-10"),
    time: "9:00 AM",
    status: "CONFIRMED",
  },
  {
    touristName: "Rafid Hasan",
    guideName: "Farhana Islam",
    packageName: "Cox's Bazar Adventure",
    date: new Date("2026-09-15"),
    time: "7:30 AM",
    status: "PENDING",
  },
];

async function main() {
  await prisma.booking.deleteMany({});
  await prisma.booking.createMany({ data: sampleBookings });
  console.log("Seeded", sampleBookings.length, "bookings successfully.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
