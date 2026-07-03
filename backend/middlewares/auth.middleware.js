import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
export const authMiddleware = async (req, res, next) => {
  try {
    let token;
    console.log("auth middleware started...");

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      // Bearer sadahsgop
      token = req.headers.authorization.substring(7);

      const payload = await jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findOne({ _id: payload.id }).populate("role");
      console.log(user);
      req.user = user;
      next();
    } else {
      return res.status(401).json({ message: "Unauthorized" });
    }
  } catch (err) {
    console.log(err);
    return res.status(401).json({ message: "Unauthorized" });
  }
};