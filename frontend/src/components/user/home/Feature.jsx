import React from "react";
import {
  Brain,
  Clock,
  Target,
  ChartNoAxesCombined,
  Bot,
  ShieldCheck,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

const features = [
  {
    title: "AI Quiz Generator",
    icon: Brain,
    desc: "Paste any topic or document and get a full quiz in seconds — powered by state-of-the-art AI.",
    color: "bg-violet-500/10 text-violet-500",
  },
  {
    title: "Adaptive Difficulty",
    icon: Target,
    desc: "Questions automatically adjust to your skill level so you're always challenged, never overwhelmed.",
    color: "bg-blue-500/10 text-blue-500",
  },
  {
    title: "Instant AI Feedback",
    icon: Bot,
    desc: "Get clear, concise explanations after every answer so you understand — not just memorize.",
    color: "bg-emerald-500/10 text-emerald-500",
  },
  {
    title: "Progress Analytics",
    icon: ChartNoAxesCombined,
    desc: "Visual dashboards show your weak spots, streaks, and improvement trends over time.",
    color: "bg-orange-500/10 text-orange-500",
  },
  {
    title: "Timed Exam Mode",
    icon: Clock,
    desc: "Simulate real exam pressure with configurable timers and countdown alerts.",
    color: "bg-rose-500/10 text-rose-500",
  },
  {
    title: "Secure & Private",
    icon: ShieldCheck,
    desc: "Your learning data is encrypted and never shared. You own your progress.",
    color: "bg-teal-500/10 text-teal-500",
  },
];

export default function Features() {
  return (
    <section className="container mx-auto px-6 py-24">
      <div className="text-center max-w-2xl mx-auto mb-14">
        <Badge variant="outline" className="mb-4 text-primary border-primary/30 bg-primary/5">
          Everything You Need
        </Badge>
        <h2 className="text-4xl font-extrabold tracking-tight">
          Powerful Features for Smarter Learning
        </h2>
        <p className="mt-4 text-muted-foreground text-lg">
          From AI quiz creation to deep analytics — every tool you need to learn
          faster and retain more.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {features.map((item, index) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.08 }}
          >
            <Card className="h-full group hover:shadow-lg hover:border-primary/30 transition-all duration-300">
              <CardContent className="p-6 flex flex-col gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${item.color}`}>
                  <item.icon size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-muted-foreground text-sm leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
