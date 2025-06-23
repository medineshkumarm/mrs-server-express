const Slot = require("../../models/slot.model");


exports.getAllCourtsAvailabilityToday = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    const allSlots = await Slot.find({
      startTime: { $gte: today, $lte: endOfDay },
    }).populate("courtId");

    const summaryMap = {};

    allSlots.forEach((slot) => {
      const cid = slot.courtId._id.toString();
      const cname = slot.courtId.name;

      if (!summaryMap[cid]) {
        summaryMap[cid] = {
          courtId: cid,
          courtName: cname,
          totalSlots: 0,
          availableSlots: 0,
          timeRanges: [],
        };
      }

      summaryMap[cid].totalSlots += 1;

      if (!slot.isBooked) {
        summaryMap[cid].availableSlots += 1;

        const start = new Date(slot.startTime).toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
        });
        const end = new Date(slot.endTime).toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
        });

        summaryMap[cid].timeRanges.push(`${start} - ${end}`);
      }
    });

    const result = Object.values(summaryMap);

    res.status(200).json({
      success: true,
      message: `Today's availability for all courts`,
      data: result,
      error: null,
    });
  } catch (err) {
    console.error("Error fetching today's court availability:", err);
    res.status(500).json({
      success: false,
      message: "Server error fetching today's availability",
      data: null,
      error: err.message,
    });
  }
};

// POST: /api/slots/summary
exports.getCourtAvailabilitySummaryWithTotals = async (req, res) => {
  const { courtIds, date } = req.body;

  if (!courtIds || !Array.isArray(courtIds) || !date) {
    return res.status(400).json({
      success: false,
      message: "courtIds (array) and date (YYYY-MM-DD) are required",
      data: null,
      error: "Missing or invalid parameters",
    });
  }

  try {
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);

    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    // Fetch all slots (booked + unbooked) for the courts on the date
    const allSlots = await Slot.find({
      courtId: { $in: courtIds },
      startTime: { $gte: dayStart, $lte: dayEnd },
    }).populate("courtId");

    // Prepare summary
    const summaryMap = {};

    allSlots.forEach((slot) => {
      const cid = slot.courtId._id.toString();
      const cname = slot.courtId.name;

      if (!summaryMap[cid]) {
        summaryMap[cid] = {
          courtId: cid,
          courtName: cname,
          totalSlots: 0,
          availableSlots: 0,
          timeRanges: [],
        };
      }

      summaryMap[cid].totalSlots += 1;

      if (!slot.isBooked) {
        summaryMap[cid].availableSlots += 1;

        const start = new Date(slot.startTime).toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
        });
        const end = new Date(slot.endTime).toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
        });

        summaryMap[cid].timeRanges.push(`${start} - ${end}`);
      }
    });

    // Final result as array
    const result = Object.values(summaryMap);

    res.status(200).json({
      success: true,
      message: `Court availability summary for ${date}`,
      data: result,
      error: null,
    });
  } catch (err) {
    console.error("Error fetching availability summary:", err);
    res.status(500).json({
      success: false,
      message: "Server error fetching court availability summary",
      data: null,
      error: err.message,
    });
  }
};


/* GET all available slots across all courts */
exports.getAllSlots = async (req, res, next) => {
  try {
    const availableSlots = await Slot.find({ isBooked: false });
    res.status(200).json({
      message: "Getting Available Slots",
      availableSlots,
    });
  } catch (err) {
    next(err);
    res
      .status(500)
      .json({ message: "Error retrieving available slots", error: err });
  }
};

/* GET available slots for a specific court.
   Optionally filters by a provided date (YYYY-MM-DD). */
exports.getAllCourtSlotsByDate = async (req, res) => {
  const { date } = req.query;

  if (!date) {
    return res.status(400).json({
      success: false,
      message: "date is required",
      data: null,
      error: "Missing 'date' query parameter",
    });
  }

  try {
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);

    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    const availableSlots = await Slot.find({
      isBooked: false,
      startTime: { $gte: dayStart, $lte: dayEnd },
    }).populate("courtId");

    res.status(200).json({
      success: true,
      message: `Available slots for all courts on ${date}`,
      data: {
        date,
        availableSlots,
      },
      error: null,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error retrieving slots",
      data: null,
      error: err.message,
    });
  }
};

/* GET available slots for a specific court by date range
   Query params:
   - date: Start date (YYYY-MM-DD)
*/

exports.getCourtSlotsByDate = async (req, res) => {
  const { courtId } = req.params;
  const { date } = req.query;

  if (!courtId || !date) {
    return res.status(400).json({
      success: false,
      message: "courtId and date are required",
      data: null,
      error: "Missing 'courtId' param or 'date' query",
    });
  }

  try {
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);

    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    const availableSlots = await Slot.find({
      courtId,
      isBooked: false,
      startTime: { $gte: dayStart, $lte: dayEnd },
    }).populate("courtId");

    res.status(200).json({
      success: true,
      message: `Available slots for court ${courtId} on ${date}`,
      data: {
        date,
        courtId,
        availableSlots,
      },
      error: null,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error retrieving slots",
      error: err.message,
      data: null,
    });
  }
};



