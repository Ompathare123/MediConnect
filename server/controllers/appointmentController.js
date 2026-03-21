const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor");

// CREATE APPOINTMENT (No changes here)
exports.createAppointment = async (req, res) => {
  try {
    const { 
      patientName,
      doctorId, 
      doctorName, 
      department, 
      appointmentDate, 
      timeSlot, 
      age, 
      bloodGroup, 
      symptoms 
    } = req.body;

    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "User not authorized. Please login again." });
    }

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
      symptoms
    });

    await appointment.save();
    res.status(201).json({ success: true, message: "Appointment booked successfully", appointment });
  } catch (error) {
    res.status(500).json({ message: "Server error during booking", error: error.message });
  }
};

// GET USER APPOINTMENTS (No changes here)
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

// --- NEW: DELETE (CANCEL) APPOINTMENT ---
exports.deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Security check: Only the patient who booked it or the assigned doctor can cancel
    const isPatient = appointment.user.toString() === req.user.id;
    
    // For doctor check, we find their profile first
    let isDoctor = false;
    if (req.user.role === 'doctor') {
      const doctorProfile = await Doctor.findOne({ userId: req.user.id });
      if (doctorProfile && appointment.doctorId.toString() === doctorProfile._id.toString()) {
        isDoctor = true;
      }
    }

    if (!isPatient && !isDoctor) {
      return res.status(401).json({ message: "User not authorized to cancel this appointment" });
    }

    await appointment.deleteOne();
    res.json({ success: true, message: "Appointment cancelled successfully" });

  } catch (error) {
    console.error("Delete Error:", error);
    res.status(500).json({ message: "Server error while cancelling appointment" });
  }
};