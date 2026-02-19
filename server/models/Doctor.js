const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }, 
    department: String,
    specialization: String,
    experience: String,
    education: String,
    phone: String,
}, { timestamps: true });

module.exports = mongoose.model("Doctor", doctorSchema);