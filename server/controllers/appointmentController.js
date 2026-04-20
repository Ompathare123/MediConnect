const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor");
const Schedule = require("../models/Schedule");
const User = require("../models/User");
const { sendEmail } = require("../utils/emailService");
const { templates } = require("../utils/emailTemplates");

const parseDateOnly = (dateStr) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(dateStr || "").trim());
  if (!match) return null;

  const year = Number(match[1]);
  const monthIndex = Number(match[2]) - 1;
  const day = Number(match[3]);

  const parsed = new Date(year, monthIndex, day);
  if (
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== monthIndex ||
    parsed.getDate() !== day
  ) {
    return null;
  }

  parsed.setHours(0, 0, 0, 0);
  return parsed;
};

// CREATE APPOINTMENT
exports.createAppointment = async (req, res) => {
  try {
    const { 
      patientName, doctorId, doctorName, department, 
      appointmentDate, timeSlot, age, bloodGroup, symptoms, gender 
    } = req.body;
    const medicalReport = req.file ? req.file.filename : null;
    const normalizedGender = String(gender || "").trim();

    // Trust patient-self booking gender from profile fallback; avoid using admin's gender for walk-ins.
    const appointmentGender = normalizedGender || (req.user?.role === "patient" ? String(req.user.gender || "").trim() : "");

    const selectedDate = parseDateOnly(appointmentDate);
    if (!selectedDate) {
      return res.status(400).json({ message: "Invalid appointment date format." });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      return res.status(400).json({ message: "Past date booking is not allowed." });
    }

    const schedule = await Schedule.findOne({ doctorId, date: appointmentDate });
    if (!schedule) {
      return res.status(404).json({ message: "Doctor is not available on this date." });
    }

    const slot = schedule.slots.find(s => s.time === timeSlot);
    if (!slot) {
      return res.status(404).json({ message: "Selected time slot is not found." });
    }

    const existingCount = await Appointment.countDocuments({
      doctorId,
      appointmentDate,
      timeSlot,
      status: { $ne: "Cancelled" } 
    });

    if (existingCount >= slot.maxPatients) {
      return res.status(400).json({ 
        message: `This slot is fully booked. Limit of ${slot.maxPatients} patients reached.` 
      });
    }

    const appointment = new Appointment({
      user: req.user.id,
      patientName,
      doctorId,
      doctorName,
      department,
      appointmentDate,
      timeSlot,
      gender: appointmentGender,
      age,
      bloodGroup,
      symptoms,
      medicalReport 
    });

    await appointment.save();

    const [patientUser, doctorProfile] = await Promise.all([
      User.findById(appointment.user).select("name email"),
      appointment.doctorId ? Doctor.findById(appointment.doctorId).select("name email") : null
    ]);

    const patientBookingMail = templates.appointmentBookedPatient({
      patientName: patientUser?.name || appointment.patientName,
      doctorName: appointment.doctorName,
      appointmentDate: appointment.appointmentDate,
      timeSlot: appointment.timeSlot,
      department: appointment.department
    });

    const doctorBookingMail = templates.appointmentBookedDoctor({
      doctorName: doctorProfile?.name || appointment.doctorName,
      patientName: appointment.patientName,
      appointmentDate: appointment.appointmentDate,
      timeSlot: appointment.timeSlot,
      department: appointment.department
    });

    await Promise.allSettled([
      sendEmail({
        to: patientUser?.email,
        subject: "Appointment booked successfully",
        text: patientBookingMail.text,
        html: patientBookingMail.html
      }),
      sendEmail({
        to: doctorProfile?.email,
        subject: "New appointment booked",
        text: doctorBookingMail.text,
        html: doctorBookingMail.html
      })
    ]);

    res.status(201).json({ success: true, message: "Appointment booked successfully", appointment });
  } catch (error) {
    res.status(500).json({ message: "Server error during booking", error: error.message });
  }
};

