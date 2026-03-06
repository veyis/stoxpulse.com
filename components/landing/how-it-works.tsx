"use client";

import { Plus, Zap, Bell } from "lucide-react";
import { motion, Variants } from "framer-motion";

const steps = [
  {
    number: "01",
    icon: Plus,
    title: "Build your watchlist",
    description:
      "Add the stocks you own and the ones you're researching. AAPL, NVDA, MSFT — your portfolio, your rules. We cover all S&P 500 companies and growing.",
  },
  {
    number: "02",
    icon: Zap,
    title: "AI monitors everything, 24/7",
    description:
      "Every earnings call transcript, every 10-K and 8-K filing, every insider trade, every news mention — StoxPulse AI reads it all in real-time and surfaces only what matters.",
  },
  {
    number: "03",
    icon: Bell,
    title: "10 minutes. Fully informed.",
    description:
      "Get 2-minute earnings summaries, red flag alerts, daily news digests scored by importance, and insider transaction analysis. Stay as informed as a full-time analyst — in a fraction of the time.",
  },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.3 },
  },
};

const stepVariants: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: "spring", stiffness: 70, damping: 20 },
  },
};

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-24 md:py-32 overflow-hidden bg-background">
      <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-border to-transparent" />

      {/* Subtle background glow */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-brand/5 rounded-full blur-[120px]" />

      <div className="relative mx-auto max-w-4xl px-6">
        {/* Section header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-20 md:mb-28"
        >
          <p className="text-sm font-bold text-brand mb-4 tracking-widest uppercase">
            How It Works
          </p>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            From watchlist to{" "}
            <span className="text-gradient">institutional intelligence</span>{" "}
            in 3 steps
          </h2>
        </motion.div>

        {/* Vertical Timeline Steps */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="relative max-w-2xl mx-auto"
        >
          {/* Central Line */}
          <div className="absolute left-[39px] md:left-1/2 top-0 bottom-0 w-px bg-border/50 -translate-x-1/2 hidden sm:block" />

          {steps.map((step, index) => {
            const isEven = index % 2 === 0;

            return (
              <motion.div 
                key={step.number} 
                variants={stepVariants}
                className={`relative flex flex-col sm:flex-row items-center gap-8 md:gap-16 mb-16 last:mb-0 ${isEven ? "sm:flex-row" : "sm:flex-row-reverse"}`}
              >
                {/* Content Side */}
                <div className={`flex-1 w-full text-left ${isEven ? "sm:text-right" : "sm:text-left"}`}>
                  <motion.div 
                    whileHover={{ scale: 1.02 }}
                    className="inline-block px-10 py-8 rounded-3xl bg-surface-1/50 backdrop-blur-sm border border-border/50 hover:border-brand/30 hover:bg-surface-2 transition-all duration-300 shadow-sm"
                  >
                    <div className={`flex items-center gap-4 mb-4 ${isEven ? "sm:justify-end" : "sm:justify-start"}`}>
                      <span className="text-4xl font-display font-bold text-brand/20 select-none">
                        {step.number}
                      </span>
                      <h3 className="text-2xl font-bold text-foreground">
                        {step.title}
                      </h3>
                    </div>
                    <p className="text-base text-muted-foreground leading-relaxed max-w-sm">
                      {step.description}
                    </p>
                  </motion.div>
                </div>

                {/* Center Icon Node */}
                <div className="absolute left-0 sm:static sm:shrink-0 z-10 flex items-center justify-center">
                  <motion.div 
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                    className="flex items-center justify-center size-20 rounded-2xl bg-surface-0 border-2 border-brand/30 shadow-[0_0_30px_rgba(var(--brand-rgb),0.2)] glow-brand"
                  >
                    <step.icon className="size-8 text-brand drop-shadow-sm" />
                  </motion.div>
                </div>

                {/* Empty Flexible Space to balance the grid on alternating sides */}
                <div className="flex-1 hidden sm:block" />
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
