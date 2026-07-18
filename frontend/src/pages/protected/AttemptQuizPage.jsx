
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";

import Loading from "@/components/shared/Loading";

import QuizLobby from "@/components/quiz/QuizLobby";
import QuizPlaying from "@/components/quiz/QuizPlaying";
import QuizResult from "@/components/quiz/QuizResult";

import useProctoring from "@/hooks/useProctoring";
import useCameraMonitoring from "@/hooks/useCameraMonitoring";
import WarningDialog from "@/components/quiz/WarningDialog";

import {
  getQuizById,
  getQuizQuestions,
  startAttempt,
  saveProgressiveAnswers,
  submitAttempt,
} from "@/services/quiz.service";

const AttemptQuizPage = () => {

  const { quizId } = useParams();

  const navigate = useNavigate();

  // ===================================
  // Quiz States
  // ===================================

  const [loading, setLoading] = useState(true);

  const [quiz, setQuiz] = useState(null);

  const [questions, setQuestions] = useState([]);

  const [attempt, setAttempt] = useState(null);

  const [result, setResult] = useState(null);

  const [phase, setPhase] = useState("lobby");

  const [currentQuestion, setCurrentQuestion] =
    useState(0);

  const [selectedAnswers, setSelectedAnswers] =
    useState({});

  const [timer, setTimer] = useState(0);

  const [starting, setStarting] =
    useState(false);

  const [submitting, setSubmitting] =
    useState(false);
    const [warningOpen, setWarningOpen] = useState(false);

const [warningMessage, setWarningMessage] = useState("");

const [countdown, setCountdown] = useState(5);

  // ===================================
  // Refs
  // ===================================

  const hasSubmittedRef = useRef(false);

  const attemptRef = useRef(null);

  const answersRef = useRef({});

  const questionsRef = useRef([]);

  const startTimeRef = useRef(Date.now());

   

  // ===================================
  // Camera Hook
  // ===================================

 const {
  videoRef,
  cameraEnabled,
} = useCameraMonitoring({

  enabled: phase === "playing",

  onViolation: (reason) => {

    showViolationWarning(reason);

  },

});
  // ===================================
// Phone Detection


  // ===================================
  // Proctoring Hook
  // ===================================

 useProctoring({

  enabled: phase === "playing",

  onViolation: (reason) => {

    showViolationWarning(reason);

  },

});

  // ===================================
  // Sync Refs
  // ===================================

  useEffect(() => {

    attemptRef.current = attempt;

  }, [attempt]);

  useEffect(() => {

    answersRef.current = selectedAnswers;

  }, [selectedAnswers]);

  useEffect(() => {

    questionsRef.current = questions;

  }, [questions]);

  // ===================================
  // Load Quiz
  // ===================================

  useEffect(() => {

    loadQuiz();

  }, [quizId]);

  const loadQuiz = async () => {

    try {

      setLoading(true);

      const res = await getQuizById(quizId);

      setQuiz(res.data.quiz);

    } catch (err) {

      console.error(err);

      toast.error("Unable to load quiz.");

      navigate("/dashboard/newfeed");

    } finally {

      setLoading(false);

    }

  };
    // ===================================
  // Begin Challenge
  // ===================================

  const handleBeginChallenge = async () => {
    try {
      // Fullscreen
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      }

      // Camera Permission
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });

      stream.getTracks().forEach((track) => track.stop());

      await handleStartQuiz();
    } catch (error) {
      console.error(error);

      toast.error("Camera permission is required.");

      if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
    }
  };

  // ===================================
  // Start Quiz
  // ===================================

  const handleStartQuiz = async () => {
    try {
      setStarting(true);

      const questionsRes = await getQuizQuestions(quiz._id);

      const questionList =
        questionsRes.data?.questions || [];

      if (!questionList.length) {
        toast.error("Questions not found.");
        return;
      }

      const attemptRes = await startAttempt(quiz._id);

      const newAttempt =
        attemptRes.data?.attempt;

      setAttempt(newAttempt);

      setQuestions(questionList);

      setCurrentQuestion(0);

      setSelectedAnswers({});

      setPhase("playing");

      setTimer((quiz.timer || 10) * 60);

      startTimeRef.current = Date.now();

      toast.success("Quiz Started");
    } catch (error) {
      console.error(error);

      toast.error(
        error.response?.data?.message ||
          "Unable to start quiz."
      );
    } finally {
      setStarting(false);
    }
  };

  // ===================================
  // Select Option
  // ===================================

  const handleSelectOption = (
    questionId,
    optionIndex,
    type
  ) => {
    setSelectedAnswers((prev) => {
      const current =
        prev[questionId] || [];

      // Multiple Choice
      if (type === "multiple") {
        if (current.includes(optionIndex)) {
          return {
            ...prev,
            [questionId]: current.filter(
              (x) => x !== optionIndex
            ),
          };
        }

        return {
          ...prev,
          [questionId]: [
            ...current,
            optionIndex,
          ],
        };
      }

      // Single Choice

      return {
        ...prev,
        [questionId]: [optionIndex],
      };
    });
  };

  // ===================================
  // Save Current Question
  // ===================================

  const saveCurrentAnswer =
    async () => {
      if (
        !attempt ||
        !questions[currentQuestion]
      )
        return;

      try {
        const question =
          questions[currentQuestion];

        await saveProgressiveAnswers(
          attempt._id,
          [
            {
              questionId: question._id,
              selectedAnswers:
                selectedAnswers[
                  question._id
                ] || [],
            },
          ]
        );
      } catch (error) {
        console.error(error);
      }
    };

  // ===================================
  // Next Question
  // ===================================

  const handleNext = async () => {
    await saveCurrentAnswer();

    if (
      currentQuestion <
      questions.length - 1
    ) {
      setCurrentQuestion((prev) => prev + 1);
    }
  };

  // ===================================
  // Previous Question
  // ===================================

  const handlePrevious = async () => {
    await saveCurrentAnswer();

    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
    }
  };
    // ===================================
  // Timer
  // ===================================

  useEffect(() => {

    if (phase !== "playing") return;

    if (timer <= 0) return;

    const interval = setInterval(() => {

      setTimer((prev) => {

        if (prev <= 1) {

          clearInterval(interval);

          triggerAutoSubmit();

          return 0;

        }

        return prev - 1;

      });

    }, 1000);

    return () => clearInterval(interval);

  }, [phase, timer]);

  // ===================================
  // Submit Quiz
  // ===================================

  const handleSubmitQuiz = async () => {
if (hasSubmittedRef.current) return;

hasSubmittedRef.current = true;

    try {

      setSubmitting(true);

      const answers = questions.map((question) => ({

        questionId: question._id,

        selectedAnswers:

          selectedAnswers[question._id] || [],

      }));

      const timeTaken = Math.round(

        (Date.now() - startTimeRef.current) /

          1000

      );

      const res = await submitAttempt(

        attempt._id,

        {

          answers,

          timeTaken,

        }

      );

      setResult(res.data.attempt);

      setPhase("result");

      toast.success("Quiz Submitted");

    } catch (error) {

      console.error(error);

      toast.error("Failed to submit quiz.");

    } finally {

      setSubmitting(false);

    }

  };

  // ===================================
  // Auto Submit
  // ===================================
