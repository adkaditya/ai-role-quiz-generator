import { motion } from "framer-motion";
import CountUp from "react-countup";
import { TypeAnimation } from "react-type-animation";

import {
  Sparkles,
  ArrowRight,
  CheckCircle,
  Users,
  BookOpen,
  Trophy,
  Play,
  Star,
} from "lucide-react";

import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";const stats = [
  { icon: Users, value: "10K+", label: "Active Learners" },
  { icon: BookOpen, value: "50K+", label: "Quizzes Created" },
  { icon: Trophy, value: "98%", label: "Satisfaction Rate" },
];

const mockQuestion = {
  q: "Which layer of neural networks applies learned filters across input data?",
  options: ["Dense Layer", "Convolutional Layer", "Dropout Layer", "Embedding Layer"],
  correct: 1,
};

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
   <>
  <div className="absolute inset-0 -z-30 bg-background" />

  <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_top,hsl(var(--primary)/0.18),transparent_50%)]" />

  <div className="absolute inset-0 -z-20 bg-[linear-gradient(to_right,hsl(var(--border)/0.2)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.2)_1px,transparent_1px)] bg-[size:42px_42px]" />

  <motion.div
    animate={{
      x: [0, 80, 0],
      y: [0, -60, 0],
    }}
    transition={{
      repeat: Infinity,
      duration: 12,
    }}
    className="absolute top-10 left-0 h-80 w-80 rounded-full bg-violet-500/20 blur-[120px]"
  />

  <motion.div
    animate={{
      x: [0, -80, 0],
      y: [0, 60, 0],
    }}
    transition={{
      repeat: Infinity,
      duration: 15,
    }}
    className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-cyan-500/20 blur-[150px]"
  />
</>

      <div className="container mx-auto px-6 py-24">
        <div className="grid md:grid-cols-2 gap-16 items-center">

          {/* Left — text */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge variant="outline" className="mb-5 gap-1.5 px-3 py-1 text-primary border-primary/30 bg-primary/5">
              <Sparkles size={14} />
              AI-Powered Quiz Platform
            </Badge>

            <h1 className="text-5xl font-extrabold leading-tight tracking-tight">
              Learn Faster with{" "}
              <span className="text-primary">Intelligent</span>{" "}
              Quizzes
            </h1>

            <p className="mt-6 text-muted-foreground text-lg leading-relaxed max-w-md">
              Quizify uses advanced AI to generate adaptive quizzes, provide instant
              feedback, and give you a personalized path to mastery — for any topic.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Button size="lg" className="gap-2">
                Start for Free <ArrowRight size={16} />
              </Button>
              <Button size="lg" variant="outline">
                See How It Works
              </Button>
            </div>

            <div className="mt-10 flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle size={15} className="text-primary" />
              No credit card required &nbsp;·&nbsp;
              <CheckCircle size={15} className="text-primary" />
              Free plan available
            </div>

            {/* Stats */}
            <div className="mt-12 grid grid-cols-3 gap-4">
              {stats.map(({ icon: Icon, value, label }) => (
                <div key={label} className="text-center">
                  <div className="flex justify-center mb-1">
                    <Icon size={18} className="text-primary" />
                  </div>
                  <div className="text-2xl font-bold">{value}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right — AI Quiz Card mockup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="relative"
          >
            <div className="absolute -inset-4 rounded-3xl bg-primary/5 blur-2xl -z-10" />
            <div className="rounded-2xl border bg-card shadow-2xl p-6 space-y-4">

              {/* Quiz header */}
              <div className="flex items-center justify-between">
                <Badge className="bg-primary/10 text-primary hover:bg-primary/10 border-0">
                  AI Generated · Machine Learning
                </Badge>
                <span className="text-xs text-muted-foreground font-mono bg-muted px-2 py-1 rounded">
                  Q 3 / 10
                </span>
              </div>

              <p className="font-semibold text-base leading-snug">{mockQuestion.q}</p>

              {/* Options */}
              <div className="space-y-2">
                {mockQuestion.options.map((opt, i) => (
                  <div
                    key={opt}
                    className={`flex items-center gap-3 rounded-lg border px-4 py-2.5 text-sm transition-colors ${
                      i === mockQuestion.correct
                        ? "border-primary bg-primary/10 text-primary font-medium"
                        : "border-border bg-muted/40 text-muted-foreground"
                    }`}
                  >
                    <span className={`w-5 h-5 rounded-full border text-xs flex items-center justify-center font-bold ${
                      i === mockQuestion.correct ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground"
                    }`}>
                      {String.fromCharCode(65 + i)}
                    </span>
                    {opt}
                    {i === mockQuestion.correct && <CheckCircle size={14} className="ml-auto" />}
                  </div>
                ))}
              </div>

              {/* AI explanation */}
              <div className="rounded-lg bg-muted p-3 text-xs text-muted-foreground leading-relaxed border-l-2 border-primary">
                <span className="font-semibold text-primary">AI Explanation: </span>
                Convolutional layers slide filters across the input, detecting spatial patterns — key to image and sequence tasks.
              </div>

              {/* Progress bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Progress</span><span>30%</span>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div className="h-full w-[30%] rounded-full bg-primary transition-all" />
                </div>
              </div>
            </div>

            {/* Floating score badge */}
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-4 -right-4 bg-card border shadow-lg rounded-xl px-4 py-2 text-sm font-bold flex items-center gap-2"
            >
              <Trophy size={16} className="text-yellow-500" />
              Score: 280 pts
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}