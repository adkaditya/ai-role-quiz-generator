import express from "express";
import { askAI, generateQuiz } from "../controllers/ai.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { roleCheckMiddleware } from "../middlewares/roleCheckMiddleware.js";

const aiRouter = express.Router();

// Apply auth and admin check only to /ai routes
aiRouter.get("/ask-ai",authMiddleware,roleCheckMiddleware, askAI);
aiRouter.use("/ai", authMiddleware, roleCheckMiddleware);
aiRouter.post("/ai/generate", generateQuiz);

export default aiRouter;