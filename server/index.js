const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path"); // 1. ADDED THIS
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const doctorRoutes = require("./routes/doctorRoutes");
const scheduleRoutes = require("./routes/scheduleRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// 2. ADD THIS LINE: Serve the 'uploads' folder as a static directory
// This allows you to access files via http://localhost:5000/uploads/filename.jpg
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/schedule", scheduleRoutes);
app.use("/api/appointments", appointmentRoutes);

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Atlas Connected"))
  .catch(err => console.log("❌ Connection Error:", err));

app.listen(5000, () => console.log("🚀 Server running on port 5000"));