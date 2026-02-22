const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const doctorRoutes = require("./routes/doctorRoutes");
// ... existing imports
const scheduleRoutes = require("./routes/scheduleRoutes");
const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/doctors", doctorRoutes);

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Atlas Connected"))
  .catch(err => console.log("❌ Connection Error:", err));

app.listen(5000, () => console.log("🚀 Server running on port 5000"));



// ... after app.use("/api/doctors", doctorRoutes);
app.use("/api/schedule", scheduleRoutes);