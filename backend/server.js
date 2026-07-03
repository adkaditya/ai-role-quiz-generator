import dotenv from "dotenv";
dotenv.config();

import express from "express";
import path from "path";
import cors from "cors";

const app = express();

import "./utils/db.js";

import authRouter from "./routes/auth.route.js";
import categoryRouter from "./routes/category.route.js";
import quizRouter from "./routes/quiz.route.js";
import questionRouter from "./routes/question.route.js";
import attemptRouter from "./routes/attempt.route.js";
import leaderboardRouter from "./routes/leaderboard.route.js";
import userRouter from "./routes/user.route.js";
import { exceptionHandler } from "./middlewares/exceptionHandler.middleware.js";



//middleware- helps to parse json

app.use(cors({
  origin: ['http://localhost:5173', 'https://localhost:5174']
}));

const jsonMiddleware = express.json();
app.use(jsonMiddleware);

// Serve static uploads
app.use("/uploads", express.static("uploads"));

//attach routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1", categoryRouter);
app.use("/api/v1", quizRouter);
app.use("/api/v1", questionRouter);
app.use("/api/v1", attemptRouter);
app.use("/api/v1", leaderboardRouter);
app.use("/api/v1", userRouter);

app.use(exceptionHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
