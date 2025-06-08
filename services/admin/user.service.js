const User = require("../../models/user.model");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const UserRole = require("../../enums/useRole");
const AuditLogService = require("./auditLog.service");

const AuditActions = require("../../enums/auditActions.enum");
const AuditEntities = require("../../enums/auditEntity.enum");

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "1h" });
};

class UserService {
  static async createUser(data, performedBy, ipAddress, userAgent) {
    const { name, email, password, mobile_number, profileImageUrl, role } =
      data;

    if (!email || !password) throw new Error("Email and password are required");

    const existingUser = await User.findOne({ email });
    if (existingUser) throw new Error("Email already in use");

    const assignedRole = role || UserRole.USER;
    const newUser = await User.create({
      name,
      email,
      password,
      mobile_number,
      profileImageUrl,
      role: assignedRole,

      
    });

    // Create audit log (optional)
    if (performedBy) {
      AuditLogService.createLog({
        action: AuditActions.USER.CREATE,
        performedBy,
        entityType: AuditEntities.USER,
        entityId: newUser._id,
        newValue: newUser.toObject(),
        description: `User created`,
        ipAddress,
        userAgent,
      }).catch(console.error);
    }

    return {
      user: newUser,
      token: generateToken(newUser._id, assignedRole),
    };
  }

  static async updateUser(id, updateFields, performedBy, ipAddress, userAgent) {
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("Invalid user ID");
    }

    const user = await User.findById(id);
    if (!user) throw new Error("User not found");

    if (updateFields.email && updateFields.email !== user.email) {
      const emailExists = await User.findOne({ email: updateFields.email });
      if (emailExists) throw new Error("Email already in use");
    }

    // Prevent role updates here — role updates via separate method
    if ("role" in updateFields) {
      delete updateFields.role;
    }

    const oldValue = user.toObject();

    const updatedUser = await User.findByIdAndUpdate(id, updateFields, {
      new: true,
      runValidators: true,
    });

    const newValue = updatedUser.toObject();

    // Create audit log (fire and forget)
    AuditLogService.createLog({
      action: "USER_UPDATE",
      performedBy,
      entityType: "User",
      entityId: updatedUser._id,
      oldValue,
      newValue,
      description: `User updated (except role)`,
      ipAddress,
      userAgent,
    }).catch((err) => {
      console.error("AuditLog error:", err);
    });

    return updatedUser;
  }

  static async changeRole(id, newRole, performedBy, ipAddress, userAgent) {
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("Invalid user ID");
    }

    const validRoles = [UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.USER];
    if (!validRoles.includes(newRole)) {
      throw new Error(`Invalid role. Must be one of: ${validRoles.join(", ")}`);
    }

    const user = await User.findById(id);
    const oldRole = user.role;

    if (!user) throw new Error("User not found");

    if (
      user.role === UserRole.SUPER_ADMIN &&
      newRole !== UserRole.SUPER_ADMIN
    ) {
      throw new Error("Cannot change superAdmin's role");
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { role: newRole },
      {
        new: true,
        runValidators: true,
        select: "-password",
      }
    );
    // Create audit log
    AuditLogService.createLog({
      action: AuditActions.USER.ROLE_CHANGE,
      performedBy,
      entityType: AuditEntities.USER,
      entityId: updatedUser._id,
      oldValue: { role: oldRole },
      newValue: { role: newRole },
      description: `User role changed from ${oldRole} to ${newRole}`,
      ipAddress,
      userAgent,
    }).catch(console.error);

    return updatedUser;
  }

  static async deleteUser(id, performedBy, ipAddress, userAgent) {
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("Invalid user ID");
    }

    const user = await User.findById(id);
    if (!user) throw new Error("User not found");

    if (user.role === UserRole.SUPER_ADMIN) {
      throw new Error("Cannot delete superAdmin user");
    }

    const deletedUser = await User.findByIdAndDelete(id);

    // Create audit log
    AuditLogService.createLog({
      action: AuditActions.USER.DELETE,
      performedBy,
      entityType: AuditEntities.USER,
      entityId: deletedUser._id,
      oldValue: deletedUser.toObject(),
      description: `User deleted`,
      ipAddress,
      userAgent,
    }).catch(console.error);

    return deletedUser;
  }

  static async getAllUsers() {
    return await User.find({}).select("-password").lean();
  }
}

module.exports = UserService;
