// ======================================================
// ENVIRONMENT VARIABLES
// ======================================================

import dotenv from "dotenv";

dotenv.config();

// ======================================================
// IMPORTS
// ======================================================

import express from "express";
import cors from "cors";

// ======================================================
// CREATE EXPRESS APP
// ======================================================

const app = express();

// ======================================================
// DATABASE CONNECTION
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
  // Production frontend
  "https://ai-role-quiz-generator.vercel.app",

  // Local frontend
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "http://localhost:5176",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Postman / curl / server-to-server request
      if (!origin) {
        return callback(null, true);
      }

      // Check allowed frontend
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.log("Blocked CORS Origin:", origin);

      return callback(new Error("Not allowed by CORS"));
    },

    credentials: true,

    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],

    allowedHeaders: [
      "Origin",
      "X-Requested-With",
      "Content-Type",
      "Accept",
      "Authorization",
    ],

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
// TEST ROUTE
// ======================================================

app.get("/test", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Backend is working correctly 🚀",
  });
});

// ======================================================
// AUTH ROUTES
// ======================================================

// Register
// POST /api/v1/auth/register

// Login
// POST /api/v1/auth/login

// Verify Email
// POST /api/v1/auth/verify-email

app.use("/api/v1/auth", authRouter);

// ======================================================
// OTHER API ROUTES
// ======================================================

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
  return res.status(200).json({
    success: true,
    message: "AI Role Quiz Backend is Running 🚀",
  });
});

// ======================================================
// 404 ROUTE
// ======================================================

app.use((req, res) => {
  return res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// ======================================================
// GLOBAL ERROR HANDLER
// ======================================================

app.use(exceptionHandler);

// ======================================================
// START SERVER
// ======================================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log("======================================");
  console.log(`🚀 Server running on port ${PORT}`);
  console.log("======================================");
});