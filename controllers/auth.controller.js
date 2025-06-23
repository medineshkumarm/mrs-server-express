const User = require("../models/user.model");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const BASE_URL = process.env.BASE_URL; 
//should be frontend url
//generate JWT token
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "1h" });
};

const resetPasswordToken = (id, role, time) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: time || "15min",
  });
};

exports.registerUser = async (req, res, next) => {
  try {
    const { name, email, password, mobile_number, profileImageUrl, role } =
      req.body;

      console.log(mobile_number)

    //validation: Check for missing fields
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    //if user already exist
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email already in use" });
    }

    // Assign default role if not provided
    const assignedRole = role || "user";

    const newUser = await User.create({
      name,
      email,
      password,
      mobile_number,
      profileImageUrl,
      role: assignedRole,
    });

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: {
        user: newUser,
        token: generateToken(newUser._id, assignedRole),
        id: newUser._id,
      },
    });
  } catch (error) {
    next(error);
    
  }
};

exports.loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    //validation: Check for missing fields
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    //if user already exist
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!(await user.comparePassword(password))) {
      const error = new Error("Invalid password");
      error.statusCode = 401;
      throw error;
    }

    res.status(200).json({
      success: true,
      message: "User signed in successfully",
      data: {
        user,
        token: generateToken(user._id, user.role),
        id: user._id,
      },
    });
  } catch (error) {
    next(error);
  }
};

//get user info
exports.getUserInfo = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      user,
    });
  } catch (error) {
    next(error);
  }
};

//forgot password
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: "Email not found" });

    const resetToken = resetPasswordToken(user.id, user.role, "15min");

    const resetLink = `${BASE_URL}/api/v1/auth/reset-password?token=${resetToken}`;
    console.log(resetLink);
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password reset",
      html: `<p>Click below to reset your password:</p><a href="${resetLink}">Reset Password</a>`,
    });

    // For testing: Return token in response
    res.status(200).json({
      message: "Password reset link sent to email!",
      resetToken:
        process.env.NODE_ENV === "development" ? resetToken : undefined,
    });
    // res.status(200).json({ message: "Password reset link sent to email!" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

//reset password
exports.resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    console.log(token);

    if (!token || !newPassword) {
      return res.status(400).json({
        message: "Token and new password are required",
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({
          message:
            "Token has expired. Please request a new password reset link.",
        });
      }
      return res.status(400).json({ message: "Invalid token" });
    }
    const user = await User.findById(decoded.id);
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found. Please register" });
    }

    user.password = newPassword;
    await user.save();

    return res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
