const Schedule = require("../models/Schedule");
const Appointment = require("../models/Appointment"); // Imported to count bookings

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

        // --- NEW LOGIC: Calculate occupancy for each slot ---
        const slotsWithAvailability = await Promise.all(activeSlots.map(async (slot) => {
            // Count active (not cancelled) appointments for this specific slot
            const bookedCount = await Appointment.countDocuments({
                doctorId,
                appointmentDate: date,
                timeSlot: slot.time,
                status: { $ne: "Cancelled" }
            });

            // Convert Mongoose document to plain object and add availability info
            const slotObj = slot.toObject();
            return {
                ...slotObj,
                currentBookings: bookedCount,
                isFull: bookedCount >= slot.maxPatients // Boolean flag for frontend
            };
        }));
        
        res.status(200).json(slotsWithAvailability);
    } catch (error) {
        console.error("Error fetching schedule:", error);
        res.status(500).json({ message: "Error fetching schedule" });
    }
};

exports.saveSchedule = async (req, res) => {
    try {
        const { doctorId, date, slots } = req.body;

        // VALIDATION FIX: Ensure doctorId is provided and valid
        if (!doctorId || doctorId === "null" || doctorId === "undefined") {
            return res.status(400).json({ 
                message: "Doctor ID is missing. Please log in again to refresh your session." 
            });
        }

        // Upsert logic: Update if exists for that date, otherwise create new
        const schedule = await Schedule.findOneAndUpdate(
            { doctorId, date },
            { slots },
            { upsert: true, new: true }
        );

        res.status(200).json({ message: "Schedule saved successfully", schedule });
    } catch (error) {
        console.error("Save Schedule Error:", error);
        res.status(500).json({ message: "Error saving schedule", error: error.message });
    }
};