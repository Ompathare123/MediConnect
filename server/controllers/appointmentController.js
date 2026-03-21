const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor");

// CREATE APPOINTMENT
exports.createAppointment = async (req, res) => {
  try {
    const { patientName, doctorId, doctorName, department, appointmentDate, timeSlot, age, bloodGroup, symptoms } = req.body;
    const medicalReport = req.file ? req.file.filename : null;

    const appointment = new Appointment({
      user: req.user.id,
      patientName,
      doctorId,
      doctorName,
      department,
      appointmentDate,
      timeSlot,
      age,
      bloodGroup,
      symptoms,
      medicalReport 
    });

    await appointment.save();
    res.status(201).json({ success: true, message: "Appointment booked successfully", appointment });
  } catch (error) {
    console.error("Booking Error Trace:", error);
    res.status(500).json({ message: "Server error during booking", error: error.message });
  }
};

// GET USER APPOINTMENTS
exports.getMyAppointments = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === "doctor") {
      const doctorProfile = await Doctor.findOne({ userId: req.user.id });
      if (doctorProfile) {
        query = { doctorId: doctorProfile._id };
      } else {
        query = { doctorName: new RegExp(req.user.name, 'i') };
      }
    } else {
      query = { user: req.user.id };
    }
    const appointments = await Appointment.find(query).sort({ createdAt: -1 });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: "Server error fetching appointments" });
  }
};

// --- NEW: ADD PRESCRIPTION LOGIC ---
exports.addPrescription = async (req, res) => {
  try {
    const { medicines, advice } = req.body;
    const { id } = req.params;

    if (req.user.role !== "doctor") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const appointment = await Appointment.findByIdAndUpdate(
      id,
      { 
        prescription: { medicines, advice },
        status: "Completed" // Auto-complete when prescription is issued
      },
      { new: true }
    );

    if (!appointment) return res.status(404).json({ message: "Appointment not found" });

    res.json({ success: true, message: "Prescription saved and visit completed", appointment });
  } catch (error) {
    console.error("Prescription Error:", error);
    res.status(500).json({ message: "Error saving prescription" });
  }
};

// UPDATE STATUS
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;
    if (req.user.role !== "doctor") return res.status(403).json({ message: "Unauthorized" });

    const appointment = await Appointment.findByIdAndUpdate(id, { status }, { new: true });
    if (!appointment) return res.status(404).json({ message: "Not found" });

    res.json({ success: true, appointment });
  } catch (error) {
    res.status(500).json({ message: "Server error while updating status" });
  }
};

// DELETE APPOINTMENT
exports.deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: "Not found" });
    await appointment.deleteOne();
    res.json({ success: true, message: "Appointment cancelled successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};