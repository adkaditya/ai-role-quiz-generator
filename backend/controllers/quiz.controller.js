import Quiz from "../models/quiz.model.js";
import Question from "../models/question.model.js";
import QuizAttempt from "../models/quizattempt.model.js";
import Bookmark from "../models/bookmark.model.js";

// create quiz (Admin only)
export const createQuiz = async (req, resp) => {
  try {

    // const { title, description, quizPhoto, category, difficulty, timer, isPublished } = req.body;

    const quizData = {
      ...req.body,
      createdBy: req.user._id,
    };

    if(req.body.categoryId){

      // quizData.category = req.body.categoryId

      const category = await Category.findById(req.body.categoryId);
      if(!category){
        
        return resp.status(404).json({ message: "Category not found" });
      }
      quizData.category = category._id;

}
    const quiz = await Quiz.create(quizData);

    return resp.status(201).json({
      status: "success",
      data: {
        quiz,
      },
    });
  } catch (error) {
    console.log(error);
    return resp.status(500).json({
      message: "Something went wrong in creating quiz",
      error: error.message,
    });
  }
};

// get all quiz
export const getQuizzes = async (req, resp) => {
  try {
    //for filters
    const queryObj = {};

    // For regular users, only show published quizzes
    const isAdmin = req.user && req.user.role && req.user.role.name === "admin";
    if (!isAdmin) {
      queryObj.isPublished = true;
    } else if (req.query.isPublished !== undefined) {
      queryObj.isPublished = req.query.isPublished === "true";
    }

    // Search filter
    if (req.query.search) {
      queryObj.$or = [
        { title: { $regex: req.query.search, $options: "i" } },
        { description: { $regex: req.query.search, $options: "i" } },
      ];
    }

    // Category filter
    if (req.query.category) {
      queryObj.category = req.query.category;
    }

    // Difficulty filter
    if (req.query.difficulty) {
      queryObj.difficulty = req.query.difficulty;
    }

    // Tags filter
    if (req.query.tags) {
      const tagsArray = req.query.tags.split(",");
      queryObj.tags = { $all: tagsArray };
    }

    // Execute query with pagination & sorting
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    let sort = "-createdAt";
    if (req.query.sort) {
      sort = req.query.sort.split(",").join(" ");
    }

    const quizzes = await Quiz.find(queryObj)
      .populate("category", "name")
      .populate("createdBy", "name")
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const totalQuizzes = await Quiz.countDocuments(queryObj);

    // Attach bookmark information
    let bookmarks = [];
    if (req.user) {
      const userBookmarks = await Bookmark.find({ user: req.user._id });
      bookmarks = userBookmarks.map((b) => b.quiz.toString());
    }

    const quizzesWithBookmarks = quizzes.map((quiz) => {
      const quizObj = quiz.toObject();
      quizObj.isBookmarked = bookmarks.includes(quiz._id.toString());
      return quizObj;
    });

    return resp.status(200).json({
      status: "success",
      results: quizzesWithBookmarks.length,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(totalQuizzes / limit),
        totalResults: totalQuizzes,
      },
      data: {
        quizzes: quizzesWithBookmarks,
      },
    });
  } catch (error) {
    console.log(error);
    return resp.status(500).json({
      message: "Something went wrong in fetching quizzes",
      error: error.message,
    });
  }
};

// get single quiz
export const getQuizById = async (req, resp) => {
  try {
    const quiz = await Quiz.findById(req.params.id)
      .populate("category", "name")
      .populate("createdBy", "name");

    if (!quiz) {
      return resp.status(404).json({ message: "Quiz not found" });
    }

    // If quiz is not published and user is not admin, deny access
    const isAdmin = req.user && req.user.role && req.user.role.name === "admin";
    if (!quiz.isPublished && !isAdmin) {
      return resp.status(403).json({ message: "You do not have permission to view this unpublished quiz" });
    }

    // Check bookmark
    let isBookmarked = false;
    if (req.user) {
      const bookmark = await Bookmark.findOne({ user: req.user._id, quiz: quiz._id });
      isBookmarked = !!bookmark;
    }

    const quizObj = quiz.toObject();
    quizObj.isBookmarked = isBookmarked;

    return resp.status(200).json({
      status: "success",
      data: {
        quiz: quizObj,
      },
    });
  } catch (error) {
    console.log(error);
    return resp.status(500).json({
      message: "Something went wrong in fetching quiz details",
      error: error.message,
    });
  }
};

// Retrieve quiz questions (Strips correct options for users)
export const getQuizQuestions = async (req, resp) => {
  try {
    //quiz id:
    const { id } = req.params;
    const quiz = await Quiz.findById(id);
    if (!quiz) {
      return resp.status(404).json({ message: "Quiz not found" });
    }

    const isAdmin = req.user && req.user.role && req.user.role.name === "admin";

    if (!quiz.isPublished && !isAdmin) {
      return resp.status(403).json({ message: "Quiz is not available" });
    }

    // Fetch questions
    let questions;
    if (isAdmin) {
      // Admins get everything (including correctAnswer)
      questions = await Question.find({ quiz: id });
    } else {
      // Regular users get questions without correctAnswer (to prevent cheating)
      questions = await Question.find({ quiz: id }).select("-correctAnswer");
    }

    return resp.status(200).json({
      status: "success",
      results: questions.length,
      data: {
        questions,
      },
    });
  } catch (error) {
    console.log(error);
    return resp.status(500).json({
      message: "Something went wrong in fetching quiz questions",
      error: error.message,
    });
  }
};

// update quiz (Admin only)
export const updateQuiz = async (req, resp) => {
  try {
    const { id } = req.params;
    const quiz = await Quiz.findById(id);

    if (!quiz) {
      return resp.status(404).json({ message: "Quiz not found" });
    }

    // Update fields
    const allowedUpdates = [
      "title",
      "description",
      "quizPhoto",
      "category",
      "difficulty",
      "timer",
      "isPublished",
    ];
    
    allowedUpdates.forEach((update) => {
      if (req.body[update] !== undefined) {
        quiz[update] = req.body[update];
      }
    });

    await quiz.save();

    const updatedQuiz = await Quiz.findById(id)
      .populate("category", "name")
      .populate("createdBy", "name");

    return resp.status(200).json({
      status: "success",
      data: {
        quiz: updatedQuiz,
      },
    });
  } catch (error) {
    console.log(error);
    return resp.status(500).json({
      message: "Something went wrong in updating quiz",
      error: error.message,
    });
  }
};

// delete quiz (Admin only)
export const deleteQuiz = async (req, resp) => {
  try {
    const { id } = req.params;
    const quiz = await Quiz.findById(id);

    if (!quiz) {
      return resp.status(404).json({ message: "Quiz not found" });
    }

    // Cascade delete: delete all associated questions, attempts, and bookmarks
    await Question.deleteMany({ quiz: id });
    await QuizAttempt.deleteMany({ quiz: id });
    await Bookmark.deleteMany({ quiz: id });

    await Quiz.findByIdAndDelete(id);

    return resp.status(200).json({
      status: "success",
      message: "Quiz and all associated questions/attempts/bookmarks deleted successfully",
    });
  } catch (error) {
    console.log(error);
    return resp.status(500).json({
      message: "Something went wrong in deleting quiz",
      error: error.message,
    });
  }
};