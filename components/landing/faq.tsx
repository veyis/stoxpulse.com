"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { analytics } from "@/lib/analytics";

const faqs = [
  {
    question: "What is StoxPulse?",
    answer:
      "StoxPulse is an AI-powered stock intelligence platform that acts as your personal research analyst. It reads earnings call transcripts, analyzes SEC filings (10-K, 10-Q, 8-K), monitors insider transactions, and scores financial news — all for the stocks on your watchlist. You get 2-minute earnings summaries, plain-English filing translations, red flag alerts, and daily digests of what actually matters for your portfolio.",
  },
  {
    question: "How is this different from just asking ChatGPT about a stock?",
    answer:
      "ChatGPT gives you a one-time answer based on its training data, which may be months old. StoxPulse is fundamentally different: it monitors your watchlist 24/7, automatically processes new earnings calls and SEC filings as they're published, tracks management promises across quarters, and alerts you in real-time when something material happens. It's not a chatbot — it's a continuous intelligence system purpose-built for financial document analysis. Think of it as the difference between googling a symptom vs. having a doctor monitoring your health.",
  },
  {
    question: "How does AI earnings call analysis work?",
    answer:
      "When a company on your watchlist reports earnings, StoxPulse automatically fetches the full transcript and runs a multi-step AI analysis: (1) Extraction — revenue, EPS, and key metrics vs. estimates, (2) Sentiment analysis — management confidence rated 1-10, compared to previous quarters, (3) Red flag detection — hedging language, vague answers, buried guidance changes, and (4) Synthesis — a concise summary a smart non-expert can understand in under 2 minutes. Pro subscribers get this within hours of the call; free tier gets it with a 48-hour delay.",
  },
  {
    question: "Is StoxPulse free to use?",
    answer:
      "Yes. The free tier includes up to 5 stocks on your watchlist, earnings summaries with a 48-hour delay, weekly news digests, and basic filing alerts — forever, no credit card required. Pro ($29/month) unlocks 30 stocks, real-time analysis, daily AI digests, insider transaction alerts, and sentiment tracking. Analyst ($59/month) adds 100 stocks, PDF exports, API access, custom alerts, and peer comparison analysis.",
  },
  {
    question: "What if the AI gets something wrong?",
    answer:
      "StoxPulse AI analyzes factual documents — it reads what management actually said on earnings calls and what SEC filings actually contain. It doesn't predict stock prices or make buy/sell recommendations. That said, AI can occasionally misinterpret nuance or miss context. Every analysis includes source references so you can verify key points, and we display confidence indicators. We strongly encourage users to verify critical information independently. StoxPulse is a research tool that saves you time — not a replacement for your own judgment.",
  },
  {
    question: "What SEC filings does StoxPulse monitor?",
    answer:
      "StoxPulse monitors all major SEC filing types: 10-K (annual reports), 10-Q (quarterly reports), 8-K (material events like acquisitions, executive changes, or buyback announcements), Form 4 (insider transactions), 13-F (institutional holdings), and proxy statements. Each filing is summarized in plain English with key changes highlighted compared to the previous filing. For 8-K filings and unusual insider transactions, you get real-time alerts.",
  },
  {
    question: "How is StoxPulse different from Seeking Alpha or Motley Fool?",
    answer:
      "Seeking Alpha gives you crowdsourced opinions from thousands of contributors with varying quality. Motley Fool gives you editorial stock picks. Both are human opinions about stocks. StoxPulse is different: it uses AI to analyze primary sources directly — the actual earnings call transcripts, the actual SEC filings, the actual news. You get objective, AI-generated analysis of what was said and filed, not someone's opinion about what it means. It's faster (2 minutes vs. waiting for an article), cheaper ($29/mo vs. $299+/year), and covers your specific watchlist automatically.",
  },
  {
    question: "What stocks does StoxPulse cover?",
    answer:
      "StoxPulse covers all S&P 500 companies at launch, with NASDAQ 100 and Russell 2000 stocks being added progressively. Every covered stock gets AI earnings call analysis, SEC filing monitoring, news sentiment scoring, and insider transaction tracking. If a stock you want isn't covered yet, you can request it — we prioritize based on user demand.",
  },
  {
    question: "Is this financial advice?",
    answer:
      "No. StoxPulse is a research and intelligence tool — it helps you understand what's happening with the companies you follow by analyzing public documents. It does not provide personalized investment advice, stock recommendations, or buy/sell signals. Think of it as having a research assistant who reads everything and summarizes it for you. The investment decisions are always yours. We strongly recommend consulting a qualified financial advisor for personalized advice.",
  },
  {
    question: "How fast do I get earnings call summaries?",
    answer:
      "Pro and Analyst subscribers receive AI-generated earnings analysis within hours of the call ending — typically before the next trading session. Free tier users receive summaries with a 48-hour delay. Each analysis includes: revenue and EPS vs. estimates, key management quotes, sentiment scoring compared to previous quarters, red flag detection, and forward guidance changes.",
  },
  {
    question: "Will the free plan always be free?",
    answer:
      "Yes. The free tier includes 5 stocks on your watchlist forever — no credit card required, no trial period, no hidden catches. You only pay if you choose to upgrade to Pro or Analyst for more stocks and real-time features. You can stay on free indefinitely.",
  },
  {
    question: "What happens when I join the waitlist?",
    answer:
      "You'll receive one email when StoxPulse launches with your founding member pricing locked in. That's it — no spam, no daily emails, no obligations. Founding members get permanently discounted pricing that won't increase even as we raise prices after launch.",
  },
  {
    question: "Can I cancel anytime?",
    answer:
      "Yes. Cancel from your account settings anytime — no questions asked, no lock-in contracts, no cancellation fees. If you cancel a paid plan, you'll keep access through the end of your billing period and then revert to the free tier automatically.",
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <section id="faq" className="relative py-24 md:py-32">
      <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-border to-transparent" />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="mx-auto max-w-3xl px-6">
        <div className="text-center mb-12 md:mb-16">
          <p className="text-sm font-medium text-brand mb-3 tracking-wide uppercase">
            FAQ
          </p>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Frequently asked{" "}
            <span className="text-gradient">questions</span>
          </h2>
        </div>

        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
          }}
          className="space-y-4"
        >
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            
            return (
              <motion.div
                key={index}
                variants={{
                  hidden: { opacity: 0, y: 10 },
                  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
                }}
                className={cn(
                  "overflow-hidden rounded-2xl border transition-all duration-300",
                  isOpen ? "border-brand/30 bg-surface-1/60 shadow-md backdrop-blur-sm" : "border-border/50 bg-surface-1/30 hover:border-brand/20 hover:bg-surface-1/50"
                )}
              >
                <button
                  onClick={() => {
                    if (!isOpen) analytics.faqOpened(faq.question);
                    setOpenIndex(isOpen ? null : index);
                  }}
                  className="flex w-full items-center justify-between px-6 py-5 text-left focus:outline-none"
                  aria-expanded={isOpen}
                >
                  <span className="text-base font-semibold text-foreground pr-4">
                    {faq.question}
                  </span>
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                    className={cn(
                      "flex items-center justify-center size-8 rounded-full shrink-0",
                      isOpen ? "bg-brand/10 text-brand" : "bg-surface-2 text-muted-foreground"
                    )}
                  >
                    <ChevronDown className="size-4" />
                  </motion.div>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <p className="px-6 pb-6 pt-2 text-[15px] text-muted-foreground leading-relaxed flex-1 border-t border-border/30 mx-6 mt-2">
                        {faq.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
