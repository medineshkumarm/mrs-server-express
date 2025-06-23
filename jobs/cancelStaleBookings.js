// jobs/cancelStaleBookings.js
const Booking = require("../models/booking.model");
const Slot = require("../models/slot.model");


const cancelStaleBookings = async () => {
  try {
    const timeoutMinutes = 10;
    const cutoffTime = new Date(Date.now() - timeoutMinutes * 60 * 1000);

    // Find stale bookings
    const staleBookings = await Booking.find({
      paymentStatus: "pending",
      status: "pending",
      createdAt: { $lt: cutoffTime },
    });

    if (staleBookings.length === 0) {
      console.log(`[${new Date().toISOString()}] No stale bookings to cancel.`);
      return;
    }

    for (const booking of staleBookings) {
      // Cancel booking
      booking.status = "cancelled";
      await booking.save();

      // Release locked slots
      await Slot.updateMany(
        { _id: { $in: booking.slots } },
        { $set: { isLocked: false, lockedAt: null } }
      );

      console.log(
        `[${new Date().toISOString()}] Cancelled stale booking ${booking._id}`
      );
    }
  } catch (err) {
    console.error("Error cancelling stale bookings:", err);
  }
};

module.exports = cancelStaleBookings;
