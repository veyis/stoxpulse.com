"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Activity, Menu, X } from "lucide-react";
import { motion, useScroll, useMotionValueEvent, Variants } from "framer-motion";
import { ThemeToggle } from "@/components/theme-toggle";
import { analytics } from "@/lib/analytics";

const navLinks = [
  { label: "Stocks", href: "/stocks" },
  { label: "AI Signals", href: "/signals" },
  { label: "Earnings", href: "/earnings" },
  { label: "Tools", href: "/tools" },
  { label: "Blog", href: "/blog" },
  { label: "Pricing", href: "/#pricing" },
];

const navVariants: Variants = {
  hidden: { y: -20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 100, damping: 20, staggerChildren: 0.05, delayChildren: 0.1 },
  },
};

const itemVariants: Variants = {
  hidden: { y: -10, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } },
};

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 20);
  });

  return (
    <motion.header 
      initial="hidden"
      animate="visible"
      variants={navVariants}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled ? "bg-surface-1/80 backdrop-blur-xl border-b border-border/50 shadow-sm" : "bg-transparent border-transparent"
      )}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <motion.div variants={itemVariants}>
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex items-center justify-center size-9 rounded-xl relative overflow-hidden group-hover:glow-brand transition-shadow duration-300">
              <Image 
                src="/images/related/logo1.png" 
                alt="StoxPulse" 
                fill
                className="object-cover"
                sizes="36px"
              />
            </div>
            <span className="font-display text-xl font-bold tracking-tight text-foreground">
              Stox<span className="text-brand">Pulse</span>
            </span>
          </Link>
        </motion.div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <motion.div key={link.href} variants={itemVariants}>
              <Link
                href={link.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200"
              >
                {link.label}
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Desktop CTA */}
        <motion.div className="hidden md:flex items-center gap-3" variants={itemVariants}>
          <ThemeToggle />
          <Link
            href="/#waitlist"
            onClick={() => analytics.ctaClicked("navbar", "Get Early Access")}
            className="inline-flex items-center justify-center rounded-lg bg-brand px-5 py-2.5 text-sm font-bold text-brand-foreground hover:bg-brand/90 transition-all duration-300 hover:scale-105 glow-brand shadow-md"
          >
            Get Early Access
          </Link>
        </motion.div>

        {/* Mobile Menu Button */}
        <motion.button
          variants={itemVariants}
          className="md:hidden flex items-center justify-center size-10 rounded-lg hover:bg-secondary transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </motion.button>
      </nav>

      {/* Mobile Menu */}
      <div
        className={cn(
          "md:hidden overflow-hidden transition-all duration-300 ease-out bg-surface-1/95 border-b border-border/50 backdrop-blur-xl",
          mobileOpen ? "max-h-80 opacity-100" : "max-h-0 opacity-0 border-transparent"
        )}
      >
        <div className="px-6 py-6 flex flex-col gap-5">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/#waitlist"
            className="inline-flex items-center justify-center rounded-lg bg-brand px-5 py-3 mt-2 text-sm font-bold text-brand-foreground"
            onClick={() => { analytics.ctaClicked("navbar_mobile", "Get Early Access"); setMobileOpen(false); }}
          >
            Get Early Access
          </Link>
        </div>
      </div>
    </motion.header>
  );
}
