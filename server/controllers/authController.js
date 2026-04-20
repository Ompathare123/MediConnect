const User = require("../models/User");
const Doctor = require("../models/Doctor"); // Imported Doctor Model
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sendEmail } = require("../utils/emailService");

// REGISTER PATIENT
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, phone, gender, address } = req.body;
    const normalizedEmail = email.toLowerCase();

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists with this email" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      phone,
      gender,
      address,
      role: "patient"
    });

    await user.save();

    await sendEmail({
      to: user.email,
      subject: "Welcome to MediConnect",
      text: `Hi ${user.name}, your MediConnect account has been created successfully. You can now book appointments and view your prescriptions online.`
    });

    res.status(201).json({ success: true, message: "Registered successfully" });

  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ message: "Server Error: " + error.message });
  }
};

// LOGIN USER
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (user.isActive === false) {
      return res.status(403).json({ message: "Account is deactivated. Please contact admin." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || "secret123",
      { expiresIn: "1d" }
    );

    // FIND DOCTOR PROFILE ID
    let doctorProfileId = null;
    if (user.role === "doctor") {
      const doctorProfile = await Doctor.findOne({ userId: user._id });
      doctorProfileId = doctorProfile ? doctorProfile._id : null;
    }

    res.json({
      success: true,
      token,
      role: user.role,
      doctorProfileId, // Sent to frontend to fix the "No Slots" error
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// GET ALL PATIENTS (ADMIN ONLY)
exports.getPatients = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const patients = await User.find({ role: "patient" })
      .select("name email phone gender address createdAt")
      .sort({ createdAt: -1 });

    res.json(patients);
  } catch (error) {
    console.error("Get Patients Error:", error);
    res.status(500).json({ message: "Server Error fetching patients" });
  }
};