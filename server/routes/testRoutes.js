const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { verifySmtpConnection, sendEmail, getEmailDebugInfo } = require("../utils/emailService");

console.log("Test Routes Loaded");

// Protected test route
router.get("/protected", protect, (req, res) => {
  res.json({
    message: "You are authorized!",
    user: req.user,
  });
});
router.get("/ping", (req, res) => {
  res.send("Ping working");
});

router.get("/email/status", async (req, res) => {
  const result = await verifySmtpConnection();
  const statusCode = result.success ? 200 : 400;
  res.status(statusCode).json(result);
});

router.post("/email/send", async (req, res) => {
  try {
    const { to } = req.body || {};
    const emailResult = await sendEmail({
      to,
      subject: "MediConnect SMTP test",
      text: "If you received this email, Brevo SMTP is configured correctly."
    });

    if (!emailResult.success) {
      return res.status(400).json({ success: false, emailResult, debug: getEmailDebugInfo() });
    }

    return res.status(200).json({ success: true, emailResult });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;