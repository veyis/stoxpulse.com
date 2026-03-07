import { NextRequest, NextResponse } from "next/server";

interface FMPQuote {
  symbol: string;
  price: number;
  changePercentage: number;
  change: number;
  volume: number;
  dayLow: number;
  dayHigh: number;
  yearHigh: number;
  yearLow: number;
  priceAvg50: number;
  priceAvg200: number;
  open: number;
  previousClose: number;
  timestamp: number;
}

const ALLOWED_SYMBOLS = new Set(["XAUUSD", "XAGUSD"]);

export async function GET(request: NextRequest) {
  const symbol = request.nextUrl.searchParams.get("symbol")?.toUpperCase();
  if (!symbol || !ALLOWED_SYMBOLS.has(symbol)) {
    return NextResponse.json({ error: "Invalid symbol" }, { status: 400 });
  }

  const apiKey = process.env.FMP_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "No API key" }, { status: 500 });
  }

  try {
    const res = await fetch(
      `https://financialmodelingprep.com/stable/quote?symbol=${symbol}&apikey=${apiKey}`,
      { cache: "no-store" }
    );
    if (!res.ok) return NextResponse.json({ error: "FMP error" }, { status: 502 });

    const data: FMPQuote[] = await res.json();
    if (!data?.[0]) return NextResponse.json({ error: "No data" }, { status: 404 });

    const q = data[0];
    return NextResponse.json(
      {
        symbol: q.symbol,
        price: q.price,
        change: q.change,
        changePercent: q.changePercentage,
        volume: q.volume,
        dayLow: q.dayLow,
        dayHigh: q.dayHigh,
        high52w: q.yearHigh,
        low52w: q.yearLow,
        priceAvg50: q.priceAvg50,
        priceAvg200: q.priceAvg200,
        open: q.open,
        previousClose: q.previousClose,
        timestamp: q.timestamp,
      },
      { headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60" } }
    );
  } catch {
    return NextResponse.json({ error: "Fetch failed" }, { status: 502 });
  }
}
