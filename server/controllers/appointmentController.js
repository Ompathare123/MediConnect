const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor");
const Schedule = require("../models/Schedule"); // Added Schedule model import

// CREATE APPOINTMENT (With Max Patients Logic)
exports.createAppointment = async (req, res) => {
  try {
    const { 
      patientName, doctorId, doctorName, department, 
      appointmentDate, timeSlot, age, bloodGroup, symptoms 
    } = req.body;
    const medicalReport = req.file ? req.file.filename : null;

    // --- NEW: MAX PATIENTS LOGIC ---
    const schedule = await Schedule.findOne({ doctorId, date: appointmentDate });
    
    if (!schedule) {
      return res.status(404).json({ message: "Doctor is not available on this date." });
    }

    const slot = schedule.slots.find(s => s.time === timeSlot);
    
    if (!slot) {
      return res.status(404).json({ message: "Selected time slot is not found in the schedule." });
    }

    const existingCount = await Appointment.countDocuments({
      doctorId,
      appointmentDate,
      timeSlot,
      status: { $ne: "Cancelled" } 
    });

    if (existingCount >= slot.maxPatients) {
      return res.status(400).json({ 
        message: `This slot is fully booked. Maximum limit of ${slot.maxPatients} patients reached.` 
      });
    }
    // --- END OF MAX PATIENTS LOGIC ---

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

// GET USER APPOINTMENTS (Unchanged)
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

// ADD PRESCRIPTION LOGIC (Unchanged)
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
        status: "Completed" 
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

// UPDATE STATUS (Updated with Cancellation Note Logic)
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { status, cancellationNote } = req.body; // Accept cancellationNote from request
    const { id } = req.params;

    if (req.user.role !== "doctor") return res.status(403).json({ message: "Unauthorized" });

    // Build update object
    let updateFields = { status };
    if (status === "Cancelled" && cancellationNote) {
      updateFields.cancellationNote = cancellationNote;
    }

    const appointment = await Appointment.findByIdAndUpdate(id, updateFields, { new: true });
    
    if (!appointment) return res.status(404).json({ message: "Not found" });

    res.json({ success: true, appointment });
  } catch (error) {
    res.status(500).json({ message: "Server error while updating status" });
  }
};

// DELETE APPOINTMENT (Unchanged)
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