// GET USER APPOINTMENTS (FIXED FOR ADMIN)
exports.getMyAppointments = async (req, res) => {
  try {
    let query = {};

    // Check role from the decoded JWT token
    if (req.user.role === "admin") {
      // ADMIN: Fetch EVERY appointment in the database for the total sum
      query = {}; 
    } else if (req.user.role === "doctor") {
      const doctorProfile = await Doctor.findOne({ userId: req.user.id });
      if (doctorProfile) {
        query = { doctorId: doctorProfile._id };
      } else {
        query = { doctorName: new RegExp(req.user.name, 'i') };
      }
    } else {
      // PATIENT: Fetch only their own
      query = { user: req.user.id };
    }

    const appointments = await Appointment.find(query).sort({ createdAt: -1 });

    // Backfill missing gender for legacy records using linked patient user profile.
    const missingGenderUserIds = [
      ...new Set(
        appointments
          .filter((apt) => !apt.gender && apt.user)
          .map((apt) => String(apt.user))
      )
    ];

    let userGenderMap = new Map();
    if (missingGenderUserIds.length > 0) {
      const users = await User.find({ _id: { $in: missingGenderUserIds }, role: "patient" })
        .select("_id gender")
        .lean();
      userGenderMap = new Map(users.map((u) => [String(u._id), String(u.gender || "").trim()]));
    }

    const enrichedAppointments = appointments.map((apt) => {
      const obj = apt.toObject();
      if (!obj.gender && obj.user) {
        obj.gender = userGenderMap.get(String(obj.user)) || "";
      }
      return obj;
    });

    res.json(enrichedAppointments);
  } catch (error) {
    console.error("Fetch Error:", error);
    res.status(500).json({ message: "Server error fetching appointments" });
  }
};

// ADD PRESCRIPTION
exports.addPrescription = async (req, res) => {
  try {
    const { medicines, advice, chiefComplaints, diagnosis, tests, followUp, allergies } = req.body;
    const { id } = req.params;
    if (req.user.role !== "doctor") return res.status(403).json({ message: "Unauthorized" });

    const appointment = await Appointment.findById(id);
    if (!appointment) return res.status(404).json({ message: "Not found" });

    if (appointment.status === "Cancelled") {
      return res.status(400).json({ message: "Cannot add prescription to cancelled appointment." });
    }

    const doctorProfile = await Doctor.findOne({ userId: req.user.id });
    if (doctorProfile && String(appointment.doctorId || "") !== String(doctorProfile._id)) {
      return res.status(403).json({ message: "You can only prescribe for your own appointments." });
    }

    if (!Array.isArray(medicines) || medicines.length === 0) {
      return res.status(400).json({ message: "At least one medicine is required." });
    }

    const normalizedChiefComplaints = String(chiefComplaints || "").trim();
    const normalizedDiagnosis = String(diagnosis || "").trim();
    if (!normalizedChiefComplaints) {
      return res.status(400).json({ message: "Chief complaints are required." });
    }
    if (!normalizedDiagnosis) {
      return res.status(400).json({ message: "Diagnosis is required." });
    }

    const normalizedMedicines = medicines
      .map((med) => ({
        name: String(med?.name || "").trim(),
        dosage: String(med?.dosage || "").trim(),
        frequency: String(med?.frequency || "").trim(),
        duration: String(med?.duration || "").trim(),
        timing: String(med?.timing || "").trim() || "After Food"
      }))
      .filter((med) => med.name || med.dosage || med.frequency || med.duration);

    if (normalizedMedicines.length === 0) {
      return res.status(400).json({ message: "Medicine details are required." });
    }

    const hasInvalidMedicine = normalizedMedicines.some((med) => !med.name || !med.dosage || !med.frequency || !med.duration || !med.timing);
    if (hasInvalidMedicine) {
      return res.status(400).json({ message: "Each medicine must include name, dosage, frequency, duration and timing." });
    }

    const normalizedAdvice = String(advice || "").trim();
    const normalizedTests = String(tests || "").trim();
    const normalizedFollowUp = String(followUp || "").trim();
    const normalizedAllergies = String(allergies || "").trim();

    if (normalizedChiefComplaints.length > 1000) {
      return res.status(400).json({ message: "Chief complaints must be 1000 characters or less." });
    }
    if (normalizedDiagnosis.length > 300) {
      return res.status(400).json({ message: "Diagnosis must be 300 characters or less." });
    }
    if (normalizedTests.length > 1000) {
      return res.status(400).json({ message: "Tests must be 1000 characters or less." });
    }
    if (normalizedAdvice.length > 1000) {
      return res.status(400).json({ message: "Advice must be 1000 characters or less." });
    }
    if (normalizedFollowUp.length > 120) {
      return res.status(400).json({ message: "Follow-up details must be 120 characters or less." });
    }
    if (normalizedAllergies.length > 300) {
      return res.status(400).json({ message: "Allergies details must be 300 characters or less." });
    }

    appointment.prescription = {
      chiefComplaints: normalizedChiefComplaints,
      diagnosis: normalizedDiagnosis,
      medicines: normalizedMedicines,
      tests: normalizedTests,
      advice: normalizedAdvice,
      followUp: normalizedFollowUp,
      allergies: normalizedAllergies,
      createdAt: new Date()
    };
    appointment.status = "Completed";
    await appointment.save();

    const patientUser = await User.findById(appointment.user).select("name email");
    const prescriptionMail = templates.prescriptionReady({
      patientName: patientUser?.name || appointment.patientName,
      doctorName: appointment.doctorName,
      appointmentDate: appointment.appointmentDate,
      timeSlot: appointment.timeSlot
    });

    await sendEmail({
      to: patientUser?.email,
      subject: "Prescription is ready",
      text: prescriptionMail.text,
      html: prescriptionMail.html
    });

    res.json({ success: true, message: "Visit completed", appointment });
  } catch (error) {
    res.status(500).json({ message: "Error saving prescription" });
  }
};

