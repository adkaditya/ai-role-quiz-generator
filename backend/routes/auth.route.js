
import { Router } from "express";
import passport from "../config/passport.js";

import {
  registerUser,
  loginUser,
  deleteUser,
  changeUserRole,
  verifyEmail,
  resendOTP,
  sendSMSOTPController,
  verifySMSOTPController,
  googleAuthCallback,
} from "../controllers/auth.controller.js";

const router = Router();

// Register
router.post("/register", registerUser);

// Email and password login
router.post("/login", loginUser);

// Email verification
router.post("/verify-email", verifyEmail);

// Resend email OTP
router.post("/resend-otp", resendOTP);

// Delete user
router.delete("/delete-user", deleteUser);

// Change user role
router.patch("/change-role", changeUserRole);

// SMS OTP
router.post("/send-sms-otp", sendSMSOTPController);
router.post("/verify-sms-otp", verifySMSOTPController);

// Start Google login
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })
);

// Google callback
router.get("/google/callback", googleAuthCallback);

export default router;
