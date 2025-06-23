const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User Id is required"],
    },
    courtId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Court",
      required: [true, "Court Id is required"],
    },
    slots: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Slot", required: true },
    ],
    totalDuration: { type: Number, required: true }, // in minutes
    totalAmount: { type: Number, required: true },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid"],
      default: "pending",
    },
    status: {
      type: String,
      enum: ["confirmed", "cancelled", "pending"],
      default: "confirmed",
    },
    razorpayOrderId: {
      type: String,
    },
    razorpayPaymentId: {
      type: String,
    },
    razorpaySignature: {
      type: String,
    },
   
  },
  { timestamps: true }
);

// Indexes for fast querying
// bookingSchema.index({ courtId: 1 });

const Booking = mongoose.model("Booking", bookingSchema);
module.exports = Booking;
