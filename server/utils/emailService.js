const nodemailer = require("nodemailer");

const SMTP_HOST = process.env.SMTP_HOST || "smtp-relay.brevo.com";
const SMTP_PORT = Number(process.env.SMTP_PORT || 587);
const SMTP_SECURE = String(process.env.SMTP_SECURE || "false").toLowerCase() === "true";

const SMTP_USER = process.env.SMTP_USER || process.env.EMAIL_USER;
const SMTP_PASS = process.env.SMTP_PASS || process.env.EMAIL_PASS;
const EMAIL_FROM = process.env.EMAIL_FROM || "MediConnect <no-reply@mediconnect.app>";

let transporter;

const isEmailConfigured = () => Boolean(SMTP_USER && SMTP_PASS);

const getTransporter = () => {
  if (!isEmailConfigured()) return null;

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_SECURE,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS
      }
    });
  }

  return transporter;
};

const sendEmail = async ({ to, subject, text, html }) => {
  if (!to) {
    return { success: false, skipped: true, reason: "Recipient email is missing" };
  }

  const smtpTransport = getTransporter();
  if (!smtpTransport) {
    return { success: false, skipped: true, reason: "SMTP credentials are not configured" };
  }

  try {
    await smtpTransport.sendMail({
      from: EMAIL_FROM,
      to,
      subject,
      text,
      html
    });

    return { success: true, skipped: false };
  } catch (error) {
    console.error("Email send error:", error.message);
    return { success: false, skipped: false, reason: error.message };
  }
};

module.exports = {
  sendEmail,
  isEmailConfigured
};
