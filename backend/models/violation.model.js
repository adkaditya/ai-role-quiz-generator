import mongoose from "mongoose";

const violationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    quiz: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
    },

    attempt: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "QuizAttempt",
      required: true,
    },

    violationType: {
      type: String,
      required: true,
      enum: [
        "TAB_SWITCH",
        "FULLSCREEN_EXIT",
        "COPY",
        "PASTE",
        "CUT",
        "RIGHT_CLICK",
        "DEVTOOLS",
        "CAMERA_OFF",
        "PHONE_DETECTED",
        "MULTIPLE_FACE",
      ],
    },

    description: {
      type: String,
      default: "",
    },

    autoSubmitted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model(
  "Violation",
  violationSchema
);