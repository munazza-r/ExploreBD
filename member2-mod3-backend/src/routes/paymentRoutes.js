const express = require("express");
const router = express.Router();
const {
  getCustomerPayments, getGuideEarnings, releasePayment, getAllPayments,
} = require("../controllers/paymentController");

router.get("/", getAllPayments);
router.get("/customer/:touristName", getCustomerPayments);
router.get("/guide/:guideName", getGuideEarnings);
router.post("/:id/release", releasePayment);

module.exports = router;
