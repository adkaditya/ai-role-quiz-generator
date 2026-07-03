import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
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
  Clock,
  Calendar,
  Award,
  BookOpen,
  Check,
  X,
  Eye,
  Info,
  ChevronRight,
  Smile,
  Meh,
  Frown,
  Code,
  Database,
  Globe,
  Cpu,
  Palette,
  ArrowRight,
  Trophy,
} from "lucide-react";
import { toast } from "react-hot-toast";
import {
  getAttemptsHistory,
  getAttemptResult,
} from "../../services/quiz.service";
import Loading from "../../components/shared/Loading";

function QuizAttemptsPage() {
  const navigate = useNavigate();
  const [attempts, setAttempts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Attempt details modal states
  const [selectedAttemptId, setSelectedAttemptId] = useState(null);
  const [attemptDetails, setAttemptDetails] = useState(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  useEffect(() => {
    async function loadHistory() {
      try {
        setIsLoading(true);
        const res = await getAttemptsHistory();
        if (res?.data?.attempts) {
          //set attempts to variable
          setAttempts(res.data.attempts);
        }
      } catch (error) {
        console.error("Failed to load attempts history:", error);
        toast.error("Failed to load attempts history.");
      } finally {
        setIsLoading(false);
      }
    }
    loadHistory();
  }, []);

  const handleOpenDetails = async (attemptId) => {
    setSelectedAttemptId(attemptId);
    setIsLoadingDetails(true);
    try {
      const res = await getAttemptResult(attemptId);
      if (res?.data?.attempt) {
        setAttemptDetails(res.data.attempt);
      } else {
        toast.error("Failed to load details for this attempt.");
        setSelectedAttemptId(null);
      }
    } catch (error) {
      console.error("Failed to load attempt details:", error);
      toast.error("Failed to load attempt details.");
      setSelectedAttemptId(null);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const handleCloseDetails = () => {
    setSelectedAttemptId(null);
    setAttemptDetails(null);
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
      return <Code size={16} className="text-indigo-500" />;
    }
    if (
      name.includes("design") ||
      name.includes("css") ||
      name.includes("ui") ||
      name.includes("ux") ||
      name.includes("tailwind")
    ) {
      return <Palette size={16} className="text-rose-500" />;
    }
    if (
      name.includes("db") ||
      name.includes("sql") ||
      name.includes("data") ||
      name.includes("mongo") ||
      name.includes("postgres")
    ) {
      return <Database size={16} className="text-emerald-500" />;
    }
    if (
      name.includes("web") ||
      name.includes("html") ||
      name.includes("internet") ||
      name.includes("cloud")
    ) {
      return <Globe size={16} className="text-sky-500" />;
    }
    if (
      name.includes("ai") ||
      name.includes("ml") ||
      name.includes("machine") ||
      name.includes("intell")
    ) {
      return <Cpu size={16} className="text-violet-500" />;
    }
    return <BookOpen size={16} className="text-amber-500" />;
  };

  if (isLoading) {
    return (
      <div className="space-y-6 py-6">
        <div className="flex flex-col gap-2">
          <div className="h-8 w-48 bg-muted rounded animate-pulse" />
          <div className="h-4 w-96 bg-muted rounded animate-pulse" />
        </div>
        <Separator className="border-border/60" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card
              key={i}
              className="p-6 border border-border/80 bg-card/40 animate-pulse space-y-4"
            >
              <div className="flex justify-between items-start">
                <div className="h-6 w-32 bg-muted rounded" />
                <div className="h-5 w-16 bg-muted rounded" />
              </div>
              <div className="h-4 w-40 bg-muted rounded" />
              <div className="grid grid-cols-2 gap-2 pt-2">
                <div className="h-4 w-20 bg-muted rounded" />
                <div className="h-4 w-20 bg-muted rounded" />
              </div>
              <div className="flex justify-between items-center pt-4 border-t">
                <div className="h-6 w-16 bg-muted rounded" />
                <div className="h-8 w-24 bg-muted rounded" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12 relative">
      {/* Background ambient gradients */}
      <div className="absolute top-0 right-0 -z-10 w-[300px] h-[300px] bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-border/60">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <Trophy size={28} className="text-amber-500" />
            Quiz Attempts
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
            Review your past attempts, accuracy scores, time spent, and detailed
            quiz results.
          </p>
        </div>
      </div>

      {/* Attempts List */}
      {attempts.length === 0 ? (
        <Card className="border border-dashed border-border/80 bg-card/30 p-12 text-center flex flex-col items-center justify-center space-y-4">
          <div className="p-4 bg-muted/40 text-muted-foreground rounded-full border border-border/60">
            <BookOpen size={40} />
          </div>
          <h2 className="text-xl font-bold">No quiz attempts yet</h2>
          <p className="text-sm text-muted-foreground max-w-sm">
            You haven't attempted any quizzes yet. Head over to the New Feed to
            find standard and AI-generated quizzes!
          </p>
          <Button
            onClick={() => navigate("/dashboard/newfeed")}
            className="mt-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold"
          >
            Explore Quizzes
            <ArrowRight size={14} className="ml-1" />
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {attempts.map((attempt) => {
            const quiz = attempt.quiz;
            if (!quiz) return null;

            const score = attempt.score ?? 0;
            const accuracyColor =
              score >= 85
                ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
                : score >= 70
                  ? "text-indigo-500 bg-indigo-500/10 border-indigo-500/20"
                  : score >= 50
                    ? "text-amber-500 bg-amber-500/10 border-amber-500/20"
                    : "text-rose-500 bg-rose-500/10 border-rose-500/20";

            return (
              <Card
                key={attempt._id}
                className="group border border-border/80 bg-card hover:border-border/100 transition-all duration-300 hover:shadow-lg flex flex-col justify-between"
              >
                <CardHeader className="space-y-2 pb-3">
                  <div className="flex justify-between items-start gap-2">
                    <Badge
                      variant="outline"
                      className={`font-semibold capitalize text-[10px] ${getDifficultyColor(quiz.difficulty)}`}
                    >
                      {quiz.difficulty}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1">
                      <Calendar size={11} />
                      {new Date(attempt.completedAt).toLocaleDateString(
                        undefined,
                        {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        },
                      )}
                    </span>
                  </div>

                  <CardTitle className="text-base font-bold line-clamp-1 group-hover:text-indigo-500 transition-colors">
                    {quiz.title}
                  </CardTitle>
                  <CardDescription className="text-xs flex items-center gap-1.5 font-medium">
                    {getCategoryIcon(quiz.category?.name)}
                    <span>{quiz.category?.name || "General"}</span>
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-3 pb-4">
                  <div className="grid grid-cols-2 gap-2 p-2.5 rounded-lg bg-muted/40 border border-border/40 text-[11px] text-muted-foreground">
                    <div className="flex items-center gap-1.5 font-medium">
                      <Award size={13} className="text-indigo-500" />
                      <span>
                        Correct: {attempt.correctAnswersCount} /{" "}
                        {attempt.totalQuestions}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 font-medium">
                      <Clock size={13} className="text-indigo-500" />
                      <span>Time: {formatTime(attempt.timeTaken)}</span>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="pt-3 border-t border-border/50 flex justify-between items-center gap-3 bg-muted/10">
                  <Badge
                    className={`font-bold text-xs px-2.5 py-1 ${accuracyColor}`}
                  >
                    {score}% Accuracy
                  </Badge>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleOpenDetails(attempt._id)}
                    className="h-8 text-xs cursor-pointer hover:bg-indigo-500/10 hover:text-indigo-600 dark:hover:text-indigo-400 font-semibold flex items-center gap-1 group/btn"
                  >
                    Review
                    <Eye
                      size={12}
                      className="group-hover/btn:scale-110 transition-transform"
                    />
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      {/* DETAIL VIEW MODAL OVERLAY */}
      {selectedAttemptId && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md overflow-y-auto flex items-center justify-center p-4 sm:p-6">
          <div className="w-full max-w-2xl bg-card border border-border shadow-2xl rounded-2xl overflow-hidden flex flex-col relative max-h-[90vh]">
            {isLoadingDetails ? (
              <div className="p-12 flex flex-col items-center justify-center space-y-4">
                <Loading />
                <p className="text-muted-foreground text-sm">
                  Fetching attempt feedback details...
                </p>
              </div>
            ) : (
              attemptDetails && (
                <div className="flex flex-col h-full overflow-hidden">
                  {/* Modal Header */}
                  <div className="p-4 border-b border-border/60 flex justify-between items-center bg-muted/10">
                    <div className="space-y-0.5">
                      <h3 className="text-sm font-bold text-foreground">
                        Quiz Grading Feedback
                      </h3>
                      <p className="text-[10px] text-muted-foreground font-medium uppercase truncate max-w-[400px]">
                        {attemptDetails.quiz?.title || "Quiz details"}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCloseDetails}
                      className="cursor-pointer text-xs h-7 px-2"
                    >
                      Close
                    </Button>
                  </div>

                  {/* Scrollable Content */}
                  <div className="p-6 md:p-8 space-y-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                    {/* Score gauge */}
                    <div className="text-center space-y-3">
                      <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle
                            cx="48"
                            cy="48"
                            r="42"
                            className="stroke-muted"
                            strokeWidth="6"
                            fill="transparent"
                          />
                          <circle
                            cx="48"
                            cy="48"
                            r="42"
                            className={
                              attemptDetails.score >= 85
                                ? "stroke-emerald-500"
                                : attemptDetails.score >= 70
                                  ? "stroke-indigo-500"
                                  : attemptDetails.score >= 50
                                    ? "stroke-amber-500"
                                    : "stroke-rose-500"
                            }
                            strokeWidth="6"
                            fill="transparent"
                            strokeDasharray={264}
                            strokeDashoffset={
                              264 - (264 * attemptDetails.score) / 100
                            }
                            strokeLinecap="round"
                            className="transition-all duration-1000"
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-xl font-extrabold leading-none">
                            {attemptDetails.score}%
                          </span>
                          <span className="text-[8px] text-muted-foreground font-semibold uppercase tracking-wider mt-0.5">
                            Accuracy
                          </span>
                        </div>
                      </div>

                      <div>
                        <h2 className="text-base font-black text-foreground flex items-center justify-center gap-1">
                          {attemptDetails.score >= 85 ? (
                            <>
                              Outstanding Accuracy!{" "}
                              <Smile className="text-emerald-500 w-4 h-4" />
                            </>
                          ) : attemptDetails.score >= 70 ? (
                            <>
                              Great work!{" "}
                              <Smile className="text-indigo-500 w-4 h-4" />
                            </>
                          ) : attemptDetails.score >= 50 ? (
                            <>
                              Average Performance{" "}
                              <Meh className="text-amber-500 w-4 h-4" />
                            </>
                          ) : (
                            <>
                              Keep practicing!{" "}
                              <Frown className="text-rose-500 w-4 h-4" />
                            </>
                          )}
                        </h2>
                      </div>
                    </div>

                    <Separator className="border-border/60" />

                    {/* Numerical Stats */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="p-2.5 rounded-xl border border-border/80 bg-muted/20 text-center">
                        <div className="text-[9px] font-bold text-muted-foreground uppercase">
                          Correct
                        </div>
                        <div className="text-sm font-extrabold text-foreground mt-0.5">
                          {attemptDetails.correctAnswersCount} /{" "}
                          {attemptDetails.totalQuestions}
                        </div>
                      </div>
                      <div className="p-2.5 rounded-xl border border-border/80 bg-muted/20 text-center">
                        <div className="text-[9px] font-bold text-muted-foreground uppercase">
                          Time Spent
                        </div>
                        <div className="text-sm font-extrabold text-foreground mt-0.5">
                          {formatTime(attemptDetails.timeTaken)}
                        </div>
                      </div>
                      <div className="p-2.5 rounded-xl border border-border/80 bg-muted/20 text-center">
                        <div className="text-[9px] font-bold text-muted-foreground uppercase">
                          Avg Speed
                        </div>
                        <div className="text-sm font-extrabold text-foreground mt-0.5">
                          {attemptDetails.timeTaken > 0 &&
                          attemptDetails.totalQuestions > 0
                            ? `${Math.round(attemptDetails.timeTaken / attemptDetails.totalQuestions)}s / Q`
                            : "N/A"}
                        </div>
                      </div>
                    </div>

                    {/* Detailed Questions Review */}
                    <div className="space-y-4">
                      <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wider text-muted-foreground/80">
                        <BookOpen size={14} className="text-indigo-500" />
                        Detailed Answer Review
                      </h3>

                      <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                        {attemptDetails.answers &&
                          attemptDetails.answers.map((ans, idx) => {
                            const q = ans.question;
                            const isCorrect = ans.isCorrect;
                            const userChoices = ans.selectedAnswers || [];
                            const correctChoices = q?.correctAnswer || [];

                            if (!q) return null;

                            return (
                              <div
                                key={idx}
                                className={`p-3 rounded-lg border transition-colors ${
                                  isCorrect
                                    ? "border-emerald-500/25 bg-emerald-500/5"
                                    : "border-rose-500/25 bg-rose-500/5"
                                }`}
                              >
                                {/* Question title index bar */}
                                <div className="flex justify-between items-center gap-2 pb-1.5 mb-1.5 border-b border-border/30">
                                  <span className="text-[9px] font-bold text-muted-foreground uppercase">
                                    Question {idx + 1}
                                  </span>
                                  <Badge
                                    variant="outline"
                                    className={`text-[8px] font-extrabold gap-1 px-1 py-0 ${
                                      isCorrect
                                        ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/25"
                                        : "bg-rose-500/10 text-rose-600 border-rose-500/25"
                                    }`}
                                  >
                                    {isCorrect ? (
                                      <Check size={8} />
                                    ) : (
                                      <X size={8} />
                                    )}
                                    {isCorrect ? "Correct" : "Incorrect"}
                                  </Badge>
                                </div>

                                {/* Question description */}
                                <h4 className="text-xs font-bold text-foreground leading-snug">
                                  {q.text}
                                </h4>

                                {/* Options review */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mt-2.5">
                                  {q.options.map((opt, optIdx) => {
                                    const wasSelected =
                                      userChoices.includes(optIdx);
                                    const wasCorrect =
                                      correctChoices.includes(optIdx);

                                    let styleClass =
                                      "border-border/80 bg-card text-muted-foreground";
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
                                        className={`p-2 rounded border text-[10px] flex items-center justify-between gap-2 ${styleClass}`}
                                      >
                                        <span className="truncate flex-1">
                                          {opt}
                                        </span>
                                        <div className="shrink-0 flex items-center gap-0.5">
                                          {wasCorrect && (
                                            <Check
                                              size={10}
                                              className="text-emerald-500 font-bold"
                                            />
                                          )}
                                          {wasSelected && !wasCorrect && (
                                            <X
                                              size={10}
                                              className="text-rose-500 font-bold"
                                            />
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>

                                {/* Explanation block */}
                                {q.explanation && (
                                  <div className="mt-2.5 p-2 rounded border border-border/40 bg-muted/60 text-[10px] text-muted-foreground flex gap-1.5">
                                    <Info
                                      size={12}
                                      className="shrink-0 text-indigo-500 mt-0.5"
                                    />
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

                  {/* Modal Footer */}
                  <div className="p-4 border-t border-border/60 bg-muted/10 flex justify-end">
                    <Button
                      size="sm"
                      onClick={handleCloseDetails}
                      className="cursor-pointer bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-4"
                    >
                      Close Review
                    </Button>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default QuizAttemptsPage;