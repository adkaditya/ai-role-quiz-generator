import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";

const app = express();

import "./utils/db.js";

import authRouter from "./routes/auth.route.js";
import violationRouter from "./routes/violation.route.js";
import categoryRouter from "./routes/category.route.js";
import quizRouter from "./routes/quiz.route.js";
import questionRouter from "./routes/question.route.js";
import attemptRouter from "./routes/attempt.route.js";
import leaderboardRouter from "./routes/leaderboard.route.js";
import userRouter from "./routes/user.route.js";
import aiRouter from "./routes/ai.route.js";

import { exceptionHandler } from "./middlewares/exceptionHandler.middleware.js";

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "https://ai-role-quiz-generator.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

app.use("/uploads", express.static("uploads"));

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/violations", violationRouter);
app.use("/api/v1", categoryRouter);
app.use("/api/v1", quizRouter);
app.use("/api/v1", questionRouter);
app.use("/api/v1", attemptRouter);
app.use("/api/v1", leaderboardRouter);
app.use("/api/v1", userRouter);
app.use("/api/v1/ai", aiRouter);

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "AI Role Quiz Backend is Running 🚀",
  });
});

app.use(exceptionHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});