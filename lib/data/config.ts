// Data provider configuration
// API keys are loaded from environment variables

export const dataConfig = {
  edgar: {
    baseUrl: "https://data.sec.gov",
    searchUrl: "https://efts.sec.gov/LATEST/search-index",
    userAgent: "StoxPulse support@stoxpulse.com",
    rateLimit: 10, // requests per second
    tickerMapUrl: "https://www.sec.gov/files/company_tickers.json",
  },
  finnhub: {
    baseUrl: "https://finnhub.io/api/v1",
    apiKey: process.env.FINNHUB_API_KEY ?? "",
    rateLimit: 60, // requests per minute (free tier)
  },
  fmp: {
    baseUrl: "https://financialmodelingprep.com/stable",
    apiKey: process.env.FMP_API_KEY ?? "",
    rateLimit: 300, // requests per minute (Starter tier)
  },
  apiNinjas: {
    baseUrl: "https://api.api-ninjas.com/v1",
    apiKey: process.env.API_NINJAS_API_KEY ?? "",
    rateLimit: 50, // requests per second (Developer tier)
  },
  cache: {
    dir: ".cache",
    // Default TTLs in seconds
    ttl: {
      quote: 15 * 60, // 15 minutes
      profile: 24 * 60 * 60, // 24 hours
      financials: 24 * 60 * 60, // 24 hours
      filings: 6 * 60 * 60, // 6 hours
      insiderTrades: 6 * 60 * 60, // 6 hours
      news: 30 * 60, // 30 minutes
      earnings: 7 * 24 * 60 * 60, // 7 days (transcripts rarely change)
      calendar: 60 * 60, // 1 hour
      tickerMap: 7 * 24 * 60 * 60, // 1 week
    },
  },
} as const;

export function isProviderEnabled(provider: "finnhub" | "fmp" | "apiNinjas"): boolean {
  switch (provider) {
    case "finnhub":
      return !!dataConfig.finnhub.apiKey;
    case "fmp":
      return !!dataConfig.fmp.apiKey;
    case "apiNinjas":
      return !!dataConfig.apiNinjas.apiKey;
  }
}
