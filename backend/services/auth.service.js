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
  const { name, email, password } = data;

  // ------------------------------------------------------
  // VALIDATION
  // ------------------------------------------------------

  if (!name?.trim() || !email?.trim() || !password) {
    throw new Error("Name, email and password are required");
  }

  if (password.length < 6) {
    throw new Error("Password must be at least 6 characters");
  }

  const normalizedEmail = email.trim().toLowerCase();

  // ------------------------------------------------------
  // CHECK EXISTING USER
  // ------------------------------------------------------

  const existingUser = await User.findOne({
    email: normalizedEmail,
  });

  // ======================================================
  // EXISTING USER
  // ======================================================

  if (existingUser) {
    // Already verified
    if (existingUser.isEmailVerified) {
      throw new Error("User already exists");
    }

    // ----------------------------------------------------
    // EXISTING BUT UNVERIFIED
    // Generate new OTP
    // ----------------------------------------------------

    const verificationOTP = String(generateOTP());

    existingUser.verificationOTP = verificationOTP;
    existingUser.verificationOTPExpires = new Date(
      Date.now() + 10 * 60 * 1000
    );

    // Update name/password if signup is retried
    existingUser.name = name.trim();
    existingUser.password = password;

    await existingUser.save();

    // ----------------------------------------------------
    // SEND OTP
    // ----------------------------------------------------

    try {
      await sendVerificationEmail(
        normalizedEmail,
        verificationOTP
      );

      console.log(
        `✅ Verification OTP sent to ${normalizedEmail}`
      );
    } catch (emailError) {
      console.error(
        "❌ EMAIL SEND ERROR:",
        emailError.message
      );

      // Development fallback
      console.log(
        `🔐 DEVELOPMENT OTP for ${normalizedEmail}: ${verificationOTP}`
      );
    }

    return existingUser;
  }

  // ======================================================
  // GENERATE OTP
  // ======================================================

  const verificationOTP = String(generateOTP());

  const verificationOTPExpires = new Date(
    Date.now() + 10 * 60 * 1000
  );

  // ======================================================
  // GET USER ROLE
  // ======================================================

  const role = await getOrCreateRole("user");

  // ======================================================
  // CREATE USER
  // ======================================================

  const createdUser = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    password,
    role: role._id,

    isEmailVerified: false,

    verificationOTP,
    verificationOTPExpires,

    resetPasswordOTP: null,
    resetPasswordOTPExpires: null,
  });

  // ======================================================
  // SEND VERIFICATION OTP
  // ======================================================

  try {
    await sendVerificationEmail(
      normalizedEmail,
      verificationOTP
    );

    console.log(
      `✅ Verification OTP sent to ${normalizedEmail}`
    );
  } catch (emailError) {
    console.error(
      "❌ EMAIL SEND ERROR:",
      emailError.message
    );

    // Development fallback
    console.log(
      `🔐 DEVELOPMENT OTP for ${normalizedEmail}: ${verificationOTP}`
    );
  }

  return createdUser;
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

export const verifyEmailService = async (email, otp) => {
  if (!email || !otp) {
    throw new Error("Email and OTP are required");
  }

  const normalizedEmail = email.trim().toLowerCase();
  const normalizedOTP = String(otp).trim();

  // ------------------------------------------------------
  // FIND USER
  // ------------------------------------------------------

  const user = await User.findOne({
    email: normalizedEmail,
  });

  if (!user) {
    throw new Error("User not found");
  }

  // ------------------------------------------------------
  // ALREADY VERIFIED
  // ------------------------------------------------------

  if (user.isEmailVerified) {
    throw new Error("Email is already verified");
  }

  // ------------------------------------------------------
  // OTP EXISTS?
  // ------------------------------------------------------

  if (!user.verificationOTP) {
    throw new Error(
      "No verification OTP found. Please request a new OTP."
    );
  }

  // ------------------------------------------------------
  // CHECK OTP
  // ------------------------------------------------------

  if (
    String(user.verificationOTP).trim() !==
    normalizedOTP
  ) {
    throw new Error("Invalid OTP");
  }

  // ------------------------------------------------------
  // CHECK OTP EXPIRY
  // ------------------------------------------------------

  if (
    !user.verificationOTPExpires ||
    user.verificationOTPExpires < new Date()
  ) {
    throw new Error(
      "OTP has expired. Please request a new OTP."
    );
  }

  // ------------------------------------------------------
  // VERIFY EMAIL
  // ------------------------------------------------------

  user.isEmailVerified = true;

  // Remove verification OTP
  user.verificationOTP = null;
  user.verificationOTPExpires = null;

  await user.save();

  return user;
};

