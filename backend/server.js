import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";

const app = express();

// ======================================================
// DATABASE
// ======================================================

import "./utils/db.js";

// ======================================================
// ROUTES
// ======================================================

import authRouter from "./routes/auth.route.js";
import violationRouter from "./routes/violation.route.js";
import categoryRouter from "./routes/category.route.js";
import quizRouter from "./routes/quiz.route.js";
import questionRouter from "./routes/question.route.js";
import attemptRouter from "./routes/attempt.route.js";
import leaderboardRouter from "./routes/leaderboard.route.js";
import userRouter from "./routes/user.route.js";
import aiRouter from "./routes/ai.route.js";

// ======================================================
// ERROR HANDLER
// ======================================================

import { exceptionHandler } from "./middlewares/exceptionHandler.middleware.js";

// ======================================================
// CORS CONFIGURATION
// ======================================================

const allowedOrigins = [
  // Local development
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "http://localhost:5176",

  // Production frontend
  "https://ai-role-quiz-generator.vercel.app",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Postman / curl / server-to-server request
      if (!origin) {
        return callback(null, true);
      }

      // Allow registered frontend
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.log("Blocked CORS Origin:", origin);

      return callback(new Error("Not allowed by CORS"));
    },

    // Cookies / credentials
    credentials: true,

    // Allowed HTTP methods
    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],

    // Allowed headers
    allowedHeaders: [
      "Origin",
      "X-Requested-With",
      "Content-Type",
      "Accept",
      "Authorization",
    ],

    // Browser preflight response
    optionsSuccessStatus: 204,
  })
);

// ======================================================
// BODY PARSER
// ======================================================

app.use(express.json());

// ======================================================
// STATIC FILES
// ======================================================

app.use("/uploads", express.static("uploads"));

// ======================================================
// API ROUTES
// ======================================================

app.use("/api/v1/auth", authRouter);

app.use("/api/v1/violations", violationRouter);

app.use("/api/v1", categoryRouter);

app.use("/api/v1", quizRouter);

app.use("/api/v1", questionRouter);

app.use("/api/v1", attemptRouter);

app.use("/api/v1", leaderboardRouter);

app.use("/api/v1", userRouter);

app.use("/api/v1/ai", aiRouter);

// ======================================================
// ROOT ROUTE
// ======================================================

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "AI Role Quiz Backend is Running 🚀",
  });
});

// ======================================================
// ERROR HANDLER
// ======================================================

app.use(exceptionHandler);

// ======================================================
// SERVER
// ======================================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});