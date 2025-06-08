const UserService = require("../../services/admin/user.service");
const {
  successResponse,
  errorResponse,
} = require("../../util/responses/apiResponse");

// 1. Create User
exports.createUser = async (req, res) => {
  const { name, email, password, mobile_number, profileImageUrl, role } =
    req.body;

  if (!email || !password) {
    return errorResponse(res, "Email and password are required", 400);
  }

  try {
    const result = await UserService.createUser(
      {
        name,
        email,
        password,
        mobile_number,
        profileImageUrl,
        role,
      },
      req.user?.id, // performedBy (if present)
      req.ip,
      req.headers["user-agent"]
    );
    return successResponse(
      res,
      "User created successfully",
      {
        user: result.user,
        token: result.token,
        id: result.user._id,
      },
      201
    );
  } catch (err) {
    return errorResponse(res, err.message || "Error creating user", 500);
  }
};

// 2. Update User Info
exports.updateUser = async (req, res) => {
  const userId = req.params.id || req.query.id;
  const updateFields = req.body;

  if (!userId) {
    return errorResponse(res, "User ID is required", 400);
  }

  try {
    const updatedUser = await UserService.updateUser(
      userId,
      updateFields,
      req.user.id, // performedBy user id (from auth middleware)
      req.ip, // IP address
      req.headers["user-agent"] // user agent string
    );

    return successResponse(res, "User updated successfully", {
      user: updatedUser,
    });
  } catch (err) {
    return errorResponse(res, err.message || "Error updating user", 500);
  }
};

// 3. Change User Role
exports.changeUserRole = async (req, res) => {
  const userId = req.params.id || req.query.id;
  const { role } = req.body;

  if (!userId) {
    return errorResponse(res, "User ID is required", 400);
  }

  if (!role) {
    return errorResponse(res, "New role is required", 400);
  }

  try {
    const updatedUser = await UserService.changeRole(
      userId,
      role,
      req.user.id,
      req.ip,
      req.headers["user-agent"]
    );
    return successResponse(res, "User role updated successfully", {
      user: updatedUser,
    });
  } catch (err) {
    return errorResponse(res, err.message || "Error changing user role", 500);
  }
};

// 4. Delete User
exports.deleteUser = async (req, res) => {
  const userId = req.params.id || req.query.id;

  if (!userId) {
    return errorResponse(res, "User ID is required", 400);
  }

  try {
    const deletedUser = await UserService.deleteUser(
      userId,
      req.user.id,
      req.ip,
      req.headers["user-agent"]
    );
    return successResponse(res, "User deleted successfully", { deletedUser });
  } catch (err) {
    return errorResponse(res, err.message || "Error deleting user", 500);
  }
};

// 5. Get All Users
exports.getAllUserInfo = async (req, res) => {
  try {
    const users = await UserService.getAllUsers();
    return successResponse(res, "All users fetched successfully", { users });
  } catch (err) {
    return errorResponse(res, err.message || "Error fetching users", 500);
  }
};
