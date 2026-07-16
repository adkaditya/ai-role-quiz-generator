import Role from "../models/role.model.js";
import User from "../models/user.model.js";
import {
  generateToken,
  registerUserService,
} from "../services/auth.service.js";

// ==========================
// Register User
// ==========================
export const registerUser = async (req, res) => {
  try {
    const result = await registerUserService(req.body);

    return res.status(201).json({
      status: "success",
      message: "User created successfully",
      data: result,
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error);

    return res.status(500).json({
      message: error.message,
    });
  }
};

// ==========================
// Login User
// ==========================
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and Password are required",
      });
    }

    const user = await User.findOne({ email }).populate("role");

    if (!user) {
      return res.status(404).json({
        message: "Invalid Email or Password",
      });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(404).json({
        message: "Invalid Email or Password",
      });
    }

    const accessToken = await generateToken(user._id);

    return res.status(200).json({
      status: "success",
      message: "Login successful",
      accessToken,
      user,
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);

    return res.status(500).json({
      message: error.message,
    });
  }
};

// ==========================
// Delete User
// ==========================
export const deleteUser = async (req, res) => {
  try {
    return res.status(200).json({
      status: "success",
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: error.message,
    });
  }
};

// ==========================
// Change User Role
// ==========================
export const changeUserRole = async (req, res) => {
  try {
    const { userId, role } = req.body;

    const user = await User.findById(userId).populate("role");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (user.role?.name === role) {
      return res.status(400).json({
        message: "User already has this role",
      });
    }

    const roleObj = await Role.findOne({ name: role });

    if (!roleObj) {
      return res.status(404).json({
        message: "Role not found",
      });
    }

    user.role = roleObj._id;

    await user.save();

    return res.status(200).json({
      status: "success",
      message: "User role changed successfully",
      user,
    });
  } catch (error) {
    console.error("CHANGE ROLE ERROR:", error);

    return res.status(500).json({
      message: error.message,
    });
  }
};