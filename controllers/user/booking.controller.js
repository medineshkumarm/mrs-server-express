const Razorpay = require("razorpay");
const Booking = require("../../models/booking.model");
const Slot = require("../../models/slot.model");

require("dotenv").config();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY,
  key_secret: process.env.RAZORPAY_SECRET,
});

// Create booking + initiate payment, lock slots atomically
exports.createBookingWithPayment = async (req, res) => {
  try {
    const { courtId, slotIds, totalDuration, totalAmount } = req.body;
    const userId = req.user.id;

    // Check for already booked or locked slots
    const conflictingSlot = await Slot.findOne({
      _id: { $in: slotIds },
      $or: [{ isBooked: true }, { isLocked: true }],
    });

    if (conflictingSlot) {
      return res.status(400).json({
        success: false,
        message: "One or more selected slots are already booked or locked",
        data: null,
        error: "Slot conflict",
      });
    }

    // Lock slots temporarily before payment
    await Slot.updateMany(
      { _id: { $in: slotIds } },
      { isLocked: true, lockedAt: new Date() }
    );

    // Create booking with paymentStatus pending
    const newBooking = new Booking({
      userId,
      courtId,
      slots: slotIds,
      totalDuration,
      totalAmount,
      paymentStatus: "pending",
      status: "pending",
    });

    const savedBooking = await newBooking.save();

    // Create Razorpay order
    let razorpayOrder;
    try {
      razorpayOrder = await razorpay.orders.create({
        amount: totalAmount * 100, // amount in paise
        currency: "INR",
        payment_capture: 1,
      });

      savedBooking.razorpayOrderId = razorpayOrder.id;
      await savedBooking.save();
    } catch (paymentError) {
      // Release locks on Razorpay order creation failure
      await Slot.updateMany(
        { _id: { $in: slotIds } },
        { isLocked: false, lockedAt: null }
      );

      return res.status(500).json({
        success: false,
        message: "Booking saved but payment order creation failed",
        data: { bookingId: savedBooking._id },
        error: paymentError.message,
      });
    }
    // Populate slots before returning
    const populatedBooking = await Booking.findById(savedBooking._id)
      .populate("slots") // <-- include full slot data
      .populate("courtId"); // optional: also populate court details

    return res.status(201).json({
      success: true,
      message: "Booking created and Razorpay order initialized",
      data: {
        id: populatedBooking._id,
        booking: populatedBooking,
        razorpayOrderId: razorpayOrder.id,
      },
      error: null,
    });

    // return res.status(201).json({
    //   success: true,
    //   message: "Booking created and Razorpay order initialized",
    //   data: {
    //     id: savedBooking._id,
    //     booking: savedBooking,
    //     razorpayOrderId: razorpayOrder.id,
    //   },
    //   error: null,
    // });
  } catch (error) {
    console.error("Booking error:", error);
    res.status(500).json({
      success: false,
      message: "Booking creation failed",
      data: null,
      error: error.message,
    });
  }
};

// Verify payment, update booking and slots accordingly
exports.verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      bookingId,
      status, // 'paid' or 'failed'
    } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
        data: null,
        error: "Invalid booking ID",
      });
    }

    // Prevent double processing if already paid
    if (booking.paymentStatus === "paid") {
      return res.status(200).json({
        success: true,
        message: "Booking already paid",
        data: { booking },
        error: null,
      });
    }
    // Add this guard:
    if (booking.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message:
          "Booking was cancelled due to timeout. Payment will not be processed.",
        data: null,
        error: "Booking already cancelled",
      });
    }
    // Update payment info
    booking.paymentStatus = status;
    booking.razorpayOrderId = razorpay_order_id;
    booking.razorpayPaymentId = razorpay_payment_id;
    booking.razorpaySignature = razorpay_signature;

    if (status === "paid") {
      // Confirm booking & mark slots booked
      booking.status = "confirmed";
      await Slot.updateMany(
        { _id: { $in: booking.slots } },
        { $set: { isBooked: true, isLocked: false, lockedAt: null } }
      );
    } else {
      // Payment failed: cancel booking & release locks
      booking.status = "cancelled";
      await Slot.updateMany(
        { _id: { $in: booking.slots } },
        { $set: { isLocked: false, lockedAt: null } }
      );
    }

    await booking.save();

    return res.json({
      success: true,
      message: "Payment verified and booking updated",
      data: { updatedBooking: booking },
      error: null,
    });
  } catch (err) {
    console.error("Verify payment error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to verify payment",
      data: null,
      error: err.message,
    });
  }
};

// exports.createBookingWithPayment = async (req, res) => {
//   try {
//     const { courtId, slotIds, totalDuration, totalAmount } = req.body;
//     const userId = req.user.id; // from auth middleware
//     console.log(userId);

//     // Retrieve the selected slots.
//     const slots = await Slot.find({ _id: { $in: slotIds } });

