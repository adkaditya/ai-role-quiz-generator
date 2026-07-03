import express from "express";
import {
  getQuizLeaderboard,
  getGlobalLeaderboard,
} from "../controllers/leaderboard.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const leaderboardRouter = express.Router();

// Apply auth middleware only to /leaderboard routes
leaderboardRouter.use("/leaderboard", authMiddleware);

leaderboardRouter.get("/leaderboard/global", getGlobalLeaderboard);
leaderboardRouter.get("/leaderboard/:quizId", getQuizLeaderboard);

export default leaderboardRouter;