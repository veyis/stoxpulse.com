"use client";

import { Check, Sparkles } from "lucide-react";
import { motion, Variants } from "framer-motion";
import { cn } from "@/lib/utils";
import { analytics } from "@/lib/analytics";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Start researching smarter. No credit card, no catch.",
    features: [
      "5 stocks on your watchlist",
      "Earnings summaries (48hr delay)",
      "Weekly news digest",
      "Basic filing alerts",
    ],
    cta: "Start Free",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$29",
    period: "/month",
    annualPrice: "$290/year (save 17%)",
    description: "The plan serious investors choose. Real-time intelligence for your entire portfolio.",
    features: [
      "30 stocks on your watchlist",
      "Real-time earnings analysis & alerts",
      "Daily AI news digest (scored by importance)",
      "All SEC filing summaries in plain English",
      "Insider transaction analysis with AI context",
      "Sentiment trend tracking across quarters",
      "Email + in-app alerts",
    ],
    cta: "Get Early Access",
    highlighted: true,
  },
  {
    name: "Analyst",
    price: "$59",
    period: "/month",
    annualPrice: "$590/year (save 17%)",
    description: "Institutional-grade output for power users and content creators.",
    features: [
      "100 stocks on your watchlist",
      "Everything in Pro",
      "PDF report export",
      "API access for your workflows",
      "Custom alert rules",
      "Peer comparison analysis",
      "Priority support",
    ],
    cta: "Get Early Access",
    highlighted: false,
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
  hidden: { opacity: 0, scale: 0.95, y: 30 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 15 },
  },
};

export function Pricing() {
  return (
    <section id="pricing" className="relative py-24 md:py-32 overflow-hidden bg-background">
      <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-border to-transparent" />

      {/* Ambient background glow */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-brand/3 rounded-[100%] blur-[120px]" />

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16 md:mb-20"
        >
          <p className="text-sm font-medium text-brand mb-3 tracking-wide uppercase">
            Pricing
          </p>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            A Bloomberg Terminal costs{" "}
            <span className="text-gradient">$24,000/year</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            A junior research analyst costs $80,000. StoxPulse gives you
            the AI-powered analysis layer that actually matters — for less
            than your streaming subscriptions combined.
          </p>
        </motion.div>

        {/* Pricing cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto"
        >
          {plans.map((plan) => (
            <motion.div
              key={plan.name}
              variants={cardVariants}
              whileHover={{ y: plan.highlighted ? -4 : -2, transition: { duration: 0.2 } }}
              className={cn(
                "relative flex flex-col rounded-3xl border p-6 md:p-8 transition-colors duration-300",
                plan.highlighted
                  ? "border-brand/40 bg-brand/5 shadow-2xl shadow-brand/10 z-10"
                  : "border-border bg-surface-1 hover:border-brand/20 z-0"
              )}
            >
              {/* Popular badge */}
              {plan.highlighted && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <motion.span
                    animate={{ boxShadow: ["0 0 0 0 rgba(114, 219, 155, 0)", "0 0 0 4px rgba(114, 219, 155, 0.1)", "0 0 0 0 rgba(114, 219, 155, 0)"] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="inline-flex items-center gap-1.5 rounded-full bg-brand px-3.5 py-1 text-xs font-bold tracking-widest uppercase text-brand-foreground"
                  >
                    <Sparkles className="size-3" />
                    Most Popular
                  </motion.span>
                </div>
              )}

              {/* Plan header */}
              <div className="mb-6">
                <h3 className={cn("text-lg font-bold tracking-tight", plan.highlighted ? "text-brand" : "text-foreground")}>
                  {plan.name}
                </h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-5xl font-extrabold font-display tracking-tight text-foreground">
                    {plan.price}
                  </span>
                  <span className="text-sm font-medium text-muted-foreground">
                    {plan.period}
                  </span>
                </div>
                {plan.annualPrice ? (
                  <p className="mt-2 text-xs font-semibold text-brand/80">
                    {plan.annualPrice}
                  </p>
                ) : (
                  <div className="mt-2 h-4" /> /* spacer for alignment */
                )}
                <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                  {plan.description}
                </p>
              </div>

              {/* Features list */}
              <ul className="mb-8 flex-1 space-y-4">
                {plan.features.map((feature, i) => (
                  <motion.li
                    key={feature}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-start gap-3"
                  >
                    <div className={cn(
                      "flex items-center justify-center size-5 shrink-0 rounded-full mt-0.5",
                      plan.highlighted ? "bg-brand/20 text-brand" : "bg-surface-3 text-muted-foreground"
                    )}>
                      <Check className="size-3" strokeWidth={3} />
                    </div>
                    <span className="text-sm font-medium text-muted-foreground">
                      {feature}
                    </span>
                  </motion.li>
                ))}
              </ul>

              {/* CTA */}
              <motion.a
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                href="#waitlist"
                onClick={() => analytics.pricingViewed(plan.name)}
                className={cn(
                  "inline-flex items-center justify-center rounded-xl px-6 py-3.5 text-sm font-bold transition-all duration-200 mt-auto",
                  plan.highlighted
                    ? "bg-brand text-brand-foreground hover:bg-brand/90 glow-brand shadow-lg"
                    : "border border-border bg-surface-2 text-foreground hover:bg-surface-3"
                )}
              >
                {plan.cta}
              </motion.a>
            </motion.div>
          ))}
        </motion.div>

        {/* Trust note */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-12 text-center text-sm font-medium text-muted-foreground max-w-xl mx-auto"
        >
          No credit card required for free tier. Cancel anytime. <span className="text-foreground">Founding member
          pricing locked in at launch — prices will increase.</span>
        </motion.p>
      </div>
    </section>
  );
}
