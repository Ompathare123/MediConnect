const mongoose = require("mongoose");

const scheduleSchema = new mongoose.Schema({
    doctorId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Doctor", 
        required: true 
    },
    date: { 
        type: String, 
        required: true 
    }, // Format: YYYY-MM-DD
    slots: [{
        time: { type: String, required: true }, // e.g., "09:00 - 10:00"
        mode: { type: String, default: "In-Person" },
        maxPatients: { type: Number, default: 5 },
        fee: { type: String, required: true },
        status: { type: String, default: "Active" }
    }]
}, { timestamps: true });

module.exports = mongoose.model("Schedule", scheduleSchema);