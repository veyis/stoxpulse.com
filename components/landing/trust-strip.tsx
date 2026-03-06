"use client";

import { motion } from "framer-motion";
import { Shield, Database, Brain, Lock } from "lucide-react";

const trustItems = [
  {
    icon: Database,
    label: "Real-time data from SEC EDGAR, Finnhub & FMP",
  },
  {
    icon: Brain,
    label: "Powered by Claude & GPT-4o — state-of-the-art AI",
  },
  {
    icon: Shield,
    label: "No financial advice — research tool only",
  },
  {
    icon: Lock,
    label: "Your watchlist is private & encrypted",
  },
];

export function TrustStrip() {
  return (
    <section className="relative py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.7, type: "spring", bounce: 0.3 }}
          className="flex flex-col items-center rounded-3xl border border-border/50 bg-surface-1/40 backdrop-blur-xl p-8 md:p-12 shadow-[0_0_40px_rgba(0,0,0,0.05)]"
        >
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground mb-8">
            Built on real data. Powered by real AI. No gimmicks.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 w-full">
            {trustItems.map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 + i * 0.1, duration: 0.5 }}
                className="flex items-center gap-4 justify-center sm:justify-start"
              >
                <div className="flex items-center justify-center size-10 rounded-xl bg-surface-0 border border-border shrink-0 shadow-sm">
                  <item.icon className="size-4 text-brand" />
                </div>
                <span className="text-sm font-medium text-foreground/80 leading-snug">
                  {item.label}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
