import { NextResponse } from "next/server";
import { sp500Stocks } from "@/data/stocks/sp500";
import { getInsiderTrades } from "@/lib/data";
import type { InsiderTransaction } from "@/lib/types/stock";

export async function GET() {
  try {
    // Take top 20 stocks from the S&P 500 list
    const tickers = sp500Stocks.slice(0, 20).map((s) => s.ticker);

    // Fetch insider trades for all tickers in parallel
    const results = await Promise.all(
      tickers.map((ticker) =>
        getInsiderTrades(ticker, 5)
          .then((trades) =>
            trades.map((t) => ({ ...t, ticker }))
          )
          .catch(() => [] as (InsiderTransaction & { ticker: string })[])
      )
    );

    // Flatten, filter out zero-value trades, sort by date desc, take top 50
    const allTrades = results
      .flat()
      .filter((t) => t.totalValue !== 0)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 50);

    return NextResponse.json(allTrades, {
      headers: { "Cache-Control": "public, s-maxage=600, stale-while-revalidate=300" },
    });
  } catch (error) {
    console.error("Insider feed error:", error);
    return NextResponse.json([], { status: 500 });
  }
}
