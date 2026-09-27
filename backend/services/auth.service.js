// ======================================================
// AUTH SERVICE
// ======================================================

import Role from "../models/role.model.js";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";

import { generateOTP } from "../utils/generateOTP.js";
import { sendVerificationEmail } from "./email.service.js";
import redis from "../config/redis.js";

// ======================================================
// OTP CONFIG
// ======================================================

const OTP_EXPIRY_SECONDS = 10 * 60; // 10 minutes
const OTP_MAX_ATTEMPTS = 5;

// ======================================================
// OTP HASH
// ======================================================

const hashOTP = (otp) => {
  return crypto
    .createHash("sha256")
    .update(otp)
    .digest("hex");
};

// ======================================================
// REDIS KEYS
// ======================================================

const getVerificationKey = (email) =>
  `intelliquiz:verification:${email}`;

const getResetPasswordKey = (email) =>
  `intelliquiz:reset-password:${email}`;

// ======================================================
// REGISTER USER
// ======================================================

export const registerUserService = async (data) => {
  const { name, email, password } = data;

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
    if (existingUser.isEmailVerified) {
      throw new Error("User already exists");
    }

    const verificationOTP = generateOTP();

    const otpData = {
      otpHash: hashOTP(verificationOTP),
      attempts: 0,
    };

    // Store OTP in Redis for 10 minutes
    await redis.set(
      getVerificationKey(normalizedEmail),
      JSON.stringify(otpData),
      {
        ex: OTP_EXPIRY_SECONDS,
      }
    );

    existingUser.name = name.trim();
    existingUser.password = password;

    await existingUser.save();

    // ----------------------------------------------------
    // SEND OTP EMAIL
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

      // Remove OTP if email could not be sent
      await redis.del(
        getVerificationKey(normalizedEmail)
      );

      throw new Error(
        "OTP email could not be sent. Please try again later."
      );
    }

    return existingUser;
  }

  // ======================================================
  // GENERATE OTP
  // ======================================================

  const verificationOTP = generateOTP();

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

    // OTP is now stored in Redis
    verificationOTP: null,
    verificationOTPExpires: null,

    resetPasswordOTP: null,
    resetPasswordOTPExpires: null,
  });

  // ======================================================
  // STORE OTP IN REDIS
  // ======================================================

  const otpData = {
    otpHash: hashOTP(verificationOTP),
    attempts: 0,
  };

  await redis.set(
    getVerificationKey(normalizedEmail),
    JSON.stringify(otpData),
    {
      ex: OTP_EXPIRY_SECONDS,
    }
  );

  // ======================================================
  // SEND VERIFICATION EMAIL
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

    // Delete Redis OTP
    await redis.del(
      getVerificationKey(normalizedEmail)
    );

    // Remove user because verification email failed
    await User.findByIdAndDelete(createdUser._id);

    throw new Error(
      "OTP email could not be sent. Please try again later."
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

  if (user.isEmailVerified) {
    throw new Error("Email is already verified");
  }

  // ------------------------------------------------------
  // GET OTP FROM REDIS
  // ------------------------------------------------------

  const storedData = await redis.get(
    getVerificationKey(normalizedEmail)
  );

  if (!storedData) {
    throw new Error(
      "OTP has expired. Please request a new OTP."
    );
  }

  const otpData =
    typeof storedData === "string"
      ? JSON.parse(storedData)
      : storedData;

  // ------------------------------------------------------
  // MAX ATTEMPTS
  // ------------------------------------------------------

  if (otpData.attempts >= OTP_MAX_ATTEMPTS) {
    await redis.del(
      getVerificationKey(normalizedEmail)
    );

    throw new Error(
      "Too many invalid OTP attempts. Please request a new OTP."
    );
  }

  // ------------------------------------------------------
  // VERIFY OTP
  // ------------------------------------------------------

  const incomingHash = hashOTP(normalizedOTP);

  if (incomingHash !== otpData.otpHash) {
    otpData.attempts += 1;

    await redis.set(
      getVerificationKey(normalizedEmail),
      JSON.stringify(otpData),
      {
        keepttl: true,
      }
    );

    throw new Error("Invalid OTP");
  }

  // ------------------------------------------------------
  // VERIFY EMAIL
  // ------------------------------------------------------

  user.isEmailVerified = true;

  await user.save();

  // OTP can only be used once
  await redis.del(
    getVerificationKey(normalizedEmail)
  );

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

  if (user.isEmailVerified) {
    throw new Error("Email is already verified");
  }

  // ------------------------------------------------------
  // GENERATE NEW OTP
  // ------------------------------------------------------

  const verificationOTP = generateOTP();

  const otpData = {
    otpHash: hashOTP(verificationOTP),
    attempts: 0,
  };

  // Old OTP automatically replaced
  await redis.set(
    getVerificationKey(normalizedEmail),
    JSON.stringify(otpData),
    {
      ex: OTP_EXPIRY_SECONDS,
    }
  );

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

    await redis.del(
      getVerificationKey(normalizedEmail)
    );

    throw new Error(
      "OTP email could not be sent. Please try again later."
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

  const resetOTP = generateOTP();

  const otpData = {
    otpHash: hashOTP(resetOTP),
    attempts: 0,
  };

  // ------------------------------------------------------
  // STORE RESET OTP IN REDIS
  // ------------------------------------------------------

  await redis.set(
    getResetPasswordKey(normalizedEmail),
    JSON.stringify(otpData),
    {
      ex: OTP_EXPIRY_SECONDS,
    }
  );

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

    await redis.del(
      getResetPasswordKey(normalizedEmail)
    );

    throw new Error(
      "Reset OTP email could not be sent. Please try again later."
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
  // GET RESET OTP FROM REDIS
  // ------------------------------------------------------

  const storedData = await redis.get(
    getResetPasswordKey(normalizedEmail)
  );

  if (!storedData) {
    throw new Error("OTP has expired");
  }

  const otpData =
    typeof storedData === "string"
      ? JSON.parse(storedData)
      : storedData;

  // ------------------------------------------------------
  // MAX ATTEMPTS
  // ------------------------------------------------------

  if (otpData.attempts >= OTP_MAX_ATTEMPTS) {
    await redis.del(
      getResetPasswordKey(normalizedEmail)
    );

    throw new Error(
      "Too many invalid OTP attempts. Please request a new OTP."
    );
  }

  // ------------------------------------------------------
  // VERIFY OTP
  // ------------------------------------------------------

  const incomingHash = hashOTP(normalizedOTP);

  if (incomingHash !== otpData.otpHash) {
    otpData.attempts += 1;

    await redis.set(
      getResetPasswordKey(normalizedEmail),
      JSON.stringify(otpData),
      {
        keepttl: true,
      }
    );

    throw new Error("Invalid OTP");
  }

  return user;
};