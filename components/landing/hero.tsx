"use client";

import { cn } from "@/lib/utils";
import { ArrowRight, TrendingUp, FileText, Zap } from "lucide-react";
import { motion, Variants } from "framer-motion";
import { analytics } from "@/lib/analytics";

const stats = [
  { value: "4,000+", label: "Earnings calls analyzed per quarter" },
  { value: "3,000+", label: "SEC filings monitored per day" },
  { value: "< 2 min", label: "To understand any earnings call" },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 15 },
  },
};

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background gradient effects */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-brand/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-border to-transparent" />
      </div>

      {/* Grid pattern overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-6 py-24 md:py-32">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center text-center"
        >
          {/* Badge */}
          <motion.div
            variants={itemVariants}
            className="mb-8 inline-flex items-center gap-2 rounded-full border border-brand/20 bg-brand/5 px-4 py-1.5 text-sm text-brand"
          >
            <motion.div
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            >
              <Zap className="size-3.5" />
            </motion.div>
            <span>AI-Powered Stock Intelligence</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={itemVariants}
            className="max-w-5xl text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
          >
            The research analyst{" "}
            <br className="hidden sm:block" />
            <span className="text-gradient">serious investors</span> wish
            they could afford.
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            variants={itemVariants}
            className="mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl"
          >
            StoxPulse AI reads every earnings call, analyzes every SEC filing,
            and scores every piece of news for your watchlist — so you make
            decisions on{" "}
            <span className="text-foreground font-medium">
              intelligence, not headlines
            </span>
            .
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={itemVariants}
            className="mt-10 flex flex-col sm:flex-row items-center gap-4"
          >
            <motion.a
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              href="#waitlist"
              onClick={() => analytics.ctaClicked("hero", "Get Early Access")}
              className="group inline-flex items-center gap-2 rounded-xl bg-brand px-7 py-3.5 text-base font-semibold text-brand-foreground hover:bg-brand/90 glow-brand transition-all duration-300"
            >
              Get Early Access — Free
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </motion.a>
            <motion.a
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              href="#how-it-works"
              onClick={() => analytics.ctaClicked("hero", "See How It Works")}
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface-1 px-7 py-3.5 text-base font-medium text-foreground hover:bg-surface-2 transition-colors duration-200"
            >
              See How It Works
            </motion.a>
          </motion.div>

          {/* Stats Bar */}
          <motion.div
            variants={containerVariants}
            className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-12"
          >
            {stats.map((stat) => (
              <motion.div key={stat.label} variants={itemVariants} className="flex flex-col items-center gap-1">
                <span className="text-2xl font-bold font-display text-foreground md:text-3xl">
                  {stat.value}
                </span>
                <span className="text-sm text-muted-foreground">
                  {stat.label}
                </span>
              </motion.div>
            ))}
          </motion.div>

          {/* Product Preview Teaser */}
          <motion.div
            variants={itemVariants}
            className="mt-20 w-full max-w-5xl relative group perspective-1000"
            style={{ perspective: "1000px" }}
          >
            <motion.div
              initial={{ rotateX: 15, y: 40, opacity: 0 }}
              animate={{ rotateX: 0, y: 0, opacity: 1 }}
              transition={{ delay: 0.6, type: "spring", stiffness: 60, damping: 20 }}
              whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
              className="relative rounded-2xl border border-border bg-surface-1 p-2 shadow-2xl shadow-black/40"
            >
              {/* Browser chrome */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
                <div className="flex gap-1.5">
                  <div className="size-3 rounded-full bg-destructive/60" />
                  <div className="size-3 rounded-full bg-warning/60" />
                  <div className="size-3 rounded-full bg-positive/60" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="rounded-md bg-surface-2 px-4 py-1 text-xs text-muted-foreground">
                    stoxpulse.com/dashboard
                  </div>
                </div>
              </div>

              {/* Mock Dashboard */}
              <div className="p-6 space-y-4 text-left">
                {/* Dashboard header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-display text-lg font-semibold text-foreground">Your Watchlist</h3>
                    <p className="text-sm text-muted-foreground">3 events need your attention</p>
                  </div>
                  <motion.div
                    animate={{ backgroundColor: ["rgba(114, 219, 155, 0.1)", "rgba(114, 219, 155, 0.2)", "rgba(114, 219, 155, 0.1)"] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="flex items-center gap-2 rounded-lg bg-positive/10 px-3 py-1.5 text-sm text-positive"
                  >
                    <TrendingUp className="size-4" />
                    Portfolio +2.4%
                  </motion.div>
                </div>

                {/* Mock stock cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    { ticker: "NVDA", name: "NVIDIA Corp", change: "+3.2%", positive: true, event: "Earnings Beat — AI Summary Ready" },
                    { ticker: "AAPL", name: "Apple Inc", change: "+0.8%", positive: true, event: "8-K Filed — $100B Buyback" },
                    { ticker: "MSFT", name: "Microsoft", change: "-0.4%", positive: false, event: "CFO Sold $3M — Unusual" },
                  ].map((stock, i) => (
                    <motion.div
                      key={stock.ticker}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.8 + i * 0.1 }}
                      className="rounded-xl border border-border bg-surface-2 p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-display font-bold text-foreground">{stock.ticker}</span>
                          <p className="text-xs text-muted-foreground">{stock.name}</p>
                        </div>
                        <span
                          className={cn(
                            "text-sm font-semibold",
                            stock.positive ? "text-positive" : "text-negative"
                          )}
                        >
                          {stock.change}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <FileText className="size-3.5 text-brand" />
                        <span className="text-xs text-brand">{stock.event}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Mock AI Analysis preview */}
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  transition={{ delay: 1.2, duration: 0.5 }}
                  className="rounded-xl border border-brand/20 bg-brand/5 p-4 overflow-hidden"
                >
                  <div className="flex items-start gap-3">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                      className="flex items-center justify-center size-8 rounded-lg bg-brand/10 shrink-0 mt-0.5"
                    >
                      <Zap className="size-4 text-brand" />
                    </motion.div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-foreground">AI Analysis — NVDA Q4 Earnings Call <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>|</motion.span></p>
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.7 }}
                        className="text-sm text-muted-foreground leading-relaxed"
                      >
                        Revenue beat by 8% ($39.3B vs $36.4B expected). Data center segment grew 42% YoY.
                        Management raised full-year guidance. CEO tone significantly more confident than Q3 —
                        first mention of &ldquo;supply constraints easing&rdquo; in 3 quarters.
                        <span className="text-positive font-medium"> Sentiment: Bullish.</span>
                        <span className="text-warning font-medium"> 1 red flag detected: rising inventory levels.</span>
                      </motion.p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>

            {/* Glow effect under the preview */}
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-3/4 h-16 bg-brand/10 rounded-full blur-[60px]" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
