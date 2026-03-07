"use client";

import Link from "next/link";
import Image from "next/image";
import { Activity } from "lucide-react";
import { motion } from "framer-motion";

export function Footer() {
  return (
    <footer className="relative border-t border-border bg-surface-0 overflow-hidden">
      <motion.div 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
        }}
        className="mx-auto max-w-7xl px-6 py-12 md:py-16"
      >
        <div className="flex flex-col md:flex-row items-start justify-between gap-8">
          {/* Brand */}
          <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="max-w-xs">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex items-center justify-center size-8 rounded-lg relative overflow-hidden shadow-sm">
                <Image 
                  src="/images/related/logo1.png" 
                  alt="StoxPulse" 
                  fill
                  className="object-cover"
                  sizes="32px"
                />
              </div>
              <span className="font-display text-lg font-bold tracking-tight">
                Stox<span className="text-brand">Pulse</span>
              </span>
            </Link>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              The AI research analyst serious investors wish they could afford.
            </p>
          </motion.div>

          {/* Links */}
          <div className="flex flex-wrap gap-12 md:gap-16">
            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
              <h4 className="text-sm font-semibold text-foreground mb-3">
                Product
              </h4>
              <ul className="space-y-2">
                {[
                  { label: "AI Stock Analysis", href: "/stocks" },
                  { label: "AI Signals", href: "/signals" },
                  { label: "Earnings Calendar", href: "/earnings" },
                  { label: "Free Tools", href: "/tools" },
                  { label: "Pricing", href: "/#pricing" },
                ].map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
              <h4 className="text-sm font-semibold text-foreground mb-3">
                Free Tools
              </h4>
              <ul className="space-y-2 mb-6">
                {[
                  { label: "SEC Form 4 Decoder", href: "/tools/sec-filing-translator" },
                  { label: "Sentiment Checker", href: "/tools/stock-sentiment-checker" },
                  { label: "Earnings Summarizer", href: "/tools/earnings-call-summarizer" },
                  { label: "View All Tools", href: "/tools" },
                ].map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
              <h4 className="text-sm font-semibold text-foreground mb-3">
                Learn
              </h4>
              <ul className="space-y-2">
                {[
                  { label: "Blog", href: "/blog" },
                  { label: "Glossary", href: "/glossary" },
                  { label: "Compare Tools", href: "/compare" },
                ].map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
              <h4 className="text-sm font-semibold text-foreground mb-3">
                Popular Stocks
              </h4>
              <ul className="space-y-2">
                {[
                  { label: "AAPL — Apple", href: "/stocks/aapl" },
                  { label: "NVDA — NVIDIA", href: "/stocks/nvda" },
                  { label: "MSFT — Microsoft", href: "/stocks/msft" },
                  { label: "TSLA — Tesla", href: "/stocks/tsla" },
                  { label: "AMZN — Amazon", href: "/stocks/amzn" },
                  { label: "GOOGL — Alphabet", href: "/stocks/googl" },
                ].map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
              <h4 className="text-sm font-semibold text-foreground mb-3">
                Company
              </h4>
              <ul className="space-y-2">
                {[
                  { label: "About", href: "/about" },
                  { label: "Privacy Policy", href: "/privacy" },
                  { label: "Terms of Service", href: "/terms" },
                ].map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>

        {/* Disclaimer + Copyright */}
        <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="mt-12 pt-8 border-t border-border">
          <p className="text-xs text-muted-foreground/60 leading-relaxed max-w-4xl">
            <strong>Disclaimer:</strong> StoxPulse provides financial information
            and AI-generated analysis for educational and informational purposes
            only. Nothing on this platform constitutes investment advice, a
            recommendation, or a solicitation to buy or sell any security. AI
            analysis may contain errors. Always consult a qualified financial
            advisor and verify all information independently before making
            investment decisions. Past performance does not indicate future results.
          </p>
          <p className="mt-4 text-xs font-medium text-muted-foreground/40">
            &copy; 2026 StoxPulse. All rights reserved.
          </p>
        </motion.div>
      </motion.div>
    </footer>
  );
}
