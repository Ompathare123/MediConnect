const express = require("express");
const router = express.Router();
// Importing functions from the authController
const { registerUser, loginUser } = require("../controllers/authController");

// POST /api/auth/register
router.post("/register", registerUser);

// POST /api/auth/login
router.post("/login", loginUser); 

module.exports = router;