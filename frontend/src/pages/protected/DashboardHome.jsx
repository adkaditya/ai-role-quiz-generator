import React, { useState, useEffect } from "react";
import { useAuthContext } from "../../context/AuthContext";
import {
  Trophy,
  Activity,
  Clock,
  Target,
  Star,
  Award,
  ChevronRight,
  TrendingUp,
  Zap,
  BookOpen,
  Sparkles,
  RefreshCw,
  AlertCircle,
  PlayCircle,
  HelpCircle,
  Eye,
  Check,
  X,
  Info,
  Smile,
  Meh,
  Frown,
  Calendar,
} from "lucide-react";
import { useNavigate } from "react-router";
import { getDashboardStats, getGlobalLeaderboard } from "../../services/dashboard.service";
import { getAttemptResult } from "../../services/quiz.service";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

function DashboardHome() {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [categoryPerformance, setCategoryPerformance] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [isDemoMode, setIsDemoMode] = useState(false);

  // Attempt details modal states
  const [selectedAttemptId, setSelectedAttemptId] = useState(null);
  const [attemptDetails, setAttemptDetails] = useState(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  // Mock data for new users to showcase how the dashboard looks when fully active
  const demoStats = {
    totalAttempts: 12,
    highestScore: 95,
    averageScore: 78,
    averageTimeTaken: 105, // in seconds
  };

  const demoRecentActivity = [
    {
      _id: "demo-1",
      quiz: { title: "JavaScript Core Concepts", category: { name: "Programming" } },
      score: 90,
      timeTaken: 85,
      completedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
    {
      _id: "demo-2",
      quiz: { title: "React Lifecycle & Hooks", category: { name: "Web Development" } },
      score: 80,
      timeTaken: 110,
      completedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    },
    {
      _id: "demo-3",
      quiz: { title: "Python Advanced OOP", category: { name: "Programming" } },
      score: 65,
      timeTaken: 140,
      completedAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    },
    {
      _id: "demo-4",
      quiz: { title: "Tailwind CSS Layouts", category: { name: "Design" } },
      score: 95,
      timeTaken: 65,
      completedAt: new Date(Date.now() - 3600000 * 72).toISOString(),
    },
  ];

  const demoCategoryPerformance = [
    { category: "Programming", attemptsCount: 6, averageScore: 82 },
    { category: "Web Development", attemptsCount: 3, averageScore: 78 },
    { category: "Design", attemptsCount: 2, averageScore: 92 },
    { category: "Database", attemptsCount: 1, averageScore: 60 },
  ];

  const demoLeaderboard = [
    { rank: 1, name: "Aarav Sharma", totalScore: 480, quizzesSolved: 5 },
    { rank: 2, name: "Priya Patel", totalScore: 455, quizzesSolved: 5 },
    { rank: 3, name: "John Doe", totalScore: 410, quizzesSolved: 4 },
    { rank: 4, name: "Sneha Reddy", totalScore: 395, quizzesSolved: 4 },
    { rank: 5, name: "Vikram Malhotra", totalScore: 380, quizzesSolved: 4 },
  ];

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch dashboard analytics
      const statsRes = await getDashboardStats();
      if (statsRes.status === "success") {
        setStats(statsRes.data.stats);
        setRecentActivity(statsRes.data.recentActivity || []);
        setCategoryPerformance(statsRes.data.categoryPerformance || []);
      }

      // Fetch global leaderboard
      const leaderboardRes = await getGlobalLeaderboard();
      if (leaderboardRes.status === "success") {
        setLeaderboard(leaderboardRes.data.leaderboard || []);
      }
      setLoading(false);
    } catch (err) {
      console.error("Dashboard data fetch error:", err);
      setError("Failed to fetch dashboard data. Please try again later.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const activeStats = isDemoMode || !stats || stats.totalAttempts === 0 ? demoStats : stats;
  const activeRecent = isDemoMode || recentActivity.length === 0 ? demoRecentActivity : recentActivity;
  const activeCategories = isDemoMode || categoryPerformance.length === 0 ? demoCategoryPerformance : categoryPerformance;
  const activeLeaderboard = isDemoMode || leaderboard.length === 0 ? demoLeaderboard : leaderboard.slice(0, 5);

  // Load specific attempt details in overlay modal
  const handleOpenDetails = async (attemptId) => {
    if (isDemoMode || attemptId.startsWith("demo-")) {
      toast.error("Review details are not available for demo activities.");
      return;
    }
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

  // Helper values
  const getScoreBadgeColor = (score) => {
    if (score >= 85) return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
    if (score >= 70) return "bg-sky-500/10 text-sky-500 border-sky-500/20";
    if (score >= 50) return "bg-amber-500/10 text-amber-500 border-amber-500/20";
    return "bg-rose-500/10 text-rose-500 border-rose-500/20";
  };

  const getScoreFeedback = (score) => {
    if (score >= 85) return "Outstanding";
    if (score >= 70) return "Good Progress";
    if (score >= 50) return "Average";
    return "Needs Review";
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  // Format seconds to text: 105s -> "1m 45s"
  const formatTime = (seconds) => {
    if (!seconds) return "0s";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs}s`;
    return `${mins}m ${secs}s`;
  };

  // Determine top category
  const topCategory = activeCategories.length > 0
    ? activeCategories.reduce((max, c) => c.averageScore > max.averageScore ? c : max, activeCategories[0])
    : null;

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        {/* Welcome Banner Skeleton */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-2">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64 rounded-md" />
            <Skeleton className="h-4 w-96 rounded-md" />
          </div>
          <Skeleton className="h-10 w-36 rounded-md" />
        </div>

        {/* Stats Grid Skeleton */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>

        {/* Charts & Timeline Skeleton */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
          <Skeleton className="h-[380px] rounded-xl lg:col-span-4" />
          <Skeleton className="h-[380px] rounded-xl lg:col-span-3" />
        </div>
      </div>
    );
  }

  const hasNoData = !stats || stats.totalAttempts === 0;

  return (
    <div className="space-y-6">
      {/* Background ambient gradients */}
      <div className="absolute top-0 right-0 -z-10 w-[300px] h-[300px] bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Header and Welcome */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
              {getGreeting()}, <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-500 bg-clip-text text-transparent dark:from-indigo-400 dark:via-violet-400 dark:to-indigo-300">{user?.name || "Achiever"}</span>!
            </h1>
            <Sparkles className="h-5 w-5 text-indigo-500 animate-pulse" />
          </div>
          <p className="text-muted-foreground mt-1 text-xs md:text-sm">
            Review your progress, see leaderboard rankings, and explore your achievements.
          </p>
        </div>

        <div className="flex items-center gap-2 self-stretch md:self-auto shrink-0">
          {hasNoData && (
            <Button
              variant={isDemoMode ? "default" : "outline"}
              onClick={() => setIsDemoMode(!isDemoMode)}
              className="text-xs flex gap-1.5 items-center cursor-pointer border-indigo-200 dark:border-indigo-900 bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100/50 transition-all duration-300 h-9"
            >
              <Zap size={13} className={isDemoMode ? "fill-indigo-500 text-indigo-500" : ""} />
              {isDemoMode ? "Hide Demo Data" : "Preview Demo Data"}
            </Button>
          )}

          <Button
            onClick={() => navigate("/dashboard/newfeed")}
            className="w-full md:w-auto bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold shadow-md shadow-indigo-500/20 rounded-lg cursor-pointer flex gap-1.5 items-center h-9 text-xs md:text-sm"
          >
            <PlayCircle size={16} />
            Explore Quizzes
          </Button>
        </div>
      </div>

      {/* Warning/Info banner if empty and not in demo mode */}
      {hasNoData && !isDemoMode && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 flex items-start gap-3"
        >
          <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-amber-700 dark:text-amber-400 text-sm">No attempts logged yet</h4>
            <p className="text-xs text-amber-600/90 dark:text-amber-400/80 mt-1 leading-relaxed">
              Your analytics dashboard will unlock once you complete your first quiz. Click "Explore Quizzes" to take a quiz, or click the{" "}
              <strong>"Preview Demo Data"</strong> button above to inspect widgets with sample analytics.
            </p>
          </div>
        </motion.div>
      )}

      {/* Stats Cards Grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Attempts Card */}
        <Card className="overflow-hidden border border-border/80 bg-card hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Total Quizzes</CardDescription>
            <BookOpen className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">{activeStats.totalAttempts}</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <TrendingUp className="text-emerald-500 h-3 w-3" />
              <span>Completed attempts</span>
            </p>
          </CardContent>
        </Card>

        {/* Average Score Card */}
        <Card className="overflow-hidden border border-border/80 bg-card hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Average Accuracy</CardDescription>
            <Target className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent className="flex justify-between items-center">
            <div>
              <div className="text-3xl font-black">{activeStats.averageScore}%</div>
              <p className="text-xs text-muted-foreground mt-1">Overall correctness</p>
            </div>
            {/* Custom Circular Progress */}
            <div className="relative w-12 h-12">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="24"
                  cy="24"
                  r="20"
                  className="stroke-muted/40"
                  strokeWidth="4.5"
                  fill="transparent"
                />
                <circle
                  cx="24"
                  cy="24"
                  r="20"
                  className="stroke-emerald-500"
                  strokeWidth="4.5"
                  fill="transparent"
                  strokeDasharray={125.6}
                  strokeDashoffset={125.6 - (125.6 * activeStats.averageScore) / 100}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-[10px] font-extrabold text-foreground">
                {activeStats.averageScore}%
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Highest Score Card */}
        <Card className="overflow-hidden border border-border/80 bg-card hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Highest Score</CardDescription>
            <Trophy className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">{activeStats.highestScore}%</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/10">
                Personal best
              </span>
            </p>
          </CardContent>
        </Card>

        {/* Average Time taken */}
        <Card className="overflow-hidden border border-border/80 bg-card hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Average Speed</CardDescription>
            <Clock className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">
              {formatTime(activeStats.averageTimeTaken)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Per active quiz attempt</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid Section */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        
        {/* Category Performance Card */}
        <Card className="lg:col-span-4 border border-border/80 bg-card">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2 text-foreground">
              <Activity className="h-5 w-5 text-indigo-500" />
              Category Accuracy
            </CardTitle>
            <CardDescription className="text-xs">Your average scoring rates across quiz topics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeCategories.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-border/80 rounded-xl space-y-2">
                <HelpCircle className="h-8 w-8 text-muted-foreground" />
                <h4 className="text-xs font-bold">No topic analytics</h4>
                <p className="text-[11px] text-muted-foreground max-w-[200px]">Complete more quizzes to see category performance breakdown.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-3">
                  {activeCategories.map((cat, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-foreground/90 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                          {cat.category}
                        </span>
                        <span className="text-muted-foreground font-medium text-[10px]">
                          {cat.attemptsCount} {cat.attemptsCount === 1 ? "attempt" : "attempts"} • <span className="font-bold text-foreground">{cat.averageScore}% avg</span>
                        </span>
                      </div>
                      {/* Accurate glowing visual progress */}
                      <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                          style={{ width: `${cat.averageScore}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {topCategory && (
                  <div className="border border-border/60 rounded-xl p-3.5 bg-muted/20 flex items-center justify-between gap-3 mt-4">
                    <div className="space-y-1">
                      <span className="text-[9px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block">Peak Subject Proficiency</span>
                      <p className="text-xs text-muted-foreground">
                        Your highest accuracy is in <strong className="text-foreground">{topCategory.category}</strong> with <strong className="text-foreground">{topCategory.averageScore}%</strong> average correctness.
                      </p>
                    </div>
                    <Award className="h-8 w-8 text-amber-500 fill-amber-500/10 shrink-0" />
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Leaderboard Rankings */}
        <Card className="lg:col-span-3 border border-border/80 bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div className="space-y-0.5">
              <CardTitle className="text-base font-bold flex items-center gap-2 text-foreground">
                <Trophy className="h-5 w-5 text-amber-500" />
                Leaderboard Rankings
              </CardTitle>
              <CardDescription className="text-xs">Top quiz solving scorers</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {activeLeaderboard.map((player, idx) => {
              const isCurrentUser = player.name === user?.name || (player.userId === user?._id);
              return (
                <div
                  key={idx}
                  className={`flex items-center justify-between p-2.5 rounded-xl border transition-all duration-200 ${
                    isCurrentUser
                      ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-600 dark:text-indigo-400 font-semibold"
                      : "bg-muted/40 border-transparent hover:bg-muted/70"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-extrabold ${
                      player.rank === 1 ? "bg-amber-500 text-white" :
                      player.rank === 2 ? "bg-slate-300 text-slate-800" :
                      player.rank === 3 ? "bg-amber-700 text-white" :
                      "bg-muted text-muted-foreground"
                    }`}>
                      {player.rank}
                    </span>
                    
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-bold text-foreground truncate max-w-[130px]">
                        {player.name} {isCurrentUser && <span className="text-[9px] px-1 py-0.2 rounded bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-normal">You</span>}
                      </span>
                      <span className="text-[9px] text-muted-foreground">
                        {player.quizzesSolved} {player.quizzesSolved === 1 ? "quiz" : "quizzes"} solved
                      </span>
                    </div>
                  </div>
                  
                  <span className="text-xs font-bold font-mono text-foreground shrink-0">
                    {player.totalScore} pts
                  </span>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Timeline & Achievement Badges */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        
        {/* Recent Activity List */}
        <Card className="lg:col-span-4 border border-border/80 bg-card">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2 text-foreground">
              <RefreshCw className="h-5 w-5 text-indigo-500 animate-spin-hover" />
              Recent Activities
            </CardTitle>
            <CardDescription className="text-xs">Your last completed attempts. Click to review detailed answers.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {activeRecent.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center space-y-2">
                <HelpCircle className="h-8 w-8 text-muted-foreground" />
                <h4 className="text-xs font-bold">No activity history</h4>
                <p className="text-[11px] text-muted-foreground">Your recent quiz scores will appear here.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {activeRecent.map((attempt) => (
                  <div
                    key={attempt._id}
                    onClick={() => handleOpenDetails(attempt._id)}
                    className="p-3 rounded-xl border border-border/60 bg-card hover:bg-muted/40 hover:border-border/100 flex flex-row justify-between items-center gap-3 transition-all duration-150 cursor-pointer group"
                  >
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-foreground line-clamp-1 group-hover:text-indigo-600 transition-colors">
                        {attempt.quiz?.title}
                      </h4>
                      <div className="flex items-center gap-1.5 mt-1 text-[10px] text-muted-foreground font-semibold">
                        <Badge variant="outline" className="text-[8px] px-1.5 py-0 bg-muted/60 font-semibold border-border/50 uppercase">
                          {attempt.quiz?.category?.name || "General"}
                        </Badge>
                        <span>•</span>
                        <span>{new Date(attempt.completedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <span className="text-xs font-bold font-mono text-foreground block">{attempt.score}%</span>
                        <span className="text-[9px] text-muted-foreground font-medium block">
                          in {formatTime(attempt.timeTaken)}
                        </span>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 rounded-full text-muted-foreground hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-500/10 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenDetails(attempt._id);
                        }}
                      >
                        <Eye size={13} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Streaks & Accomplishments Widget */}
        <Card className="lg:col-span-3 border border-border/80 bg-card">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2 text-foreground">
              <Star className="h-5 w-5 text-indigo-500" />
              Achievements
            </CardTitle>
            <CardDescription className="text-xs">Milestones unlocked during your journey</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2.5">
              {/* Achievement 1 */}
              <div className={`p-3 rounded-xl border flex gap-3 items-center transition-all ${
                activeStats.totalAttempts >= 1 
                  ? "bg-indigo-500/5 border-indigo-500/20 text-foreground" 
                  : "opacity-40 bg-muted/20 border-transparent text-muted-foreground"
              }`}>
                <div className={`p-2 rounded-full shrink-0 ${
                  activeStats.totalAttempts >= 1 ? "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400" : "bg-muted"
                }`}>
                  <Zap size={16} />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold">First Steps</h4>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Complete at least one quiz attempt.</p>
                </div>
              </div>

              {/* Achievement 2 */}
              <div className={`p-3 rounded-xl border flex gap-3 items-center transition-all ${
                activeStats.highestScore >= 90 
                  ? "bg-amber-500/5 border-amber-500/20 text-foreground" 
                  : "opacity-40 bg-muted/20 border-transparent text-muted-foreground"
              }`}>
                <div className={`p-2 rounded-full shrink-0 ${
                  activeStats.highestScore >= 90 ? "bg-amber-500/15 text-amber-600 dark:text-amber-400" : "bg-muted"
                }`}>
                  <Trophy size={16} />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold">Genius Mind</h4>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Score 90% or above in any quiz attempt.</p>
                </div>
              </div>

              {/* Achievement 3 */}
              <div className={`p-3 rounded-xl border flex gap-3 items-center transition-all ${
                activeStats.totalAttempts >= 10 
                  ? "bg-emerald-500/5 border-emerald-500/20 text-foreground" 
                  : "opacity-40 bg-muted/20 border-transparent text-muted-foreground"
              }`}>
                <div className={`p-2 rounded-full shrink-0 ${
                  activeStats.totalAttempts >= 10 ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" : "bg-muted"
                }`}>
                  <Award size={16} />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold">Quiz Master</h4>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Complete 10 or more quiz attempts.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ATTEMPT DETAILS MODAL REVIEW OVERLAY */}
      {selectedAttemptId && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md overflow-y-auto flex items-center justify-center p-4 sm:p-6">
          <div className="w-full max-w-2xl bg-card border border-border shadow-2xl rounded-2xl overflow-hidden flex flex-col relative max-h-[90vh]">
            
            {isLoadingDetails ? (
              <div className="p-12 flex flex-col items-center justify-center space-y-4">
                <Loading />
                <p className="text-muted-foreground text-sm">Loading activity details...</p>
              </div>
            ) : (
              attemptDetails && (
                <div className="flex flex-col h-full overflow-hidden">
                  {/* Modal Header */}
                  <div className="p-4 border-b border-border/60 flex justify-between items-center bg-muted/10">
                    <div className="space-y-0.5">
                      <h3 className="text-sm font-bold text-foreground">
                        Quiz Activity Review
                      </h3>
                      <p className="text-[10px] text-muted-foreground font-medium uppercase truncate max-w-[400px]">
                        {attemptDetails.quiz?.title || "Quiz Details"}
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
                    {/* Accuracy circle progress */}
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
                            strokeDashoffset={264 - (264 * attemptDetails.score) / 100}
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
                            <>Outstanding performance! <Smile className="text-emerald-500 w-4 h-4" /></>
                          ) : attemptDetails.score >= 70 ? (
                            <>Great work! <Smile className="text-indigo-500 w-4 h-4" /></>
                          ) : attemptDetails.score >= 50 ? (
                            <>Average Performance <Meh className="text-amber-500 w-4 h-4" /></>
                          ) : (
                            <>Keep practicing! <Frown className="text-rose-500 w-4 h-4" /></>
                          )}
                        </h2>
                      </div>
                    </div>

                    <Separator className="border-border/60" />

                    {/* Stats metrics */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="p-2.5 rounded-xl border border-border/80 bg-muted/20 text-center">
                        <div className="text-[9px] font-bold text-muted-foreground uppercase">Correct</div>
                        <div className="text-sm font-extrabold text-foreground mt-0.5">
                          {attemptDetails.correctAnswersCount} / {attemptDetails.totalQuestions}
                        </div>
                      </div>
                      <div className="p-2.5 rounded-xl border border-border/80 bg-muted/20 text-center">
                        <div className="text-[9px] font-bold text-muted-foreground uppercase">Time Spent</div>
                        <div className="text-sm font-extrabold text-foreground mt-0.5">
                          {formatTime(attemptDetails.timeTaken)}
                        </div>
                      </div>
                      <div className="p-2.5 rounded-xl border border-border/80 bg-muted/20 text-center">
                        <div className="text-[9px] font-bold text-muted-foreground uppercase">Avg Speed</div>
                        <div className="text-sm font-extrabold text-foreground mt-0.5">
                          {attemptDetails.timeTaken > 0 && attemptDetails.totalQuestions > 0
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
                        {attemptDetails.answers && attemptDetails.answers.map((ans, idx) => {
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
                                  {isCorrect ? <Check size={8} /> : <X size={8} />}
                                  {isCorrect ? "Correct" : "Incorrect"}
                                </Badge>
                              </div>

                              <h4 className="text-xs font-bold text-foreground leading-snug">
                                {q.text}
                              </h4>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mt-2.5">
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
                                      className={`p-2 rounded border text-[10px] flex items-center justify-between gap-2 ${styleClass}`}
                                    >
                                      <span className="truncate flex-1">{opt}</span>
                                      <div className="shrink-0 flex items-center gap-0.5">
                                        {wasCorrect && (
                                          <Check size={10} className="text-emerald-500 font-bold" />
                                        )}
                                        {wasSelected && !wasCorrect && (
                                          <X size={10} className="text-rose-500 font-bold" />
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>

                              {q.explanation && (
                                <div className="mt-2.5 p-2 rounded border border-border/40 bg-muted/60 text-[10px] text-muted-foreground flex gap-1.5">
                                  <Info size={12} className="shrink-0 text-indigo-500 mt-0.5" />
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

export default DashboardHome;