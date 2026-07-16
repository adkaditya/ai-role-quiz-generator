import React from "react";
import { CheckCircle2 } from "lucide-react";

const QuestionCard = ({
  question,
  questionNumber,
  totalQuestions,
  selectedAnswers,
  onSelectOption,
}) => {
  if (!question) return null;

  const selected = selectedAnswers || [];

  const isMultiple =
    question.questionType === "multiple";

  return (
    <div className="bg-card rounded-xl border shadow-sm p-6">

      {/* Header */}

      <div className="flex justify-between items-center mb-6">

        <h2 className="font-bold text-lg">
          Question {questionNumber} / {totalQuestions}
        </h2>

        <span className="text-xs bg-primary/10 px-3 py-1 rounded-full">
          {isMultiple
            ? "Multiple Choice"
            : "Single Choice"}
        </span>

      </div>

      {/* Question */}

      <h3 className="text-lg font-semibold mb-6">

        {question.text}

      </h3>

      {/* Image */}

      {question.image && (

        <img
          src={question.image}
          alt="Question"
          className="rounded-lg mb-6 w-full max-h-80 object-cover"
        />

      )}

      {/* Options */}

      <div className="space-y-4">

        {question.options.map((option, index) => {

          const active =
            selected.includes(index);

          return (

            <button
              key={index}
              type="button"
              onClick={() =>
                onSelectOption(index)
              }
              className={`w-full text-left border rounded-xl p-4 transition-all duration-200 flex justify-between items-center

              ${
                active
                  ? "border-primary bg-primary/10"
                  : "hover:border-primary"
              }`}
            >

              <span>{option}</span>

              {active && (
                <CheckCircle2
                  size={20}
                />
              )}

            </button>

          );

        })}

      </div>

    </div>
  );
};

export default QuestionCard;