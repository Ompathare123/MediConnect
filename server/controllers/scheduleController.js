const Schedule = require("../models/Schedule");

exports.getScheduleByDoctor = async (req, res) => {
    try {
        const { doctorId, date } = req.query;

        // Ensure we find the exact doctor and the date string
        const schedule = await Schedule.findOne({ doctorId, date: date });
        
        if (!schedule || !schedule.slots) {
            return res.status(200).json([]); // Return empty array if not found
        }

        // Return only slots that are marked as 'Active'
        const activeSlots = schedule.slots.filter(slot => slot.status === "Active");
        
        res.status(200).json(activeSlots);
    } catch (error) {
        console.error("Error fetching schedule:", error);
        res.status(500).json({ message: "Error fetching schedule" });
    }
};

exports.saveSchedule = async (req, res) => {
    try {
        const { doctorId, date, slots } = req.body;

        // Upsert logic: Update if exists for that date, otherwise create new
        const schedule = await Schedule.findOneAndUpdate(
            { doctorId, date },
            { slots },
            { upsert: true, new: true }
        );

        res.status(200).json({ message: "Schedule saved successfully", schedule });
    } catch (error) {
        res.status(500).json({ message: "Error saving schedule", error: error.message });
    }
};