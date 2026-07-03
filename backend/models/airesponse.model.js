import mongoose from "mongoose";
const aiResponseSchema = new mongoose.Schema(
    {
        prompt: {
            type: String,
            required: [true, "Question is required"],
            trim: true,
        },
        response: {
            type: String,
            required: [true, "Response is required"],
            trim: true,
        },
        user:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "User is required"],
            index: true,
        }
    },
    {
        timestamps: true,
    }
)

const AIResponse = mongoose.model("AIResponse", aiResponseSchema)
export default AIResponse