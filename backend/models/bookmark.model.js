import mongoose from "mongoose";
const bookmarkSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Bookmark must belong to a user"],
      index: true,
    },
    quiz: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      required: [true, "Bookmark must point to a quiz"],
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure uniqueness per user-quiz pair
bookmarkSchema.index({ user: 1, quiz: 1 }, { unique: true });

const Bookmark = mongoose.model("Bookmark", bookmarkSchema);
export default Bookmark;