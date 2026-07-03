import mongoose from "mongoose";

const quizAttemptSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Attempt must belong to a user"],
      index: true,
    },
    quiz: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      required: [true, "Attempt must belong to a quiz"],
      index: true,
    },
    answers: [
      {
        question: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Question",
          required: true,
        },
        selectedAnswers: [Number], // array of selected option indices
        isCorrect: {
          type: Boolean,
          default: false,
        },
      },
    ],
    score: {
      type: Number,
      default: 0,
    },
    totalQuestions: {
      type: Number,
      default: 0,
    },
    correctAnswersCount: {
      type: Number,
      default: 0,
    },
    timeTaken: {
      type: Number, // in seconds
      default: 0,
    },
    isCompleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
quizAttemptSchema.index({ user: 1, quiz: 1 });

const QuizAttempt = mongoose.model("QuizAttempt", quizAttemptSchema);
export default QuizAttempt;