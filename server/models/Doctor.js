const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  name: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    required: true,
    unique: true 
  },
  // --- NEW FIELD FOR MOBILE NUMBER ---
  phone: { 
    type: String, 
    required: true 
  },
  // -----------------------------------
  department: { 
    type: String, 
    required: true 
  },
  specialization: String,
  experience: Number,
  education: String,
  weeklyAvailability: {
    mon: { type: Boolean, default: true },
    tue: { type: Boolean, default: true },
    wed: { type: Boolean, default: true },
    thu: { type: Boolean, default: true },
    fri: { type: Boolean, default: true },
    sat: { type: Boolean, default: true },
    sun: { type: Boolean, default: false }
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date,
    default: null
  },
  deletedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  }
}, { timestamps: true });

module.exports = mongoose.model("Doctor", doctorSchema);