//create a slot
const mongoose = require("mongoose");

const SlotSchema = new mongoose.Schema({
  courtId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Court",
    required: true,
  },
  startTime: { type: Date, required: [true, "start time is required"] },
  endTime: { type: Date, required: [true, "end time is required"] },
  isBooked: { type: Boolean, default: false },
  isLocked: {
    type: Boolean,
    default: false,
  },
  lockedAt: {
    type: Date,
    default: null
  },
});

const Slot = mongoose.model("Slot", SlotSchema);
module.exports = Slot;
