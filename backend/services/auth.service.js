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

  // Validation
  if (!name?.trim() || !email?.trim() || !password) {
    throw new Error("Name, email and password are required");
  }

  if (password.length < 6) {
    throw new Error("Password must be at least 6 characters");
  }

  const normalizedEmail = email.trim().toLowerCase();

  // Check existing user
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

    // Existing but unverified -> resend OTP
    const verificationOTP = String(generateOTP());

    existingUser.verificationOTP = verificationOTP;
    existingUser.verificationOTPExpires = new Date(
      Date.now() + 10 * 60 * 1000
    );

    await existingUser.save();

    await sendVerificationEmail(
      normalizedEmail,
      verificationOTP
    );

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
  // NORMAL USER ROLE
  // ======================================================

  // Normal signup se hamesha user role milega.
  // Admin ko baad mein manually/admin system se assign karenge.
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
  // SEND OTP EMAIL
  // ======================================================

  try {
    await sendVerificationEmail(
      normalizedEmail,
      verificationOTP
    );
  } catch (emailError) {
    console.error("EMAIL SEND ERROR:", emailError);

    await User.findByIdAndDelete(createdUser._id);

    throw new Error(
      "Registration failed because verification email could not be sent"
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

  const user = await User.findOne({
    email: normalizedEmail,
  });

  if (!user) {
    throw new Error("User not found");
  }

  if (user.isEmailVerified) {
    throw new Error("Email is already verified");
  }

  if (!user.verificationOTP) {
    throw new Error(
      "No verification OTP found. Please request a new OTP."
    );
  }

  if (
    String(user.verificationOTP).trim() !==
    normalizedOTP
  ) {
    throw new Error("Invalid OTP");
  }

  if (
    !user.verificationOTPExpires ||
    user.verificationOTPExpires < new Date()
  ) {
    throw new Error(
      "OTP has expired. Please request a new OTP."
    );
  }

  // Mark email verified
  user.isEmailVerified = true;

  // Remove OTP
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

  const user = await User.findOne({
    email: normalizedEmail,
  });

  if (!user) {
    throw new Error("User not found");
  }

  if (user.isEmailVerified) {
    throw new Error("Email is already verified");
  }

  const verificationOTP = String(generateOTP());

  const verificationOTPExpires = new Date(
    Date.now() + 10 * 60 * 1000
  );

  user.verificationOTP = verificationOTP;
  user.verificationOTPExpires = verificationOTPExpires;

  await user.save();

  await sendVerificationEmail(
    normalizedEmail,
    verificationOTP
  );

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

  const user = await User.findOne({
    email: normalizedEmail,
  });

  if (!user) {
    throw new Error("No account found with this email");
  }

  const resetOTP = String(generateOTP());

  const resetOTPExpires = new Date(
    Date.now() + 10 * 60 * 1000
  );

  user.resetPasswordOTP = resetOTP;
  user.resetPasswordOTPExpires = resetOTPExpires;

  await user.save();

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
    throw new Error("Email and OTP are required");
  }

  const normalizedEmail = email.trim().toLowerCase();
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