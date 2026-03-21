const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const {
  createAppointment,
  getMyAppointments,
  deleteAppointment,
  updateAppointmentStatus
} = require("../controllers/appointmentController");

const { protect } = require("../middleware/authMiddleware");

// --- MULTER CONFIGURATION ---
// This ensures the path is absolute to your 'server/uploads' folder
const uploadDir = path.join(__dirname, "../uploads");

// Automatically create 'uploads' folder if it doesn't exist
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generates a unique name: timestamp-originalName
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB Limit
});

// --- ROUTES ---

// POST /api/appointments
// IMPORTANT: 'medicalReport' must match the key used in your frontend FormData.append()
router.post("/", protect, upload.single("medicalReport"), createAppointment);

// GET /api/appointments
router.get("/", protect, getMyAppointments);

// DELETE /api/appointments/:id
router.delete("/:id", protect, deleteAppointment);

// PUT /api/appointments/:id
router.put("/:id", protect, updateAppointmentStatus);

module.exports = router;