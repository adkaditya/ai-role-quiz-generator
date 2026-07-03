import React, { useEffect, useState, useRef } from "react";
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sparkles,
  Zap,
  Play,
  Share2,
  Heart,
  MessageSquare,
  Award,
  BookOpen,
  Calendar,
  Flame,
  ArrowRight,
  Book,
  Clock,
  HelpCircle,
  User,
  Check,
  X,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  ArrowLeft,
  Trophy,
  Search,
  CheckCircle2,
  AlertTriangle,
  PlayCircle,
  BarChart2,
  Info,
  BookMarked,
  SlidersHorizontal,
  ChevronDown,
  Layers,
  Activity,
  Smile,
  Frown,
  Meh,
  Code,
  Database,
  Globe,
  Cpu,
  Palette,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router";
import {
  getAllQuizzes,
  getCategories,
} from "../../services/quiz.service";
import Loading from "../../components/shared/Loading";
import { motion } from "framer-motion";

function NewFeedPage() {
  const navigate = useNavigate();

  const [quizzes, setQuizzes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchQueryDe, setSearchQueryDe] = useState("");
  const [categoryQuery, setCategoryQuery] = useState("");
  const [difficultyQuery, setDifficultyQuery] = useState("");

  // Quiz taking selection state
  const [selectedQuiz, setSelectedQuiz] = useState(null);

  // Liked Quizzes (stored in LocalStorage)
  const [likedQuizzes, setLikedQuizzes] = useState(() => {
    try {
      const saved = localStorage.getItem("liked_quizzes");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  async function loadAllQuizzes(params) {
    try {
      setIsLoading(true);
      setQuizzes([]);
      const quizData = await getAllQuizzes(params);
      setQuizzes(quizData.data.quizzes || []);
    } catch (error) {
      console.error("Error loading quizzes:", error);
      toast.error("Failed to load quizzes.");
    } finally {
      setIsLoading(false);
    }
  }

  async function loadAllCategories() {
    try {
      const cats = await getCategories();
      setCategories(cats.data || []);
    } catch (error) {
      console.error("Error loading categories:", error);
    }
  }

  // Debounce search query
  useEffect(() => {
    let timer = setTimeout(() => {
      setSearchQueryDe(searchQuery);
    }, 400);

    return () => {
      clearTimeout(timer);
    };
  }, [searchQuery]);

  // Load quizzes when filters change
  useEffect(() => {
    loadAllQuizzes({
      difficulty: difficultyQuery,
      category: categoryQuery,
      search: searchQueryDe,
    });
  }, [difficultyQuery, categoryQuery, searchQueryDe]);

  // Load categories on mount
  useEffect(() => {
    loadAllCategories();
  }, []);



  const handleLike = (quizId, e) => {
    e.stopPropagation();
    setLikedQuizzes((prev) => {
      const updated = { ...prev, [quizId]: !prev[quizId] };
      localStorage.setItem("liked_quizzes", JSON.stringify(updated));
      return updated;
    });
    const isLikedNow = !likedQuizzes[quizId];
    toast(isLikedNow ? "Added to Favorites! ❤️" : "Removed from Favorites 💔", {
      icon: isLikedNow ? "❤️" : "💔",
    });
  };

  const handleShare = (quiz, e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(
      `${window.location.origin}/dashboard/attempt-quiz/${quiz._id}`
    );
    toast.success(`Share link for "${quiz.title}" copied!`);
  };

  // Launch Attempt Quiz Page
  const openQuizLobby = (quiz) => {
    navigate(`/dashboard/attempt-quiz/${quiz._id}`);
  };

  // UI styling helper functions
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

  const getInitials = (fullName) => {
    if (!fullName) return "?";
    return fullName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  // Skeleton Loader for Quizzes
  const QuizSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Card
          key={i}
          className="border border-border/80 bg-card/40 backdrop-blur-sm flex flex-col justify-between h-[270px] p-6 animate-pulse"
        >
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="w-10 h-10 rounded-lg bg-muted" />
              <div className="w-16 h-5 rounded bg-muted" />
            </div>
            <div className="w-3/4 h-6 rounded bg-muted" />
            <div className="space-y-2">
              <div className="w-full h-4 rounded bg-muted" />
              <div className="w-5/6 h-4 rounded bg-muted" />
            </div>
          </div>
          <div className="flex justify-between items-center mt-6 pt-4 border-t border-border/50">
            <div className="w-20 h-4 rounded bg-muted" />
            <div className="w-24 h-9 rounded-md bg-muted" />
          </div>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="space-y-8 pb-12 relative">
      {/* Background ambient gradients */}
      <div className="absolute top-0 right-0 -z-10 w-[300px] h-[300px] bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 -z-10 w-[250px] h-[250px] bg-violet-500/5 blur-[100px] rounded-full pointer-events-none" />

      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-border/60">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-500 bg-clip-text text-transparent dark:from-indigo-400 dark:via-violet-400 dark:to-cyan-400">
              Quiz Arena
            </h1>
            <Badge
              variant="outline"
              className="bg-indigo-500/10 text-indigo-500 border-indigo-500/20 font-semibold px-2 py-0.5 animate-pulse text-[10px]"
            >
              Live Community Feed
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground max-w-2xl">
            Challenge yourself with curriculum-aligned quizzes generated by
            educators and AI models, complete attempts to update your leaderboard ranking.
          </p>
        </div>
      </div>

      {/* Filters Glass Panel */}
      <div className="p-4 rounded-xl border border-border/80 bg-card/30 backdrop-blur-md shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider pb-1">
          <SlidersHorizontal size={14} className="text-indigo-500" />
          Filter & Discover
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 w-4 h-4" />
            <Input
              onChange={(e) => setSearchQuery(e.target.value)}
              value={searchQuery}
              autoFocus
              placeholder="Search quizzes by title..."
              className="pl-9 bg-background/50 border-border/80 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50"
            />
          </div>

          {/* Select box category */}
          <Select onValueChange={setCategoryQuery} value={categoryQuery}>
            <SelectTrigger className="bg-background/50 border-border/80 text-foreground/90">
              <div className="flex items-center gap-2">
                <Layers size={14} className="text-indigo-500" />
                <SelectValue placeholder="All Categories" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Categories</SelectLabel>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category, index) => (
                  <SelectItem key={index} value={category._id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          {/* Select difficulty level */}
          <Select onValueChange={setDifficultyQuery} value={difficultyQuery}>
            <SelectTrigger className="bg-background/50 border-border/80 text-foreground/90">
              <div className="flex items-center gap-2">
                <Award size={14} className="text-indigo-500" />
                <SelectValue placeholder="All Difficulties" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Difficulty Level</SelectLabel>
                <SelectItem value="all">All Difficulties</SelectItem>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
                <SelectItem value="expert">Expert</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>

          {/* Clear Filters Button */}
          <Button
            variant="outline"
            className="border-border/80 hover:bg-muted font-medium flex gap-2 items-center cursor-pointer"
            onClick={() => {
              setDifficultyQuery("");
              setCategoryQuery("");
              setSearchQuery("");
              toast.success("Filters cleared");
            }}
          >
            <RefreshCw size={14} className="text-muted-foreground" />
            Reset Filters
          </Button>
        </div>

        {/* Active badges */}
        {(categoryQuery || difficultyQuery || searchQuery) && (
          <div className="flex flex-wrap gap-2 pt-2 border-t border-border/40 items-center">
            <span className="text-[10px] font-bold text-muted-foreground uppercase">Active filters:</span>
            {searchQuery && (
              <Badge variant="secondary" className="text-[10px] gap-1 py-0.5">
                Query: "{searchQuery}"
                <X size={10} className="cursor-pointer" onClick={() => setSearchQuery("")} />
              </Badge>
            )}
            {categoryQuery && categoryQuery !== "all" && (
              <Badge variant="secondary" className="text-[10px] gap-1 py-0.5">
                Category: {categories.find((c) => c._id === categoryQuery)?.name || "Selected"}
                <X size={10} className="cursor-pointer" onClick={() => setCategoryQuery("")} />
              </Badge>
            )}
            {difficultyQuery && difficultyQuery !== "all" && (
              <Badge variant="secondary" className="text-[10px] gap-1 py-0.5 text-capitalize">
                Difficulty: {difficultyQuery}
                <X size={10} className="cursor-pointer" onClick={() => setDifficultyQuery("")} />
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Quizzes List */}
      {isLoading ? (
        <QuizSkeleton />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {!isLoading && quizzes.length === 0 && (
            <div className="col-span-full py-16 flex flex-col gap-3 justify-center items-center text-center border border-dashed rounded-2xl border-border/80 bg-card/10">
              <div className="p-4 rounded-full bg-muted/60 text-muted-foreground">
                <Search size={32} />
              </div>
              <h2 className="text-lg font-bold">No Quizzes Found</h2>
              <p className="text-xs text-muted-foreground max-w-sm">
                We couldn't find any quizzes matching your filter combinations. Try searching for something else or clearing filters.
              </p>
              <Button
                variant="outline"
                className="mt-2 text-xs"
                onClick={() => {
                  setDifficultyQuery("");
                  setCategoryQuery("");
                  setSearchQuery("");
                }}
              >
                Clear Filters
              </Button>
            </div>
          )}

          {quizzes.map((quiz, index) => {
            const isLiked = !!likedQuizzes[quiz._id];
            return (
              <motion.div
                key={quiz._id || index}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.4) }}
                whileHover={{ y: -3 }}
                className="flex"
              >
                <Card className="group overflow-hidden border border-border bg-card/40 backdrop-blur-md flex flex-col justify-between w-full hover:shadow-md hover:border-indigo-500/40 transition-all duration-300">
                  {/* Decorative bar */}
                  <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500/40 via-violet-500/40 to-cyan-500/40 opacity-0 group-hover:opacity-100 transition-opacity" />

                  <CardHeader className="flex flex-col gap-3 pb-3">
                    <div className="flex justify-between items-start">
                      {/* Icon with colored category gradient */}
                      <div
                        className={`p-2.5 rounded-lg border flex items-center justify-center bg-gradient-to-br shadow-inner ${getCategoryColor(
                          quiz.category?.name
                        )}`}
                      >
                        {getCategoryIcon(quiz.category?.name)}
                      </div>

                      {/* Header quick buttons */}
                      <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="icon"
                          variant="ghost"
                          className={`w-8 h-8 rounded-full cursor-pointer hover:bg-muted ${
                            isLiked ? "text-rose-500" : "text-muted-foreground"
                          }`}
                          onClick={(e) => handleLike(quiz._id, e)}
                        >
                          <Heart size={15} fill={isLiked ? "currentColor" : "none"} />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="w-8 h-8 rounded-full cursor-pointer text-muted-foreground hover:bg-muted"
                          onClick={(e) => handleShare(quiz, e)}
                        >
                          <Share2 size={15} />
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

                  <CardContent className="space-y-3 pb-4">
                    {/* Badges row */}
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        variant="outline"
                        className="bg-indigo-500/5 text-indigo-600 dark:text-indigo-400 border-indigo-500/10 font-semibold text-[10px]"
                      >
                        {quiz.category?.name || "General"}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={`font-semibold text-[10px] capitalize ${getDifficultyColor(
                          quiz.difficulty
                        )}`}
                      >
                        {quiz.difficulty}
                      </Badge>
                    </div>

                    {/* Stats metrics row */}
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

                  <CardFooter className="pt-3 border-t border-border/50 flex justify-between items-center gap-3 bg-muted/10">
                    {/* Creator avatar sign */}
                    <div className="flex items-center gap-2 max-w-[50%]">
                      <div className="w-6 h-6 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-extrabold flex items-center justify-center text-[10px]">
                        {getInitials(quiz.createdBy?.name)}
                      </div>
                      <div className="text-[10px] text-muted-foreground truncate font-medium">
                        By {quiz.createdBy?.name || "System"}
                      </div>
                    </div>

                    <Button
                      onClick={() => openQuizLobby(quiz)}
                      className="text-xs h-8 px-4 cursor-pointer bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow shadow-indigo-500/20 rounded-md font-semibold flex items-center gap-1 group/btn"
                    >
                      Start Quiz
                      <ArrowRight
                        size={12}
                        className="group-hover/btn:translate-x-1 transition-transform"
                      />
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}


    </div>
  );
}

export default NewFeedPage;