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

// MongoDB connection
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

// Production frontend + local development URLs
const allowedOrigins = [
  // Vercel production frontend
  "https://ai-role-quiz-generator.vercel.app",

  // Local frontend
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "http://localhost:5176",
];

// CORS middleware
app.use(
  cors({
    // Allow only our frontend origins
    origin: function (origin, callback) {
      // Postman / curl / server-to-server requests
      // normally don't send an Origin header
      if (!origin) {
        return callback(null, true);
      }

      // Check whether frontend is allowed
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.log("Blocked CORS Origin:", origin);

      return callback(new Error("Not allowed by CORS"));
    },

    // Allow cookies/auth credentials
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

    // Allowed request headers
    allowedHeaders: [
      "Origin",
      "X-Requested-With",
      "Content-Type",
      "Accept",
      "Authorization",
    ],

    // Preflight success response
    optionsSuccessStatus: 204,
  })
);

// ======================================================
// BODY PARSER
// ======================================================

// JSON request body read karne ke liye
app.use(express.json());

// ======================================================
// STATIC FILES
// ======================================================

// Uploaded files ko serve karne ke liye
app.use("/uploads", express.static("uploads"));

// ======================================================
// API ROUTES
// ======================================================

// Authentication routes
// /api/v1/auth/register
// /api/v1/auth/login
// /api/v1/auth/verify-email
app.use("/api/v1/auth", authRouter);

// Proctoring / violations
app.use("/api/v1/violations", violationRouter);

// Category routes
app.use("/api/v1", categoryRouter);

// Quiz routes
app.use("/api/v1", quizRouter);

// Question routes
app.use("/api/v1", questionRouter);

// Attempt routes
app.use("/api/v1", attemptRouter);

// Leaderboard routes
app.use("/api/v1", leaderboardRouter);

// User routes
app.use("/api/v1", userRouter);

// AI routes
app.use("/api/v1/ai", aiRouter);

// ======================================================
// ROOT ROUTE
// ======================================================

// Backend running check karne ke liye
app.get("/", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "AI Role Quiz Backend is Running 🚀",
  });
});

// ======================================================
// 404 ROUTE
// ======================================================

// Agar koi API route exist nahi karta
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