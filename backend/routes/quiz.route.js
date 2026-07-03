import express from "express";
import {
  createQuiz,
  getQuizzes,
  getQuizById,
  getQuizQuestions,
  updateQuiz,
  deleteQuiz,
} from "../controllers/quiz.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { roleCheckMiddleware } from "../middlewares/roleCheckMiddleware.js";

const quizRouter = express.Router();

// Apply auth middleware only to /quizzes routes
quizRouter.use("/quizzes", authMiddleware);

//get quizzes
quizRouter.get("/quizzes", getQuizzes);

//get single quiz
quizRouter.get("/quizzes/:id", getQuizById);

//get quiz questions
quizRouter.get("/quizzes/:id/questions", getQuizQuestions);



// Admin-only quiz management routes
quizRouter.post("/quizzes", roleCheckMiddleware, createQuiz);



quizRouter.put("/quizzes/:id", roleCheckMiddleware, updateQuiz);

quizRouter.delete("/quizzes/:id", roleCheckMiddleware, deleteQuiz);

export default quizRouter;