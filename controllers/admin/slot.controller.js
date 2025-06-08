const Slot = require("../../models/slot.model");

/*
 * Get all slots (Admin view)
 */
exports.getAllSlots = async (req, res) => {
  try {
    const slots = await Slot.find().populate("courtId");
    res.status(200).json(slots);
  } catch (err) {
    res.status(500).json({ message: "Error retrieving slots", error: err });
  }
};


const mongoose = require('mongoose');

/*
 * Get all slots by date
 * Query Parameters: date
 */
exports.getSlotsByDate = async (req, res,next) => {
  try {
    const { date } = req.query;

    // Validate date parameter
    if (!date) {
      return res.status(400).json({
        success: false,
        message: "Date parameter is required"
      });
    }

    // Validate date format
    const isValidDate = !isNaN(new Date(date).getTime());
    if (!isValidDate) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format. Use YYYY-MM-DD"
      });
    }

    // Find all slots for the given date
    const slots = await Slot.find({
      date: new Date(date)
    })
    .populate('courtId', 'name location price')
    .sort({ startTime: 1, 'courtId.name': 1 });

    if (!slots.length) {
      return res.status(404).json({
        success: false,
        message: "No slots found for the specified date"
      });
    }

    // Group slots by court
    const slotsGroupedByCourt = slots.reduce((acc, slot) => {
      const courtId = slot.courtId._id;
      if (!acc[courtId]) {
        acc[courtId] = {
          courtName: slot.courtId.name,
          courtLocation: slot.courtId.location,
          price: slot.courtId.price,
          slots: []
        };
      }
      acc[courtId].slots.push({
        _id: slot._id,
        startTime: slot.startTime,
        endTime: slot.endTime,
        status: slot.status
      });
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      message: "Slots retrieved successfully",
      data: slotsGroupedByCourt
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error retrieving slots",
      error: err.message
    });
  }
};


/*
 * Get slots by date and courtId
 * Query Parameters: date, courtId
 */
exports.getSlotsByDateAndCourt = async (req, res) => {
  try {
    const { date, courtId } = req.query;

    // Validate required parameters
    if (!date || !courtId) {
      return res.status(400).json({
        success: false,
        message: "Both date and courtId are required"
      });
    }

    // Validate courtId format
    if (!mongoose.Types.ObjectId.isValid(courtId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid court ID format"
      });
    }

    // Validate date format
    const isValidDate = !isNaN(new Date(date).getTime());
    if (!isValidDate) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format. Use YYYY-MM-DD"
      });
    }

    // Find slots matching the criteria
    const slots = await Slot.find({
      courtId,
      date: new Date(date),
    })
    .populate('courtId', 'name location') // Include court details
    .sort({ startTime: 1 }); // Sort by start time

    if (!slots.length) {
      return res.status(404).json({
        success: false,
        message: "No slots found for the specified date and court"
      });
    }

    res.status(200).json({
      success: true,
      message: "Slots retrieved successfully",
      data: slots
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error retrieving slots",
      error: err.message
    });
  }
};

/*
 * Get all slots for a specific court
 * Route Parameter: courtId
 */
exports.getSlotsForCourt = async (req, res) => {
  const { courtId } = req.params;
  try {
    const slots = await Slot.find({ courtId }).sort({ startTime: 1 });
    if (!slots.length) {
      return res.status(404).json({ message: "No slots found for this court" });
    }
    res.status(200).json(slots);
  } catch (err) {
    res.status(500).json({ message: "Error retrieving slots", error: err });
  }
};

/*
 * Create slots for a court (e.g., 30-minute slots from 6 AM - 10 PM)
 * Route Parameter: courtId
 */
exports.createSlotsForCourt = async (req, res) => {
  const { courtId } = req.params;
  const { date, startTime, endTime, interval = 30 } = req.body;

  try {
    // Validate court existence
    const court = await Court.findById(courtId);
    if (!court) {
      return res.status(404).json({ message: "Court not found" });
    }

    // Convert start and end times into Date objects
    const start = new Date(`${date}T${startTime}:00.000Z`);
    const end = new Date(`${date}T${endTime}:00.000Z`);

    if (start >= end) {
      return res.status(400).json({ message: "Invalid slot timing" });
    }

    let slots = [];
    let currentSlot = new Date(start);

    // Generate 30-minute slots (or custom interval)
    while (currentSlot < end) {
      let slotEndTime = new Date(currentSlot.getTime() + interval * 60000);
      slots.push({
        courtId,
        date,
        startTime: currentSlot,
        endTime: slotEndTime,
        status: "available",
      });
      currentSlot = slotEndTime;
    }

    // Save slots to DB
    const createdSlots = await Slot.insertMany(slots);
    res
      .status(201)
      .json({ message: "Slots created successfully", slots: createdSlots });
  } catch (err) {
    res.status(500).json({ message: "Error creating slots", error: err });
  }
};

/*
 * Update a slot (change availability, etc.)
 * Route Parameter: slotId
 */
exports.updateSlot = async (req, res) => {
  const { slotId } = req.params;
  const updateData = req.body;
  try {
    const updatedSlot = await Slot.findByIdAndUpdate(slotId, updateData, {
      new: true,
    });
    if (!updatedSlot) {
      return res.status(404).json({ message: "Slot not found" });
    }
    res
      .status(200)
      .json({ message: "Slot updated successfully", slot: updatedSlot });
  } catch (err) {
    res.status(500).json({ message: "Error updating slot", error: err });
  }
};

/*
 * Delete a slot
 * Route Parameter: slotId
 */
exports.deleteSlot = async (req, res) => {
  const { slotId } = req.params;
  try {
    const deletedSlot = await Slot.findByIdAndDelete(slotId);
    if (!deletedSlot) {
      return res.status(404).json({ message: "Slot not found" });
    }
    res.status(200).json({ message: "Slot deleted successfully", deletedSlot });
  } catch (err) {
    res.status(500).json({ message: "Error deleting slot", error: err });
  }
};
