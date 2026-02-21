const express = require("express");
const router = express.Router();
// These names MUST match the exports.name in the controller
const { addDoctor, getDoctors } = require("../controllers/doctorController");

router.post("/add", addDoctor);
router.get("/all", getDoctors); // This is line 6; if getDoctors is undefined, it crashes

module.exports = router;