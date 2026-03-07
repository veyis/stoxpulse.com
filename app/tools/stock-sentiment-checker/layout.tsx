import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free AI Stock Sentiment Checker — AAPL, NVDA, TSLA & More | StoxPulse",
  description:
    "Check real-time AI sentiment for any stock ticker. Our tool analyzes news, social media, and analyst opinions to generate a bullish/bearish sentiment score. Free, no account required.",
  keywords: [
    "stock sentiment analysis",
    "AI stock sentiment",
    "stock sentiment checker",
    "AAPL sentiment",
    "NVDA sentiment",
    "TSLA sentiment",
    "bullish bearish stocks",
    "stock market sentiment tool",
    "free stock analysis",
  ],
  alternates: {
    canonical: "https://stoxpulse.com/tools/stock-sentiment-checker",
  },
  openGraph: {
    title: "Free Stock Sentiment Checker | StoxPulse",
    description:
      "Enter a stock ticker and instantly get an AI-generated sentiment score based on news, social media, and analyst consensus.",
    url: "https://stoxpulse.com/tools/stock-sentiment-checker",
  },
};

export default function StockSentimentCheckerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Stock Sentiment Checker by StoxPulse",
    applicationCategory: "FinanceApplication",
    operatingSystem: "Web",
    description:
      "Enter any stock ticker to see an AI-generated sentiment score based on news, social media, and analyst opinions.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      {children}
    </>
  );
}
