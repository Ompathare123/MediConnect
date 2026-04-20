const Doctor = require("../models/Doctor");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const { sendEmail } = require("../utils/emailService");

const ensureAdmin = (req, res) => {
  if (!req.user || req.user.role !== "admin") {
    res.status(403).json({ success: false, message: "Unauthorized" });
    return false;
  }
  return true;
};

exports.addDoctor = async (req, res) => {
  try {
    if (!ensureAdmin(req, res)) return;

    const { 
      firstName, lastName, email, password, 
      phone, department, specialization, experience, education 
    } = req.body;

    const normalizedEmail = email.toLowerCase();
    
    // Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: "This email is already registered." 
      });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 1. Create the User account
    const newUser = new User({
      name: `${firstName} ${lastName}`,
      email: normalizedEmail,
      password: hashedPassword,
      role: "doctor",
      phone: phone || "", // Saving phone to User model
    });
    const savedUser = await newUser.save();

    // 2. Create the Doctor profile
    const newDoctor = new Doctor({
      userId: savedUser._id,
      name: `${firstName} ${lastName}`,
      email: normalizedEmail,
      phone: phone || "", // --- FIXED: Now saving phone to Doctor model ---
      department,
      specialization,
      experience: Number(experience) || 0,
      education,
    });
    await newDoctor.save();

    await sendEmail({
      to: normalizedEmail,
      subject: "Your doctor account is ready",
      text: `Hello Dr. ${firstName} ${lastName}, your MediConnect doctor account has been created. Login email: ${normalizedEmail}. Temporary password: ${password}. Please sign in and change your password immediately.`
    });

    res.status(201).json({ success: true, message: "Doctor added successfully!" });
  } catch (error) {
    console.error("Add Doctor Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getDoctors = async (req, res) => {
  try {
    const { department } = req.query;
    // Include legacy doctor records where isDeleted was never set.
    let filter = {
      $or: [{ isDeleted: false }, { isDeleted: { $exists: false } }]
    };
    
    if (department) {
      filter.department = { $regex: new RegExp(`^${department.trim()}$`, 'i') };
    }
    
    // Fetch all doctors based on filter
    const doctors = await Doctor.find(filter).sort({ createdAt: -1 });
    res.json(doctors);
  } catch (err) {
    console.error("Fetch Doctors Error:", err);
    res.status(500).json({ message: "Error fetching doctors" });
  }
};

exports.getPublicDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find({
      $or: [{ isDeleted: false }, { isDeleted: { $exists: false } }]
    })
      .sort({ createdAt: -1 })
      .select("name department specialization experience education weeklyAvailability");

    res.json(doctors);
  } catch (err) {
    console.error("Fetch Public Doctors Error:", err);
    res.status(500).json({ message: "Error fetching doctors" });
  }
};

exports.getDeletedDoctors = async (req, res) => {
  try {
    if (!ensureAdmin(req, res)) return;

    const doctors = await Doctor.find({ isDeleted: true }).sort({ deletedAt: -1, updatedAt: -1 });
    res.json(doctors);
  } catch (err) {
    console.error("Fetch Deleted Doctors Error:", err);
    res.status(500).json({ message: "Error fetching deleted doctors" });
  }
};

exports.deleteDoctor = async (req, res) => {
  try {
    if (!ensureAdmin(req, res)) return;

    const { id } = req.params;
    const doctor = await Doctor.findById(id);

    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }

    if (doctor.isDeleted) {
      return res.status(400).json({ success: false, message: "Doctor is already deleted" });
    }

    doctor.isDeleted = true;
    doctor.deletedAt = new Date();
    doctor.deletedBy = req.user.id;
    await doctor.save();

    await User.findByIdAndUpdate(doctor.userId, { isActive: false });

    res.json({ success: true, message: "Doctor deleted successfully. Historical records are preserved." });
  } catch (err) {
    console.error("Delete Doctor Error:", err);
    res.status(500).json({ success: false, message: "Error deleting doctor" });
  }
};