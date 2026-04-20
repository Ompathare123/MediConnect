const nodemailer = require("nodemailer");

let transporter = null;
let transporterKey = "";

const getSmtpConfig = () => {
  const host = process.env.SMTP_HOST || "smtp-relay.brevo.com";
  const port = Number(process.env.SMTP_PORT || 587);
  const secure = String(process.env.SMTP_SECURE || "false").toLowerCase() === "true";
  const user = process.env.SMTP_USER || process.env.EMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS;
  const from = process.env.EMAIL_FROM || "MediConnect <no-reply@mediconnect.app>";

  return { host, port, secure, user, pass, from };
};

const isEmailConfigured = () => {
  const { user, pass } = getSmtpConfig();
  return Boolean(user && pass);
};

const getTransporter = () => {
  const { host, port, secure, user, pass } = getSmtpConfig();
  if (!user || !pass) return null;

  const nextKey = `${host}:${port}:${secure}:${user}`;

  if (!transporter || transporterKey !== nextKey) {
    transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user,
        pass
      }
    });
    transporterKey = nextKey;
  }

  return transporter;
};

const getEmailDebugInfo = () => {
  const { host, port, secure, user, from } = getSmtpConfig();
  return {
    host,
    port,
    secure,
    from,
    hasUser: Boolean(user),
    hasPass: Boolean(process.env.SMTP_PASS || process.env.EMAIL_PASS),
    userPreview: user ? `${String(user).slice(0, 3)}***` : null
  };
};

const verifySmtpConnection = async () => {
  const smtpTransport = getTransporter();
  if (!smtpTransport) {
    return {
      success: false,
      reason: "SMTP credentials are not configured",
      debug: getEmailDebugInfo()
    };
  }

  try {
    await smtpTransport.verify();
    return { success: true, debug: getEmailDebugInfo() };
  } catch (error) {
    return {
      success: false,
      reason: error.message,
      debug: getEmailDebugInfo()
    };
  }
};

const sendEmail = async ({ to, subject, text, html }) => {
  const { from } = getSmtpConfig();

  if (!to) {
    return { success: false, skipped: true, reason: "Recipient email is missing" };
  }

  const smtpTransport = getTransporter();
  if (!smtpTransport) {
    return { success: false, skipped: true, reason: "SMTP credentials are not configured" };
  }

  try {
    await smtpTransport.sendMail({
      from,
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
  isEmailConfigured,
  verifySmtpConnection,
  getEmailDebugInfo
};
