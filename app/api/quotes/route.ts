import { NextResponse } from "next/server";
import { getQuote } from "@/lib/data";

const TICKER_BAR_SYMBOLS = [
  { symbol: "SPY", label: "S&P 500" },
  { symbol: "QQQ", label: "NASDAQ" },
  { symbol: "DIA", label: "DOW" },
  { symbol: "GLD", label: "Gold" },
  { symbol: "SLV", label: "Silver" },
  { symbol: "AAPL" },
  { symbol: "MSFT" },
  { symbol: "NVDA" },
  { symbol: "AMZN" },
  { symbol: "GOOGL" },
  { symbol: "META" },
  { symbol: "TSLA" },
  { symbol: "JPM" },
];

export async function GET() {
  const quotes = await Promise.all(
    TICKER_BAR_SYMBOLS.map(async ({ symbol, label }) => {
      const q = await getQuote(symbol).catch(() => null);
      return q
        ? { symbol: label ?? q.ticker, ticker: q.ticker, price: q.price, change: q.change, changePercent: q.changePercent }
        : null;
    })
  );

  return NextResponse.json(
    quotes.filter(Boolean),
    { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120" } }
  );
}
