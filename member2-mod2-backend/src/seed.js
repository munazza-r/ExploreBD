require("dotenv").config();
const prisma = require("./db");

async function main() {
  await prisma.meeting.deleteMany({});
  await prisma.guideFallbackPoint.deleteMany({});

  // Sample meeting with mock suggested points already attached, so the guide
  // dashboard and tourist page both have something to show immediately -
  // without needing a real GOOGLE_MAPS_API_KEY configured.
  await prisma.meeting.create({
    data: {
      touristName: "Sarah Ahmed",
      guideName: "Muntasir Rahman",
      tourDetails: "Sundarbans day tour - 25 May, 2026",
      touristLocation: "Dhanmondi",
      guideLocation: "Mirpur 10",
      suggestedPoints: {
        points: [
          { name: "Shahbagh", distance: "5.6 km", time: "16 mins" },
          { name: "Dhaka University", distance: "6.2 km", time: "18 mins" },
          { name: "Panthapath", distance: "5.1 km", time: "15 mins" },
        ],
        midpoint: null,
      },
      approvalRequestedAt: new Date(),
      status: "Awaiting Guide Approval",
    },
  });

  // A couple of sample fallback points for the guide's profile settings
  await prisma.guideFallbackPoint.createMany({
    data: [
      { guideName: "Muntasir Rahman", area: "Dhaka", pointName: "Farmgate" },
      { guideName: "Muntasir Rahman", area: "Dhaka", pointName: "Uttara Sector 7" },
    ],
  });

  console.log("Seeded 1 sample meeting (awaiting approval) and 2 fallback points.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
