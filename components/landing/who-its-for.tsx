"use client";

import { Target, PenTool, Shield } from "lucide-react";
import { motion, Variants } from "framer-motion";

const personas = [
  {
    icon: Target,
    title: "The Active Portfolio Manager",
    portfolio: "$25K–$500K portfolio",
    description:
      "You own 10–30 stocks and spend 5–10 hours a week researching. You know you should be reading 10-Ks and listening to earnings calls — but there aren't enough hours in the day. StoxPulse gives you institutional-grade research coverage across your entire watchlist.",
    painQuote: "\"I missed the MSFT guidance cut because I didn't have time to listen to the call.\"",
  },
  {
    icon: PenTool,
    title: "The Finance Content Creator",
    portfolio: "YouTubers, newsletter writers, FinTwit",
    description:
      "You need to analyze stocks fast and accurately for your audience. StoxPulse gives you AI-powered earnings breakdowns, filing summaries, and sentiment data you can reference — with PDF exports and API access to plug into your workflow.",
    painQuote: "\"I need to cover 5 earnings reports tonight for tomorrow's video.\"",
  },
  {
    icon: Shield,
    title: "The Informed Long-Term Investor",
    portfolio: "Buy and hold, but not buy and forget",
    description:
      "You're not a day trader — you buy quality companies and hold. But you want to know when something material changes: a risk factor appears, an insider sells unusually, or management quietly lowers guidance. StoxPulse watches so you don't have to.",
    painQuote: "\"I held through the earnings miss because I didn't see the warning signs.\"",
  },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
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

export function WhoItsFor() {
  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-border to-transparent" />

      {/* Background glow */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-brand/3 rounded-full blur-[120px]" />

      <div className="relative mx-auto max-w-7xl px-6">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16 md:mb-20"
        >
          <p className="text-sm font-medium text-brand mb-3 tracking-wide uppercase">
            Built For You
          </p>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            For investors who{" "}
            <span className="text-gradient">do their homework</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            StoxPulse isn&apos;t for day traders chasing momentum or beginners
            buying their first ETF. It&apos;s for serious investors who want
            to make informed decisions based on real data.
          </p>
        </motion.div>

        {/* Persona cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {personas.map((persona) => (
              <motion.div
              key={persona.title}
              variants={cardVariants}
              whileHover={{ y: -8, scale: 1.02 }}
              className="group relative flex flex-col rounded-3xl border border-border/60 bg-surface-1/50 backdrop-blur-md p-8 hover:border-brand/40 transition-all duration-500 shadow-sm hover:shadow-xl hover:shadow-brand/5"
            >
              {/* Icon */}
              <div className="mb-8 inline-flex items-center justify-center size-16 rounded-2xl bg-surface-2 border border-border group-hover:border-brand/40 group-hover:bg-brand/10 transition-all duration-500 group-hover:shadow-[0_0_20px_rgba(var(--brand-rgb),0.15)]">
                <persona.icon className="size-7 text-foreground group-hover:text-brand transition-colors duration-500" />
              </div>

              {/* Title & portfolio size */}
              <h3 className="text-xl font-bold tracking-tight text-foreground mb-2 group-hover:text-brand transition-colors duration-300">
                {persona.title}
              </h3>
              <p className="inline-flex items-center self-start rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand mb-5">
                {persona.portfolio}
              </p>

              {/* Description */}
              <p className="text-[15px] text-muted-foreground leading-relaxed flex-1">
                {persona.description}
              </p>

              {/* Pain quote */}
              <div className="mt-8 pt-6 border-t border-border/50 relative">
                <div className="absolute -top-3 left-0 text-4xl text-brand/20 font-serif leading-none">&quot;</div>
                <p className="text-[15px] font-medium italic text-muted-foreground relative z-10 pl-2">
                  {persona.painQuote.replace(/"/g, '')}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
