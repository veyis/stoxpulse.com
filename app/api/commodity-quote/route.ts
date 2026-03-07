import { NextRequest, NextResponse } from "next/server";

interface FMPQuote {
  symbol: string;
  name: string;
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

interface FMPHistorical {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// Commodity symbols + related ETFs we allow
const ALLOWED_SYMBOLS = new Set([
  "XAUUSD", "XAGUSD",
  "GLD", "IAU", "GDX", "GDXJ",
  "SLV", "SIVR", "SIL",
]);

export async function GET(request: NextRequest) {
  const symbol = request.nextUrl.searchParams.get("symbol")?.toUpperCase();
  const includeHistory = request.nextUrl.searchParams.get("history") === "1";

  if (!symbol || !ALLOWED_SYMBOLS.has(symbol)) {
    return NextResponse.json({ error: "Invalid symbol" }, { status: 400 });
  }

  const apiKey = process.env.FMP_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "No API key" }, { status: 500 });
  }

  try {
    // Fetch quote and optionally historical prices in parallel
    const fetches: Promise<Response>[] = [
      fetch(
        `https://financialmodelingprep.com/stable/quote?symbol=${symbol}&apikey=${apiKey}`,
        { cache: "no-store" }
      ),
    ];

    if (includeHistory) {
      fetches.push(
        fetch(
          `https://financialmodelingprep.com/stable/historical-price-eod/full?symbol=${symbol}&apikey=${apiKey}`,
          { cache: "no-store" }
        )
      );
    }

    const responses = await Promise.all(fetches);

    // Parse quote
    if (!responses[0].ok) return NextResponse.json({ error: "FMP quote error" }, { status: 502 });
    const quoteData: FMPQuote[] = await responses[0].json();
    if (!quoteData?.[0]) return NextResponse.json({ error: "No quote data" }, { status: 404 });

    const q = quoteData[0];
    const result: Record<string, unknown> = {
      symbol: q.symbol,
      name: q.name,
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
    };

    // Parse historical prices if requested
    if (includeHistory && responses[1]?.ok) {
      const histData: FMPHistorical[] = await responses[1].json();
      if (Array.isArray(histData)) {
        result.historicalPrices = histData.slice(0, 1400).map((d) => ({
          date: d.date,
          open: d.open,
          high: d.high,
          low: d.low,
          close: d.close,
          volume: d.volume,
        }));
      }
    }

    return NextResponse.json(result, {
      headers: {
        "Cache-Control": includeHistory
          ? "public, s-maxage=300, stale-while-revalidate=600"
          : "public, s-maxage=30, stale-while-revalidate=60",
      },
    });
  } catch {
    return NextResponse.json({ error: "Fetch failed" }, { status: 502 });
  }
}
