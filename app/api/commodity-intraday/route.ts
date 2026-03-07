import { NextRequest, NextResponse } from "next/server";

const COMMODITY_SYMBOLS = new Set(["XAUUSD", "XAGUSD"]);

export async function GET(request: NextRequest) {
  const symbol = request.nextUrl.searchParams.get("symbol")?.toUpperCase();

  if (!symbol || !COMMODITY_SYMBOLS.has(symbol)) {
    return NextResponse.json({ error: "Invalid symbol" }, { status: 400 });
  }

  const apiKey = process.env.FMP_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "No API key" }, { status: 500 });
  }

  try {
    // Fetch 1-hour candles (covers ~78 days)
    const res = await fetch(
      `https://financialmodelingprep.com/stable/historical-chart/1hour?symbol=${symbol}&apikey=${apiKey}`,
      { cache: "no-store" }
    );

    if (!res.ok) {
      return NextResponse.json({ error: "FMP error" }, { status: 502 });
    }

    const data: { date: string; open: number; high: number; low: number; close: number; volume: number }[] = await res.json();

    if (!Array.isArray(data) || data.length === 0) {
      return NextResponse.json({ error: "No intraday data" }, { status: 404 });
    }

    // Return all hourly bars (most recent first from API)
    const result = data.map((d) => ({
      date: d.date,
      open: d.open,
      high: d.high,
      low: d.low,
      close: d.close,
      volume: d.volume,
    }));

    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
      },
    });
  } catch {
    return NextResponse.json({ error: "Fetch failed" }, { status: 502 });
  }
}
