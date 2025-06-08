const express = require("express");
const router = express.Router();

const slotController = require("../controllers/user/slot.controller");
const { authorize } = require("../middlewares/auth.middleware");

// Get all available slots across all courts.
// router.get("/all-slots", authorize, slotController.getAllSlots);

// Route to get available slots for all courts on a specific date
router.get("/slots-by-date", authorize, slotController.getAllCourtSlotsByDate);

// Get available slots for a specific court.
// Accepts an optional query parameter "date" (YYYY-MM-DD) to filter slots by day.
router.get("/slots-by-date/:courtId", authorize, slotController.getCourtSlotsByDate);

router.get("/summary", authorize, slotController.getAllCourtsAvailabilityToday);


module.exports = router;