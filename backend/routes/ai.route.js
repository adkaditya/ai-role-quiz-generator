import express from "express";
import { askAI, generateQuiz } from "../controllers/ai.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { roleCheckMiddleware } from "../middlewares/roleCheckMiddleware.js";

const aiRouter = express.Router();

// All AI routes require authenticated admin
aiRouter.use(authMiddleware, roleCheckMiddleware);

// Generate AI Quiz
aiRouter.post("/generate", generateQuiz);

// General AI Chat
aiRouter.post("/ask", askAI);

export default aiRouter;