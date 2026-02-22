const express = require("express");
const router = express.Router();
const { 
    saveSchedule, 
    getScheduleByDoctor 
} = require("../controllers/scheduleController");

/**
 * @route   POST /api/schedule/save
 * @desc    Save or Update a doctor's availability for a specific date
 * @access  Private (Doctor Only)
 */
router.post("/save", saveSchedule);

/**
 * @route   GET /api/schedule/get
 * @desc    Fetch availability slots for a specific doctor and date
 * @access  Public/Private (Used by Patient Booking and Doctor Dashboard)
 * @query   doctorId, date
 */
router.get("/get", getScheduleByDoctor);

module.exports = router;