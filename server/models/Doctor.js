const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: String,
  email: String,
  department: String,
  specialization: String,
  experience: Number,
  education: String,
}, { timestamps: true });

module.exports = mongoose.model("Doctor", doctorSchema);