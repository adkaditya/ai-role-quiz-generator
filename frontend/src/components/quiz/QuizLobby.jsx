import React from "react";
import {
  Play,
  Clock,
  BookOpen,
  Info,
  ArrowLeft,
  RefreshCw,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const QuizLobby = ({
  quiz,
  isStartingQuiz,
  handleBeginChallenge,
  navigate,
  getDifficultyColor,
}) => {
  return (
    <div className="bg-card border rounded-2xl shadow-lg overflow-hidden">

      <div className="p-8">

        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate("/dashboard/newfeed")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="text-center space-y-4">

          <h1 className="text-3xl font-bold">
            {quiz.title}
          </h1>

          <p className="text-muted-foreground">
            {quiz.description}
          </p>

          <Badge
            className={getDifficultyColor(
              quiz.difficulty
            )}
          >
            {quiz.difficulty}
          </Badge>

        </div>

        <Separator className="my-8" />

        <div className="grid md:grid-cols-3 gap-5">

          <div className="border rounded-xl p-5 text-center">

            <Clock
              className="mx-auto mb-2"
              size={28}
            />

            <h3 className="font-bold">
              Duration
            </h3>

            <p>{quiz.timer} Minutes</p>

          </div>

          <div className="border rounded-xl p-5 text-center">

            <BookOpen
              className="mx-auto mb-2"
              size={28}
            />

            <h3 className="font-bold">
              Questions
            </h3>

            <p>{quiz.questionsCount}</p>

          </div>

          <div className="border rounded-xl p-5 text-center">

            <Info
              className="mx-auto mb-2"
              size={28}
            />

            <h3 className="font-bold">
              Category
            </h3>

            <p>
              {quiz.category?.name || "General"}
            </p>

          </div>

        </div>

        <div className="mt-8 rounded-xl border border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 p-5">

          <h2 className="font-bold mb-3">
            Assessment Rules
          </h2>

          <ul className="list-disc ml-5 space-y-2 text-sm">

            <li>Fullscreen is mandatory.</li>

            <li>Camera permission is required.</li>

            <li>Tab switching is prohibited.</li>

            <li>Copy / Paste is disabled.</li>

            <li>Right Click is disabled.</li>

            <li>DevTools are blocked.</li>

            <li>
              Any violation may auto submit
              your assessment.
            </li>

          </ul>

        </div>

        <div className="flex justify-end mt-8">

          <Button
            size="lg"
            disabled={isStartingQuiz}
            onClick={handleBeginChallenge}
          >
            {isStartingQuiz ? (
              <>
                <RefreshCw
                  size={18}
                  className="mr-2 animate-spin"
                />
                Starting...
              </>
            ) : (
              <>
                <Play
                  size={18}
                  className="mr-2"
                />
                Begin Challenge
              </>
            )}
          </Button>

        </div>

      </div>

    </div>
  );
};

export default QuizLobby;