const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    patientName: { 
      type: String,
      required: true
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: false 
    },
    doctorName: {
      type: String,
      required: true
    },
    department: {
      type: String,
      required: true
    },
    appointmentDate: {
      type: String,
      required: true
    },
    timeSlot: {
      type: String,
      required: true
    },
    age: { type: String },
    bloodGroup: { type: String },
    symptoms: { type: String },
    // --- NEW FIELD FOR UPLOADED REPORT ---
    medicalReport: { 
      type: String,
      default: null 
    },
    status: {
      type: String,
      default: "Pending"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Appointment", appointmentSchema);