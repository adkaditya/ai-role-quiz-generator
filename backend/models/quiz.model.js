import mongoose from "mongoose";
const quizSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxLength: [100, "Title should be less than 100 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxLength: [1000, "Description should be less than 1000 characters"],
    },
    quizPhoto: {
      type: String,
      default: "",
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
      index: true,
    },

    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard", "expert"],
      required: [true, "Difficulty is required"],
      default: "easy",
    },

    timer: {
      type: Number,
      required: [true, "Timer is required"],
      min: [0, "Timer should be greater than 0"],
      default: 0,
    },
    isPublished: {
      type: Boolean,
      default: false,
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
      index: true,
    },

    questionsCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Quiz = mongoose.model("Quiz", quizSchema);
export default Quiz;