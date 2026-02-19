const Doctor = require("../models/Doctor");

// Add doctor
exports.addDoctor = async (req, res) => {
  const doctor = new Doctor(req.body);
  await doctor.save();
  res.json({ message: "Doctor added", doctor });
};

// Get all doctors
exports.getDoctors = async (req, res) => {
  const doctors = await Doctor.find();
  res.json({ count: doctors.length, doctors });
};