import passport from "../config/passport.js";

import Role from "../models/role.model.js";
import User from "../models/user.model.js";
import {
  generateToken,
  registerUserService,
  verifyEmailService,
  resendVerificationOTP,
} from "../services/auth.service.js";
import {
  sendSmsOTP,
  verifySmsOTP,
} from "../services/sms.service.js";

// ==========================
// Register User
// ==========================
export const registerUser = async (req, res) => {
  try {
    const result = await registerUserService(req.body);

    return res.status(201).json({
      status: "success",
      message:
        "Registration successful. Please verify your email with the OTP.",
      data: {
        email: result.email,
        isEmailVerified: result.isEmailVerified,
        developmentOTP: process.env.NODE_ENV !== "production"
          ? result.verificationOTP
          : undefined,
      },
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error);

    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// ==========================
// Login User
// ==========================
// ==========================
// Login User
// ==========================

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email?.trim() || !password) {
      return res.status(400).json({
        status: "error",
        message: "Email and Password are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
    }).populate("role");

    if (!user) {
      return res.status(401).json({
        status: "error",
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

    if (!user.isEmailVerified) {
      return res.status(403).json({
        status: "error",
        message: "Please verify your email before login",
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
      status: "error",
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


/* Send SMS OTP */
export const sendSMSOTPController = async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({
        status: "error",
        message: "Phone number is required",
      });
    }

    const result = await sendSmsOTP(phoneNumber);

    return res.status(200).json({
      status: "success",
      message: "SMS OTP sent successfully",
      data: {
        status: result.status,
      },
    });
  } catch (error) {
    console.error("SEND SMS OTP ERROR:", error.message);

    return res.status(400).json({
      status: "error",
      message: error.message || "Unable to send SMS OTP",
    });
  }
};

/* Verify SMS OTP */
export const verifySMSOTPController = async (req, res) => {
  try {
    const { phoneNumber, otp } = req.body;

    if (!phoneNumber || !otp) {
      return res.status(400).json({
        status: "error",
        message: "Phone number and OTP are required",
      });
    }

    const result = await verifySmsOTP(phoneNumber, otp);

    if (result.status !== "approved") {
      return res.status(400).json({
        status: "error",
        message: "Invalid or expired SMS OTP",
      });
    }
    const normalizedPhone = phoneNumber.trim();

const user = await User.findOneAndUpdate(
  { phoneNumber: normalizedPhone },
  { $set: { isPhoneVerified: true } },
  { new: true }
);

if (!user) {
  return res.status(404).json({
    status: "error",
    message: "OTP verified, but no registered user has this phone number",
  });
}

    return res.status(200).json({
      status: "success",
      message: "Phone number verified successfully",
    });
  } catch (error) {
    console.error("VERIFY SMS OTP ERROR:", error.message);

    return res.status(400).json({
      status: "error",
      message: error.message || "SMS OTP verification failed",
    });
  }
};

export const googleAuthCallback = (req, res, next) => {
  passport.authenticate(
    "google",
    { session: false },
    async (error, user) => {
      try {
        if (error || !user) {
          console.error("GOOGLE AUTH ERROR:", error);

          return res.redirect(
            `${process.env.FRONTEND_URL}/login?error=google_auth_failed`
          );
        }

        if (user.status !== "active") {
          return res.redirect(
            `${process.env.FRONTEND_URL}/login?error=account_inactive`
          );
        }

        const accessToken = await generateToken(user._id);

        const populatedUser = await User.findById(user._id).populate("role");

        // JWT ko URL mein expose nahi kar rahe.
        // Frontend exchange endpoint secure karna next step hai.
        return res.status(200).json({
          status: "success",
          message: "Google authentication successful",
          accessToken,
          user: populatedUser,
        });
      } catch (callbackError) {
        next(callbackError);
      }
    }
  )(req, res, next);
};