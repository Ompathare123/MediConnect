const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { verifySmtpConnection, sendEmail, getEmailDebugInfo } = require("../utils/emailService");
const { templates } = require("../utils/emailTemplates");

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
    const smtpTestMail = templates.smtpTest();
    const emailResult = await sendEmail({
      to,
      subject: "MediConnect SMTP test",
      text: smtpTestMail.text,
      html: smtpTestMail.html
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