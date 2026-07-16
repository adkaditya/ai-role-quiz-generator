import React from "react";
import {
  CheckCircle2,
  XCircle,
  RefreshCw,
  Home,
  Trophy,
} from "lucide-react";

import { Button } from "@/components/ui/button";

const QuizResult = ({
  resultData,
  handleRetakeQuiz,
  navigate,
}) => {
  if (!resultData) return null;

  const attempt = resultData;

  return (
    <div className="bg-card rounded-xl border shadow-sm p-8">

      <div className="text-center">

        <Trophy
          size={60}
          className="mx-auto text-yellow-500 mb-4"
        />

        <h1 className="text-3xl font-bold">

          Assessment Completed

        </h1>

        <p className="text-muted-foreground mt-2">

          Thank you for completing the assessment.

        </p>

      </div>

      <div className="grid md:grid-cols-3 gap-5 mt-8">

        <div className="border rounded-xl p-5 text-center">

          <h3 className="font-semibold">

            Score

          </h3>

          <p className="text-3xl font-bold text-green-600">

            {attempt.score}%

          </p>

        </div>

        <div className="border rounded-xl p-5 text-center">

          <h3 className="font-semibold">

            Correct

          </h3>

          <p className="text-3xl font-bold text-blue-600">

            {attempt.correctAnswersCount}

          </p>

        </div>

        <div className="border rounded-xl p-5 text-center">

          <h3 className="font-semibold">

            Total Questions

          </h3>

          <p className="text-3xl font-bold">

            {attempt.totalQuestions}

          </p>

        </div>

      </div>

      <div className="mt-10">

        <h2 className="text-xl font-bold mb-5">

          Review Answers

        </h2>

        <div className="space-y-5">

          {attempt.answers?.map((answer, index) => {

            const question = answer.question;

            return (

              <div
                key={index}
                className="border rounded-xl p-5"
              >

                <div className="flex items-center gap-3 mb-3">

                  {answer.isCorrect ? (

                    <CheckCircle2 className="text-green-500" />

                  ) : (

                    <XCircle className="text-red-500" />

                  )}

                  <h3 className="font-semibold">

                    {question.text}

                  </h3>

                </div>

                <p className="text-sm text-muted-foreground">

                  Explanation:

                </p>
                <div className="mt-5 space-y-3">

  {question.options?.map((option, optionIndex) => {

    const isCorrect =
      question.correctAnswer?.includes(optionIndex);

    const isSelected =
      answer.selectedAnswers?.includes(optionIndex);

    return (

      <div
        key={optionIndex}
        className={`border rounded-lg p-3 flex justify-between items-center

        ${
          isCorrect
            ? "border-green-500 bg-green-500/10"
            : isSelected
            ? "border-red-500 bg-red-500/10"
            : "border-gray-700"
        }`}
      >

        <span>{option}</span>

        <div className="flex gap-2">

          {isSelected && (
            <span className="text-blue-400 text-sm">
              Your Answer
            </span>
          )}

          {isCorrect && (
            <span className="text-green-400 text-sm">
              Correct
            </span>
          )}

        </div>

      </div>

    );

  })}

</div>

                <p className="mt-2">

                  {question.explanation}

                </p>

              </div>

            );

          })}

        </div>

      </div>

      <div className="flex justify-between mt-10">

        <Button
          variant="outline"
          onClick={() =>
            navigate("/dashboard/newfeed")
          }
        >
          <Home className="mr-2" size={18} />

          Dashboard

        </Button>

        <Button
          onClick={handleRetakeQuiz}
        >
          <RefreshCw
            className="mr-2"
            size={18}
          />

          Retake Quiz

        </Button>

      </div>

    </div>
  );
};

export default QuizResult;