// UPDATE STATUS
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { status, cancellationNote } = req.body;
    const { id } = req.params;
    if (req.user.role !== "doctor") return res.status(403).json({ message: "Unauthorized" });

    let updateFields = { status };
    if (status === "Cancelled" && cancellationNote) {
      updateFields.cancellationNote = cancellationNote;
    }

    const appointment = await Appointment.findByIdAndUpdate(id, updateFields, { new: true });
    if (!appointment) return res.status(404).json({ message: "Not found" });

    const [patientUser, doctorProfile] = await Promise.all([
      User.findById(appointment.user).select("name email"),
      appointment.doctorId ? Doctor.findById(appointment.doctorId).select("name email") : null
    ]);

    const patientStatusMail = templates.appointmentStatusPatient({
      patientName: patientUser?.name || appointment.patientName,
      doctorName: appointment.doctorName,
      appointmentDate: appointment.appointmentDate,
      timeSlot: appointment.timeSlot,
      status: appointment.status,
      cancellationNote: appointment.cancellationNote
    });

    const doctorStatusMail = templates.appointmentStatusDoctor({
      doctorName: doctorProfile?.name || appointment.doctorName,
      patientName: appointment.patientName,
      appointmentDate: appointment.appointmentDate,
      timeSlot: appointment.timeSlot,
      status: appointment.status,
      cancellationNote: appointment.cancellationNote
    });

    await Promise.allSettled([
      sendEmail({
        to: patientUser?.email,
        subject: `Appointment status updated: ${appointment.status}`,
        text: patientStatusMail.text,
        html: patientStatusMail.html
      }),
      sendEmail({
        to: doctorProfile?.email,
        subject: `Appointment status updated: ${appointment.status}`,
        text: doctorStatusMail.text,
        html: doctorStatusMail.html
      })
    ]);

    res.json({ success: true, appointment });
  } catch (error) {
    res.status(500).json({ message: "Error updating status" });
  }
};

// DELETE APPOINTMENT
exports.deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: "Not found" });
    await appointment.deleteOne();
    res.json({ success: true, message: "Appointment deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};