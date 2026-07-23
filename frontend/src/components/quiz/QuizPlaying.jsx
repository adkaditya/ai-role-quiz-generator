import React, { useCallback } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  AlertTriangle,
} from "lucide-react";

import { Button } from "@/components/ui/button";

import QuestionCard from "./QuestionCard";
import CameraPreview from "../CameraPreview";

const QuizPlaying = React.memo(({
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

  const handleSelect = useCallback((optionIndex) => {
    if (question) {
      handleSelectOption(
        question._id,
        optionIndex,
        question.questionType
      );
    }
  }, [question, handleSelectOption]);

  if (!question) return null;

  return (
    <div className="space-y-6 pb-24">
      <CameraPreview
        videoRef={videoRef}
        cameraEnabled={cameraEnabled}
      />

      {/* Header */}
      <div className="sticky top-0 z-40 flex items-center justify-between gap-4 rounded-lg border bg-card/95 p-4 pr-36 shadow-sm backdrop-blur sm:pr-52">
        <div className="min-w-0">
          <h2 className="truncate text-lg font-bold sm:text-xl">
            {quiz.title}
          </h2>

          <p className="text-sm text-muted-foreground">

            Question {currentQuestionIndex + 1} of{" "}
            {questions.length}

          </p>

        </div>

        <div className="flex shrink-0 items-center gap-2 font-bold text-red-500">

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
        onSelectOption={handleSelect}
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

    </div>
  );
});

QuizPlaying.displayName = "QuizPlaying";

export default QuizPlaying;
