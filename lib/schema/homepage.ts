export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "StoxPulse",
  url: "https://stoxpulse.com",
  logo: "https://stoxpulse.com/logo.png",
  description:
    "AI-powered stock intelligence platform that reads earnings calls, SEC filings, and financial news to deliver actionable insights for self-directed retail investors.",
  foundingDate: "2026",
  sameAs: [
    "https://twitter.com/stoxpulse",
    "https://linkedin.com/company/stoxpulse",
  ],
};

export const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "StoxPulse",
  url: "https://stoxpulse.com",
  potentialAction: {
    "@type": "SearchAction",
    target: "https://stoxpulse.com/stocks/{search_term_string}",
    "query-input": "required name=search_term_string",
  },
};

export const softwareApplicationSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "StoxPulse",
  applicationCategory: "FinanceApplication",
  operatingSystem: "Web",
  offers: {
    "@type": "AggregateOffer",
    lowPrice: "0",
    highPrice: "29",
    priceCurrency: "USD",
  },
  featureList: [
    "AI-powered earnings call analysis",
    "SEC filing monitoring and summarization",
    "Real-time financial news aggregation",
    "Custom stock watchlists",
    "Smart alerts and notifications",
    "Sentiment analysis on financial data",
  ],
};
