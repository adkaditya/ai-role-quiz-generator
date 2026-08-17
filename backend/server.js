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
// APP
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

// Frontend URLs jo hamare backend ko access kar sakti hain
const allowedOrigins = [
  // Production frontend - Vercel
  "https://ai-role-quiz-generator.vercel.app",

  // Local development
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "http://localhost:5176",
];

app.use(
  cors({
    // Check request origin
    origin: function (origin, callback) {
      // Postman ya server-to-server request mein
      // origin nahi hota
      if (!origin) {
        return callback(null, true);
      }

      // Agar origin allowed list mein hai
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Agar origin allowed nahi hai
      console.log("CORS blocked origin:", origin);

      return callback(new Error("Not allowed by CORS"));
    },

    // Cookies / authentication credentials allow
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

    // Successful preflight response
    optionsSuccessStatus: 204,
  })
);

// ======================================================
// BODY PARSER
// ======================================================

// JSON request body ko parse karega
app.use(express.json());

// ======================================================
// STATIC FILES
// ======================================================

// Uploaded files ke liye static folder
app.use("/uploads", express.static("uploads"));

// ======================================================
// API ROUTES
// ======================================================

// Authentication
app.use("/api/v1/auth", authRouter);

// Violations / Proctoring
app.use("/api/v1/violations", violationRouter);

// Categories
app.use("/api/v1", categoryRouter);

// Quiz
app.use("/api/v1", quizRouter);

// Questions
app.use("/api/v1", questionRouter);

// Attempts
app.use("/api/v1", attemptRouter);

// Leaderboard
app.use("/api/v1", leaderboardRouter);

// Users
app.use("/api/v1", userRouter);

// AI
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

// Ye sabhi unhandled errors ko handle karega
app.use(exceptionHandler);

// ======================================================
// SERVER
// ======================================================

const PORT = process.env.PORT || 5000;

// Server ko 0.0.0.0 par listen karwa rahe hain
// Render deployment ke liye important hai
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});