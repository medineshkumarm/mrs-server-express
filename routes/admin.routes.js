const express = require("express");
const router = express.Router();
const { authorize, permit } = require("../middlewares/auth.middleware");

const courtController = require("../controllers/admin/court.controller");
const slotController = require("../controllers/admin/slot.controller");
const userManagementController = require("../controllers/admin/user.controller");

//(Admin Panel)court managements
// Get all slots (for all courts)
router.get(
  "/slot",
  authorize,
  permit("admin", "superAdmin"),
  slotController.getAllSlots
);


// Get slots by date and courtId
router.get(
  "/slots/availability",
  authorize,
  slotController.getSlotsByDateAndCourt
);
// Get all slots for a specific court
router.get(
  "/slot/:courtId",
  authorize,
  permit("admin", "superAdmin"),
  slotController.getSlotsForCourt
);

// *********************************

/// make it for super admin

// *********************************

// Create slots for a court
// router.post("/slots/:courtId", slotController.createSlotsForCourt);

// Update a slot (change availability, timing, etc.)
router.put(
  "/slot/:slotId",
  authorize,
  permit("admin", "superAdmin"),
  slotController.updateSlot
);

// Delete a slot
router.delete(
  "/slot/:slotId",
  authorize,
  permit("superAdmin"),
  slotController.deleteSlot
);

//(Admin Panel)court managements

// Create a new court.
router.post(
  "/court",
  authorize,
  permit("admin", "superAdmin"),
  courtController.createCourt
);

// Get all courts.
router.get(
  "/court",
  authorize,
  permit("admin", "superAdmin"),
  courtController.getAllCourts
);

// Update an existing court.
router.put(
  "/court/:courtId",
  authorize,
  permit("admin", "superAdmin"),
  courtController.updateCourt
);

// Delete a court.
router.delete(
  "/court/:courtId",
  authorize,
  permit("admin", "superAdmin"),
  courtController.deleteCourt
);

// user management
//5 . Get All users
router.get(
  "/allusers",
  authorize,
  permit("admin", "superAdmin"),
  userManagementController.getAllUserInfo
);

// 1. create new user
router.post(
  "/newuser",
  authorize,
  permit("admin", "superAdmin"),
  userManagementController.createUser
);
//3 . update user info except role
router.put(
  "/updateuser/:id?",
  authorize,
  permit("admin", "superAdmin"),
  userManagementController.UpdateUserInfo
);

// (super admin things )
// 2. change user role
router.put(
  "/changeuserrole/:id?",
  authorize,
  permit("admin", "superAdmin"),
  userManagementController.changeUserRole
);
//4 . delete user
router.delete(
  "/deleteuser/:id?",
  authorize,
  permit("admin", "superAdmin"),
  userManagementController.deleteUser
);

//booking managements

// 1. create new booking by admin
//3 . view all booking info

// (super admin things )
// 2. update or change booking info
//4 . delete booking

//payment managements

module.exports = router;
