const mongoose = require("mongoose");
const Slot = require("../../models/slot.model");

// Slot creation is automatic every day. so no slot creation needed

class SlotService {
  // Fetch slots with optional filters: date, courtId

  /**
   * Get slots with optional filters:
   * - date: YYYY-MM-DD string
   * - courtId: MongoDB ObjectId string
   *
   * Returns:
   * - If date only: grouped slots by court (like your original)
   * - If courtId is provided (with or without date): array of slots
   * - If no filters: all slots populated with court info
   */
  static async getSlots(filters = {}) {
    const { date, courtId } = filters;

    // Validate courtId if provided
    if (courtId && !mongoose.Types.ObjectId.isValid(courtId)) {
      throw new Error("Invalid court ID format");
    }

    let query = {};

    if (date) {
      const startDate = new Date(date);
      if (isNaN(startDate.getTime())) {
        throw new Error("Invalid date format. Use YYYY-MM-DD");
      }
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);

      query.startTime = { $gte: startDate, $lte: endDate };
    }

    if (courtId) {
      query.courtId = courtId;
    }

    // If filtering only by date (no courtId), return grouped slots by court
    if (date && !courtId) {
      const slots = await Slot.find(query)
        .populate("courtId", "name location price")
        .sort({ startTime: 1, "courtId.name": 1 });

      if (!slots.length) return null;

      return slots.reduce((acc, slot) => {
        if (!slot.courtId) {
          // Skip if courtId is null or not populated
          return acc;
        }
        const cId = slot.courtId._id.toString();
        if (!acc[cId]) {
          acc[cId] = {
            courtName: slot.courtId.name,
            courtLocation: slot.courtId.location,
            price: slot.courtId.price,
            slots: [],
          };
        }
        acc[cId].slots.push({
          _id: slot._id,
          startTime: slot.startTime,
          endTime: slot.endTime,
          status: slot.status,
        });
        return acc;
      }, {});
    } else {
      // For all other cases (no filters, or courtId filter, or courtId+date), return flat slot array with court populated
      const slots = await Slot.find(query)
        .populate("courtId", "name location price")
        .sort({ startTime: 1 });

      return slots.length ? slots : null;
    }
  }

  // Update a slot by slotId
  static async updateSlot(slotId, updateData) {
    const updatedSlot = await Slot.findByIdAndUpdate(slotId, updateData, {
      new: true,
    });
    if (!updatedSlot) {
      throw new Error("Slot not found");
    }
    return updatedSlot;
  }

  // Delete a slot by slotId
  static async deleteSlot(slotId) {
    const deletedSlot = await Slot.findByIdAndDelete(slotId);
    if (!deletedSlot) {
      throw new Error("Slot not found");
    }
    return deletedSlot;
  }

  // Create slots for a court based on date/time range and interval (minutes)
  //    todo: we have to check whether the slot interval already exist or not
  //   static async createSlotsForCourt({
  //     courtId,
  //     date,
  //     startTime,
  //     endTime,
  //     interval = 30,
  //   }) {
  //     // Validate court existence
  //     const court = await Court.findById(courtId);
  //     if (!court) {
  //       throw new Error("Court not found");
  //     }

  //     const start = new Date(`${date}T${startTime}:00.000Z`);
  //     const end = new Date(`${date}T${endTime}:00.000Z`);

  //     if (start >= end) {
  //       throw new Error("Invalid slot timing");
  //     }

  //     const slots = [];
  //     let currentSlot = new Date(start);

  //     while (currentSlot < end) {
  //       const slotEndTime = new Date(currentSlot.getTime() + interval * 60000);
  //       slots.push({
  //         courtId,
  //         date,
  //         startTime: currentSlot,
  //         endTime: slotEndTime,
  //         status: "available",
  //       });
  //       currentSlot = slotEndTime;
  //     }

  //     const createdSlots = await Slot.insertMany(slots);
  //     return createdSlots;
  //   }
}

module.exports = SlotService;
