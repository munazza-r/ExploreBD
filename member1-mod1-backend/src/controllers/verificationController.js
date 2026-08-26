const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const submitVerification = async (req, res) => {
  try {
    const { universityName, studentIdNumber, nidOrPassportNumber } = req.body;

    if (!/^\d{8}$/.test(studentIdNumber)) {
      return res.status(400).json({ error: "Student ID must be exactly 8 digits." });
    }

    if (!/^\d{12}$/.test(nidOrPassportNumber)) {
      return res.status(400).json({ error: "NID must be exactly 12 digits." });
    }

    if (!req.files || !req.files['studentIdCard'] || !req.files['nidOrPassport']) {
      return res.status(400).json({ error: "Both Student ID and NID/Passport images are required." });
    }


    // Store just the filename, not the full absolute path
    const studentIdCardUrl = req.files['studentIdCard'][0].filename;
    const nidOrPassportUrl = req.files['nidOrPassport'][0].filename;

    const verificationRecord = await prisma.guideVerification.create({
      data: {
        universityName,
        studentIdNumber,
        studentIdCardUrl,
        nidOrPassportNumber,
        nidOrPassportUrl
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

// Admin: get all verification requests (for the dashboard table)
const getAllVerifications = async (req, res) => {
  try {
    const records = await prisma.guideVerification.findMany({
      orderBy: { submittedAt: 'desc' }
    });
    res.status(200).json({ data: records });
  } catch (error) {
    console.error("Database Error:", error);
    res.status(500).json({ error: "Failed to fetch verification requests." });
  }
};

// Admin: approve or reject a specific request
const updateVerificationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rejectionReason } = req.body; // status: "APPROVED" | "REJECTED" | "PENDING"

    if (!["PENDING", "APPROVED", "REJECTED"].includes(status)) {
      return res.status(400).json({ error: "Invalid status value." });
    }

    const updated = await prisma.guideVerification.update({
      where: { id },
      data: {
        status,
        rejectionReason: status === "REJECTED" ? (rejectionReason || "Not specified") : null,
        reviewedAt: new Date()
      }
    });

    res.status(200).json({ message: "Status updated.", data: updated });
  } catch (error) {
    console.error("Database Error:", error);
    res.status(500).json({ error: "Failed to update status." });
  }
};

// User: check status of their own submitted request (for polling)
const getVerificationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const record = await prisma.guideVerification.findUnique({ where: { id } });
    if (!record) return res.status(404).json({ error: "Record not found." });
    res.status(200).json({ data: record });
  } catch (error) {
    console.error("Database Error:", error);
    res.status(500).json({ error: "Failed to fetch status." });
  }
};

module.exports = {
  submitVerification,
  getAllVerifications,
  updateVerificationStatus,
  getVerificationStatus
};