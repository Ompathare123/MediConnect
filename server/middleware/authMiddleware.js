const jwt = require("jsonwebtoken");
const User = require("../models/User"); // Import your User model

exports.protect = async (req, res, next) => {
  let token;

  // 1. Check if the Authorization header exists and starts with 'Bearer'
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      // 2. Extract the token
      token = req.headers.authorization.split(" ")[1];

      // 3. Verify the token using your secret key
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret123");

      // 4. Fetch the user from the database and attach to the request object
      // We exclude the password field for security
      req.user = await User.findById(decoded.id).select("-password");

      // 5. If user doesn't exist in DB (e.g. account deleted), deny access
      if (!req.user) {
        return res.status(401).json({ message: "User not found, authorization denied" });
      }

      // Ensure id and role are explicitly available on req.user for controllers
      if (!req.user.id) req.user.id = req.user._id;

      next();
    } catch (err) {
      console.error("Middleware Auth Error:", err.message);
      res.status(401).json({ message: "Token is not valid or expired" });
    }
  }

  // 6. If no token was found at all
  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }
};