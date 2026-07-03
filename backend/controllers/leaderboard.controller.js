import Leaderboard from "../models/leaderboard.model.js";
import Quiz from "../models/quiz.model.js";

// Retrieve rankings and current user rank for a specific quiz
export const getQuizLeaderboard = async (req, resp) => {
  try {
    const { quizId } = req.params;

    // Check if quiz exists
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return resp.status(404).json({ message: "Quiz not found" });
    }

    // Get top 50 scores for the quiz
    const rankings = await Leaderboard.find({ quiz: quizId })
      .populate("user", "name profilePhoto")
      .sort({ score: -1, timeTaken: 1 })
      .limit(50);

    // Map rankings to include rank number
    const ranks = rankings.map((r, index) => ({
      rank: index + 1,
      userId: r.user._id,
      name: r.user.name,
      avatar: r.user.profilePhoto,
      profilePhoto: r.user.profilePhoto,
      score: r.score,
      timeTaken: r.timeTaken,
      completedAt: r.updatedAt,
    }));

    // Find current user's specific rank
    let userRank = null;
    if (req.user) {
      const allRankings = await Leaderboard.find({ quiz: quizId }).sort({ score: -1, timeTaken: 1 });
      const userIndex = allRankings.findIndex(
        (r) => r.user.toString() === req.user._id.toString()
      );

      if (userIndex !== -1) {
        userRank = {
          rank: userIndex + 1,
          score: allRankings[userIndex].score,
          timeTaken: allRankings[userIndex].timeTaken,
        };
      }
    }

    return resp.status(200).json({
      status: "success",
      data: {
        quiz: {
          id: quiz._id,
          title: quiz.title,
        },
        leaderboard: ranks,
        currentUserRank: userRank,
      },
    });
  } catch (error) {
    console.log(error);
    return resp.status(500).json({
      message: "Something went wrong in fetching quiz leaderboard",
      error: error.message,
    });
  }
};

// Retrieve global users leaderboard (aggregate scores across all quizzes)
export const getGlobalLeaderboard = async (req, resp) => {
  try {
    // Aggregate total score and total time taken grouped by user
    const rankings = await Leaderboard.aggregate([
      {
        $group: {
          _id: "$user",
          totalScore: { $sum: "$score" },
          totalTime: { $sum: "$timeTaken" },
          quizzesSolved: { $sum: 1 },
        },
      },
      { $sort: { totalScore: -1, quizzesSolved: -1, totalTime: 1 } },
      { $limit: 20 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      { $unwind: "$userDetails" },
      {
        $project: {
          userId: "$_id",
          name: "$userDetails.name",
          avatar: "$userDetails.profilePhoto",
          profilePhoto: "$userDetails.profilePhoto",
          totalScore: 1,
          totalTime: 1,
          quizzesSolved: 1,
          _id: 0,
        },
      },
    ]);

    const mappedRankings = rankings.map((r, index) => ({
      rank: index + 1,
      ...r,
    }));

    return resp.status(200).json({
      status: "success",
      data: {
        leaderboard: mappedRankings,
      },
    });
  } catch (error) {
    console.log(error);
    return resp.status(500).json({
      message: "Something went wrong in fetching global leaderboard",
      error: error.message,
    });
  }
};