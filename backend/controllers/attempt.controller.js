import * as attemptService from "../services/attempt.service.js";
import QuizAttempt from "../models/quizattempt.model.js";
import mongoose from "mongoose";

// Initialize a new quiz attempt session
export const startAttempt = async (req, resp) => {
  try {
    const { quizId } = req.body;
    const attempt = await attemptService.startAttempt(req.user._id, quizId);
    return resp.status(201).json({
      status: "success",
      data: {
        attempt,
      },
    });
  } catch (error) {
    console.log(error);
    return resp.status(400).json({
      message: error.message,
    });
  }
};

// Progressively save user answers during an active attempt
export const saveProgressiveAnswers = async (req, resp) => {
  try {
    const { id } = req.params;
    const { answers } = req.body;
    const attempt = await attemptService.saveProgressiveAnswers(req.user._id, id, answers);
    return resp.status(200).json({
      status: "success",
      message: "Answers saved progressively",
      data: {
        attemptId: attempt._id,
      },
    });
  } catch (error) {
    console.log(error);
    return resp.status(400).json({
      message: error.message,
    });
  }
};

// Submit a quiz attempt for scoring and leaderboard inclusion
export const submitAttempt = async (req, resp) => {
  try {
    const { id } = req.params;
    const result = await attemptService.submitAttempt(req.user._id, id, req.body);
    return resp.status(200).json({
      status: "success",
      message: "Quiz attempt graded and submitted successfully",
      data: {
        attempt: result,
      },
    });
  } catch (error) {
    console.log(error);
    return resp.status(400).json({
      message: error.message,
    });
  }
};

// Retrieve score, answers and explanations for a completed attempt session
export const getAttemptResult = async (req, resp) => {
  try {
    const { id } = req.params;
    const attempt = await attemptService.getAttemptResult(req.user._id, id);
    return resp.status(200).json({
      status: "success",
      data: {
        attempt,
      },
    });
  } catch (error) {
    console.log(error);
    return resp.status(404).json({
      message: error.message,
    });
  }
};

// Retrieve history of all completed quiz attempts for the logged-in user
export const getUserHistory = async (req, resp) => {
  try {
    const attempts = await QuizAttempt.find({ user: req.user._id, isCompleted: true })
      .populate({
        path: "quiz",
        populate: { path: "category", select: "name" },
      })
      .sort("-completedAt");

    return resp.status(200).json({
      status: "success",
      results: attempts.length,
      data: {
        attempts,
      },
    });
  } catch (error) {
    console.log(error);
    return resp.status(500).json({
      message: "Something went wrong in fetching user history",
      error: error.message,
    });
  }
};

// Fetch current user dashboard analytics (attempts count, scores, stats)
export const getUserDashboardStats = async (req, resp) => {
  try {
    const userId = req.user._id;

    // Total quizzes attempted
    const totalAttempts = await QuizAttempt.countDocuments({ user: userId, isCompleted: true });

    // Highest score
    const highestScoreAttempt = await QuizAttempt.findOne({ user: userId, isCompleted: true })
      .sort("-score")
      .select("score");
    const highestScore = highestScoreAttempt ? highestScoreAttempt.score : 0;

    // Average score & average time taken
    const avgStats = await QuizAttempt.aggregate([
      { $match: { user: userId, isCompleted: true } },
      {
        $group: {
          _id: null,
          avgScore: { $avg: "$score" },
          avgTime: { $avg: "$timeTaken" },
        },
      },
    ]);

    const averageScore = avgStats.length > 0 ? Math.round(avgStats[0].avgScore) : 0;
    const averageTimeTaken = avgStats.length > 0 ? Math.round(avgStats[0].avgTime) : 0;

    // Recent activity (last 5 attempts)
    const recentActivity = await QuizAttempt.find({ user: userId, isCompleted: true })
      .populate("quiz", "title category timer")
      .sort("-completedAt")
      .limit(5);

    // Performance analytics (attempts grouped by category)
    const categoryPerformance = await QuizAttempt.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(userId),
          isCompleted: true,
        },
      },
      {
        $lookup: {
          from: "quizzes",
          localField: "quiz",
          foreignField: "_id",
          as: "quizDetails",
        },
      },
      { $unwind: "$quizDetails" },
      {
        $lookup: {
          from: "categories",
          localField: "quizDetails.category",
          foreignField: "_id",
          as: "categoryDetails",
        },
      },
      { $unwind: "$categoryDetails" },
      {
        $group: {
          _id: "$categoryDetails.name",
          attemptsCount: { $sum: 1 },
          averageScore: { $avg: "$score" },
        },
      },
      {
        $project: {
          category: "$_id",
          attemptsCount: 1,
          averageScore: { $round: ["$averageScore", 0] },
          _id: 0,
        },
      },
    ]);

    return resp.status(200).json({
      status: "success",
      data: {
        stats: {
          totalAttempts,
          highestScore,
          averageScore,
          averageTimeTaken,
        },
        recentActivity,
        categoryPerformance,
      },
    });
  } catch (error) {
    console.log(error);
    return resp.status(500).json({
      message: "Something went wrong in fetching dashboard stats",
      error: error.message,
    });
  }
};