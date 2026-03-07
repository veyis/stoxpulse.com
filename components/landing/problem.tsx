"use client";

import { motion, Variants } from "framer-motion";

const painPoints = [
  {
    stat: "78 pages",
    context: "in an average 10-K filing",
    question: "Did you read your stocks' last annual report?",
  },
  {
    stat: "67 minutes",
    context: "per earnings call transcript",
    question: "Did you listen to what management actually said?",
  },
  {
    stat: "47 articles",
    context: "per day for a 15-stock watchlist",
    question: "Do you know which ones actually matter?",
  },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 80, damping: 18 },
  },
};

export function Problem() {
  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-border to-transparent" />

      {/* Subtle red-tinted glow for urgency */}
      <div className="pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-negative/3 rounded-full blur-[120px]" />

      <div className="relative mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16 md:mb-20"
        >
          <p className="text-sm font-medium text-negative/80 mb-3 tracking-wide uppercase">
            The Problem
          </p>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            You&apos;re investing with{" "}
            <span className="text-negative">incomplete information</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Right now, a hedge fund analyst earning $350K/year is reading your
            stocks&apos; SEC filings word by word. You&apos;re reading the
            headline on CNBC.
          </p>
        </motion.div>

        {/* Pain point cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto"
        >
          {painPoints.map((point) => (
            <motion.div
              key={point.stat}
              variants={itemVariants}
              whileHover={{ y: -8, scale: 1.02 }}
              className="relative rounded-3xl border border-border/50 bg-surface-1/40 backdrop-blur-md p-10 text-center group hover:border-negative/40 hover:bg-surface-1/60 transition-all duration-500 shadow-sm hover:shadow-xl hover:shadow-negative/5"
            >
              <div className="text-4xl font-extrabold font-display text-foreground mb-2 md:text-5xl group-hover:text-negative transition-colors duration-500">
                {point.stat}
              </div>
              <p className="text-sm font-semibold tracking-wider uppercase text-muted-foreground/80 mb-6">
                {point.context}
              </p>
              <p className="text-base font-medium text-foreground/90 leading-relaxed">
                {point.question}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* The kicker */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mt-16 text-center max-w-2xl mx-auto"
        >
          <p className="text-lg md:text-xl font-medium text-muted-foreground leading-relaxed">
            Hedge fund analysts read every word. They listen to every call. They
            catch the tone shift, the buried risk factor, the guidance that
            quietly dropped.
          </p>
          <p className="mt-6 text-xl md:text-2xl font-bold text-foreground">
            The information is public.{" "}
            <span className="text-gradient">
              The analysis shouldn&apos;t cost $500K.
            </span>
          </p>
        </motion.div>

        {/* What StoxPulse is NOT — differentiator */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto"
        >
          {[
            {
              not: "Not a stock screener",
              is: "An AI analyst that reads what you can\u2019t",
            },
            {
              not: "Not a trading bot",
              is: "A research tool that makes you smarter",
            },
            {
              not: 'Not "ChatGPT for stocks"',
              is: "A 24/7 monitoring system built for finance",
            },
          ].map((item) => (
            <motion.div
              key={item.not}
              whileHover={{ scale: 1.03 }}
              className="rounded-2xl border border-border/50 bg-surface-1/30 backdrop-blur-sm px-6 py-5 text-center transition-all duration-300 hover:border-brand/30 hover:bg-surface-1/50"
            >
              <p className="text-sm font-semibold text-negative/70 line-through decoration-negative/30 mb-2">
                {item.not}
              </p>
              <p className="text-sm font-bold text-foreground">
                {item.is}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