const warningTimerRef = useRef(null);

const showViolationWarning = (message) => {
  if (warningOpen) return;
  setWarningMessage(message);
  setWarningOpen(true);
  setCountdown(5);
};

useEffect(() => {
  if (!warningOpen) return;

  warningTimerRef.current = setInterval(() => {
    setCountdown((prev) => {
      if (prev <= 1) {
        clearInterval(warningTimerRef.current);
        setWarningOpen(false);
        triggerAutoSubmit();
        return 0;
      }
      return prev - 1;
    });
  }, 1000);

  return () => clearInterval(warningTimerRef.current);
}, [warningOpen]);

const triggerAutoSubmit = async () => {
  if (!attemptRef.current) return;

  if (hasSubmittedRef.current) return;

hasSubmittedRef.current = true;

    try {

      const answers =

        questionsRef.current.map((question) => ({

          questionId: question._id,

          selectedAnswers:

            answersRef.current[question._id] || [],

        }));

      const timeTaken = Math.round(

        (Date.now() - startTimeRef.current) /

          1000

      );

      const res = await submitAttempt(

        attemptRef.current._id,

        {

          answers,

          timeTaken,

        }

      );

      setResult(res.data.attempt);

      setPhase("result");

      toast.success(

        "Assessment Auto Submitted"

      );

    } catch (error) {

      console.error(error);

    }

  };

  // ===================================
  // Retake Quiz
  // ===================================

  const handleRetakeQuiz = () => {
    clearInterval(warningTimerRef.current);

    hasSubmittedRef.current = false;
    setQuestions([]);

    setAttempt(null);

    setSelectedAnswers({});

    setCurrentQuestion(0);

    setResult(null);

    setPhase("lobby");

    setTimer(0);

  };

  // ===================================
  // Helpers
  // ===================================

  const formatTime = (seconds) => {

    const mins = Math.floor(seconds / 60);

    const secs = seconds % 60;

    return `${mins

      .toString()

      .padStart(2, "0")}:${secs

      .toString()

      .padStart(2, "0")}`;

  };

  const getDifficultyColor = (difficulty) => {

    switch (

      difficulty?.toLowerCase()

    ) {

      case "easy":

        return "bg-green-500 text-white";

      case "medium":

        return "bg-yellow-500 text-black";

      case "hard":

        return "bg-orange-500 text-white";

      case "expert":

        return "bg-red-600 text-white";

      default:

        return "bg-gray-500 text-white";

    }

  };

  // ===================================
  // Loading
  // ===================================

  if (loading) {

    return <Loading />;

  }

  if (!quiz) {

    return null;

  }
    // ===================================
  // Render
  // ===================================

  return (
    <div className="container mx-auto py-6 px-4">

      {/* ========================= */}
      {/* Lobby */}
      {/* ========================= */}

      {phase === "lobby" && (
        <QuizLobby
          quiz={quiz}
          isStartingQuiz={starting}
          handleBeginChallenge={handleBeginChallenge}
          navigate={navigate}
          getDifficultyColor={getDifficultyColor}
        />
      )}

      {/* ========================= */}
      {/* Playing */}
      {/* ========================= */}

      {phase === "playing" && (
        <QuizPlaying
          quiz={quiz}
          questions={questions}
          currentQuestionIndex={currentQuestion}
          selectedAnswers={selectedAnswers}
          handleSelectOption={handleSelectOption}
          handleNextQuestion={handleNext}
          handlePrevQuestion={handlePrevious}
          handleSubmitQuiz={handleSubmitQuiz}
          timerSeconds={timer}
          formatTime={formatTime}
          videoRef={videoRef}
          cameraEnabled={cameraEnabled}
          isSubmittingAttempt={submitting}
        />
      )}

      {/* ========================= */}
      {/* Result */}
      {/* ========================= */}

      {phase === "result" && (
        <QuizResult
          resultData={result}
          handleRetakeQuiz={handleRetakeQuiz}
          navigate={navigate}
        />
      )}

      <WarningDialog
  open={warningOpen}
  message={warningMessage}
  countdown={countdown}
  onContinue={async () => {
    clearInterval(warningTimerRef.current);

    setWarningOpen(false);

    if (!document.fullscreenElement) {
      try {
        await document.documentElement.requestFullscreen();
      } catch (err) {
        console.log("Fullscreen request failed", err);
      }
    }
  }}
/>

    </div>
  );

};

export default AttemptQuizPage;