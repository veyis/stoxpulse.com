import { NextResponse } from "next/server";
import { getQuote } from "@/lib/data";
import { sp500Stocks, getStockByTicker } from "@/data/stocks/sp500";

// Sample top 100 stocks for movers (covers most liquid names)
const MOVER_TICKERS = sp500Stocks.slice(0, 100).map((s) => s.ticker);

export async function GET() {
  try {
    // Fetch quotes for all tickers in parallel
    const quotes = await Promise.all(
      MOVER_TICKERS.map(async (ticker) => {
        const quote = await getQuote(ticker).catch(() => null);
        if (!quote) return null;
        const stock = getStockByTicker(ticker);
        return {
          ticker,
          name: stock?.name ?? ticker,
          sector: stock?.sector ?? "",
          price: quote.price,
          change: quote.change,
          changePercent: quote.changePercent,
          volume: quote.volume ?? 0,
        };
      })
    );

    const valid = quotes.filter(Boolean) as NonNullable<(typeof quotes)[number]>[];

    // Sort by change percent
    const sorted = [...valid].sort(
      (a, b) => b.changePercent - a.changePercent
    );

    const gainers = sorted.slice(0, 10);
    const losers = sorted.slice(-10).reverse();

    // Most active by volume
    const mostActive = [...valid]
      .sort((a, b) => b.volume - a.volume)
      .slice(0, 10);

    return NextResponse.json(
      { gainers, losers, mostActive },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      }
    );
  } catch (error) {
    console.error("[API] Market movers error:", error);
    return NextResponse.json(
      { gainers: [], losers: [], mostActive: [] },
      { status: 500 }
    );
  }
}
