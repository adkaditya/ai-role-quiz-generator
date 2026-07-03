import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../ui/accordion";
import { Badge } from "../../ui/badge";

const faqs = [
  {
    id: "1",
    q: "How does Quizify generate quizzes using AI?",
    a: "Quizify uses large language models to analyze your chosen topic or uploaded content. It then generates contextually accurate, difficulty-calibrated questions with multiple-choice options and detailed explanations — all in seconds.",
  },
  {
    id: "2",
    q: "Is Quizify free to use?",
    a: "Yes! Our free plan gives you access to AI quiz generation, basic analytics, and up to 10 quizzes per month. Premium plans unlock unlimited quizzes, advanced analytics, and custom branding.",
  },
  {
    id: "3",
    q: "Can I track my learning progress over time?",
    a: "Absolutely. Quizify's dashboard shows your score trends, topic-wise accuracy, time spent, and streak history so you always know where to focus next.",
  },
  {
    id: "4",
    q: "What subjects and topics does Quizify support?",
    a: "Quizify works across virtually any topic — programming, history, science, law, medicine, finance, and more. If you can describe it, AI can quiz you on it.",
  },
  {
    id: "5",
    q: "Is my data safe and private?",
    a: "Yes. All your data is encrypted in transit and at rest. We never sell or share your personal information. You can delete your account and all associated data at any time.",
  },
];

export default function FAQ() {
  return (
    <section className="container mx-auto px-6 py-24">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <Badge variant="outline" className="mb-4 text-primary border-primary/30 bg-primary/5">
          FAQ
        </Badge>
        <h2 className="text-4xl font-extrabold tracking-tight">
          Frequently Asked Questions
        </h2>
        <p className="mt-4 text-muted-foreground text-lg">
          Everything you need to know before you dive in.
        </p>
      </div>

      <div className="max-w-3xl mx-auto">
        <Accordion type="single" collapsible className="space-y-3">
          {faqs.map(({ id, q, a }) => (
            <AccordionItem
              key={id}
              value={id}
              className="border rounded-xl px-5 shadow-sm bg-card hover:border-primary/30 transition-colors"
            >
              <AccordionTrigger className="text-left font-semibold hover:no-underline py-4">
                {q}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed pb-4">
                {a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}