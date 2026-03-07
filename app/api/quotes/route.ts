import { NextResponse } from "next/server";

const TICKER_BAR_SYMBOLS = [
  { symbol: "SPY", label: "S&P 500" },
  { symbol: "QQQ", label: "NASDAQ" },
  { symbol: "DIA", label: "DOW" },
  { symbol: "XAUUSD", label: "Gold" },
  { symbol: "XAGUSD", label: "Silver" },
  { symbol: "AAPL" },
  { symbol: "MSFT" },
  { symbol: "NVDA" },
  { symbol: "AMZN" },
  { symbol: "GOOGL" },
  { symbol: "META" },
  { symbol: "TSLA" },
  { symbol: "JPM" },
];

interface FMPQuote {
  symbol: string;
  name: string;
  price: number;
  changePercentage: number;
  change: number;
}

export async function GET() {
  const apiKey = process.env.FMP_API_KEY;
  if (!apiKey) {
    return NextResponse.json([]);
  }

  const quotes = await Promise.all(
    TICKER_BAR_SYMBOLS.map(async ({ symbol, label }) => {
      try {
        const url = `https://financialmodelingprep.com/stable/quote?symbol=${symbol}&apikey=${apiKey}`;
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) return null;

        const data: FMPQuote[] = await res.json();
        if (!data?.[0]) return null;

        const q = data[0];
        return {
          symbol: label ?? q.symbol,
          ticker: q.symbol,
          price: q.price,
          change: q.change,
          changePercent: q.changePercentage,
        };
      } catch {
        return null;
      }
    })
  );

  return NextResponse.json(quotes.filter(Boolean), {
    headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120" },
  });
}
