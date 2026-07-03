import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Play,
  Clock,
  HelpCircle,
  User,
  Check,
  X,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Info,
  BookMarked,
  Smile,
  Meh,
  Frown,
  Code,
  Database,
  Globe,
  Cpu,
  Palette,
  BookOpen,
} from "lucide-react";
import { toast } from "react-hot-toast";
import {
  getQuizById,
  getQuizQuestions,
  startAttempt,
  saveProgressiveAnswers,
  submitAttempt,
} from "../../services/quiz.service";
import Loading from "../../components/shared/Loading";
import { useSidebar } from "../../components/ui/sidebar";

function AttemptQuizPage() {
  const { quizId } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quizPhase, setQuizPhase] = useState("lobby"); // lobby, playing, result
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({}); // { [questionId]: [selectedIndex] }
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [activeAttempt, setActiveAttempt] = useState(null);
  const [quizStartTime, setQuizStartTime] = useState(null);
  const [isStartingQuiz, setIsStartingQuiz] = useState(false);
  const [isSubmittingAttempt, setIsSubmittingAttempt] = useState(false);
  const [resultData, setResultData] = useState(null);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const { setOpen, setOpenMobile, open, openMobile, isMobile } = useSidebar();
  const sidebarWasOpenRef = useRef(null);

  // Intercept the browser back button and trigger popstate warnings
  useEffect(() => {
    if (quizPhase !== "playing") return;

    // Push a dummy state to browser history to capture the Back button click
    window.history.pushState(null, "", window.location.href);

    const handlePopState = (e) => {
      // Re-push state so user remains on this page
      window.history.pushState(null, "", window.location.href);
      setShowExitConfirm(true);
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [quizPhase]);

  // Block clicking on sidebar and header navigation items during active play
  useEffect(() => {
    const sidebarEl = document.querySelector('[data-slot="sidebar"]');
    const headerEl = document.querySelector("header");

    if (quizPhase === "playing") {
      if (sidebarEl) sidebarEl.style.pointerEvents = "none";
      if (headerEl) headerEl.style.pointerEvents = "none";
    } else {
      if (sidebarEl) sidebarEl.style.pointerEvents = "auto";
      if (headerEl) headerEl.style.pointerEvents = "auto";
    }

    return () => {
      if (sidebarEl) sidebarEl.style.pointerEvents = "auto";
      if (headerEl) headerEl.style.pointerEvents = "auto";
    };
  }, [quizPhase]);

  // Warn on browser reload or window close
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (quizPhase === "playing") {
        const msg = "You are currently taking a quiz. Leaving this page will discard your progress.";
        e.preventDefault();
        e.returnValue = msg;
        return msg;
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [quizPhase]);

  // Handle programmatically closing the sidebar on mount and restoring on unmount
  useEffect(() => {
    // Save current sidebar state on mount
    sidebarWasOpenRef.current = {
      desktop: open,
      mobile: openMobile,
    };
    
    // Close the sidebar immediately on page entry
    setOpen(false);
    setOpenMobile(false);

    return () => {
      // Restore the sidebar state when the page is exited / unmounted
      if (sidebarWasOpenRef.current !== null) {
        setOpen(sidebarWasOpenRef.current.desktop);
        setOpenMobile(sidebarWasOpenRef.current.mobile);
      }
    };
  }, []);

  // Force close sidebar when entering active play (just in case it was toggled during lobby)
  useEffect(() => {
    if (quizPhase === "playing") {
      setOpen(false);
      setOpenMobile(false);
    }
  }, [quizPhase]);

  // References to handle timer closure issues safely
  const selectedAnswersRef = useRef(selectedAnswers);
  const questionsRef = useRef(questions);
  const activeAttemptRef = useRef(activeAttempt);
  const quizStartTimeRef = useRef(quizStartTime);

  useEffect(() => {
    selectedAnswersRef.current = selectedAnswers;
  }, [selectedAnswers]);

  useEffect(() => {
    questionsRef.current = questions;
  }, [questions]);

  useEffect(() => {
    activeAttemptRef.current = activeAttempt;
  }, [activeAttempt]);

  useEffect(() => {
    quizStartTimeRef.current = quizStartTime;
  }, [quizStartTime]);

  // Load Quiz details on mount
  useEffect(() => {
    async function fetchQuizDetails() {
      try {
        setIsLoading(true);
        const res = await getQuizById(quizId);
        if (res?.data?.quiz) {
          setQuiz(res.data.quiz);
        } else {
          toast.error("Quiz not found.");
          navigate("/dashboard/newfeed");
        }
      } catch (error) {
        console.error("Failed to load quiz details:", error);
        toast.error("Failed to load quiz details.");
        navigate("/dashboard/newfeed");
      } finally {
        setIsLoading(false);
      }
    }

    if (quizId) {
      fetchQuizDetails();
    } else {
      navigate("/dashboard/newfeed");
    }
  }, [quizId, navigate]);

  // Timer effect during active attempt
  useEffect(() => {
    let interval;
    if (quizPhase === "playing" && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            toast.error("Time's up! Auto-submitting your quiz.");
            triggerAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [quizPhase, timerSeconds]);

  // Start the actual attempt
  const handleStartQuiz = async () => {
    if (!quiz) return;
    setIsStartingQuiz(true);
    try {
      // 1. Fetch questions first
      const questionsRes = await getQuizQuestions(quiz._id);
      const quizQuestions = questionsRes.data?.questions || [];

      if (quizQuestions.length === 0) {
        toast.error("This quiz does not have any questions yet.");
        return;
      }

      // 2. Start attempt in backend
      const attemptRes = await startAttempt(quiz._id);
      const attemptObj = attemptRes.data?.attempt;

      if (!attemptObj) {
        toast.error("Failed to initialize attempt session.");
        return;
      }

      setQuestions(quizQuestions);
      setActiveAttempt(attemptObj);
      setCurrentQuestionIndex(0);
      setSelectedAnswers({});
      setTimerSeconds(quiz.timer > 0 ? quiz.timer * 60 : 0);
      setQuizStartTime(Date.now());
      setQuizPhase("playing");
      toast.success("Good luck! Quiz started.");
    } catch (error) {
      console.error("Failed to start quiz:", error);
      toast.error(
        error.response?.data?.message || "Failed to start quiz. Please try again."
      );
    } finally {
      setIsStartingQuiz(false);
    }
  };

  // Select option in quiz
  const handleSelectOption = (questionId, optionIndex) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: [optionIndex], // Stores single answer index in array format for backend
    }));
  };

  // Progressive saving on question transitions
  const saveProgressState = async (qIdx) => {
    if (activeAttempt && questions[qIdx]) {
      const q = questions[qIdx];
      const selections = selectedAnswers[q._id] || [];
      try {
        await saveProgressiveAnswers(activeAttempt._id, [
          { questionId: q._id, selectedAnswers: selections },
        ]);
      } catch (err) {
        console.error("Progressive save issue:", err);
      }
    }
  };

  const handleNextQuestion = async () => {
    await saveProgressState(currentQuestionIndex);
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePrevQuestion = async () => {
    await saveProgressState(currentQuestionIndex);
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  // Submit Attempt
  const handleSubmitQuiz = async () => {
    if (!activeAttempt) return;

    setIsSubmittingAttempt(true);
    try {
      const finalAnswers = questions.map((q) => ({
        questionId: q._id,
        selectedAnswers: selectedAnswers[q._id] || [],
      }));

      const timeTaken = Math.round((Date.now() - quizStartTime) / 1000);

      const response = await submitAttempt(activeAttempt._id, {
        answers: finalAnswers,
        timeTaken: timeTaken,
      });

      setResultData(response.data.attempt);
      setQuizPhase("result");
      toast.success("Quiz graded successfully!");
    } catch (error) {
      console.error("Grade submit failed:", error);
      toast.error(
        error.response?.data?.message || "Failed to submit answers. Please try again."
      );
    } finally {
      setIsSubmittingAttempt(false);
    }
  };

  // Auto-submit on timer end
  const triggerAutoSubmit = async () => {
    const currentAttempt = activeAttemptRef.current;
    const currentQuestions = questionsRef.current;
    const currentSelections = selectedAnswersRef.current;
    const startTime = quizStartTimeRef.current;

    if (!currentAttempt) return;

    setIsSubmittingAttempt(true);
    try {
      const finalAnswers = currentQuestions.map((q) => ({
        questionId: q._id,
        selectedAnswers: currentSelections[q._id] || [],
      }));

      const timeTaken = Math.round((Date.now() - startTime) / 1000);

      const response = await submitAttempt(currentAttempt._id, {
        answers: finalAnswers,
        timeTaken: timeTaken,
      });

      setResultData(response.data.attempt);
      setQuizPhase("result");
      toast.success("Quiz auto-submitted successfully!");
    } catch (error) {
      console.error("Auto-grade submit failed:", error);
      toast.error("Failed to automatically submit quiz results.");
    } finally {
      setIsSubmittingAttempt(false);
    }
  };

  // UI helpers
  const getDifficultyColor = (difficulty) => {
    const diff = (difficulty || "").toLowerCase();
    switch (diff) {
      case "easy":
        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      case "medium":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "hard":
        return "bg-orange-500/10 text-orange-500 border-orange-500/20";
      case "expert":
        return "bg-rose-500/10 text-rose-500 border-rose-500/20";
      default:
        return "bg-slate-500/10 text-slate-500 border-slate-500/20";
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const getCategoryIcon = (categoryName) => {
    const name = (categoryName || "").toLowerCase();
    if (
      name.includes("prog") ||
      name.includes("code") ||
      name.includes("js") ||
      name.includes("react") ||
      name.includes("node") ||
      name.includes("java")
    ) {
      return <Code size={20} />;
    }
    if (
      name.includes("design") ||
      name.includes("css") ||
      name.includes("ui") ||
      name.includes("ux") ||
      name.includes("tailwind")
    ) {
      return <Palette size={20} />;
    }
    if (
      name.includes("db") ||
      name.includes("sql") ||
      name.includes("data") ||
      name.includes("mongo") ||
      name.includes("postgres")
    ) {
      return <Database size={20} />;
    }
    if (
      name.includes("web") ||
      name.includes("html") ||
      name.includes("internet") ||
      name.includes("cloud")
    ) {
      return <Globe size={20} />;
    }
    if (
      name.includes("ai") ||
      name.includes("ml") ||
      name.includes("machine") ||
      name.includes("intell")
    ) {
      return <Cpu size={20} />;
    }
    return <BookOpen size={20} />;
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] py-12">
        <Loading />
        <p className="text-muted-foreground text-sm mt-4">Loading quiz info...</p>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-bold text-foreground">Quiz not found</h2>
        <Button onClick={() => navigate("/dashboard/newfeed")} className="mt-4">
          Back to New Feed
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto py-2 relative">
      {/* Background ambient gradients */}
      <div className="absolute top-0 right-0 -z-10 w-[300px] h-[300px] bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full bg-card border border-border shadow-xl rounded-2xl overflow-hidden flex flex-col relative min-h-[500px]">
        {/* EXIT CONFIRMATION OVERLAY */}
        {showExitConfirm && (
          <div className="absolute inset-0 z-50 bg-background/90 flex flex-col items-center justify-center p-6 text-center rounded-2xl">
            <div className="p-3 bg-rose-500/10 text-rose-500 rounded-full mb-4 border border-rose-500/20 animate-bounce">
              <AlertTriangle size={32} />
            </div>
            <h3 className="text-lg font-bold text-foreground">Abandon Current Quiz?</h3>
            <p className="text-xs text-muted-foreground max-w-sm mt-1">
              Your active session will be discarded. Any answers submitted so far will not be counted in your leaderboard score.
            </p>
            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                className="cursor-pointer"
                onClick={() => setShowExitConfirm(false)}
              >
                Resume Quiz
              </Button>
              <Button
                variant="destructive"
                className="cursor-pointer"
                onClick={() => {
                  // Switch phase to clean up the popstate and unload listeners
                  setQuizPhase("lobby");
                  setShowExitConfirm(false);
                  navigate("/dashboard/newfeed");
                }}
              >
                Abandon Session
              </Button>
            </div>
          </div>
        )}

        {/* LOBBY / PREPARATION PHASE */}
        {quizPhase === "lobby" && (
          <div className="p-6 md:p-8 space-y-6">
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground cursor-pointer -ml-2"
              onClick={() => navigate("/dashboard/newfeed")}
            >
              <ArrowLeft size={16} />
              Back to Feed
            </Button>

            {/* Lobby Header */}
            <div className="text-center space-y-3">
              <div className="flex justify-center">
                <div className="p-4 bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 rounded-2xl">
                  {getCategoryIcon(quiz.category?.name)}
                </div>
              </div>
              <Badge variant="outline" className={`mt-2 ${getDifficultyColor(quiz.difficulty)} capitalize font-semibold`}>
                {quiz.difficulty} Difficulty
              </Badge>
              <h2 className="text-xl md:text-3xl font-extrabold text-foreground">
                {quiz.title}
              </h2>
              <p className="text-xs md:text-sm text-muted-foreground max-w-lg mx-auto leading-relaxed">
                {quiz.description || "Challenge yourself with this quiz set."}
              </p>
            </div>

            <Separator className="border-border/60" />

            {/* Rules / stats grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border border-border/80 bg-muted/20 text-center space-y-1">
                <Clock className="w-6 h-6 mx-auto text-indigo-500" />
                <div className="text-[10px] font-bold text-muted-foreground uppercase">Time Limit</div>
                <div className="text-sm font-bold text-foreground">
                  {quiz.timer > 0 ? `${quiz.timer} Minutes` : "Untimed"}
                </div>
              </div>
              <div className="p-4 rounded-xl border border-border/80 bg-muted/20 text-center space-y-1">
                <HelpCircle className="w-6 h-6 mx-auto text-indigo-500" />
                <div className="text-[10px] font-bold text-muted-foreground uppercase">Questions</div>
                <div className="text-sm font-bold text-foreground">
                  {quiz.questionsCount || 0} Multiple-Choice
                </div>
              </div>
              <div className="p-4 rounded-xl border border-border/80 bg-muted/20 text-center space-y-1">
                <User className="w-6 h-6 mx-auto text-indigo-500" />
                <div className="text-[10px] font-bold text-muted-foreground uppercase">Publisher</div>
                <div className="text-sm font-bold text-foreground truncate max-w-[150px] mx-auto">
                  {quiz.createdBy?.name || "System"}
                </div>
              </div>
            </div>

            {/* Lobby instructions */}
            <div className="p-4 rounded-lg bg-amber-500/5 border border-amber-500/10 text-xs text-amber-700 dark:text-amber-400/90 flex gap-2.5">
              <Info size={16} className="shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold block mb-0.5 text-rose-600 dark:text-rose-400">CRITICAL WARNING:</strong>
                Ensure you have a stable network connection before starting. Once the quiz starts, do NOT reload the page, close the browser tab, or use the Back button. Doing so will forfeit your attempt.
              </div>
            </div>

            {/* Lobby controls */}
            <div className="flex gap-3 justify-end pt-4 border-t border-border/60">
              <Button
                variant="outline"
                className="cursor-pointer"
                onClick={() => navigate("/dashboard/newfeed")}
              >
                Cancel
              </Button>
              <Button
                className="cursor-pointer bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex gap-2 items-center px-6"
                onClick={handleStartQuiz}
                disabled={isStartingQuiz}
              >
                {isStartingQuiz ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    Entering Lobby...
                  </>
                ) : (
                  <>
                    <Play size={14} className="fill-white" />
                    Begin Challenge
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* ACTIVE QUIZ PLAYING PHASE */}
        {quizPhase === "playing" && questions.length > 0 && (
          <div className="flex flex-col h-full">
            {/* Playing Header */}
            <div className="p-4 border-b border-border/60 flex justify-between items-center gap-4 bg-muted/10">
              <div className="space-y-1">
                <h3 className="text-sm md:text-base font-bold text-foreground line-clamp-1">
                  {quiz.title}
                </h3>
                <div className="text-[10px] text-muted-foreground font-semibold uppercase">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </div>
              </div>

              {/* Countdown clock */}
              {quiz.timer > 0 ? (
                <div
                  className={`px-3 py-1.5 rounded-lg border font-mono font-bold text-xs flex items-center gap-2 ${
                    timerSeconds < 30
                      ? "bg-rose-500/15 border-rose-500/30 text-rose-500 animate-pulse"
                      : "bg-muted border-border text-foreground"
                  }`}
                >
                  <Clock size={14} />
                  {formatTime(timerSeconds)}
                </div>
              ) : (
                <Badge variant="outline" className="font-semibold text-[10px] text-muted-foreground">
                  Untimed Session
                </Badge>
              )}
            </div>

            {/* Visual Progress Bar */}
            <div className="w-full bg-muted h-1.5 overflow-hidden">
              <div
                className="bg-indigo-600 h-full transition-all duration-300"
                style={{
                  width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`,
                }}
              />
            </div>

            {/* Warning Banner */}
            <div className="bg-rose-500/10 border-b border-rose-500/20 text-rose-600 dark:text-rose-400 text-[11px] py-2 px-4 font-semibold text-center flex items-center justify-center gap-2">
              <AlertTriangle size={14} className="animate-pulse shrink-0" />
              <span>
                <strong>CRITICAL WARNING:</strong> Do NOT reload this page, close the browser, or click the back button! Leaving the page will forfeit your attempt.
              </span>
            </div>

            {/* Question Content */}
            <div className="p-6 md:p-8 space-y-6 flex-1">
              {/* Question text */}
              <h2 className="text-base md:text-xl font-bold text-foreground leading-snug">
                {questions[currentQuestionIndex].text}
              </h2>

              {/* Question image if present */}
              {questions[currentQuestionIndex].image && (
                <div className="rounded-lg overflow-hidden border max-h-[250px] bg-muted/20 flex justify-center p-2">
                  <img
                    src={questions[currentQuestionIndex].image}
                    alt="Question Reference"
                    className="max-h-[230px] object-contain"
                  />
                </div>
              )}

              {/* Options list */}
              <div className="grid grid-cols-1 gap-3">
                {questions[currentQuestionIndex].options.map((option, optIdx) => {
                  const isSelected =
                    selectedAnswers[questions[currentQuestionIndex]._id]?.includes(
                      optIdx
                    ) || false;

                  return (
                    <button
                      key={optIdx}
                      onClick={() =>
                        handleSelectOption(
                          questions[currentQuestionIndex]._id,
                          optIdx
                        )
                      }
                      className={`p-4 rounded-xl border text-left text-xs md:text-sm font-medium flex items-center gap-4 transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? "border-indigo-600 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold"
                          : "border-border/80 bg-card hover:bg-muted/40 hover:border-border/100"
                      }`}
                    >
                      {/* Option indicator (A, B, C, D) */}
                      <div
                        className={`w-6 h-6 rounded-full border text-[10px] font-bold flex items-center justify-center shrink-0 ${
                          isSelected
                            ? "bg-indigo-600 border-indigo-600 text-white"
                            : "bg-muted text-muted-foreground border-border/80"
                        }`}
                      >
                        {String.fromCharCode(65 + optIdx)}
                      </div>
                      <span className="flex-1">{option}</span>
                      {isSelected && <CheckCircle2 size={16} className="text-indigo-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Playing Footer Controls */}
            <div className="p-4 border-t border-border/60 bg-muted/10 flex justify-between items-center gap-3">
              <Button
                variant="outline"
                className="text-xs cursor-pointer text-rose-500 hover:text-rose-600 hover:bg-rose-500/5 hover:border-rose-500/20"
                onClick={() => setShowExitConfirm(true)}
              >
                Quit Quiz
              </Button>

              <div className="flex gap-2 items-center">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentQuestionIndex === 0}
                  onClick={handlePrevQuestion}
                  className="cursor-pointer"
                >
                  <ChevronLeft size={16} />
                  Back
                </Button>

                {currentQuestionIndex < questions.length - 1 ? (
                  <Button
                    size="sm"
                    onClick={handleNextQuestion}
                    className="cursor-pointer bg-indigo-600 hover:bg-indigo-500 text-white font-medium"
                  >
                    Next
                    <ChevronRight size={16} />
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={handleSubmitQuiz}
                    disabled={isSubmittingAttempt}
                    className="cursor-pointer bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold shadow shadow-emerald-500/10"
                  >
                    {isSubmittingAttempt ? (
                      <>
                        <RefreshCw size={14} className="animate-spin" />
                        Grading...
                      </>
                    ) : (
                      "Submit Quiz"
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* GRADING RESULTS PHASE */}
        {quizPhase === "result" && resultData && (
          <div className="flex flex-col h-full">
            {/* Results Header */}
            <div className="p-4 border-b border-border/60 flex justify-between items-center bg-muted/10">
              <div className="space-y-0.5">
                <h3 className="text-sm font-bold text-foreground">
                  Quiz Completed
                </h3>
                <p className="text-[10px] text-muted-foreground font-medium uppercase">
                  {quiz.title}
                </p>
              </div>
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 font-bold text-[10px]">
                Graded
              </Badge>
            </div>

            {/* Results Dashboard scroll container */}
            <div className="p-6 md:p-8 space-y-6">
              {/* Score Summary block */}
              <div className="text-center space-y-3">
                {/* Circular visual gauge */}
                <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="56"
                      cy="56"
                      r="50"
                      className="stroke-muted"
                      strokeWidth="8"
                      fill="transparent"
                    />
                    <circle
                      cx="56"
                      cy="56"
                      r="50"
                      className={
                        resultData.score >= 85
                          ? "stroke-emerald-500"
                          : resultData.score >= 70
                          ? "stroke-indigo-500"
                          : resultData.score >= 50
                          ? "stroke-amber-500"
                          : "stroke-rose-500"
                      }
                      strokeWidth="8"
                      fill="transparent"
                      strokeDasharray={314}
                      strokeDashoffset={314 - (314 * resultData.score) / 100}
                      strokeLinecap="round"
                      className="transition-all duration-1000"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-extrabold leading-none">
                      {resultData.score}%
                    </span>
                    <span className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wider mt-1">
                      Accuracy
                    </span>
                  </div>
                </div>

                {/* Message feedback */}
                <div>
                  <h2 className="text-lg font-black text-foreground">
                    {resultData.score >= 85 ? (
                      <span className="flex items-center justify-center gap-1.5">
                        Outstanding! <Smile className="text-emerald-500" />
                      </span>
                    ) : resultData.score >= 70 ? (
                      <span className="flex items-center justify-center gap-1.5">
                        Great Progress! <Smile className="text-indigo-500" />
                      </span>
                    ) : resultData.score >= 50 ? (
                      <span className="flex items-center justify-center gap-1.5">
                        Average Attempt <Meh className="text-amber-500" />
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-1.5">
                        Keep Practicing! <Frown className="text-rose-500" />
                      </span>
                    )}
                  </h2>
                  <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                    {resultData.score >= 85
                      ? "You've demonstrated exceptional understanding of the material!"
                      : resultData.score >= 70
                      ? "Solid work! Review the explanation metrics below to achieve perfect accuracy."
                      : "Keep practicing and testing your limits to level up your scores."}
                  </p>
                </div>
              </div>

              <Separator className="border-border/60" />

              {/* Stats numeric panel */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-xl border border-border/80 bg-muted/20 text-center">
                  <div className="text-[10px] font-bold text-muted-foreground uppercase">Correct</div>
                  <div className="text-base font-extrabold text-foreground mt-0.5">
                    {resultData.correctAnswersCount} / {resultData.totalQuestions}
                  </div>
                </div>
                <div className="p-3 rounded-xl border border-border/80 bg-muted/20 text-center">
                  <div className="text-[10px] font-bold text-muted-foreground uppercase">Time Spent</div>
                  <div className="text-base font-extrabold text-foreground mt-0.5">
                    {formatTime(resultData.timeTaken)}
                  </div>
                </div>
                <div className="p-3 rounded-xl border border-border/80 bg-muted/20 text-center">
                  <div className="text-[10px] font-bold text-muted-foreground uppercase">Average Speed</div>
                  <div className="text-base font-extrabold text-foreground mt-0.5">
                    {resultData.timeTaken > 0 && resultData.totalQuestions > 0
                      ? `${Math.round(resultData.timeTaken / resultData.totalQuestions)}s / Q`
                      : "N/A"}
                  </div>
                </div>
              </div>

              {/* Review section */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <BookOpen size={16} className="text-indigo-500" />
                  Detailed Questions Review
                </h3>

                <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
                  {resultData.answers && resultData.answers.map((ans, idx) => {
                    const q = ans.question;
                    const isCorrect = ans.isCorrect;
                    const userChoices = ans.selectedAnswers || [];
                    const correctChoices = q?.correctAnswer || [];

                    if (!q) return null;

                    return (
                      <div
                        key={idx}
                        className={`p-4 rounded-xl border transition-colors ${
                          isCorrect
                            ? "border-emerald-500/25 bg-emerald-500/5"
                            : "border-rose-500/25 bg-rose-500/5"
                        }`}
                      >
                        {/* Question meta header */}
                        <div className="flex justify-between items-center gap-2 pb-2 mb-2 border-b border-border/30">
                          <span className="text-[10px] font-bold text-muted-foreground uppercase">
                            Question {idx + 1}
                          </span>
                          <Badge
                            variant="outline"
                            className={`text-[9px] font-extrabold gap-1 px-1.5 py-0 ${
                              isCorrect
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25"
                                : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/25"
                            }`}
                          >
                            {isCorrect ? <Check size={10} /> : <X size={10} />}
                            {isCorrect ? "Correct" : "Incorrect"}
                          </Badge>
                        </div>

                        {/* Question text */}
                        <h4 className="text-xs md:text-sm font-bold text-foreground leading-snug">
                          {q.text}
                        </h4>

                        {/* Options review layout */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
                          {q.options.map((opt, optIdx) => {
                            const wasSelected = userChoices.includes(optIdx);
                            const wasCorrect = correctChoices.includes(optIdx);

                            let styleClass = "border-border/80 bg-card text-muted-foreground";
                            if (wasCorrect) {
                              styleClass =
                                "border-emerald-500 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-semibold";
                            } else if (wasSelected) {
                              styleClass =
                                "border-rose-500 bg-rose-500/15 text-rose-700 dark:text-rose-300 font-semibold";
                            }

                            return (
                              <div
                                key={optIdx}
                                className={`p-2.5 rounded-lg border text-[11px] flex items-center justify-between gap-2 ${styleClass}`}
                              >
                                <span className="truncate flex-1">{opt}</span>
                                <div className="shrink-0 flex items-center gap-1">
                                  {wasCorrect && (
                                    <Check size={12} className="text-emerald-500 font-bold" />
                                  )}
                                  {wasSelected && !wasCorrect && (
                                    <X size={12} className="text-rose-500 font-bold" />
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Question explanations */}
                        {q.explanation && (
                          <div className="mt-3 p-3 rounded-lg border border-border/40 bg-muted/60 text-[11px] text-muted-foreground flex gap-2">
                            <Info size={14} className="shrink-0 text-indigo-500 mt-0.5" />
                            <div className="leading-relaxed">
                              <strong className="text-foreground font-semibold">
                                Explanation:
                              </strong>{" "}
                              {q.explanation}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Results Footer controls */}
            <div className="p-4 border-t border-border/60 bg-muted/10 flex justify-end gap-3 rounded-b-2xl">
              <Button
                variant="outline"
                className="cursor-pointer text-xs"
                onClick={handleStartQuiz}
              >
                Retake Quiz
              </Button>
              <Button
                className="cursor-pointer text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-semibold"
                onClick={() => navigate("/dashboard/newfeed")}
              >
                Back to Feed
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AttemptQuizPage;