const express = require("express");
const router = express.Router();
const {
  createAppointment,
  getMyAppointments,
  deleteAppointment // Import the new function
} = require("../controllers/appointmentController");

const { protect } = require("../middleware/authMiddleware");

// POST /api/appointments
router.post("/", protect, createAppointment);

// GET /api/appointments
router.get("/", protect, getMyAppointments);

// DELETE /api/appointments/:id
router.delete("/:id", protect, deleteAppointment); // Added this route

module.exports = router;