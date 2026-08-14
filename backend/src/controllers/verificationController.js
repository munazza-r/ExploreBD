const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
// Prisma 7 requires the URL to be passed directly into the constructor
const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL
});

const submitVerification = async (req, res) => {
  try {
    const { universityName, studentIdNumber, nidOrPassportNumber } = req.body;

    if (!req.files || !req.files['studentIdCard'] || !req.files['nidOrPassport']) {
      return res.status(400).json({ error: "Both Student ID and NID/Passport images are required." });
    }

    const studentIdCardUrl = req.files['studentIdCard'][0].path;
    const nidOrPassportUrl = req.files['nidOrPassport'][0].path;

    // TEMPORARY: Create a dummy user to link the verification to (until Auth is built)
    let user = await prisma.user.findFirst();
    if (!user) {
      user = await prisma.user.create({
        data: {
          name: "Dummy Guide",
          email: "guide@explorebd.com",
          password: "hashedpassword123",
          role: "GUIDE"
        }
      });
    }

    // Save the verification data to MongoDB using Prisma
    const verificationRecord = await prisma.guideVerification.create({
      data: {
        userId: user.id,
        universityName: universityName,
        studentIdNumber: studentIdNumber,
        studentIdCardUrl: studentIdCardUrl,
        nidOrPassportNumber: nidOrPassportNumber,
        nidOrPassportUrl: nidOrPassportUrl
      }
    });

    res.status(201).json({
      message: "Documents securely uploaded and saved to the database!",
      data: verificationRecord
    });

  } catch (error) {
    console.error("Database Error:", error);
    res.status(500).json({ error: "Failed to save verification documents." });
  }
};

module.exports = { submitVerification };