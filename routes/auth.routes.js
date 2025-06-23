const express = require("express");
const {
  registerUser,
  loginUser,
  getUserInfo,
  forgotPassword,
  resetPassword,
} = require("../controllers/auth.controller");
const { authorize, permit } = require("../middlewares/auth.middleware");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/getUser", authorize, getUserInfo);

router.post("/forgot-password", forgotPassword);

router.post("/reset-password", resetPassword);

//sample
// Admin-only route
router.get(
  "/admin/dashboard",
  authorize,
  permit("admin", "superAdmin"),
  (req, res) => {
    res.json({ message: "Admin dashboard!" });
  }
);

module.exports = router;
