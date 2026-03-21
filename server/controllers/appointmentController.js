const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor");

// CREATE APPOINTMENT
exports.createAppointment = async (req, res) => {
  try {
    const { 
      patientName, // Extract from body
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

    if (!doctorId || doctorId === "null") {
        return res.status(400).json({ message: "Doctor selection is invalid. Please select the doctor again." });
    }

    const appointment = new Appointment({
      user: req.user.id,
      patientName, // Save to database
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

    res.status(201).json({
      success: true,
      message: "Appointment booked successfully",
      appointment
    });

  } catch (error) {
    console.error("Booking Error Trace:", error);
    res.status(500).json({ 
        message: "Server error during booking", 
        error: error.message 
    });
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
    console.error("Fetch Appointments Error:", error);
    res.status(500).json({ message: "Server error fetching appointments" });
  }
};