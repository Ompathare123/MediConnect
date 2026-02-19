const Appointment = require("../models/Appointment");

// CREATE APPOINTMENT
exports.createAppointment = async (req, res) => {
  try {
    const { doctorName, department, appointmentDate, timeSlot } = req.body;

    const appointment = new Appointment({
      user: req.user.id,
      doctorName,
      department,
      appointmentDate,
      timeSlot
    });

    await appointment.save();

    res.status(201).json({
      message: "Appointment booked successfully",
      appointment
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET USER APPOINTMENTS
exports.getMyAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ user: req.user.id });

    res.json(appointments);

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};