"use client";

import { motion, Variants } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Michael R.",
    role: "Self-directed investor, 8 years",
    quote:
      "I used to spend 3 hours every weekend reading earnings transcripts. StoxPulse gives me the same insights in 2 minutes. The red flag detection on INTC's last call saved me from averaging down before the guidance cut.",
    rating: 5,
    highlight: "2 minutes vs 3 hours",
  },
  {
    name: "Sarah K.",
    role: "Part-time trader & full-time engineer",
    quote:
      "The insider transaction alerts are incredible. I got notified about unusual CFO selling at one of my holdings 6 hours before FinViz even picked it up. That early signal let me hedge before the drop.",
    rating: 5,
    highlight: "6 hours ahead of FinViz",
  },
  {
    name: "James T.",
    role: "Retired portfolio manager",
    quote:
      "After 30 years on the buy side, I can say the AI summaries are genuinely good. They catch the tone shifts and hedging language that matter. It's not perfect — no analyst is — but it's 90% as good at 0.1% of the cost.",
    rating: 5,
    highlight: "90% as good at 0.1% the cost",
  },
  {
    name: "David L.",
    role: "Dividend investor, 20-stock portfolio",
    quote:
      "I track 20 dividend stocks and was missing important 8-K filings constantly. StoxPulse caught a debt covenant change in one of my REIT holdings that wasn't covered by any analyst. The plain-English translation was spot on.",
    rating: 5,
    highlight: "Catches what analysts miss",
  },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12 },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 80, damping: 18 },
  },
};

export function Testimonials() {
  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-border to-transparent" />

      <div className="relative mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <p className="text-sm font-medium text-brand mb-3 tracking-wide uppercase">
            Beta Tester Feedback
          </p>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            What early users are{" "}
            <span className="text-gradient">saying</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Real feedback from investors in our private beta program.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {testimonials.map((t) => (
            <motion.div
              key={t.name}
              variants={cardVariants}
              className="relative rounded-2xl border border-border/50 bg-surface-1/40 backdrop-blur-sm p-8 transition-all duration-300 hover:border-brand/20 hover:bg-surface-1/60"
            >
              {/* Quote icon */}
              <Quote className="absolute top-6 right-6 size-8 text-brand/10" />

              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {[...Array(t.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="size-4 fill-warning text-warning"
                  />
                ))}
              </div>

              {/* Quote text */}
              <blockquote className="text-[15px] text-foreground/90 leading-relaxed mb-6">
                &ldquo;{t.quote}&rdquo;
              </blockquote>

              {/* Highlight badge */}
              <div className="inline-flex items-center rounded-full bg-brand/10 border border-brand/20 px-3 py-1 text-xs font-semibold text-brand mb-5">
                {t.highlight}
              </div>

              {/* Author */}
              <div className="flex items-center gap-3 pt-5 border-t border-border/50">
                <div
                  className="size-10 rounded-full shrink-0 flex items-center justify-center text-sm font-bold text-brand-foreground"
                  style={{
                    background: `oklch(55% 0.12 ${t.name.charCodeAt(0) * 3})`,
                  }}
                >
                  {t.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {t.name}
                  </p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
