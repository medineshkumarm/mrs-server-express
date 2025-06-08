const express = require("express");
const router = express.Router();
const slotManagementController = require("../../controllers/admin/slot.controller");
const { authorize, permit } = require("../../middlewares/auth.middleware");

// Get slots with optional filters: date, courtId
router.get(
  "/",
  authorize,
  permit("admin", "superAdmin"),
  slotManagementController.getSlots
);

// Update a slot by ID
router.put(
  "/:slotId",
  authorize,
  permit("admin", "superAdmin"),
  slotManagementController.updateSlot
);

// Delete a slot by ID
router.delete(
  "/:slotId",
  authorize,
  permit("admin", "superAdmin"),
  slotManagementController.deleteSlot
);

// // Create slots for a court
// router.post("/court/:courtId",  authorize,permit("admin", "superAdmin"),slotManagementController.createSlotsForCourt);

module.exports = router;
