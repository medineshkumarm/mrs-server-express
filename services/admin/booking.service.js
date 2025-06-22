const Booking = require("../../models/booking.model");

class BookingService {
  async getAllBookings(query) {
    const { status, paymentStatus, courtId, from, to } = query;
    let filter = {};

    if (status) filter.status = status;
    if (paymentStatus) filter.paymentStatus = paymentStatus;
    if (courtId) filter.courtId = courtId;

    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) filter.createdAt.$lte = new Date(to);
    }

    return Booking.find(filter).sort({ createdAt: -1 });
  }

  async getBookingById(id) {
    const booking = await Booking.findById(id);
    if (!booking) {
      throw new Error("Booking not found");
    }

    return booking;
  }

  async updateBookingStatus(id, status) {
    const allowed = ["confirmed", "cancelled", "pending"];
    if (!allowed.includes(status)) {
      throw new Error("Invalid status");
    }

    const updated = await Booking.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updated) {
      throw new Error("Booking not found");
    }

    return updated;
  }

  async deleteBooking(id) {
    const deleted = await Booking.findByIdAndDelete(id);
    if (!deleted) {
      throw new Error("Booking not found");
    }
  }
}

module.exports = BookingService;
