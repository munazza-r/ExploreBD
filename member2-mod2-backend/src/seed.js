require("dotenv").config();
const prisma = require("./db");

async function main() {
  await prisma.meeting.deleteMany({});
  await prisma.meeting.create({
    data: {
      touristName: "Sarah Ahmed",
      guideName: "Muntasir Rahman",
      tourDetails: "Sundarbans day tour - 25 May, 2026",
      touristLocation: "Dhanmondi",
      guideLocation: "Mirpur 10",
    },
  });
  console.log("Seeded 1 sample meeting successfully.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
