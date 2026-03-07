"use client";

import { useState } from "react";
import { ArrowRight, CheckCircle, Loader2 } from "lucide-react";
import { motion, Variants } from "framer-motion";
import { analytics } from "@/lib/analytics";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
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

const avatarVariants: Variants = {
  hidden: { scale: 0, opacity: 0 },
  visible: { scale: 1, opacity: 1, transition: { type: "spring", stiffness: 260, damping: 20 } },
};

export function CTA() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) return;

    setStatus("loading");

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to join waitlist");
      }

      setStatus("success");
      setEmail("");
      analytics.waitlistSubmitted("cta_section");
    } catch {
      setStatus("error");
      analytics.waitlistError("cta_section");
      setTimeout(() => setStatus("idle"), 3000);
    }
  };

  return (
    <section id="waitlist" className="relative py-24 md:py-32 overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-border to-transparent" />

      {/* Background glow */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-brand/5 rounded-[100%] blur-[120px]" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="relative mx-auto max-w-3xl px-6 text-center"
      >
        <motion.p
          variants={itemVariants}
          className="text-sm font-medium text-brand mb-4 tracking-wide uppercase"
        >
          Early Access
        </motion.p>
        <motion.h2 variants={itemVariants} className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
          Your stocks filed 23 documents last quarter.{" "}
          <span className="text-gradient">How many did you read?</span>
        </motion.h2>
        <motion.p variants={itemVariants} className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">
          Join the waitlist and be the first to have an AI research analyst
          reading everything for you. Founding members get locked-in pricing
          when we launch.
        </motion.p>

        {/* Email Form */}
        <motion.div variants={itemVariants}>
          {status === "success" ? (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="mt-10 inline-flex items-center gap-3 rounded-2xl border border-positive/30 bg-positive/10 px-8 py-5 text-positive shadow-lg"
            >
              <CheckCircle className="size-6" />
              <div className="text-left">
                <p className="font-semibold text-lg">You&apos;re on the list!</p>
                <p className="text-sm font-medium opacity-80">
                  We&apos;ll notify you when StoxPulse launches with your founding member pricing.
                </p>
              </div>
            </motion.div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="mt-10 flex flex-col sm:flex-row items-center gap-3 max-w-lg mx-auto relative z-10"
            >
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full flex-1 rounded-xl border border-border bg-surface-1/80 backdrop-blur-sm px-5 py-3.5 text-sm font-medium text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-brand/50 focus:border-brand/50 transition-all duration-200 shadow-sm"
              />
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={status === "loading"}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-7 py-3.5 text-sm font-bold text-brand-foreground hover:bg-brand/90 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 glow-brand shadow-lg"
              >
                {status === "loading" ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Joining...
                  </>
                ) : (
                  <>
                    Join Waitlist
                    <ArrowRight className="size-4" />
                  </>
                )}
              </motion.button>
            </form>
          )}

          {/* Error state */}
          {status === "error" && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 text-xs font-semibold text-negative">
              Something went wrong. Please try again.
            </motion.p>
          )}

          {/* Assurance */}
          {status !== "error" && (
            <p className="mt-4 text-xs font-medium text-muted-foreground/60">
              No spam, ever. Unsubscribe anytime. We respect your inbox.
            </p>
          )}
        </motion.div>

        {/* Social proof */}
        <motion.div variants={itemVariants} className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-4 text-sm font-medium text-muted-foreground">
          <motion.div
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.3 } }
            }}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="flex -space-x-3"
          >
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                variants={avatarVariants}
                className="size-10 rounded-full border-2 border-background shadow-sm relative z-0 hover:z-10 transition-all duration-300 hover:scale-110"
                style={{
                  background: `oklch(${55 + i * 5}% 0.12 ${160 + i * 40})`,
                }}
              />
            ))}
          </motion.div>
          <span>Join <span className="text-foreground font-bold">200+</span> serious investors on the waitlist</span>
        </motion.div>
      </motion.div>
    </section>
  );
}
