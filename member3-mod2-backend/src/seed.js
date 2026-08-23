require("dotenv").config();
const prisma = require("./db");

async function main() {
  await prisma.message.deleteMany({});
  await prisma.message.createMany({
    data: [
      { conversationId: "demo-1", senderName: "Sarah Ahmed", senderRole: "TOURIST", content: "Hi! Looking forward to the Sundarbans tour." },
      { conversationId: "demo-1", senderName: "Muntasir Rahman", senderRole: "GUIDE", content: "Welcome! I'll meet you at Shahbagh at 9 AM." },
    ],
  });
  console.log("Seeded sample conversation successfully.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
