
import { useEffect, useRef, useState, useCallback } from "react";
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

const getDifficultyColor = (difficulty) => {
  switch (difficulty?.toLowerCase()) {
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
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [timer, setTimer] = useState(0);
  const [starting, setStarting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
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
  const endTimeRef = useRef(null);
  const warningTimerRef = useRef(null);
  const isWarningActiveRef = useRef(false);
  const isEnteringFullscreenRef = useRef(false);
  const activeStreamRef = useRef(null);

  // ===================================
  // Auto Submit & Violation Warning
  // ===================================
  const triggerAutoSubmit = useCallback(async () => {
    if (!attemptRef.current) return;
    if (hasSubmittedRef.current) return;
    hasSubmittedRef.current = true;

    if (warningTimerRef.current) {
      clearInterval(warningTimerRef.current);
    }
    isWarningActiveRef.current = false;
    setWarningOpen(false);

    try {
      const answers = questionsRef.current.map((question) => ({
        questionId: question._id,
        selectedAnswers: answersRef.current[question._id] || [],
      }));

      const timeTaken = Math.round(
        (Date.now() - startTimeRef.current) / 1000
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
      toast.success("Assessment Auto Submitted");

      if (document.fullscreenElement) {
        try {
          await document.exitFullscreen();
        } catch (exitErr) {
          console.error("Exit fullscreen error on auto submit:", exitErr);
        }
      }
    } catch (error) {
      console.error("Auto submit failed:", error);
      hasSubmittedRef.current = false; // Allow retry on network failure
    }
  }, []);

  const showViolationWarning = useCallback((message) => {
    if (hasSubmittedRef.current || isWarningActiveRef.current) return;
    isWarningActiveRef.current = true;
    setWarningMessage(message);
    setWarningOpen(true);
    setCountdown(5);
  }, []);

  // ===================================
  // Camera Hook
  // ===================================
  const {
    videoRef,
    cameraEnabled,
  } = useCameraMonitoring({
    enabled: phase === "playing",
    onViolation: showViolationWarning,
    activeStreamRef,
  });


  // ===================================
  // Proctoring Hook
  // ===================================
  useProctoring({
    enabled: phase === "playing",
    onViolation: showViolationWarning,
    isEnteringFullscreenRef,
    isWarningActiveRef,
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
  const loadQuiz = useCallback(async () => {
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
  }, [quizId, navigate]);

  useEffect(() => {
    loadQuiz();
  }, [loadQuiz]);

  // ===================================
  // Start Quiz
  // ===================================
  const handleStartQuiz = useCallback(async (loadedQuiz) => {
    const targetQuiz = loadedQuiz || quiz;
    if (!targetQuiz) return;

    try {
      setStarting(true);
      const questionsRes = await getQuizQuestions(targetQuiz._id);
      const questionList = questionsRes.data?.questions || [];

      if (!questionList.length) {
        toast.error("Questions not found.");
        return;
      }

      const attemptRes = await startAttempt(targetQuiz._id);
      const newAttempt = attemptRes.data?.attempt;

      setAttempt(newAttempt);
      setQuestions(questionList);
      setCurrentQuestion(0);
      setSelectedAnswers({});

      const totalSeconds = (targetQuiz.timer || 10) * 60;
      endTimeRef.current = Date.now() + totalSeconds * 1000;
      setTimer(totalSeconds);
      startTimeRef.current = Date.now();

      setPhase("playing");

      toast.success("Quiz Started");
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message || "Unable to start quiz."
      );
      // Clean up the stream immediately if start attempt failed
      if (activeStreamRef.current) {
        activeStreamRef.current.getTracks().forEach((track) => track.stop());
        activeStreamRef.current = null;
      }
    } finally {
      setStarting(false);
    }
  }, [quiz]);

  // ===================================
  // Begin Challenge
  // ===================================
  const handleBeginChallenge = useCallback(async () => {
    try {
      // Fullscreen
      if (!document.fullscreenElement) {
        isEnteringFullscreenRef.current = true;
        await document.documentElement.requestFullscreen();
      }

      // Camera Permission - Keep it running and transfer to activeStreamRef
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });

      activeStreamRef.current = stream;

      await handleStartQuiz();
    } catch (error) {
      console.error("Lobby camera permission failed:", error);
      toast.error("Camera permission is required.");
      isEnteringFullscreenRef.current = false;
      if (document.fullscreenElement) {
        try {
          await document.exitFullscreen();
        } catch (exitErr) {
          console.error("Exit fullscreen error:", exitErr);
        }
      }
    }
  }, [handleStartQuiz]);

  // ===================================
  // Select Option
  // ===================================
  const handleSelectOption = useCallback((
    questionId,
    optionIndex,
    type
  ) => {
    setSelectedAnswers((prev) => {
      const current = prev[questionId] || [];

      if (type === "multiple") {
        if (current.includes(optionIndex)) {
          return {
            ...prev,
            [questionId]: current.filter((x) => x !== optionIndex),
          };
        }

        return {
          ...prev,
          [questionId]: [...current, optionIndex],
        };
      }

      return {
        ...prev,
        [questionId]: [optionIndex],
      };
    });
  }, []);

  // ===================================
  // Save Current Question
  // ===================================
  const saveCurrentAnswer = useCallback(async () => {
    if (!attemptRef.current || !questionsRef.current[currentQuestion]) return;

    try {
      const question = questionsRef.current[currentQuestion];
      await saveProgressiveAnswers(
        attemptRef.current._id,
        [
          {
            questionId: question._id,
            selectedAnswers: answersRef.current[question._id] || [],
          },
        ]
      );
    } catch (error) {
      console.error("Progressive save error:", error);
    }
  }, [currentQuestion]);

  // ===================================
  // Next Question
  // ===================================
  const handleNext = useCallback(async () => {
    await saveCurrentAnswer();
    if (currentQuestion < questionsRef.current.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    }
  }, [currentQuestion, saveCurrentAnswer]);

  // ===================================
  // Previous Question
  // ===================================
  const handlePrevious = useCallback(async () => {
    await saveCurrentAnswer();
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
    }
  }, [currentQuestion, saveCurrentAnswer]);

  // ===================================
  // Timer
  // ===================================
  useEffect(() => {
    if (phase !== "playing") return;

    const interval = setInterval(() => {
      if (!endTimeRef.current) return;
      const remaining = Math.max(0, Math.round((endTimeRef.current - Date.now()) / 1000));
      setTimer(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
        triggerAutoSubmit();
      }
    }, 500);

    return () => clearInterval(interval);
  }, [phase, triggerAutoSubmit]);

  // ===================================
  // Submit Quiz
  // ===================================
  const handleSubmitQuiz = useCallback(async () => {
    if (hasSubmittedRef.current) return;
    hasSubmittedRef.current = true;

    if (warningTimerRef.current) {
      clearInterval(warningTimerRef.current);
    }
    isWarningActiveRef.current = false;
    setWarningOpen(false);

    try {
      setSubmitting(true);

      const answers = questionsRef.current.map((question) => ({
        questionId: question._id,
        selectedAnswers: answersRef.current[question._id] || [],
      }));

      const timeTaken = Math.round(
        (Date.now() - startTimeRef.current) / 1000
      );

      const res = await submitAttempt(
        attemptRef.current?._id,
        {
          answers,
          timeTaken,
        }
      );

      setResult(res.data.attempt);
      setPhase("result");
      toast.success("Quiz Submitted");

      if (document.fullscreenElement) {
        try {
          await document.exitFullscreen();
        } catch (exitErr) {
          console.error("Exit fullscreen error on submit:", exitErr);
        }
      }
    } catch (error) {
      console.error("Quiz submission error:", error);
      toast.error("Failed to submit quiz.");
      hasSubmittedRef.current = false; // Allow retry
    } finally {
      setSubmitting(false);
    }
  }, []);

  // ===================================
  // Warning Dialog Countdown Effect
  // ===================================
 
  useEffect(() => {
    if (!warningOpen) return;

    warningTimerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(warningTimerRef.current);
          isWarningActiveRef.current = false;
          setWarningOpen(false);
          triggerAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (warningTimerRef.current) {
        clearInterval(warningTimerRef.current);
      }
    };
  }, [warningOpen, triggerAutoSubmit]);
  // ===================================
  // Retake Quiz
  // ===================================
  const handleRetakeQuiz = useCallback(() => {
    if (warningTimerRef.current) {
      clearInterval(warningTimerRef.current);
    }
    isWarningActiveRef.current = false;
    hasSubmittedRef.current = false;
    setQuestions([]);
    setAttempt(null);
    setSelectedAnswers({});
    setCurrentQuestion(0);
    setResult(null);
    setPhase("lobby");
    setTimer(0);
  }, []);

  // ===================================
  // Clean up global timers & stream on unmount
  // ===================================
  useEffect(() => {
    return () => {
      if (warningTimerRef.current) {
        clearInterval(warningTimerRef.current);
      }
      if (activeStreamRef.current) {
        activeStreamRef.current.getTracks().forEach((track) => track.stop());
        activeStreamRef.current = null;
      }
    };
  }, []);

  // ===================================
  // Helpers
  // ===================================
  const formatTime = useCallback((seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }, []);

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
          if (warningTimerRef.current) {
            clearInterval(warningTimerRef.current);
          }
          setWarningOpen(false);

          if (!document.fullscreenElement) {
            try {
              isEnteringFullscreenRef.current = true;
              await document.documentElement.requestFullscreen();
            } catch {
              isEnteringFullscreenRef.current = false;
              toast.error("Failed to re-enter fullscreen. Please try again.");
            }
          }
          isWarningActiveRef.current = false;
        }}
      />
    </div>
  );
};

export default AttemptQuizPage;
