const express = require("express");
const router = express.Router();
// Import the protect middleware to verify the Admin token
const { protect } = require("../middleware/authMiddleware"); 
// These names MUST match the exports.name in the controller
const { addDoctor, getDoctors } = require("../controllers/doctorController");

// POST /api/doctors/add
router.post("/add", addDoctor);

// GET /api/doctors/all
// Added 'protect' so the middleware can identify the 'admin' role from the token
router.get("/all", protect, getDoctors); 

module.exports = router;