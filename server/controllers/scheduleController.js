const Schedule = require("../models/Schedule");
const Appointment = require("../models/Appointment"); // Imported to count bookings
const Doctor = require("../models/Doctor");

const parseDateOnly = (dateStr) => {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(dateStr || "").trim());
    if (!match) return null;

    const year = Number(match[1]);
    const monthIndex = Number(match[2]) - 1;
    const day = Number(match[3]);

    const parsed = new Date(year, monthIndex, day);
    if (
        parsed.getFullYear() !== year ||
        parsed.getMonth() !== monthIndex ||
        parsed.getDate() !== day
    ) {
        return null;
    }
    parsed.setHours(0, 0, 0, 0);
    return parsed;
};

const getSlotEndMinutes = (slotTime) => {
    const endPart = String(slotTime || "").split("-")[1]?.trim();
    if (!endPart) return null;

    const timeMatch = /^(\d{1,2}):(\d{2})$/.exec(endPart);
    if (!timeMatch) return null;

    const hours = Number(timeMatch[1]);
    const minutes = Number(timeMatch[2]);
    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;

    return hours * 60 + minutes;
};

exports.getScheduleByDoctor = async (req, res) => {
    try {
        const { doctorId, date, includeExpired } = req.query;
        const shouldIncludeExpired = String(includeExpired || "").toLowerCase() === "true";

        // Ensure we find the exact doctor and the date string
        const schedule = await Schedule.findOne({ doctorId, date: date });
        
        if (!schedule || !schedule.slots) {
            return res.status(200).json([]); // Return empty array if not found
        }

        // Return only slots that are marked as 'Active'
        const activeSlots = schedule.slots.filter(slot => slot.status === "Active");

        const selectedDate = parseDateOnly(date);
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const isToday = selectedDate && selectedDate.getTime() === today.getTime();
        const nowMinutes = now.getHours() * 60 + now.getMinutes();

        // --- NEW LOGIC: Calculate occupancy for each slot ---
        const slotsWithAvailability = await Promise.all(activeSlots.map(async (slot) => {
            const slotEndMinutes = getSlotEndMinutes(slot.time);
            const isExpired = Boolean(isToday && slotEndMinutes !== null && slotEndMinutes <= nowMinutes);

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
                isFull: bookedCount >= slot.maxPatients, // Boolean flag for frontend
                isExpired
            };
        }));

        // Default: booking clients get only non-expired slots for today.
        // Doctors can request includeExpired=true to manage full day schedule.
        const finalSlots = shouldIncludeExpired
            ? slotsWithAvailability
            : slotsWithAvailability.filter((slot) => !slot.isExpired);

        res.status(200).json(finalSlots);
    } catch (error) {
        console.error("Error fetching schedule:", error);
        res.status(500).json({ message: "Error fetching schedule" });
    }
};

exports.saveSchedule = async (req, res) => {
    try {
        const { doctorId, date, slots, weeklyAvailability } = req.body;

        // VALIDATION FIX: Ensure doctorId is provided and valid
        if (!doctorId || doctorId === "null" || doctorId === "undefined") {
            return res.status(400).json({ 
                message: "Doctor ID is missing. Please log in again to refresh your session." 
            });
        }

        const selectedDate = parseDateOnly(date);
        if (!selectedDate) {
            return res.status(400).json({ message: "Invalid schedule date format." });
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (selectedDate < today) {
            return res.status(400).json({ message: "Past date schedule is not allowed." });
        }

        // Upsert logic: Update if exists for that date, otherwise create new
        const schedule = await Schedule.findOneAndUpdate(
            { doctorId, date },
            { slots },
            { upsert: true, new: true }
        );

        if (weeklyAvailability && typeof weeklyAvailability === "object") {
            const allowedDays = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
            const normalizedWeekly = {};

            allowedDays.forEach((dayKey) => {
                if (Object.prototype.hasOwnProperty.call(weeklyAvailability, dayKey)) {
                    normalizedWeekly[`weeklyAvailability.${dayKey}`] = Boolean(weeklyAvailability[dayKey]);
                }
            });

            if (Object.keys(normalizedWeekly).length > 0) {
                await Doctor.findByIdAndUpdate(doctorId, { $set: normalizedWeekly });
            }
        }

        res.status(200).json({ message: "Schedule saved successfully", schedule });
    } catch (error) {
        console.error("Save Schedule Error:", error);
        res.status(500).json({ message: "Error saving schedule", error: error.message });
    }
};