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
  Heart,
  Share2,
  HelpCircle,
  Clock,
  ArrowRight,
  Bookmark,
  Sparkles,
  BookOpen,
  Code,
  Palette,
  Database,
  Globe,
  Cpu,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { getAllQuizzes } from "../../services/quiz.service";

function BookmarksPage() {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Read liked quizzes from LocalStorage
  const [likedQuizzes, setLikedQuizzes] = useState(() => {
    try {
      const saved = localStorage.getItem("liked_quizzes");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Load all quizzes on mount and filter
  useEffect(() => {
    async function fetchQuizzes() {
      try {
        setIsLoading(true);
        const res = await getAllQuizzes();
        const quizList = res?.data?.quizzes || [];
        // Filter quizzes that are favorited/bookmarked in local storage
        const bookmarked = quizList.filter((quiz) => likedQuizzes[quiz._id] === true);
        setQuizzes(bookmarked);
      } catch (error) {
        console.error("Failed to load bookmarked quizzes:", error);
        toast.error("Failed to load bookmarked quizzes.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchQuizzes();
  }, [likedQuizzes]);

  // Toggle Favorite
  const handleLike = (quizId, e) => {
    e.stopPropagation();
    setLikedQuizzes((prev) => {
      const updated = { ...prev, [quizId]: !prev[quizId] };
      localStorage.setItem("liked_quizzes", JSON.stringify(updated));
      return updated;
    });
    
    // Immediately filter out the unbookmarked quiz from current display for crisp UX
    setQuizzes((prev) => prev.filter((q) => q._id !== quizId));

    toast("Removed from Bookmarks 💔", {
      icon: "💔",
    });
  };

  // Copy share link
  const handleShare = (quiz, e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(
      `${window.location.origin}/dashboard/attempt-quiz/${quiz._id}`
    );
    toast.success(`Share link for "${quiz.title}" copied!`);
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

  const getCategoryColor = (categoryName) => {
    const name = (categoryName || "").toLowerCase();
    if (
      name.includes("prog") ||
      name.includes("code") ||
      name.includes("js") ||
      name.includes("react") ||
      name.includes("node") ||
      name.includes("java")
    ) {
      return "from-blue-500/10 to-indigo-500/10 text-indigo-500 border-indigo-500/20";
    }
    if (
      name.includes("design") ||
      name.includes("css") ||
      name.includes("ui") ||
      name.includes("ux") ||
      name.includes("tailwind")
    ) {
      return "from-pink-500/10 to-rose-500/10 text-rose-500 border-rose-500/20";
    }
    if (
      name.includes("db") ||
      name.includes("sql") ||
      name.includes("data") ||
      name.includes("mongo") ||
      name.includes("postgres")
    ) {
      return "from-emerald-500/10 to-teal-500/10 text-emerald-500 border-emerald-500/20";
    }
    if (
      name.includes("web") ||
      name.includes("html") ||
      name.includes("internet") ||
      name.includes("cloud")
    ) {
      return "from-cyan-500/10 to-sky-500/10 text-sky-500 border-sky-500/20";
    }
    if (
      name.includes("ai") ||
      name.includes("ml") ||
      name.includes("machine") ||
      name.includes("intell")
    ) {
      return "from-violet-500/10 to-purple-500/10 text-violet-500 border-violet-500/20";
    }
    return "from-amber-500/10 to-orange-500/10 text-amber-500 border-amber-500/20";
  };

  const getInitials = (fullName) => {
    if (!fullName) return "?";
    return fullName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
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
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-6 border border-border/80 bg-card/40 animate-pulse space-y-4 h-[270px] flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="w-10 h-10 rounded-lg bg-muted" />
                  <div className="w-16 h-5 rounded bg-muted" />
                </div>
                <div className="w-3/4 h-6 rounded bg-muted" />
                <div className="w-full h-4 rounded bg-muted" />
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-border/50">
                <div className="w-20 h-4 rounded bg-muted" />
                <div className="w-24 h-9 rounded-md bg-muted" />
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
            <Bookmark size={28} className="text-indigo-500 fill-indigo-500" />
            Bookmarks
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
            Access and manage your favorited quizzes for quick practice.
          </p>
        </div>
      </div>

      {/* Bookmarks Grid */}
      {quizzes.length === 0 ? (
        <Card className="border border-dashed border-border/80 bg-card/30 p-12 text-center flex flex-col items-center justify-center space-y-4">
          <div className="p-4 bg-rose-500/5 text-rose-500 rounded-full border border-rose-500/10">
            <Heart size={40} />
          </div>
          <h2 className="text-xl font-bold">No bookmarked quizzes</h2>
          <p className="text-sm text-muted-foreground max-w-sm">
            Save quizzes you find interesting or want to practice later by clicking the Heart ❤️ icon on the feed!
          </p>
          <Button onClick={() => navigate("/dashboard/newfeed")} className="mt-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold">
            Find Quizzes
            <ArrowRight size={14} className="ml-1" />
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz) => (
            <Card
              key={quiz._id}
              className="group border border-border/80 bg-card hover:border-border/100 transition-all duration-300 hover:shadow-lg flex flex-col justify-between"
            >
              {/* Card Header */}
              <CardHeader className="space-y-3 pb-3">
                <div className="flex justify-between items-start">
                  {/* Share & Favorite buttons */}
                  <div className="flex items-center gap-1.5 -ml-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full cursor-pointer hover:bg-rose-500/10 hover:text-rose-500"
                      onClick={(e) => handleLike(quiz._id, e)}
                    >
                      <Heart size={15} className="fill-rose-500 text-rose-500" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full cursor-pointer hover:bg-indigo-500/10 hover:text-indigo-600 dark:hover:text-indigo-400"
                      onClick={(e) => handleShare(quiz, e)}
                    >
                      <Share2 size={15} className="text-muted-foreground" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-1">
                  <CardTitle className="text-base font-bold line-clamp-1 group-hover:text-indigo-500 transition-colors">
                    {quiz.title}
                  </CardTitle>
                  <CardDescription className="text-xs line-clamp-2 min-h-[32px] leading-relaxed">
                    {quiz.description || "No description provided."}
                  </CardDescription>
                </div>
              </CardHeader>

              {/* Card content stats */}
              <CardContent className="space-y-3 pb-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className={`bg-indigo-500/5 border-indigo-500/10 font-semibold text-[10px] ${getCategoryColor(quiz.category?.name)}`}>
                    {quiz.category?.name || "General"}
                  </Badge>
                  <Badge variant="outline" className={`font-semibold text-[10px] capitalize ${getDifficultyColor(quiz.difficulty)}`}>
                    {quiz.difficulty}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 p-2.5 rounded-lg bg-muted/40 border border-border/40 text-[11px] text-muted-foreground">
                  <div className="flex items-center gap-1.5 font-medium">
                    <HelpCircle size={13} className="text-indigo-500" />
                    <span>{quiz.questionsCount || 0} Questions</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-medium">
                    <Clock size={13} className="text-indigo-500" />
                    <span>{quiz.timer > 0 ? `${quiz.timer} Min` : "Untimed"}</span>
                  </div>
                </div>
              </CardContent>

              {/* Card Footer controls */}
              <CardFooter className="pt-3 border-t border-border/50 flex justify-between items-center gap-3 bg-muted/10">
                <div className="flex items-center gap-2 max-w-[50%]">
                  <div className="w-6 h-6 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-extrabold flex items-center justify-center text-[10px] shrink-0">
                    {getInitials(quiz.createdBy?.name)}
                  </div>
                  <div className="text-[10px] text-muted-foreground truncate font-medium">
                    By {quiz.createdBy?.name || "System"}
                  </div>
                </div>

                <Button
                  onClick={() => navigate(`/dashboard/attempt-quiz/${quiz._id}`)}
                  className="text-xs h-8 px-4 cursor-pointer bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow shadow-indigo-500/20 rounded-md font-semibold flex items-center gap-1 group/btn"
                >
                  Start Quiz
                  <ArrowRight size={12} className="group-hover/btn:translate-x-1 transition-transform" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default BookmarksPage;