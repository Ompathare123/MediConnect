const WEBSITE_URL = process.env.WEBSITE_URL || "https://medi-connect-k1cv.vercel.app/";

const escapeHtml = (value) =>
  String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");

const buildEmail = ({ title, greeting, intro, details = [], actionLabel = "Open MediConnect" }) => {
  const safeTitle = escapeHtml(title);
  const safeGreeting = escapeHtml(greeting);
  const safeIntro = escapeHtml(intro);
  const safeDetails = details.filter(Boolean).map((item) => escapeHtml(item));

  const htmlDetails = safeDetails
    .map((item) => `<li style="margin: 0 0 8px;">${item}</li>`)
    .join("");

  const html = `
    <div style="margin:0;padding:24px;background:#f5f7fb;font-family:Segoe UI,Arial,sans-serif;color:#0f172a;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;">
        <tr>
          <td style="padding:20px 24px;background:#0b5fff;color:#ffffff;font-size:22px;font-weight:700;">MediConnect</td>
        </tr>
        <tr>
          <td style="padding:24px;">
            <h1 style="margin:0 0 14px;font-size:24px;line-height:1.3;color:#0f172a;">${safeTitle}</h1>
            <p style="margin:0 0 12px;font-size:16px;line-height:1.6;">${safeGreeting}</p>
            <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#334155;">${safeIntro}</p>
            ${safeDetails.length > 0 ? `<ul style="margin:0 0 18px 18px;padding:0;font-size:14px;line-height:1.5;color:#334155;">${htmlDetails}</ul>` : ""}
            <a href="${WEBSITE_URL}" style="display:inline-block;background:#0b5fff;color:#ffffff;text-decoration:none;padding:12px 18px;border-radius:8px;font-weight:600;">${escapeHtml(actionLabel)}</a>
            <p style="margin:16px 0 0;font-size:13px;color:#64748b;line-height:1.5;">You can also open: <a href="${WEBSITE_URL}" style="color:#0b5fff;text-decoration:none;">${escapeHtml(WEBSITE_URL)}</a></p>
          </td>
        </tr>
      </table>
    </div>
  `;

  const textParts = [
    title,
    "",
    greeting,
    intro,
    safeDetails.length ? "" : null,
    ...safeDetails.map((item) => `- ${item}`),
    "",
    `${actionLabel}: ${WEBSITE_URL}`,
    `Website: ${WEBSITE_URL}`
  ].filter((line) => line !== null && line !== undefined);

  return {
    html,
    text: textParts.join("\n")
  };
};

const templates = {
  welcomePatient: ({ name }) =>
    buildEmail({
      title: "Welcome to MediConnect",
      greeting: `Hi ${name || "there"},`,
      intro: "Your account is ready. You can now book appointments, manage your visits, and view prescriptions online.",
      details: ["Book appointments in minutes", "Track status updates in your dashboard", "Access your prescriptions anytime"],
      actionLabel: "Go to MediConnect"
    }),

  doctorOnboarding: ({ firstName, lastName, email, password }) =>
    buildEmail({
      title: "Your Doctor Account Is Ready",
      greeting: `Hello Dr. ${[firstName, lastName].filter(Boolean).join(" ") || "Doctor"},`,
      intro: "Your MediConnect doctor account has been created successfully.",
      details: [
        `Login Email: ${email}`,
        `Temporary Password: ${password}`,
        "Please sign in and change your password immediately."
      ],
      actionLabel: "Sign In to MediConnect"
    }),

  appointmentBookedPatient: ({ patientName, doctorName, appointmentDate, timeSlot, department }) =>
    buildEmail({
      title: "Appointment Confirmed",
      greeting: `Hi ${patientName || "there"},`,
      intro: "Your appointment has been booked successfully.",
      details: [
        `Doctor: Dr. ${doctorName}`,
        `Department: ${department}`,
        `Date: ${appointmentDate}`,
        `Time: ${timeSlot}`
      ],
      actionLabel: "View My Appointments"
    }),

  appointmentBookedDoctor: ({ doctorName, patientName, appointmentDate, timeSlot, department }) =>
    buildEmail({
      title: "New Appointment Booked",
      greeting: `Hello Dr. ${doctorName || "Doctor"},`,
      intro: "A new appointment has been booked on your schedule.",
      details: [
        `Patient: ${patientName}`,
        `Department: ${department}`,
        `Date: ${appointmentDate}`,
        `Time: ${timeSlot}`
      ],
      actionLabel: "Open Doctor Dashboard"
    }),

  prescriptionReady: ({ patientName, doctorName, appointmentDate, timeSlot }) =>
    buildEmail({
      title: "Prescription Is Ready",
      greeting: `Hi ${patientName || "there"},`,
      intro: "Your doctor has completed your consultation and your prescription is now available.",
      details: [
        `Doctor: Dr. ${doctorName}`,
        `Appointment Date: ${appointmentDate}`,
        `Time: ${timeSlot}`
      ],
      actionLabel: "View Prescription"
    }),

  appointmentStatusPatient: ({ patientName, doctorName, appointmentDate, timeSlot, status, cancellationNote }) =>
    buildEmail({
      title: `Appointment Status: ${status}`,
      greeting: `Hi ${patientName || "there"},`,
      intro: "Your appointment status has been updated.",
      details: [
        `Doctor: Dr. ${doctorName}`,
        `Date: ${appointmentDate}`,
        `Time: ${timeSlot}`,
        `Current Status: ${status}`,
        cancellationNote ? `Reason: ${cancellationNote}` : ""
      ],
      actionLabel: "Check Appointment Status"
    }),

  appointmentStatusDoctor: ({ doctorName, patientName, appointmentDate, timeSlot, status, cancellationNote }) =>
    buildEmail({
      title: `Appointment Status: ${status}`,
      greeting: `Hello Dr. ${doctorName || "Doctor"},`,
      intro: "An appointment status on your schedule has been updated.",
      details: [
        `Patient: ${patientName}`,
        `Date: ${appointmentDate}`,
        `Time: ${timeSlot}`,
        `Current Status: ${status}`,
        cancellationNote ? `Reason: ${cancellationNote}` : ""
      ],
      actionLabel: "Open Doctor Dashboard"
    }),

  smtpTest: () =>
    buildEmail({
      title: "SMTP Test Successful",
      greeting: "Hi,",
      intro: "If you received this email, your Brevo SMTP configuration is working correctly.",
      details: ["This is a system test email from MediConnect."],
      actionLabel: "Open MediConnect"
    })
};

module.exports = {
  templates,
  WEBSITE_URL
};
