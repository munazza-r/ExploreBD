const prisma = require("../prisma");
const {
  sendVerificationReceivedEmail,
  sendVerificationResultEmail,
} = require("../services/emailService");

// POST /api/verification/submit - a logged-in guide submits their documents
// (email/userId come from the authenticated session now, not the request body)
const submitVerification = async (req, res) => {
  try {
    const { universityName, studentIdNumber, nidOrPassportNumber } = req.body;

    if (!/^\d{8}$/.test(studentIdNumber)) {
      return res.status(400).json({ error: "Student ID must be exactly 8 digits." });
    }
    if (!/^\d{12}$/.test(nidOrPassportNumber)) {
      return res.status(400).json({ error: "NID must be exactly 12 digits." });
    }
    if (!req.files || !req.files["studentIdCard"] || !req.files["nidOrPassport"]) {
      return res.status(400).json({ error: "Both Student ID and NID/Passport images are required." });
    }

    const studentIdCardUrl = req.files["studentIdCard"][0].filename;
    const nidOrPassportUrl = req.files["nidOrPassport"][0].filename;

    const verificationRecord = await prisma.guideVerification.upsert({
      where: { userId: req.user.id },
      update: {
        universityName, studentIdNumber, studentIdCardUrl, nidOrPassportNumber, nidOrPassportUrl,
        status: "PENDING", rejectionReason: null, submittedAt: new Date(), reviewedAt: null,
      },
      create: {
        userId: req.user.id,
        email: req.user.email,
        universityName, studentIdNumber, studentIdCardUrl, nidOrPassportNumber, nidOrPassportUrl,
      },
    });

    sendVerificationReceivedEmail(req.user.email, universityName);

    res.status(201).json({
      message: "Documents securely uploaded and saved to the database!",
      data: verificationRecord,
    });
  } catch (error) {
    console.error("Database Error:", error);
    res.status(500).json({ error: "Failed to save verification documents." });
  }
};

// GET /api/verification/all - admin only
const getAllVerifications = async (req, res) => {
  try {
    const records = await prisma.guideVerification.findMany({ orderBy: { submittedAt: "desc" } });
    res.status(200).json({ data: records });
  } catch (error) {
    console.error("Database Error:", error);
    res.status(500).json({ error: "Failed to fetch verification requests." });
  }
};

// PATCH /api/verification/:id/status - admin approves/rejects
const updateVerificationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rejectionReason } = req.body;

    if (!["PENDING", "APPROVED", "REJECTED"].includes(status)) {
      return res.status(400).json({ error: "Invalid status value." });
    }

    const updated = await prisma.guideVerification.update({
      where: { id },
      data: {
        status,
        rejectionReason: status === "REJECTED" ? (rejectionReason || "Not specified") : null,
        reviewedAt: new Date(),
      },
    });

    // If approved, also mark the linked Guide record as verified so it shows up in search
    if (status === "APPROVED") {
      await prisma.guide.updateMany({
        where: { userId: updated.userId },
        data: { verified: true },
      });
    }

    if (status === "APPROVED" || status === "REJECTED") {
      sendVerificationResultEmail(updated.email, status, updated.rejectionReason);
    }

    res.status(200).json({ message: "Status updated.", data: updated });
  } catch (error) {
    console.error("Database Error:", error);
    res.status(500).json({ error: "Failed to update status." });
  }
};

// GET /api/verification/me - the logged-in guide checks their own status
const getMyVerificationStatus = async (req, res) => {
  try {
    const record = await prisma.guideVerification.findUnique({ where: { userId: req.user.id } });
    if (!record) return res.status(404).json({ error: "No verification submitted yet." });
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
  getMyVerificationStatus,
};
