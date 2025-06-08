const express = require("express");
const router = express.Router();

const userManagementController = require("../../controllers/admin/user.controller");
const { authorize, permit } = require("../../middlewares/auth.middleware");
const UserRole = require("../../enums/useRole");

// Get all users (admin or superAdmin)
router.get(
  "/all",
  authorize,
  permit(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  userManagementController.getAllUserInfo
);

// Create a new user (admin use)
router.post(
  "/create",
  authorize,
  permit(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  userManagementController.createUser
);

// Update user info (admin can update user fields)
router.put(
  "/update/:id?",
  authorize,
  permit(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  userManagementController.updateUser
);

// Change user role (superAdmin only)
router.put(
  "/update-role/:id?",
  authorize,
  permit(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  userManagementController.changeUserRole
);

// Delete user (admin or superAdmin)
router.delete(
  "/delete/:id?",
  authorize,
  permit(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  userManagementController.deleteUser
);

module.exports = router;
