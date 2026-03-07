import { Navbar } from "@/components/navbar";
import { MarketTicker } from "@/components/dashboard/market-ticker";
import { Hero } from "@/components/landing/hero";
import { Problem } from "@/components/landing/problem";
import { TrustStrip } from "@/components/landing/trust-strip";
import { Features } from "@/components/landing/features";
import { HowItWorks } from "@/components/landing/how-it-works";
import { WhoItsFor } from "@/components/landing/who-its-for";
import { Pricing } from "@/components/landing/pricing";
import { FAQ } from "@/components/landing/faq";
import { Testimonials } from "@/components/landing/testimonials";
import { RelatedContents } from "@/components/landing/related-contents";
import { CTA } from "@/components/landing/cta";
import { Footer } from "@/components/landing/footer";

const softwareAppSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "StoxPulse",
  url: "https://stoxpulse.com",
  applicationCategory: "FinanceApplication",
  operatingSystem: "Web",
  description:
    "The AI research analyst serious investors wish they could afford. Reads earnings calls, analyzes SEC filings, scores financial news, and tracks insider transactions for your watchlist.",
  offers: {
    "@type": "AggregateOffer",
    lowPrice: "0",
    highPrice: "59",
    priceCurrency: "USD",
    offerCount: "3",
  },
  featureList: [
    "AI Earnings Call Analysis with Sentiment Scoring",
    "SEC Filing Summaries in Plain English",
    "Real-time News Scoring by Importance (1-10)",
    "Insider Transaction Alerts with AI Context",
    "Management Promise Tracking Across Quarters",
    "Custom Stock Watchlist with AI Monitoring",
    "Daily AI News Digest",
    "Red Flag Detection in Earnings & Filings",
  ],
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(softwareAppSchema),
        }}
      />
      <Navbar />
      <div className="h-[68px]" /> {/* Spacer for fixed navbar */}
      <MarketTicker />
      <main>
        <Hero />
        <Problem />
        <TrustStrip />
        <Features />
        <HowItWorks />
        <WhoItsFor />
        <Pricing />
        <FAQ />
        <Testimonials />
        <RelatedContents />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
