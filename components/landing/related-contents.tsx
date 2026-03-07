"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import { motion, Variants } from "framer-motion";

const articles = [
  {
    title: "How AI Is Changing Stock Analysis in 2026",
    category: "AI & Investing",
    readTime: "8 MIN READ",
    image: "/images/related/laptop.png",
    link: "/blog/how-ai-is-changing-stock-analysis",
    description: "How institutional-grade machine learning is finally leveling the playing field for everyday investors.",
  },
  {
    title: "How to Read an Earnings Call Transcript",
    category: "Earnings",
    readTime: "6 MIN READ",
    image: "/images/related/tablet.png",
    link: "/blog/how-to-read-earnings-call-transcript",
    description: "Stop wasting hours listening to management spin. Learn what to look for and how to spot key signals.",
  },
  {
    title: "SEC Filings Explained: 10-K vs 10-Q vs 8-K",
    category: "SEC Filings",
    readTime: "7 MIN READ",
    image: "/images/related/phone.png",
    link: "/blog/sec-filings-explained-10k-10q-8k",
    description: "The difference between annual reports, quarterly filings, and material event disclosures — and why each matters.",
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
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 15 },
  },
};

export function RelatedContents() {
  return (
    <section className="relative py-24 md:py-32 overflow-hidden bg-background">
      <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-border to-transparent" />
      
      {/* Subtle background glow */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-brand/3 rounded-[100%] blur-[120px]" />

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="mb-16 md:mb-20 flex flex-col md:flex-row md:items-end justify-between gap-6"
        >
          <div className="max-w-2xl">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Inside <span className="text-gradient">StoxPulse</span>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Deep-dive insights, strategies, and methodologies powering our AI platform.
            </p>
          </div>
          <a
            href="#waitlist"
            className="group inline-flex items-center gap-2 text-sm font-semibold text-brand hover:text-brand/80 transition-colors"
          >
            Join waitlist for updates
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </a>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8"
        >
          {articles.map((article) => (
            <motion.div
              key={article.title}
              variants={cardVariants}
              whileHover={{ y: -8, transition: { duration: 0.3, ease: "easeOut" } }}
            >
            <Link
              href={article.link}
              className="group relative flex flex-col rounded-3xl border border-border/50 bg-surface-1 overflow-hidden transition-colors hover:border-brand/30 shadow-sm hover:shadow-xl hover:shadow-brand/5"
            >
              {/* Image Container */}
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-surface-2">
                <div className="absolute inset-0 bg-linear-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />
                <Image
                  src={article.image}
                  alt={article.title}
                  fill
                  className="object-cover transition-transform duration-700 ease-in-out group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 400px"
                />
                
                {/* Badge */}
                <div className="absolute top-4 left-4 z-20">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-background/90 backdrop-blur-md px-3 py-1.5 text-[10px] font-bold tracking-widest uppercase text-foreground shadow-sm">
                    {article.category}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="flex flex-1 flex-col p-6 md:p-8">
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="size-4 text-brand" />
                  <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">{article.readTime}</span>
                </div>
                
                <h3 className="text-xl font-bold tracking-tight text-foreground mb-3 group-hover:text-brand transition-colors duration-300">
                  {article.title}
                </h3>
                
                <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                  {article.description}
                </p>

                <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-foreground group-hover:text-brand transition-colors duration-300">
                  Read full analysis
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
