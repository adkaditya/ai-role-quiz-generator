import { Button } from "../../ui/button";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";

export default function CTA() {
  return (
    <section className="container mx-auto px-6 py-24">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-3xl bg-primary text-primary-foreground p-14 text-center shadow-2xl"
      >
        {/* Background glow blobs */}
        <div className="absolute -top-10 -left-10 w-64 h-64 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -right-10 w-64 h-64 rounded-full bg-white/10 blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
            <Sparkles size={15} />
            No credit card required
          </div>

          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight max-w-2xl mx-auto leading-tight">
            Ready to learn smarter — not harder?
          </h2>

          <p className="mt-5 text-primary-foreground/80 text-lg max-w-xl mx-auto">
            Join 10,000+ learners already using Quizify to ace exams, upskill
            faster, and retain more with AI.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Button
              size="lg"
              variant="secondary"
              className="gap-2 font-semibold text-primary"
            >
              Get Started for Free <ArrowRight size={16} />
            </Button>
            <Button
              size="lg"
              variant="ghost"
              className="text-primary-foreground border border-primary-foreground/30 hover:bg-white/10"
            >
              View Demo
            </Button>
          </div>

          <p className="mt-6 text-sm text-primary-foreground/60">
            Free plan · No setup · Cancel anytime
          </p>
        </div>
      </motion.div>
    </section>
  );
}