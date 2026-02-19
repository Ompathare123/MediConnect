const express = require("express");
const router = express.Router();
const {
  createAppointment,
  getMyAppointments
} = require("../controllers/appointmentController");

const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, createAppointment);
router.get("/", protect, getMyAppointments);

module.exports = router;