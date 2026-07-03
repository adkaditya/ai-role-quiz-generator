import { OpenAI } from "openai";
import Quiz from "../models/quiz.model.js";
import Question from "../models/question.model.js";
import Category from "../models/category.model.js";

import openAiClient from "../utils/openConfig.js";
const apiKey= process.env.OPENAI_API_KEY;
/**
 * Generate quiz questions using OpenAI LLM and store to DB
 * @param {string} topic - The topic of the quiz
 * @param {string} difficulty - easy | medium | hard | expert
 * @param {number} numQuestions - number of questions to generate
 * @param {string} categoryId - Category DB ObjectId
 * @param {string} creatorId - Creator Admin DB ObjectId
 */
export const generateQuiz = async (topic, difficulty, numQuestions, categoryId, creatorId) => {
  // Verify category exists
  const category = await Category.findById(categoryId);
  if (!category) {
    throw new Error("Category not found");
  }





  let quizData = null;


  // Check if we should use mock fallback (valid keys start with sk-)
  if (!apiKey || apiKey === "mock_key_for_now" || !apiKey.startsWith("sk-")) {
    console.log("Using Mock AI Quiz Generator (no valid OpenAI key provided or default dummy key detected)");
    throw new Error("Invalid AI API  Key !!")
  //  quizData = generateMockQuiz(topic, difficulty, numQuestions);
  } else {
    // Attempt actual OpenAI API call with retry mechanism
    let retries = 3;
    while (retries > 0 && !quizData) {
      try {
        const response = await openAiClient.chat.completions.create({
          model: "gpt-4o-mini", // Cost-effective and structured JSON capable
          messages: [
            {
              role: "system",
              content: `You are an expert quiz creator. Generate a complete multiple choice quiz about the user's topic in JSON format.
The JSON output MUST follow this exact schema:
{
  "title": "A catchy, short title for the quiz",
  "description": "An engaging, descriptive summary of what the quiz covers",
  "questions": [
    {
      "text": "The question text, clear and concise",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": [0], // Array of index integers (0-based) pointing to correct options (e.g. 0 matches "Option A")
      "explanation": "Brief explanation of why the correct option is right"
    }
  ]
}
Ensure exactly ${numQuestions} questions are generated. Ensure difficulty is tuned to: ${difficulty}. Output must be VALID JSON and nothing else.`,
            },
            {
              role: "user",
              content: `Topic: ${topic}
Difficulty: ${difficulty}
Questions count: ${numQuestions}`,
            },
          ],
          response_format: { type: "json_object" },
          temperature: 0.7,
          max_tokens: 2500,
        });

        const rawContent = response.choices[0].message.content;
        quizData = JSON.parse(rawContent);

        // Validate parsed structures
        if (!quizData.title || !quizData.description || !Array.isArray(quizData.questions)) {
          throw new Error("AI response structure invalid");
        }
      } catch (err) {
        retries--;
        console.error(`OpenAI generation attempt failed: ${err.message}. Retries remaining: ${retries}`);
        if (retries === 0) {
          throw new Error(`Failed to generate quiz from OpenAI API after multiple attempts: ${err.message}`);
        }
      }
    }
  }

  // Auto-Save generated quiz to MongoDB
  const quiz = await Quiz.create({
    title: quizData.title,
    description: quizData.description,
    category: categoryId,
    difficulty: difficulty,
    timer: Math.max(5, numQuestions * 1.5), // Allocate 1.5 mins per question
    isPublished: true, // Auto publish generated quizzes
    createdBy: creatorId,
    questionsCount: quizData.questions.length,
  });

  // Save questions
  const questionsToInsert = quizData.questions.map((q) => {
    // handle case where AI might return correctAnswer or correctAnswers
    const correctAns = q.correctAnswer !== undefined ? q.correctAnswer : q.correctAnswers;
    return {
      quiz: quiz._id,
      text: q.text,
      options: q.options,
      correctAnswer: Array.isArray(correctAns) ? correctAns : [correctAns],
      explanation: q.explanation || "No explanation provided.",
    };
  });

  const savedQuestions = await Question.insertMany(questionsToInsert);

  return {
    quiz,
    questions: savedQuestions,
  };
};

/**
 * Generate highly detailed mock quizzes for development sandbox when API key is missing
 */
function generateMockQuiz(topic, difficulty, numQuestions) {
  const questions = [];
  for (let i = 1; i <= numQuestions; i++) {
    questions.push({
      text: `Mock AI Question ${i}: What is the core characteristic of ${topic} when running under ${difficulty} parameters?`,
      options: [
        `Option A: Primary feature which satisfies developer needs`,
        `Option B: Secondary feature which adds stability`,
        `Option C: Tertiary execution parameter`,
        `Option D: None of the above`,
      ],
      correctAnswer: [0], // first index correct
      explanation: `Option A represents the primary design choice for ${topic} in typical ${difficulty} architectures.`,
    });
  }

  return {
    title: `Exploring ${topic} (${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)})`,
    description: `An AI-generated exploration covering ${topic}. Great for testing your foundational capabilities!`,
    questions,
  };
}