// ======================================================
// RESEND VERIFICATION OTP
// ======================================================

export const resendVerificationOTP = async (email) => {
  if (!email) {
    throw new Error("Email is required");
  }

  const normalizedEmail = email.trim().toLowerCase();

  // ------------------------------------------------------
  // FIND USER
  // ------------------------------------------------------

  const user = await User.findOne({
    email: normalizedEmail,
  });

  if (!user) {
    throw new Error("User not found");
  }

  // ------------------------------------------------------
  // ALREADY VERIFIED
  // ------------------------------------------------------

  if (user.isEmailVerified) {
    throw new Error("Email is already verified");
  }

  // ------------------------------------------------------
  // GENERATE NEW OTP
  // ------------------------------------------------------

  const verificationOTP = String(generateOTP());

  const verificationOTPExpires = new Date(
    Date.now() + 10 * 60 * 1000
  );

  user.verificationOTP = verificationOTP;
  user.verificationOTPExpires = verificationOTPExpires;

  await user.save();

  // ------------------------------------------------------
  // SEND OTP
  // ------------------------------------------------------

  try {
    await sendVerificationEmail(
      normalizedEmail,
      verificationOTP
    );

    console.log(
      `✅ Verification OTP resent to ${normalizedEmail}`
    );
  } catch (emailError) {
    console.error(
      "❌ RESEND OTP EMAIL ERROR:",
      emailError.message
    );

    // Development fallback
    console.log(
      `🔐 DEVELOPMENT OTP for ${normalizedEmail}: ${verificationOTP}`
    );
  }

  return {
    email: normalizedEmail,
  };
};

// ======================================================
// FORGOT PASSWORD - GENERATE OTP
// ======================================================

export const generatePasswordResetOTP = async (email) => {
  if (!email) {
    throw new Error("Email is required");
  }

  const normalizedEmail = email.trim().toLowerCase();

  // ------------------------------------------------------
  // FIND USER
  // ------------------------------------------------------

  const user = await User.findOne({
    email: normalizedEmail,
  });

  if (!user) {
    throw new Error(
      "No account found with this email"
    );
  }

  // ------------------------------------------------------
  // GENERATE RESET OTP
  // ------------------------------------------------------

  const resetOTP = String(generateOTP());

  const resetOTPExpires = new Date(
    Date.now() + 10 * 60 * 1000
  );

  user.resetPasswordOTP = resetOTP;
  user.resetPasswordOTPExpires = resetOTPExpires;

  await user.save();

  // ------------------------------------------------------
  // SEND RESET OTP
  // ------------------------------------------------------

  try {
    await sendVerificationEmail(
      normalizedEmail,
      resetOTP
    );

    console.log(
      `✅ Password reset OTP sent to ${normalizedEmail}`
    );
  } catch (emailError) {
    console.error(
      "❌ PASSWORD RESET EMAIL ERROR:",
      emailError.message
    );

    // Development fallback
    console.log(
      `🔐 DEVELOPMENT RESET OTP for ${normalizedEmail}: ${resetOTP}`
    );
  }

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
    throw new Error("Email and OTP are required");
  }

  const normalizedEmail = email.trim().toLowerCase();
  const normalizedOTP = String(otp).trim();

  // ------------------------------------------------------
  // FIND USER
  // ------------------------------------------------------

  const user = await User.findOne({
    email: normalizedEmail,
  });

  if (!user) {
    throw new Error("User not found");
  }

  // ------------------------------------------------------
  // CHECK OTP
  // ------------------------------------------------------

  if (
    !user.resetPasswordOTP ||
    String(user.resetPasswordOTP).trim() !==
      normalizedOTP
  ) {
    throw new Error("Invalid OTP");
  }

  // ------------------------------------------------------
  // CHECK EXPIRY
  // ------------------------------------------------------

  if (
    !user.resetPasswordOTPExpires ||
    user.resetPasswordOTPExpires < new Date()
  ) {
    throw new Error("OTP has expired");
  }

  return user;
};