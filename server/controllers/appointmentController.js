const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor");

// CREATE APPOINTMENT
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

    // --- LOGIC FOR FILE UPLOAD ---
    // req.file is populated by multer in the route
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
      medicalReport // SAVING THE FILENAME TO DB
    });

    await appointment.save();
    res.status(201).json({ success: true, message: "Appointment booked successfully", appointment });
  } catch (error) {
    console.error("Booking Error Trace:", error);
    res.status(500).json({ message: "Server error during booking", error: error.message });
  }
};

// GET USER APPOINTMENTS (Logic preserved)
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

// DELETE (CANCEL) APPOINTMENT (Logic preserved)
exports.deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }
    const isPatient = appointment.user.toString() === req.user.id;
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

// UPDATE APPOINTMENT STATUS (Logic preserved)
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    if (req.user.role !== "doctor") {
      return res.status(403).json({ message: "Only doctors can update appointment status" });
    }

    const appointment = await Appointment.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    res.json({ 
      success: true, 
      message: `Appointment marked as ${status}`, 
      appointment 
    });

  } catch (error) {
    console.error("Update Status Error:", error);
    res.status(500).json({ message: "Server error while updating status" });
  }
};