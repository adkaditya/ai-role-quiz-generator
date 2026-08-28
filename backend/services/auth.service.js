// ======================================================
// AUTH SERVICE
// ======================================================

import Role from "../models/role.model.js";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";

import { generateOTP } from "../utils/generateOTP.js";
import { sendVerificationEmail } from "./email.service.js";

// ======================================================
// REGISTER USER
// ======================================================

export const registerUserService = async (data) => {
  try {
    const { name, email, password } = data;

    // ------------------------------------------
    // Validation
    // ------------------------------------------

    if (!name || !email || !password) {
      throw new Error("Name, email and password are required");
    }

    const normalizedEmail = email.trim().toLowerCase();

    // ------------------------------------------
    // Check Existing User
    // ------------------------------------------

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    // ------------------------------------------
    // If user already exists
    // ------------------------------------------

    if (existingUser) {
      // Agar email already verified hai
      if (existingUser.isEmailVerified) {
        throw new Error("User already exists");
      }

      // ------------------------------------------
      // Existing but unverified user
      // New OTP generate karo
      // ------------------------------------------

      const verificationOTP = String(generateOTP());

      const verificationOTPExpires = new Date(
        Date.now() + 10 * 60 * 1000
      );

      existingUser.verificationOTP = verificationOTP;
      existingUser.verificationOTPExpires =
        verificationOTPExpires;

      await existingUser.save();

      // OTP email send karo
      await sendVerificationEmail(
        normalizedEmail,
        verificationOTP
      );

      return existingUser;
    }

    // ------------------------------------------
    // Generate OTP
    // ------------------------------------------

    const verificationOTP = String(generateOTP());

    const verificationOTPExpires = new Date(
      Date.now() + 10 * 60 * 1000
    );

    // ------------------------------------------
    // Decide User Role
    // ------------------------------------------

    const userCount = await User.countDocuments();

    const roleName = userCount === 0 ? "admin" : "user";

    const role = await getOrCreateRole(roleName);

    // ------------------------------------------
    // Create User
    // ------------------------------------------

    const createdUser = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,

      role: role._id,

      isEmailVerified: false,

      verificationOTP,

      verificationOTPExpires,
    });

    // ------------------------------------------
    // Send Verification Email
    // ------------------------------------------

    try {
      await sendVerificationEmail(
        normalizedEmail,
        verificationOTP
      );
    } catch (emailError) {
      console.error(
        "EMAIL SEND ERROR:",
        emailError
      );

      // Agar email send nahi hui
      // to incomplete user ko delete kar do
      await User.findByIdAndDelete(createdUser._id);

      throw new Error(
        "Registration failed because verification email could not be sent"
      );
    }

    return createdUser;
  } catch (error) {
    console.error("REGISTER SERVICE ERROR:", error);

    throw error;
  }
};

// ======================================================
// GET OR CREATE ROLE
// ======================================================

const getOrCreateRole = async (roleName) => {
  let role = await Role.findOne({
    name: roleName,
  });

  if (role) {
    return role;
  }

  role = await Role.create({
    name: roleName,
  });

  return role;
};

// ======================================================
// GENERATE JWT TOKEN
// ======================================================

export const generateToken = async (userId) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }

  return jwt.sign(
    {
      id: userId,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "24h",
    }
  );
};

// ======================================================
// VERIFY EMAIL OTP
// ======================================================

