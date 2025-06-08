const Slot = require("../models/slot.model");
const Court = require("../models/court.model");

export async function calculateBookingDetails(slotIds, courtId) {
  const slots = await Slot.find({ _id: { $in: slotIds }, courtId });

  if (slots.length === 0) throw new Error("No valid slots found");

  // Sort slots by time
  slots.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

  // Calculate total duration in minutes
  let totalDuration = 0;
  slots.forEach((slot) => {
    const duration =
      (new Date(slot.endTime) - new Date(slot.startTime)) / (1000 * 60); // ms to mins
    totalDuration += duration;
  });

  // Fetch court rate
  const court = await Court.findById(courtId);
  const ratePerHour = court.hourlyRate;

  // Calculate total amount
  const totalAmount = (ratePerHour / 60) * totalDuration;

  return { totalDuration, totalAmount };
}


// const { totalDuration, totalAmount } = await calculateBookingDetails(slots, courtId);
