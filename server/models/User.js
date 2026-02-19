const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true
    },
    phone: String,
    gender: String,
    address: String,
    role: {
      type: String,
      enum: ["admin", "doctor", "patient"],
      default: "patient"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