//     // Check that none of the slots are already booked.
//     const conflict = slots.some((slot) => slot.isBooked);
//     if (conflict) {
//       return res.status(400).json({
//         success: false,
//         message: "One or more selected slots are already booked",
//         data: null,
//         error: "Slot conflict",
//       });
//     }

//     // // Recalculate price server-side
//     // const { totalDuration1, totalAmount1 } = await calculateBookingDetails(
//     //   slotIds,
//     //   courtId
//     // );

//     // // Compare with amount sent by frontend (if sent) — OPTIONAL
//     // if (req.body.totalAmount && req.body.totalAmount !== totalAmount1) {
//     //   return res
//     //     .status(400)
//     //     .json({ message: "Amount mismatch. Please refresh and try again." });
//     // }

//     //before booking make sure isBooked is true then book :

//     const newBooking = new Booking({
//       userId,
//       courtId,
//       slots,
//       totalDuration,
//       totalAmount,
//       paymentStatus: "pending",
//       status: "confirmed",
//     });

//     const savedBooking = await newBooking.save();

//     await Slot.updateMany({ _id: { $in: slotIds } }, { isBooked: true }); ///check it afterwards
//     let razorpayOrder;
//     try {
//       razorpayOrder = await razorpay.orders.create({
//         amount: totalAmount * 100, // Razorpay expects paise
//         currency: "INR",
//         payment_capture: 1,
//       });

//       // Save Razorpay order ID in a separate field if needed (extend schema or store in frontend)
//       savedBooking.razorpayOrderId = razorpayOrder.id;
//       await savedBooking.save();
//     } catch (error) {
//       console.error("Razorpay error:", paymentError);

//       return res.status(500).json({
//         success: false,
//         message: "Booking saved but payment order creation failed",
//         data: {
//           bookingId: savedBooking._id,
//         },
//         error: paymentError.message,
//       });
//     }

//     res.status(201).json({
//       success: true,
//       message: "Booking created and Razorpay order initialized",
//       data: {
//         id: savedBooking._id,
//         booking: savedBooking,
//         razorpayOrderId: razorpayOrder.id,
//       },
//       error: null,
//     });
//     // razorpayOrderId: razorpayOrder.id,
//   } catch (error) {
//     console.error("Booking error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Booking creation failed",
//       data: null,
//       error: error.message,
//     });
//   }
// };

// exports.verifyPayment = async (req, res) => {
//   try {
//     const {
//       razorpay_order_id,
//       razorpay_payment_id,
//       razorpay_signature,
//       bookingId,
//       status,
//     } = req.body;

//     const booking = await Booking.findById(bookingId);
//     if (!booking) {
//       return res.status(404).json({
//         success: false,
//         message: "Booking not found",
//         data: null,
//         error: "Invalid booking ID",
//       });
//     }

//     booking.paymentStatus = status;
//     // Set payment status
//     booking.razorpayOrderId = razorpay_order_id;
//     booking.razorpayPaymentId = razorpay_payment_id;
//     booking.razorpaySignature = razorpay_signature;
//     // You can store razorpay fields in your Booking model if needed (add to schema)
//     await booking.save();

//     // Mark slots as booked
//     if (status === "paid") {
//       await Slot.updateMany(
//         { _id: { $in: booking.slots } },
//         { $set: { isBooked: true } }
//       );
//     }

//     res.json({
//       success: true,
//       message: "Payment verified and booking updated",
//       data: {
//         updatedBooking: booking,
//       },
//       error: null,
//     });
//   } catch (err) {
//     console.error("Verify payment error:", err);
//     res.status(500).json({
//       success: false,
//       message: "Failed to verify payment",
//       data: null,
//       error: err.message,
//     });
//   }
// };

exports.getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user.id })
      .populate("courtId")
      .populate("slots")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Fetched user bookings successfully",
      data: {
        bookings,
      },
      error: null,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error retrieving user bookings",
      data: null,
      error: err.message,
    });
  }
};

exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().populate("courtId").populate("slots");
    res.status(200).json({
      success: true,
      message: "Fetched all bookings successfully",
      data: {
        bookings,
      },
      error: null,
    });
  } catch (err) {
    res.status(500).json({ message: "Error retrieving bookings" });
  }
};

/**
 * Let use the update and delete booking in admin panel
 */

// exports.updateBookingStatus = async (req, res) => {
//   try {
//     const { bookingId } = req.params;
//     const { status } = req.body;

//     const booking = await Booking.findById(bookingId);
//     if (!booking) return res.status(404).json({ message: "Booking not found" });

//     booking.status = status;
//     await booking.save();

//     res.json({ message: "Booking status updated" });
//   } catch (err) {
//     res.status(500).json({ message: "Error updating booking status" });
//   }
// };

// exports.deleteBooking = async (req, res) => {
//   try {
//     await Booking.findByIdAndDelete(req.params.bookingId);
//     res.json({ message: "Booking deleted" });
//   } catch (err) {
//     res.status(500).json({ message: "Failed to delete booking" });
//   }
// };
