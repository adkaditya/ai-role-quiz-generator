// ==========================================
// Auth Routes
// ==========================================

// Express Router import karo
import { Router } from "express";

// Authentication controllers import karo
import {
  registerUser,
  loginUser,
  deleteUser,
  changeUserRole,
  verifyEmail,
} from "../controllers/auth.controller.js";

// Router ka instance create karo
const router = Router();

// ==========================================
// Authentication Routes
// ==========================================

// Register new user
// POST /api/v1/auth/register
router.post("/register", registerUser);

// Login existing user
// POST /api/v1/auth/login
router.post("/login", loginUser);

// Verify email using OTP
// POST /api/v1/auth/verify-email
router.post("/verify-email", verifyEmail);

// ==========================================
// User Management Routes
// ==========================================

// Delete user
// POST /api/v1/auth/delete-user
router.delete("/delete-user", deleteUser);

// Change user role
// POST /api/v1/auth/change-role
router.patch("/change-role", changeUserRole);

// ==========================================
// Export Router
// ==========================================

export default router;