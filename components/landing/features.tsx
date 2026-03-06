"use client";

import {
  Mic,
  FileSearch,
  Newspaper,
  ShieldAlert,
  TrendingUp,
  Clock,
  Activity,
} from "lucide-react";
import { motion, Variants } from "framer-motion";
import { cn } from "@/lib/utils";

const features = [
  {
    icon: Mic,
    title: "AI Earnings Call Analyzer",
    description:
      "NVDA reported last night. In 2 minutes you know: beat revenue by 8%, datacenter grew 42% YoY, management raised guidance, CEO tone shifted from cautious to confident. First mention of \"supply constraints easing\" in 3 quarters. Red flag: rising inventory levels buried on page 47.",
    highlight: "Flagship",
    colSpan: "md:col-span-8",
    bgPattern: true,
  },
  {
    icon: FileSearch,
    title: "SEC Filing Intelligence",
    description:
      "AAPL filed an 8-K at 4:47 PM. You got the alert before CNBC published: $100B buyback authorized, 4% dividend increase. Every 10-K, 10-Q, and 8-K translated into plain English — with changes from last filing highlighted.",
    highlight: null,
    colSpan: "md:col-span-4",
    bgPattern: false,
  },
  {
    icon: Newspaper,
    title: "Smart News Digest",
    description:
      "47 articles about your watchlist today. StoxPulse says: 3 actually matter. That MSFT regulatory probe? Already disclosed in last quarter's 10-K risk factors. The market is reacting to old news. Ignore it.",
    highlight: null,
    colSpan: "md:col-span-4",
    bgPattern: false,
  },
  {
    icon: ShieldAlert,
    title: "Insider Transaction Alerts",
    description:
      "The CFO just sold $3M in stock outside the scheduled 10b5-1 plan. That's not a routine sale — that's a red flag. StoxPulse tells you the difference so you don't panic over noise or miss a real warning sign.",
    highlight: null,
    colSpan: "md:col-span-4",
    bgPattern: false,
  },
  {
    icon: TrendingUp,
    title: "Sentiment Tracking",
    description:
      "Management confidence dropped from 8/10 to 5/10 over 3 quarters. They're using more hedging language. More \"challenging environment,\" less \"strong demand.\" The price hasn't moved yet. You see it first.",
    highlight: null,
    colSpan: "md:col-span-4",
    bgPattern: false,
  },
  {
    icon: Activity,
    title: "The Pulse Score",
    description:
      "One number that tells you: does this stock need your attention right now? Combines earnings quality, filing signals, news sentiment, insider activity, and management tone into a single composite score. Glance at your watchlist, know exactly where to focus.",
    highlight: "Coming Soon",
    colSpan: "md:col-span-12",
    bgPattern: true,
  },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, scale: 0.96, y: 30 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", stiffness: 80, damping: 20 },
  },
};

export function Features() {
  return (
    <section id="features" className="relative py-24 md:py-32 overflow-hidden bg-background">
      {/* Section divider */}
      <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-border to-transparent" />

      {/* Ambient Glow */}
      <div className="pointer-events-none absolute top-1/4 right-0 w-[600px] h-[600px] bg-brand/5 rounded-full blur-[120px] translate-x-1/3" />

      <div className="mx-auto max-w-7xl px-6 relative z-10">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16 md:mb-20"
        >
          <p className="text-sm font-medium text-brand mb-3 tracking-wide uppercase">
            What You Get
          </p>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Six ways StoxPulse replaces{" "}
            <span className="text-gradient">a $500K analyst</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Institutional investors have teams reading every filing and
            listening to every call. Now AI does the same for your watchlist.
          </p>
        </motion.div>

        {/* Bento Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-5"
        >
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              variants={cardVariants}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className={cn(
                "group relative overflow-hidden rounded-3xl border border-border bg-surface-1 p-8 transition-colors duration-300 hover:border-brand/40",
                feature.colSpan
              )}
            >
              {/* Dynamic Abstract Background Patterns for large cards */}
              {feature.bgPattern && (
                <div className="absolute inset-0 opacity-[0.04] pointer-events-none transition-opacity duration-500 group-hover:opacity-[0.08]">
                  <svg className="absolute w-full h-full" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <pattern id={`pattern-${i}`} x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                        <circle cx="2" cy="2" r="1.5" className="fill-brand" />
                      </pattern>
                    </defs>
                    <rect x="0" y="0" width="100%" height="100%" fill={`url(#pattern-${i})`} />
                  </svg>
                  {/* Subtle hover gradient */}
                  <div className="absolute inset-0 bg-linear-to-tr from-brand/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                </div>
              )}

              {/* Highlight badge */}
              {feature.highlight && (
                <div className="absolute top-6 right-6 z-20">
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold tracking-wide shadow-sm",
                      feature.highlight === "Flagship"
                        ? "bg-brand/10 text-brand border border-brand/20"
                        : "bg-surface-3 text-muted-foreground border border-border"
                    )}
                  >
                    {feature.highlight === "Coming Soon" ? <Clock className="size-3 mr-1.5" /> : null}
                    {feature.highlight}
                  </span>
                </div>
              )}

              {/* Icon Container with glowing effect on hover */}
              <div className="relative z-10 mb-6 inline-flex items-center justify-center size-14 rounded-2xl bg-surface-2 border border-border group-hover:border-brand/40 group-hover:bg-brand/10 transition-all duration-300 shadow-sm">
                <feature.icon className="size-6 text-foreground group-hover:text-brand transition-colors duration-300" />
              </div>

              {/* Content */}
              <div className="relative z-10 w-full lg:w-4/5 pt-2">
                <h3 className="text-2xl font-bold tracking-tight text-foreground mb-3">
                  {feature.title}
                </h3>
                <p className="text-base text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
