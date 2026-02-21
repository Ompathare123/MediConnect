const Doctor = require("../models/Doctor");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");

exports.addDoctor = async (req, res) => {
  try {
    const { 
      firstName, lastName, email, password, 
      phone, department, specialization, experience, education 
    } = req.body;

    const normalizedEmail = email.toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });
    
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: "This email is already registered." 
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name: `${firstName} ${lastName}`,
      email: normalizedEmail,
      password: hashedPassword,
      role: "doctor",
      phone: phone || "",
    });
    const savedUser = await newUser.save();

    const newDoctor = new Doctor({
      userId: savedUser._id,
      name: `${firstName} ${lastName}`,
      email: normalizedEmail,
      department,
      specialization,
      experience: Number(experience) || 0,
      education,
    });
    await newDoctor.save();

    res.status(201).json({ success: true, message: "Doctor added successfully!" });
  } catch (error) {
    console.error("Add Doctor Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Ensure this EXACT name is used in your routes file
exports.getDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find().sort({ createdAt: -1 });
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ message: "Error fetching doctors" });
  }
};