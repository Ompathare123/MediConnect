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
    medicalReport: { 
      type: String,
      default: null 
    },
    // --- PRESCRIPTION STORAGE ---
    prescription: {
      medicines: [
        {
          name: String,
          dosage: String,
          timing: String
        }
      ],
      advice: String,
      createdAt: { type: Date, default: Date.now }
    },
    status: {
      type: String,
      default: "Pending"
    },
    // --- CANCELLATION NOTE ---
    cancellationNote: {
      type: String,
      default: null
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Appointment", appointmentSchema);