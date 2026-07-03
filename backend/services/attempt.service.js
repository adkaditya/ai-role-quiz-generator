import Quiz from "../models/quiz.model.js";
import Question from "../models/question.model.js";
import QuizAttempt from "../models/quizattempt.model.js";
import Leaderboard from "../models/leaderboard.model.js";

export const startAttempt = async (userId, quizId) => {
  // Check if quiz exists and is published
  const quiz = await Quiz.findById(quizId);
  if (!quiz) {
    throw new Error("Quiz not found");
  }
  if (!quiz.isPublished) {
    throw new Error("Quiz is not available for attempts");
  }

  // Create new attempt
  const attempt = await QuizAttempt.create({
    user: userId,
    quiz: quizId,
    startedAt: new Date(),
    isCompleted: false,
    answers: [],
  });

  return attempt;
};

export const saveProgressiveAnswers = async (userId, attemptId, answers) => {
  const attempt = await QuizAttempt.findOne({ _id: attemptId, user: userId });
  if (!attempt) {
    throw new Error("Quiz attempt not found");
  }
  if (attempt.isCompleted) {
    throw new Error("Cannot save answers on a completed attempt");
  }

  // Format progressive answers: support questionId or question mapping for flexibility
  const formattedAnswers = answers.map((ans) => ({
    question: ans.questionId || ans.question,
    selectedAnswers: ans.selectedAnswers,
  }));

  attempt.answers = formattedAnswers;
  await attempt.save();

  return attempt;
};

export const submitAttempt = async (userId, attemptId, submissionData) => {
  const { answers, timeTaken } = submissionData;

  const attempt = await QuizAttempt.findOne({ _id: attemptId, user: userId }).populate("quiz");
  if (!attempt) {
    throw new Error("Quiz attempt not found");
  }
  if (attempt.isCompleted) {
    throw new Error("Attempt has already been submitted");
  }

  // Fetch all questions for this quiz to grade
  const questions = await Question.find({ quiz: attempt.quiz._id });
  if (questions.length === 0) {
    throw new Error("Quiz does not have any questions");
  }

  // Map submission answers by questionId for fast lookup
  const submissionMap = new Map();
  answers.forEach((ans) => {
    const qId = ans.questionId || ans.question;
    submissionMap.set(qId.toString(), ans.selectedAnswers);
  });

  let correctAnswersCount = 0;
  const gradedAnswers = [];

  questions.forEach((question) => {
    const qIdStr = question._id.toString();
    const selected = submissionMap.get(qIdStr) || [];
    
    // Sort both arrays to check equivalence
    const sortedSelected = [...selected].sort((a, b) => a - b);
    const sortedCorrect = [...question.correctAnswer].sort((a, b) => a - b);
    
    const isCorrect = 
      sortedSelected.length === sortedCorrect.length && 
      sortedSelected.every((val, index) => val === sortedCorrect[index]);

    if (isCorrect) {
      correctAnswersCount++;
    }

    gradedAnswers.push({
      question: question._id,
      selectedAnswers: selected,
      isCorrect,
    });
  });

  // Calculate score (percentage)
  const score = Math.round((correctAnswersCount / questions.length) * 100);

  // Update attempt status
  attempt.answers = gradedAnswers;
  attempt.score = score;
  attempt.totalQuestions = questions.length;
  attempt.correctAnswersCount = correctAnswersCount;
  attempt.timeTaken = timeTaken;
  attempt.isCompleted = true;
  attempt.completedAt = new Date();

  await attempt.save();

  // Update Leaderboard: Check if user has a higher record for this quiz
  const existingRecord = await Leaderboard.findOne({ quiz: attempt.quiz._id, user: userId });
  if (!existingRecord) {
    try {
      await Leaderboard.create({
        quiz: attempt.quiz._id,
        user: userId,
        score: score,
        timeTaken: timeTaken,
        attempt: attempt._id,
      });
    } catch (err) {
      // Catch duplicate key errors if index race condition occurs
      console.log("Leaderboard creation issue:", err.message);
    }
  } else {
    // If score is strictly higher, or if score is equal but time taken is lower, update!
    if (
      score > existingRecord.score ||
      (score === existingRecord.score && timeTaken < existingRecord.timeTaken)
    ) {
      existingRecord.score = score;
      existingRecord.timeTaken = timeTaken;
      existingRecord.attempt = attempt._id;
      await existingRecord.save();
    }
  }

  // Populate attempt details for response (including correctAnswer and explanation)
  const populatedAttempt = await QuizAttempt.findById(attempt._id)
    .populate({
      path: "answers.question",
      select: "text options correctAnswer explanation",
    })
    .populate("quiz", "title category timer");

  return populatedAttempt;
};

export const getAttemptResult = async (userId, attemptId) => {
  const attempt = await QuizAttempt.findOne({ _id: attemptId, user: userId })
    .populate({
      path: "answers.question",
      select: "text options correctAnswer explanation",
    })
    .populate("quiz", "title category timer");

  if (!attempt) {
    throw new Error("Quiz attempt not found");
  }

  return attempt;
};