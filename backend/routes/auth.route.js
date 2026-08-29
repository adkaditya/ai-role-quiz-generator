// ==========================================
// AUTH ROUTES
// ==========================================

import { Router } from "express";

import {
  registerUser,
  loginUser,
  deleteUser,
  changeUserRole,
  verifyEmail,
  resendOTP,

} from "../controllers/auth.controller.js";

const router = Router();

// ==========================================
// REGISTER
// POST /api/v1/auth/register
// ==========================================

router.post("/register", registerUser);

// ==========================================
// LOGIN
// POST /api/v1/auth/login
// ==========================================

router.post("/login", loginUser);

// ==========================================
// VERIFY EMAIL OTP
// POST /api/v1/auth/verify-email
// ==========================================

router.post("/verify-email", verifyEmail);

// ==========================================
// RESEND OTP
// POST /api/v1/auth/resend-otp
// ==========================================

router.post("/resend-otp", resendOTP);

// ==========================================
// DELETE USER
// DELETE /api/v1/auth/delete-user
// ==========================================

router.delete("/delete-user", deleteUser);

// ==========================================
// CHANGE USER ROLE
// PATCH /api/v1/auth/change-role
// ==========================================

router.patch("/change-role", changeUserRole);

// ==========================================
// EXPORT
// ==========================================


export default router;