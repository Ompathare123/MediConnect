const express = require("express");
const router = express.Router();
// Importing functions from the authController
const { registerUser, loginUser } = require("../controllers/authController");

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user (Patient by default)
 * @access  Public
 */
router.post("/register", registerUser);

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user and get token
 * Now uses the database for all users including Admin
 * @access  Public
 */
router.post("/login", loginUser); 

module.exports = router;