const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

console.log("Test Routes Loaded");

// Protected test route
router.get("/protected", authMiddleware, (req, res) => {
  res.json({
    message: "You are authorized!",
    user: req.user,
  });
});
router.get("/ping", (req, res) => {
  res.send("Ping working");
});
module.exports = router;