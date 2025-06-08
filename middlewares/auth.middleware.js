const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
/**
 * decoded token structure
 * {
  id: '67cbfc93d23f71a1e124707c',
  role: 'user',
  iat: 1741425549,
  exp: 1741429149
}
 */
exports.authorize = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) return res.status(401).json({ message: "Unauthorized" });
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    req.user = user; // Attach user to request

    next();
  } catch (error) {
    console.error("Authorization Middleware Error:", error);
    
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

exports.permit = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({
          message: "Forbidden: You don't have the permission to access",
        });
    }
    next();
  };
};
