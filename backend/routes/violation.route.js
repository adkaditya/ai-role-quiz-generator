import express from "express";

import {
  createViolation,
  getAllViolations,
} from "../controllers/violation.controller.js";

import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Student
router.post(
  "/",
  authMiddleware,
  createViolation
);

// Temporary (No Role Check)
router.get(
  "/",
  authMiddleware,
  getAllViolations
);

export default router;