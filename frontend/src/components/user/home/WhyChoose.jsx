import { CheckCircle, TrendingUp, Zap, Award } from "lucide-react";
import { Badge } from "../../ui/badge";
import { motion } from "framer-motion";

const points = [
  {
    title: "AI-generated quality questions",
    desc: "Every question is crafted and reviewed by AI to ensure clarity, accuracy, and relevance.",
  },
  {
    title: "Adaptive difficulty system",
    desc: "The quiz engine learns from your answers and adjusts difficulty in real time.",
  },
  {
    title: "Detailed performance reports",
    desc: "Get topic-wise breakdowns, accuracy rates, and time-spent analytics after every session.",
  },
  {
    title: "Learn faster with smart analytics",
    desc: "Identify your weak areas instantly and focus your study time where it matters most.",
  },
];

const highlights = [
  { icon: Zap, value: "3x", label: "Faster Retention" },
  { icon: TrendingUp, value: "85%", label: "Avg. Score Improvement" },
  { icon: Award, value: "#1", label: "AI Quiz Platform" },
];

export default function WhyChoose() {
  return (
    <section className="bg-muted/50 border-y py-24">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-16 items-center">

          {/* Left — content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Badge variant="outline" className="mb-4 text-primary border-primary/30 bg-primary/5">
              Why Quizify
            </Badge>
            <h2 className="text-4xl font-extrabold tracking-tight leading-tight">
              Built differently,{" "}
              <span className="text-primary">designed to work</span>
            </h2>
            <p className="mt-4 text-muted-foreground text-lg leading-relaxed">
              Unlike static quiz tools, Quizify adapts to you — combining AI, analytics,
              and smart pacing so every study session counts.
            </p>

            <div className="mt-8 space-y-5">
              {points.map((p, i) => (
                <motion.div
                  key={p.title}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex gap-4"
                >
                  <CheckCircle className="text-primary mt-0.5 shrink-0" size={20} />
                  <div>
                    <p className="font-semibold">{p.title}</p>
                    <p className="text-sm text-muted-foreground mt-0.5">{p.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right — highlight stats */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            {highlights.map(({ icon: Icon, value, label }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                className="flex items-center gap-6 rounded-2xl border bg-card p-6 shadow-sm hover:shadow-md hover:border-primary/30 transition-all"
              >
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Icon size={26} className="text-primary" />
                </div>
                <div>
                  <div className="text-4xl font-extrabold text-primary">{value}</div>
                  <div className="text-muted-foreground text-sm mt-0.5">{label}</div>
                </div>
              </motion.div>
            ))}

            <div className="rounded-2xl border bg-card p-6 shadow-sm">
              <p className="text-sm text-muted-foreground leading-relaxed italic">
                "Quizify helped me go from failing my ML course to acing it in just 3 weeks.
                The AI explanations after each question are a game changer."
              </p>
              <div className="mt-3 flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                  AR
                </div>
                <div>
                  <p className="text-sm font-semibold">Aditya R.</p>
                  <p className="text-xs text-muted-foreground">CS Student, IIT Delhi</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}