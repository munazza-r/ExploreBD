require("dotenv").config();
const prisma = require("./db");

const samplePayments = [
  {
    touristName: "Sarah Ahmed",
    guideName: "Muntasir Rahman",
    tourDetails: "Sundarbans Day Tour - 25 May, 2026",
    totalAmount: 3200,
    commissionPercent: 15,
    status: "IN_ESCROW",
  },
  {
    touristName: "Sarah Ahmed",
    guideName: "Farhana Islam",
    tourDetails: "Cox's Bazar Adventure - 3 June, 2026",
    totalAmount: 2800,
    commissionPercent: 15,
    status: "IN_ESCROW",
  },
  {
    touristName: "Sarah Ahmed",
    guideName: "Rafid Hasan",
    tourDetails: "Sylhet Tea Garden Tour - 15 June, 2026",
    totalAmount: 1800,
    commissionPercent: 15,
    status: "IN_ESCROW",
  },
  {
    touristName: "Rafid Hasan",
    guideName: "Muntasir Rahman",
    tourDetails: "Cox's Bazar Adventure - 10 May, 2026",
    totalAmount: 2500,
    commissionPercent: 15,
    commissionAmount: 375,
    payoutAmount: 2125,
    status: "RELEASED",
    completedAt: new Date("2026-05-11"),
  },
  {
    touristName: "Sarah Ahmed",
    guideName: "Muntasir Rahman",
    tourDetails: "Bandarban Hill Trek - 20 June, 2026",
    totalAmount: 2200,
    commissionPercent: 15,
    status: "IN_ESCROW",
  },
];

async function main() {
  await prisma.payment.deleteMany({});
  await prisma.payment.createMany({ data: samplePayments });
  console.log("Seeded", samplePayments.length, "payments successfully.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
