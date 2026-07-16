import React from "react";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  AlertTriangle,
} from "lucide-react";

import { Button } from "@/components/ui/button";

import QuestionCard from "./QuestionCard";
import CameraPreview from "../CameraPreview";

const QuizPlaying = ({
  quiz,
  questions,
  currentQuestionIndex,
  selectedAnswers,
  handleSelectOption,
  handleNextQuestion,
  handlePrevQuestion,
  handleSubmitQuiz,
  timerSeconds,
  formatTime,
  videoRef,
  cameraEnabled,
  isSubmittingAttempt,
}) => {
  const question = questions[currentQuestionIndex];

  if (!question) return null;

  return (
    <div className="space-y-6">

      {/* Header */}

      <div className="border rounded-xl p-4 flex justify-between items-center bg-card">

        <div>

          <h2 className="text-xl font-bold">

            {quiz.title}

          </h2>

          <p className="text-sm text-muted-foreground">

            Question {currentQuestionIndex + 1} of{" "}
            {questions.length}

          </p>

        </div>

        <div className="flex items-center gap-2 text-red-500 font-bold">

          <Clock size={20} />

          {formatTime(timerSeconds)}

        </div>

      </div>

      {/* Question */}

      <QuestionCard
        question={question}
        questionNumber={currentQuestionIndex + 1}
        totalQuestions={questions.length}
        selectedAnswers={
          selectedAnswers[question._id] || []
        }
        onSelectOption={(optionIndex) =>
          handleSelectOption(
            question._id,
            optionIndex,
            question.questionType
          )
        }
      />

      {/* Navigation */}

      <div className="flex justify-between">

        <Button
          variant="outline"
          disabled={currentQuestionIndex === 0}
          onClick={handlePrevQuestion}
        >
          <ChevronLeft
            className="mr-2"
            size={18}
          />

          Previous

        </Button>

        {currentQuestionIndex ===
        questions.length - 1 ? (

          <Button
            disabled={isSubmittingAttempt}
            onClick={handleSubmitQuiz}
          >
            Submit Quiz
          </Button>

        ) : (

          <Button
            onClick={handleNextQuestion}
          >
            Next

            <ChevronRight
              className="ml-2"
              size={18}
            />

          </Button>

        )}

      </div>

      {/* Warning */}

      <div className="rounded-xl border border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 p-4 flex gap-3">

        <AlertTriangle className="text-yellow-600" />

        <p className="text-sm">

          Do not switch tabs, exit fullscreen,
          or use copy/paste. Any violation may
          automatically submit your assessment.

        </p>

      </div>

      {/* Camera */}

      <CameraPreview
        videoRef={videoRef}
        cameraEnabled={cameraEnabled}
      />

    </div>
  );
};

export default QuizPlaying;