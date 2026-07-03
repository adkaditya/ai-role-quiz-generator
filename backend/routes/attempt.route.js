import express from "express";
import {
  startAttempt,
  saveProgressiveAnswers,
  submitAttempt,
  getAttemptResult,
  getUserHistory,
  getUserDashboardStats,
} from "../controllers/attempt.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const attemptRouter = express.Router();

// Apply auth middleware only to /attempts routes
attemptRouter.use("/attempts", authMiddleware);

attemptRouter.get("/attempts/dashboard", getUserDashboardStats);
attemptRouter.get("/attempts/history", getUserHistory);

attemptRouter.post("/attempts", startAttempt);

attemptRouter.put("/attempts/:id/save", saveProgressiveAnswers);

attemptRouter.post("/attempts/:id/submit", submitAttempt);

attemptRouter.get("/attempts/:id", getAttemptResult);

export default attemptRouter;