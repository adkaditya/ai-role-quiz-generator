import React, { useEffect, useState } from "react";
import { useAuthContext } from "../../context/AuthContext";
import {
  Trophy,
  Award,
  Clock,
  BookOpen,
  User,
  Star,
  Sparkles,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import { getGlobalLeaderboard } from "../../services/dashboard.service";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "react-hot-toast";

function LeaderboardPage() {
  const { user } = useAuthContext();
  const [leaderboard, setLeaderboard] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadLeaderboard() {
      try {
        setIsLoading(true);
        const res = await getGlobalLeaderboard();
        if (res?.status === "success" && res?.data?.leaderboard) {
          setLeaderboard(res.data.leaderboard);
        }
      } catch (error) {
        console.error("Failed to load global leaderboard:", error);
        toast.error("Failed to load leaderboard rankings.");
      } finally {
        setIsLoading(false);
      }
    }
    loadLeaderboard();
  }, []);

  // Format seconds to mins/secs
  const formatTime = (seconds) => {
    if (!seconds) return "0s";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs}s`;
    return `${mins}m ${secs}s`;
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

  // Separate top 3 players for the podium
  const topThree = leaderboard.slice(0, 3);
  const remainingPlayers = leaderboard.slice(3);

  // Pad the podium if there are fewer than 3 players
  const firstPlace = topThree.find((p) => p.rank === 1) || null;
  const secondPlace = topThree.find((p) => p.rank === 2) || null;
  const thirdPlace = topThree.find((p) => p.rank === 3) || null;

  if (isLoading) {
    return (
      <div className="space-y-8 py-6 animate-pulse">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-8 w-48 rounded" />
          <Skeleton className="h-4 w-96 rounded" />
        </div>
        <Separator className="border-border/60" />
        {/* Podium Skeleton */}
        <div className="grid grid-cols-3 gap-4 max-w-xl mx-auto h-48 items-end pt-8">
          <Skeleton className="h-32 rounded-t-xl" />
          <Skeleton className="h-44 rounded-t-xl" />
          <Skeleton className="h-24 rounded-t-xl" />
        </div>
        {/* List Skeleton */}
        <div className="space-y-3 max-w-3xl mx-auto pt-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-14 rounded-xl" />
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
            Leaderboard Arena
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
            See how you stack up against the top quiz-solvers globally. Gain
            points by completing quizzes and scoring high!
          </p>
        </div>
      </div>

      {/* Empty State */}
      {leaderboard.length === 0 ? (
        <Card className="border border-dashed border-border/80 bg-card/30 p-12 text-center flex flex-col items-center justify-center space-y-4">
          <div className="p-4 bg-muted/40 text-muted-foreground rounded-full border border-border/60">
            <Trophy size={40} className="text-muted-foreground" />
          </div>
          <h2 className="text-xl font-bold">No rankings recorded</h2>
          <p className="text-sm text-muted-foreground max-w-sm">
            Be the first to complete a quiz and claim the top rank on the global
            leaderboard!
          </p>
        </Card>
      ) : (
        <div className="space-y-10">
          {/* TOP 3 PODIUM DISPLAY */}
          <div className="max-w-2xl mx-auto pt-8 px-4">
            <div className="grid grid-cols-3 gap-2 sm:gap-6 items-end justify-center text-center">
              {/* SECOND PLACE (LEFT) */}
              <div className="flex flex-col items-center">
                {secondPlace ? (
                  <div className="space-y-2 mb-2">
                    <div className="relative inline-block">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-tr from-slate-400 to-slate-200 border-2 border-slate-300 flex items-center justify-center text-slate-800 text-sm sm:text-base font-extrabold shadow-md">
                        {getInitials(secondPlace.name)}
                      </div>
                      <span className="absolute -bottom-1 -right-1 flex items-center justify-center w-5 h-5 rounded-full bg-slate-300 border border-slate-200 text-[10px] font-extrabold text-slate-800">
                        2
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-foreground truncate max-w-[90px] sm:max-w-[130px] mx-auto">
                        {secondPlace.name}
                      </p>
                      <p className="text-[10px] font-extrabold text-indigo-600 dark:text-indigo-400">
                        {secondPlace.totalScore} pts
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="h-10" />
                )}
                {/* Podium pillar */}
                <div className="w-full bg-slate-100 dark:bg-muted/30 border-t-2 border-slate-300 h-24 sm:h-28 rounded-t-xl flex items-center justify-center shadow-inner">
                  <span className="text-xl sm:text-2xl font-black text-slate-400">
                    2nd
                  </span>
                </div>
              </div>

              {/* FIRST PLACE (CENTER) */}
              <div className="flex flex-col items-center">
                {firstPlace ? (
                  <div className="space-y-2 mb-3 z-10">
                    <div className="relative inline-block">
                      <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-amber-500 animate-bounce">
                        <Trophy size={24} className="fill-amber-500/20" />
                      </div>
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 border-4 border-amber-400 flex items-center justify-center text-amber-950 text-base sm:text-lg font-black shadow-lg">
                        {getInitials(firstPlace.name)}
                      </div>
                      <span className="absolute -bottom-1 -right-1 flex items-center justify-center w-6 h-6 rounded-full bg-amber-500 border border-amber-300 text-xs font-black text-white">
                        1
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-black text-foreground truncate max-w-[100px] sm:max-w-[140px] mx-auto">
                        {firstPlace.name}
                      </p>
                      <p className="text-[10px] sm:text-xs font-black text-indigo-600 dark:text-indigo-400">
                        {firstPlace.totalScore} pts
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="h-10" />
                )}
                {/* Podium pillar */}
                <div className="w-full bg-amber-500/5 dark:bg-amber-500/10 border-t-4 border-amber-400 h-32 sm:h-36 rounded-t-2xl flex items-center justify-center shadow-md relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 to-transparent pointer-events-none" />
                  <span className="text-2xl sm:text-3xl font-black text-amber-500">
                    1st
                  </span>
                </div>
              </div>

              {/* THIRD PLACE (RIGHT) */}
              <div className="flex flex-col items-center">
                {thirdPlace ? (
                  <div className="space-y-2 mb-2">
                    <div className="relative inline-block">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-tr from-amber-700 to-amber-500 border-2 border-amber-600 flex items-center justify-center text-amber-100 text-xs sm:text-sm font-bold shadow-md">
                        {getInitials(thirdPlace.name)}
                      </div>
                      <span className="absolute -bottom-1 -right-1 flex items-center justify-center w-5 h-5 rounded-full bg-amber-600 border border-amber-500 text-[10px] font-extrabold text-white">
                        3
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-foreground truncate max-w-[90px] sm:max-w-[130px] mx-auto">
                        {thirdPlace.name}
                      </p>
                      <p className="text-[10px] font-extrabold text-indigo-600 dark:text-indigo-400">
                        {thirdPlace.totalScore} pts
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="h-10" />
                )}
                {/* Podium pillar */}
                <div className="w-full bg-orange-100/60 dark:bg-muted/20 border-t-2 border-amber-600 h-18 sm:h-22 rounded-t-xl flex items-center justify-center shadow-inner">
                  <span className="text-lg sm:text-xl font-black text-amber-700">
                    3rd
                  </span>
                </div>
              </div>
            </div>
          </div>

          <Separator className="border-border/60 max-w-3xl mx-auto" />

          {/* LEADERBOARD LIST DISPLAY (Ranks 4+) */}
          <div className="max-w-3xl mx-auto space-y-3">
            <h3 className="text-xs font-extrabold tracking-wider text-muted-foreground uppercase px-2">
              Leaderboard Standings
            </h3>

            <div className="space-y-2">
              {leaderboard.map((player) => {
                const isCurrentUser =
                  player.userId === user?._id || player.name === user?.name;
                const score = player.totalScore;

                return (
                  <div
                    key={player.rank}
                    className={`flex items-center justify-between p-3.5 rounded-xl border transition-all duration-200 ${
                      isCurrentUser
                        ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-600 dark:text-indigo-400 font-semibold shadow-sm"
                        : "bg-card border-border/80 hover:bg-muted/30"
                    }`}
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      {/* Rank number indicator */}
                      <span
                        className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-extrabold shrink-0 ${
                          player.rank === 1
                            ? "bg-amber-500 text-white"
                            : player.rank === 2
                              ? "bg-slate-300 text-slate-800"
                              : player.rank === 3
                                ? "bg-amber-700 text-white"
                                : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {player.rank}
                      </span>

                      {/* Avatar initials badge */}
                      <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-extrabold flex items-center justify-center text-xs shrink-0">
                        {getInitials(player.name)}
                      </div>

                      {/* Player Info block */}
                      <div className="min-w-0">
                        <span className="text-xs sm:text-sm font-bold text-foreground truncate block">
                          {player.name}{" "}
                          {isCurrentUser && (
                            <span className="text-[9px] px-1 py-0.2 rounded bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-normal ml-1">
                              You
                            </span>
                          )}
                        </span>

                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] text-muted-foreground">
                          <span className="flex items-center gap-0.5">
                            <BookOpen size={10} />
                            {player.quizzesSolved}{" "}
                            {player.quizzesSolved === 1 ? "quiz" : "quizzes"}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-0.5">
                            <Clock size={10} />
                            {formatTime(player.totalTime)} spent
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Stats metrics */}
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs sm:text-sm font-black font-mono text-foreground">
                        {score} pts
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LeaderboardPage;