const Slot = require("../models/slot.model");

/**
 * Generates slots for a specific court and day (default 30-minute slots from 6 AM to 10 PM).
 * Checks if slots for the day already exist to prevent duplication.
 *
 * @param {ObjectId} courtId - The ID of the court.
 * @param {Date} date - The date for which to generate slots.
 * @param {Number} slotDuration - Duration of each slot in minutes (default: 30).
 * @returns {Promise<Array>} - Array of slot documents.
 */
exports.generateSlotsForDay = async (courtId, date, slotDuration = 30) => {
  // Define the time range for the day (6 AM to 10 PM).
  const dayStart = new Date(date);
  dayStart.setHours(6, 0, 0, 0);
  const dayEnd = new Date(date);
  dayEnd.setHours(22, 0, 0, 0);

  // Check if slots already exist for the given court and time range.
  const existingSlots = await Slot.find({
    court: courtId,
    startTime: { $gte: dayStart, $lt: dayEnd }
  });
  if (existingSlots.length > 0) {
    console.log(`Slots already generated for court ${courtId} on ${date.toDateString()}`);
    return existingSlots;
  }

  // Generate slots for the day.
  let slots = [];
  let slotStart = new Date(dayStart);
  while (slotStart < dayEnd) {
    let slotEnd = new Date(slotStart.getTime() + slotDuration * 60000);
    if (slotEnd > dayEnd) break;
    slots.push({
      courtId,
      startTime: new Date(slotStart),
      endTime: new Date(slotEnd),
      isBooked: false
    });
    slotStart = slotEnd;
  }

  // Bulk insert the slots.
  return await Slot.insertMany(slots);
};
