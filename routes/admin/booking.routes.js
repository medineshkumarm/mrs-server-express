const express = require("express");
const router = express.Router();
const { authorize, permit } = require("../../middlewares/auth.middleware");

const BookingController = require("../../controllers/admin/booking.controller");
const controller = new BookingController();

// Admin Booking Management Routes
router.get(
  "/",
  authorize,
  permit("admin", "superAdmin"),
  controller.getAllBookings
);
router.get(
  "/:id",
  authorize,
  permit("admin", "superAdmin"),
  controller.getBookingById
);
router.patch(
  "/:id/status",
  authorize,
  permit("admin", "superAdmin"),
  controller.updateBookingStatus
);
router.delete(
  "/:id",
  authorize,
  permit("admin", "superAdmin"),
  controller.deleteBooking
);

module.exports = router;
