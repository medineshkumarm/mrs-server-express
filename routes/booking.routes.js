const express = require("express");
const router = express.Router();

const bookingController = require("../controllers/user/booking.controller");
const { authorize } = require("../middlewares/auth.middleware");

// Expected payload: { userId, courtId, slotIds (array), totalAmount }
router.post("/bookings", authorize,bookingController.createBookingWithPayment );

router.post("/verify-payment", authorize,bookingController.verifyPayment );

router.get("/bookings/user", authorize, bookingController.getUserBookings);



module.exports = router;