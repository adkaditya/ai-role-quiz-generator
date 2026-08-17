import Role from "../models/role.model.js";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";

// OTP generate karne wala function
import { generateOTP } from "../utils/generateOTP.js";

// Email bhejne wala function
import { sendVerificationEmail } from "./email.service.js";

// ==========================================
// Register User
// ==========================================

export const registerUserService = async (data) => {
  // Frontend se name, email aur password receive kar rahe hain
  const { name, email, password } = data;

  // ------------------------------------------
  // Check: Kya user already exist karta hai?
  // ------------------------------------------

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new Error("User already exists");
  }

  // ------------------------------------------
  // Generate OTP
  // ------------------------------------------

  // 6 digit verification OTP generate hoga
  const verificationOTP = generateOTP();

  // OTP 10 minutes ke baad expire hoga
  const verificationOTPExpires = new Date(
    Date.now() + 10 * 60 * 1000
  );

  // ------------------------------------------
  // Decide User Role
  // ------------------------------------------

  // Database mein total users count karo
  const userCount = await User.countDocuments();

  // Agar first user hai -> admin
  // Otherwise -> normal user
  const roleName = userCount === 0 ? "admin" : "user";

  // Role find/create karo
  const role = await getOrCreateRole(roleName);

  // ------------------------------------------
  // Create User
  // ------------------------------------------

  const createdUser = await User.create({
    name,
    email,
    password,

    // User ko role assign kar rahe hain
    role: role._id,

    // --------------------------------------
    // Email Verification Data
    // --------------------------------------

    // Abhi email verify nahi hua hai
    isEmailVerified: false,

    // Generated OTP database mein save hoga
    verificationOTP,

    // OTP ki expiry time save hogi
    verificationOTPExpires,
  });

  // ------------------------------------------
  // Send OTP Email
  // ------------------------------------------

  // User ke email address par OTP bhejenge
  await sendVerificationEmail(email, verificationOTP);

  // Created user return karo
  return createdUser;
};

// ==========================================
// Get or Create Role
// ==========================================

const getOrCreateRole = async (roleName) => {
  // Database mein role search karo
  const role = await Role.findOne({ name: roleName });

  // Agar role already exist karta hai
  if (role) {
    return role;
  }

  // Agar role exist nahi karta to create karo
  const newRole = await Role.create({
    name: roleName,
  });

  return newRole;
};

// ==========================================
// Generate JWT Token
// ==========================================

export async function generateToken(userId) {
  // User ID ke basis par JWT token generate hoga
  return jwt.sign(
    {
      id: userId,
    },
    process.env.JWT_SECRET,
    {
      // Token 24 hours tak valid rahega
      expiresIn: "24h",
    }
  );
}

// ==========================================
// Verify Email OTP
// ==========================================

export const verifyEmailService = async (email, otp) => {
  // Email ke basis par user find karo
  const user = await User.findOne({ email });

  // Agar user nahi mila
  if (!user) {
    throw new Error("User not found");
  }

  // Agar email already verified hai
  if (user.isEmailVerified) {
    throw new Error("Email is already verified");
  }

  // Check karo OTP match kar raha hai ya nahi
  if (user.verificationOTP !== otp) {
    throw new Error("Invalid OTP");
  }

  // Check karo OTP expire to nahi ho gaya
  if (
    !user.verificationOTPExpires ||
    user.verificationOTPExpires < new Date()
  ) {
    throw new Error("OTP has expired");
  }

  // Email ko verified mark karo
  user.isEmailVerified = true;

  // OTP ko remove karo
  // Verify hone ke baad OTP ki zarurat nahi hai
  user.verificationOTP = null;
  user.verificationOTPExpires = null;

  // Changes database mein save karo
  await user.save();

  return user;
};