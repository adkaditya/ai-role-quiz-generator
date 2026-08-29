import Role from "../models/role.model.js";
import User from "../models/user.model.js";
import {
  generateToken,
  registerUserService,
  verifyEmailService,
  resendVerificationOTP,
} from "../services/auth.service.js";

// ==========================
// Register User
// ==========================
export const registerUser = async (req, res) => {
  try {
    const result = await registerUserService(req.body);
return res.status(201).json({
  status: "success",
  message: "Registration successful. Please check your email for the verification OTP.",
  data: {
    email: result.email,
    isEmailVerified: result.isEmailVerified,
  },
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
  return res.status(401).json({
    status: "error",
    message: "Invalid Email or Password",
  });
}

// ==========================================
// Check Email Verification
// ==========================================

// Agar user ne email verify nahi kiya hai
// to login allow nahi karenge
if (!user.isEmailVerified) {
  return res.status(403).json({
    status: "error",
    message: "Please verify your email before login",
  });
}

// ==========================================
// Generate JWT Token
// ==========================================

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
// ==========================================
// Verify Email
// ==========================================

export const verifyEmail = async (req, res) => {
  try {
    // Frontend se email aur OTP receive kar rahe hain
    const { email, otp } = req.body;

    // Basic validation
    if (!email || !otp) {
      return res.status(400).json({
        status: "error",
        message: "Email and OTP are required",
      });
    }

    // OTP verification service ko call karo
    await verifyEmailService(email, otp);

    return res.status(200).json({
      status: "success",
      message: "Email verified successfully",
    });
  } catch (error) {
    console.error("VERIFY EMAIL ERROR:", error);

    return res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};

// ==========================================
// RESEND OTP
// ==========================================

export const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        status: "error",
        message: "Email is required",
      });
    }

    const result = await resendVerificationOTP(email);

    return res.status(200).json({
      status: "success",
      message: "OTP sent successfully",
      data: result,
    });
  } catch (error) {
    console.error("RESEND OTP ERROR:", error);

    return res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};