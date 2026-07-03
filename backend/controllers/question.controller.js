import Question from "../models/question.model.js";
import Quiz from "../models/quiz.model.js";

// Helper to keep quiz questionsCount in sync
const updateQuizQuestionsCount = async (quizId) => {
  try {
    const count = await Question.countDocuments({ quiz: quizId });
    await Quiz.findByIdAndUpdate(quizId, { questionsCount: count });
  } catch (err) {
    console.error(`Failed to update questions count for quiz ${quizId}:`, err);
  }
};

// Add a new question to a quiz (Admin only)
export const createQuestion = async (req, resp) => {
  try {
    const { quiz, text, options, correctAnswer, explanation, image } = req.body;

    // Check if quiz exists
    const quizExists = await Quiz.findById(quiz);
    if (!quizExists) {
      return resp.status(404).json({ message: "Quiz not found" });
    }

    // Validate correctAnswer indices
    if (!Array.isArray(correctAnswer) || correctAnswer.length === 0) {
      return resp.status(400).json({ message: "correctAnswer must be a non-empty array of indices" });
    }

    const invalidIndex = correctAnswer.some(
      (idx) => idx < 0 || idx >= options.length
    );
    if (invalidIndex) {
      return resp.status(400).json({ message: "Correct answer index must correspond to options indices" });
    }

    const question = await Question.create({
      quiz,
      text,
      options,
      correctAnswer,
      explanation,
      image,
    });

    // Update count in Quiz
    await updateQuizQuestionsCount(quiz);

    return resp.status(201).json({
      status: "success",
      data: {
        question,
      },
    });
  } catch (error) {
    console.log(error);
    return resp.status(500).json({
      message: "Something went wrong in creating question",
      error: error.message,
    });
  }
};

// Update an existing question (Admin only)
export const updateQuestion = async (req, resp) => {
  try {
    const { id } = req.params;
    const { text, options, correctAnswer, explanation, image } = req.body;

    const question = await Question.findById(id);
    if (!question) {
      return resp.status(404).json({ message: "Question not found" });
    }

    if (text) question.text = text;

    if (options) question.options = options;

    if (image !== undefined) question.image = image;
    
    if (correctAnswer) {
      const opts = options || question.options;
      if (!Array.isArray(correctAnswer) || correctAnswer.length === 0) {
        return resp.status(400).json({ message: "correctAnswer must be a non-empty array of indices" });
      }
      const invalidIndex = correctAnswer.some((idx) => idx < 0 || idx >= opts.length);
      if (invalidIndex) {
        return resp.status(400).json({ message: "Correct answer index must correspond to options indices" });
      }
      question.correctAnswer = correctAnswer;
    }
    if (explanation !== undefined) question.explanation = explanation;

    await question.save();

    return resp.status(200).json({
      status: "success",
      data: {
        question,
      },
    });
  } catch (error) {
    console.log(error);
    return resp.status(500).json({
      message: "Something went wrong in updating question",
      error: error.message,
    });
  }
};

// Delete a question (Admin only)
export const deleteQuestion = async (req, resp) => {
  try {
    const { id } = req.params;
    const question = await Question.findById(id);

    if (!question) {
      return resp.status(404).json({ message: "Question not found" });
    }

    const quizId = question.quiz;

    await Question.findByIdAndDelete(id);

    // Update count in Quiz
    await updateQuizQuestionsCount(quizId);

    return resp.status(200).json({
      status: "success",
      message: "Question deleted successfully",
    });
  } catch (error) {
    console.log(error);
    return resp.status(500).json({
      message: "Something went wrong in deleting question",
      error: error.message,
    });
  }
};

// Upload questions in bulk to a quiz (Admin only)
export const bulkUploadQuestions = async (req, resp) => {
  try {
    const { quizId } = req.params;
    const { questions } = req.body;

    if (!Array.isArray(questions) || questions.length === 0) {
      return resp.status(400).json({ message: "questions must be a non-empty array" });
    }

    // Check if quiz exists
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return resp.status(404).json({ message: "Quiz not found" });
    }

    // Validate and attach quizId to each question
    const questionsToInsert = [];
    for (const q of questions) {
      // support both correctAnswer and correctAnswers mapping for flexibility
      const correctAns = q.correctAnswer || q.correctAnswers;
      if (!Array.isArray(correctAns) || correctAns.length === 0) {
        return resp.status(400).json({ message: `Question "${q.text}" requires a valid correctAnswer array` });
      }

      const invalidIndex = correctAns.some(
        (idx) => idx < 0 || idx >= q.options.length
      );
      if (invalidIndex) {
        return resp.status(400).json({ message: `Question "${q.text}" has invalid correct answer indices` });
      }

      questionsToInsert.push({
        quiz: quizId,
        text: q.text,
        image: q.image || "",
        options: q.options,
        correctAnswer: correctAns,
        explanation: q.explanation || "",
      });
    }

    // Bulk insert questions
    const createdQuestions = await Question.insertMany(questionsToInsert);

    // Update count in Quiz
    await updateQuizQuestionsCount(quizId);

    return resp.status(201).json({
      status: "success",
      results: createdQuestions.length,
      data: {
        questions: createdQuestions,
      },
    });
  } catch (error) {
    console.log(error);
    return resp.status(500).json({
      message: "Something went wrong in bulk uploading questions",
      error: error.message,
    });
  }
};