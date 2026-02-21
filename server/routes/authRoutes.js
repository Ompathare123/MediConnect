const express = require("express");
const router = express.Router();
// Destructure the exported functions from your controller
const { registerUser, loginUser } = require("../controllers/authController");

// Ensure these handlers are actual functions
router.post("/register", registerUser);
router.post("/login", loginUser); 

module.exports = router;