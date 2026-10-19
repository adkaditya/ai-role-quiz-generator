
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import passport from "passport";

// Database connection
import "./utils/db.js";

// Routes
import authRouter from "./routes/auth.route.js";
import violationRouter from "./routes/violation.route.js";
import categoryRouter from "./routes/category.route.js";
import quizRouter from "./routes/quiz.route.js";
import questionRouter from "./routes/question.route.js";
import attemptRouter from "./routes/attempt.route.js";
import leaderboardRouter from "./routes/leaderboard.route.js";
import userRouter from "./routes/user.route.js";
import aiRouter from "./routes/ai.route.js";

// Error handler
import { exceptionHandler } from "./middlewares/exceptionHandler.middleware.js";

const app = express();

// CORS configuration
const allowedOrigins = [
  "https://ai-role-quiz-generator.vercel.app",
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "http://localhost:5176",
];

const corsOptions = {
  origin(origin, callback) {
    // Allow requests without Origin, such as server-to-server
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Allow Vercel preview deployments
    if (
      /^https:\/\/ai-role-quiz-generator-[a-z0-9-]+\.vercel\.app$/i.test(
        origin
      )
    ) {
      return callback(null, true);
    }

    // Allow localhost on any port
    if (/^http:\/\/localhost:\d+$/i.test(origin)) {
      return callback(null, true);
    }

    console.log("Blocked CORS Origin:", origin);
    return callback(new Error("Not allowed by CORS"));
  },

  credentials: true,

  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],

  allowedHeaders: [
    "Origin",
    "X-Requested-With",
    "Content-Type",
    "Accept",
    "Authorization",
  ],

  optionsSuccessStatus: 204,
};

// Middleware
app.use(cors(corsOptions));
app.use(passport.initialize());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use("/uploads", express.static("uploads"));

// Test route
app.get("/test", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Backend is working correctly",
  });
});

// Root route
app.get("/", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "AI Role Quiz Backend is Running",
  });
});

// Authentication routes
app.use("/api/v1/auth", authRouter);

// Other API routes
app.use("/api/v1/violations", violationRouter);

app.use("/api/v1", categoryRouter);
app.use("/api/v1", quizRouter);
app.use("/api/v1", questionRouter);
app.use("/api/v1", attemptRouter);
app.use("/api/v1", leaderboardRouter);
app.use("/api/v1", userRouter);

app.use("/api/v1/ai", aiRouter);

// 404 handler
app.use((req, res) => {
  return res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// Global error handler
app.use(exceptionHandler);

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log("======================================");
  console.log(`Server running on port ${PORT}`);
  console.log(`PORT: ${PORT}`);
  console.log("======================================");
});
