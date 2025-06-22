const express = require("express");
const router = express.Router();
const { authorize, permit } = require("../../middlewares/auth.middleware");
const courtManagementController = require("../../controllers/admin/court.controller");


// Get all courts.
router.post(
  "/",
  authorize,
  permit("admin", "superAdmin"),
  courtManagementController.createCourt
);

// Get all courts.
router.get(
  "/",
  authorize,
  permit("admin", "superAdmin"),
  courtManagementController.getAllCourts
);

// Update an existing court.
router.put(
  "/:courtId",
  authorize,
  permit("admin", "superAdmin"),
  courtManagementController.updateCourt
);

// Delete a court.
router.delete(
  "/:courtId",
  authorize,
  permit("admin", "superAdmin"),
  courtManagementController.deleteCourt
);


module.exports = router;