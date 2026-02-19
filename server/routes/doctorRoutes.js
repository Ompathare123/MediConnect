const router = require("express").Router();
const {
  addDoctor,
  getDoctors,
} = require("../controllers/doctorController");

router.post("/add", addDoctor);
router.get("/all", getDoctors);

module.exports = router;