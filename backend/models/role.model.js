import mongoose from "mongoose";

const roleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Role name is required"],
      enum: ["admin", "user"],
      default: "user",
      lowercase: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Role = mongoose.model("Role", roleSchema);

export default Role;