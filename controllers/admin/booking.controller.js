const BookingService = require("../../services/admin/booking.service");

class BookingController {
  constructor() {
    this.bookingService = new BookingService();

    // Bindings
    this.getAllBookings = this.getAllBookings.bind(this);
    this.getBookingById = this.getBookingById.bind(this);
    this.updateBookingStatus = this.updateBookingStatus.bind(this);
    this.deleteBooking = this.deleteBooking.bind(this);
  }

  async getAllBookings(req, res) {
    try {
      const data = await this.bookingService.getAllBookings(req.query);
      res.status(200).json({ success: true, data });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async getBookingById(req, res) {
    try {
      const data = await this.bookingService.getBookingById(req.params.id);
      res.status(200).json({ success: true, data });
    } catch (err) {
      res.status(404).json({ success: false, message: err.message });
    }
  }

  async updateBookingStatus(req, res) {
    try {
      const data = await this.bookingService.updateBookingStatus(
        req.params.id,
        req.body.status
      );
      res.status(200).json({ success: true, message: "Status updated", data });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async deleteBooking(req, res) {
    try {
      await this.bookingService.deleteBooking(req.params.id);
      res.status(200).json({ success: true, message: "Booking deleted" });
    } catch (err) {
      res.status(404).json({ success: false, message: err.message });
    }
  }
}

module.exports = BookingController;
