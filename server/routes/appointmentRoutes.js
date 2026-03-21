const express = require("express");
const router = express.Router();
const {
  createAppointment,
  getMyAppointments
} = require("../controllers/appointmentController");

const { protect } = require("../middleware/authMiddleware");

// POST /api/appointments
router.post("/", protect, createAppointment);

// GET /api/appointments
router.get("/", protect, getMyAppointments);

module.exports = router;