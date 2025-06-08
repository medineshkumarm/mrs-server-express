// user management
const User = require("../../models/user.model");
const jwt = require("jsonwebtoken");
const mongoose = require('mongoose');
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "1h" });
};

// 1. create new user
exports.createUser = async (req, res, next) => {
  try {
    const { name, email, password, mobile_number, profileImageUrl, role } =
      req.body;

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
      message: "New User created by Admin",
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

//3 . update user info except role
// PUT {{localhost}}/api/v1/admin/updateuser?id=68008fbc65d9a78b3dde577c (query param)
// PUT {{localhost}}/api/v1/admin/updateuser/68008fbc65d9a78b3dde577c (route parameter)
exports.UpdateUserInfo = async (req, res, next) => {
  try {
    // Get ID from either params or query
    const userId = req.params.id || req.query.id;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required"
      });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID format"
      });
    }

    const { name, email, mobile_number, profileImageUrl } = req.body;

    // Check if user exists
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // If email is being updated, check if new email already exists
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(409).json({
          success: false,
          message: "Email already in use"
        });
      }
    }

    // Create update object with only provided fields
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (mobile_number) updateData.mobile_number = mobile_number;
    if (profileImageUrl) updateData.profileImageUrl = profileImageUrl;

    // Update user info
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "User information updated successfully",
      data: updatedUser
    });
  } catch (error) {
    next(error);
  }
};

// (super admin things )
// 2. change user role

// 2. change user role (super admin only)
exports.changeUserRole = async (req, res, next) => {
  try {
    const userId = req.params.id || req.query.id;

    // Validate userId
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required"
      });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID format"
      });
    }

    const { role } = req.body;

    // Validate role
    const validRoles = ["user", "admin", "superAdmin"];
    if (!role || !validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: `Invalid role. Must be one of: ${validRoles.join(", ")}`
      });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Prevent changing superAdmin's role
    if (user.role === "superAdmin" && role !== "superAdmin") {
      return res.status(403).json({
        success: false,
        message: "Cannot change superAdmin's role"
      });
    }

    // Update role with validation
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { role },
      { 
        new: true,
        runValidators: true,
        select: '-password'  // Exclude password from response
      }
    );

    res.status(200).json({
      success: true,
      message: "User role updated successfully",
      data: updatedUser
    });
  } catch (error) {
    next(error);
  }
};

//4 . delete user
exports.deleteUser = async (req, res, next) => {
  try {
    const userId = req.params.id || req.query.id;

    // Validate userId
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required"
      });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID format"
      });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Prevent deleting superAdmin
    if (user.role === "superAdmin") {
      return res.status(403).json({
        success: false,
        message: "Cannot delete superAdmin user"
      });
    }

    // Delete user
    const deletedUser = await User.findByIdAndDelete(userId);

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
      deletedUser,
    });
  } catch (error) {
    next(error);
  }
};
exports.getAllUserInfo = async (req, res, next) => {
  try {
    const users = await User.find({}).select("-password").lean();
    // console.log(users);

    res.status(200).json({
      message: "All User Details",
      data: users,
    });
  } catch (error) {
    next(error);
  }
};
