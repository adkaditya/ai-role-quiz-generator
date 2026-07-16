import Violation from "../models/violation.model.js";

// ==========================================
// Create Violation
// ==========================================
export const createViolation = async (req, res) => {
  try {
    const {
      quiz,
      attempt,
      violationType,
      description,
      autoSubmitted,
    } = req.body;

    const violation = await Violation.create({
      user: req.user._id,
      quiz,
      attempt,
      violationType,
      description,
      autoSubmitted,
    });

    return res.status(201).json({
      status: "success",
      message: "Violation recorded successfully",
      data: violation,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: error.message,
    });
  }
};

// ==========================================
// Get All Violations (Admin)
// ==========================================
export const getAllViolations = async (req, res) => {
  try {
    const violations = await Violation.find()
      .populate("user", "name email")
      .populate("quiz", "title")
      .populate("attempt", "score completedAt")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      status: "success",
      results: violations.length,
      data: violations,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: error.message,
    });
  }
};