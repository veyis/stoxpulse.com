import { NextResponse } from "next/server";
import { sp500Stocks, tickerToSlug } from "@/data/stocks/sp500";
import { getQuote } from "@/lib/data";
import { calculatePulseScore } from "@/lib/pulse-score";
import type { StockPageData } from "@/lib/data/index";

interface ScreenerStock {
  ticker: string;
  name: string;
  slug: string;
  sector: string;
  price: number;
  change: number;
  changePercent: number;
  marketCap: number;
  pe: number | null;
  pulseScore: number;
  grade: string;
  sparkData: number[];
}

// Batch fetch quotes in groups to avoid rate limits
async function batchFetch(
  tickers: typeof sp500Stocks,
  batchSize = 10
): Promise<ScreenerStock[]> {
  const results: ScreenerStock[] = [];

  for (let i = 0; i < tickers.length; i += batchSize) {
    const batch = tickers.slice(i, i + batchSize);
    const quotes = await Promise.all(
      batch.map(async (stock) => {
        try {
          const quote = await getQuote(stock.ticker);
          if (!quote) return null;

          // Build minimal StockPageData for pulse score calculation
          const pageData: StockPageData = {
            quote,
            profile: null,
            financials: null,
            balanceSheet: null,
            cashFlow: null,
            ratios: null,
            filings: [],
            insiderTrades: [],
            news: [],
            historicalPrices: [],
            recommendations: [],
            analystEstimates: [],
            priceTargets: [],
            upgradesDowngrades: [],
            earningsSurprises: [],
            peers: [],
            dcf: null,
            aiAnalysis: null,
          };

          const pulse = calculatePulseScore(pageData);

          return {
            ticker: stock.ticker,
            name: stock.name,
            slug: tickerToSlug(stock.ticker),
            sector: stock.sector,
            price: quote.price,
            change: quote.change,
            changePercent: quote.changePercent,
            marketCap: quote.marketCap,
            pe: quote.pe ?? null,
            pulseScore: pulse.total,
            grade: pulse.grade,
            sparkData: [quote.price],
          } satisfies ScreenerStock;
        } catch {
          return null;
        }
      })
    );

    results.push(
      ...(quotes.filter(Boolean) as ScreenerStock[])
    );
  }

  return results;
}

export async function GET() {
  try {
    const stocks = await batchFetch(sp500Stocks, 10);

    return NextResponse.json(
      { stocks },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300",
        },
      }
    );
  } catch (error) {
    console.error("[Screener API]", error);
    return NextResponse.json(
      { stocks: [], error: "Failed to fetch screener data" },
      { status: 500 }
    );
  }
}
