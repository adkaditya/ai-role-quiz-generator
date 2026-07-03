import mongoose from "mongoose";
const leaderboardSchema = new mongoose.Schema(
  {
    quiz: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      required: [true, "Leaderboard entry must belong to a quiz"],
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Leaderboard entry must belong to a user"],
      index: true,
    },
    score: {
      type: Number,
      required: [true, "Score is required"],
    },
    timeTaken: {
      type: Number, // in seconds
      required: [true, "Time taken is required"],
    },
    attempt: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "QuizAttempt",
      required: [true, "Reference attempt is required"],
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to guarantee one leaderboard record per user per quiz
leaderboardSchema.index({ quiz: 1, user: 1 }, { unique: true });
// Index for sorting ranking by score descending and timeTaken ascending
leaderboardSchema.index({ quiz: 1, score: -1, timeTaken: 1 });

const Leaderboard = mongoose.model("Leaderboard", leaderboardSchema);
export default Leaderboard;