export const verifyEmailService = async (
  email,
  otp
) => {
  if (!email || !otp) {
    throw new Error(
      "Email and OTP are required"
    );
  }

  const normalizedEmail = email
    .trim()
    .toLowerCase();

  const normalizedOTP = String(otp).trim();

  // ------------------------------------------
  // Find User
  // ------------------------------------------

  const user = await User.findOne({
    email: normalizedEmail,
  });

  if (!user) {
    throw new Error("User not found");
  }

  // ------------------------------------------
  // Already Verified
  // ------------------------------------------

  if (user.isEmailVerified) {
    throw new Error(
      "Email is already verified"
    );
  }

  // ------------------------------------------
  // Check OTP Exists
  // ------------------------------------------

  if (!user.verificationOTP) {
    throw new Error(
      "No verification OTP found. Please request a new OTP."
    );
  }

  // ------------------------------------------
  // Check OTP
  // ------------------------------------------

  if (
    String(user.verificationOTP).trim() !==
    normalizedOTP
  ) {
    throw new Error("Invalid OTP");
  }

  // ------------------------------------------
  // Check OTP Expiry
  // ------------------------------------------

  if (
    !user.verificationOTPExpires ||
    user.verificationOTPExpires < new Date()
  ) {
    throw new Error(
      "OTP has expired. Please request a new OTP."
    );
  }

  // ------------------------------------------
  // Verify Email
  // ------------------------------------------

  user.isEmailVerified = true;

  user.verificationOTP = null;

  user.verificationOTPExpires = null;

  await user.save();

  return user;
};

// ======================================================
// RESEND VERIFICATION OTP
// ======================================================

export const resendVerificationOTP = async (
  email
) => {
  if (!email) {
    throw new Error("Email is required");
  }

  const normalizedEmail = email
    .trim()
    .toLowerCase();

  const user = await User.findOne({
    email: normalizedEmail,
  });

  if (!user) {
    throw new Error("User not found");
  }

  if (user.isEmailVerified) {
    throw new Error(
      "Email is already verified"
    );
  }

  // ------------------------------------------
  // Generate New OTP
  // ------------------------------------------

  const verificationOTP = String(generateOTP());

  const verificationOTPExpires = new Date(
    Date.now() + 10 * 60 * 1000
  );

  user.verificationOTP = verificationOTP;

  user.verificationOTPExpires =
    verificationOTPExpires;

  await user.save();

  // ------------------------------------------
  // Send Email
  // ------------------------------------------

  await sendVerificationEmail(
    normalizedEmail,
    verificationOTP
  );

  return {
    email: normalizedEmail,
  };
};

// ======================================================
// FORGOT PASSWORD OTP
// ======================================================

export const generatePasswordResetOTP = async (
  email
) => {
  if (!email) {
    throw new Error("Email is required");
  }

  const normalizedEmail = email
    .trim()
    .toLowerCase();

  const user = await User.findOne({
    email: normalizedEmail,
  });

  if (!user) {
    throw new Error(
      "No account found with this email"
    );
  }

  const resetOTP = String(generateOTP());

  const resetOTPExpires = new Date(
    Date.now() + 10 * 60 * 1000
  );

  // NOTE:
  // User model me ye fields add hone chahiye:
  // resetPasswordOTP
  // resetPasswordOTPExpires

  user.resetPasswordOTP = resetOTP;

  user.resetPasswordOTPExpires =
    resetOTPExpires;

  await user.save();

  // Abhi verification email function use kar rahe hain.
  // Baad me separate password reset email bana sakte hain.

  await sendVerificationEmail(
    normalizedEmail,
    resetOTP
  );

  return {
    email: normalizedEmail,
  };
};

// ======================================================
// VERIFY PASSWORD RESET OTP
// ======================================================

export const verifyPasswordResetOTP = async (
  email,
  otp
) => {
  if (!email || !otp) {
    throw new Error(
      "Email and OTP are required"
    );
  }

  const normalizedEmail = email
    .trim()
    .toLowerCase();

  const normalizedOTP = String(otp).trim();

  const user = await User.findOne({
    email: normalizedEmail,
  });

  if (!user) {
    throw new Error("User not found");
  }

  if (
    !user.resetPasswordOTP ||
    String(user.resetPasswordOTP).trim() !==
      normalizedOTP
  ) {
    throw new Error("Invalid OTP");
  }

  if (
    !user.resetPasswordOTPExpires ||
    user.resetPasswordOTPExpires < new Date()
  ) {
    throw new Error("OTP has expired");
  }

  return user;
};