const express = require("express");
const router = express.Router();
// Import the protect middleware to verify the Admin token
const { protect } = require("../middleware/authMiddleware"); 
// These names MUST match the exports.name in the controller
const { addDoctor, getDoctors, getPublicDoctors, getDeletedDoctors, deleteDoctor } = require("../controllers/doctorController");

// POST /api/doctors/add
router.post("/add", protect, addDoctor);

// GET /api/doctors/all
// Added 'protect' so the middleware can identify the 'admin' role from the token
router.get("/all", protect, getDoctors); 

// GET /api/doctors/public
router.get("/public", getPublicDoctors);

// GET /api/doctors/deleted
router.get("/deleted", protect, getDeletedDoctors);

// DELETE /api/doctors/:id
router.delete("/:id", protect, deleteDoctor);

module.exports = router;