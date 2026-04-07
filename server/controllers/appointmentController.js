const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor");
const Schedule = require("../models/Schedule");

// CREATE APPOINTMENT
exports.createAppointment = async (req, res) => {
  try {
    const { 
      patientName, doctorId, doctorName, department, 
      appointmentDate, timeSlot, age, bloodGroup, symptoms 
    } = req.body;
    const medicalReport = req.file ? req.file.filename : null;

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
      age,
      bloodGroup,
      symptoms,
      medicalReport 
    });

    await appointment.save();
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
    res.json(appointments);
  } catch (error) {
    console.error("Fetch Error:", error);
    res.status(500).json({ message: "Server error fetching appointments" });
  }
};

// ADD PRESCRIPTION
exports.addPrescription = async (req, res) => {
  try {
    const { medicines, advice } = req.body;
    const { id } = req.params;
    if (req.user.role !== "doctor") return res.status(403).json({ message: "Unauthorized" });

    const appointment = await Appointment.findByIdAndUpdate(
      id,
      { prescription: { medicines, advice }, status: "Completed" },
      { new: true }
    );
    if (!appointment) return res.status(404).json({ message: "Not found" });
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