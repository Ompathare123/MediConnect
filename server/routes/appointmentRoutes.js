const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const {
  createAppointment,
  getMyAppointments,
  deleteAppointment,
  updateAppointmentStatus,
  addPrescription
} = require("../controllers/appointmentController");

const { protect } = require("../middleware/authMiddleware");

// MULTER CONFIG
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => { cb(null, uploadDir); },
  filename: (req, file, cb) => { cb(null, Date.now() + "-" + file.originalname); },
});

const upload = multer({ storage: storage, limits: { fileSize: 10 * 1024 * 1024 } });

// ROUTES
// Added 'protect' to ensure only authorized users (Admin/Doctor/Patient) can access their respective data
router.post("/", protect, upload.single("medicalReport"), createAppointment);
router.get("/", protect, getMyAppointments); // Admin uses this to get the 'Sum' of all records
router.delete("/:id", protect, deleteAppointment);
router.put("/:id", protect, updateAppointmentStatus);
router.put("/:id/prescription", protect, addPrescription);

module.exports = router;