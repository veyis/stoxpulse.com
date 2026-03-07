import { NextRequest, NextResponse } from "next/server";
import { calculateAllTechnicals, type OHLCV } from "@/lib/technicals";

interface FMPQuote {
  symbol: string;
  price: number;
  change: number;
  changePercentage: number;
}

interface FMPNews {
  symbol: string;
  publishedDate: string;
  publisher: string;
  title: string;
  image: string;
  site: string;
  text: string;
  url: string;
}

interface FMPHistorical {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

const COMMODITY_SYMBOLS = new Set(["XAUUSD", "XAGUSD"]);
const OTHER_METAL: Record<string, string> = {
  XAUUSD: "XAGUSD",
  XAGUSD: "XAUUSD",
};

export async function GET(request: NextRequest) {
  const symbol = request.nextUrl.searchParams.get("symbol")?.toUpperCase();

  if (!symbol || !COMMODITY_SYMBOLS.has(symbol)) {
    return NextResponse.json({ error: "Invalid symbol" }, { status: 400 });
  }

  const apiKey = process.env.FMP_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "No API key" }, { status: 500 });
  }

  const base = "https://financialmodelingprep.com/stable";

  try {
    // Fetch historical prices (for calculating technicals), other metal quote, and news in parallel
    // This uses only Starter-tier endpoints — no Premium needed
    const [histRes, otherQuoteRes, newsRes] = await Promise.all([
      fetch(`${base}/historical-price-eod/full?symbol=${symbol}&apikey=${apiKey}`, { cache: "no-store" }),
      fetch(`${base}/quote?symbol=${OTHER_METAL[symbol]}&apikey=${apiKey}`, { cache: "no-store" }),
      fetch(`${base}/news/stock?symbols=${symbol}&limit=6&apikey=${apiKey}`, { cache: "no-store" }),
    ]);

    const result: Record<string, unknown> = {};

    // Calculate all technical indicators from historical price data
    if (histRes.ok) {
      const histData: FMPHistorical[] = await histRes.json();
      if (Array.isArray(histData) && histData.length > 0) {
        // Convert to OHLCV format (data is already newest-first from FMP)
        const ohlcv: OHLCV[] = histData.slice(0, 300).map((d) => ({
          date: d.date,
          open: d.open,
          high: d.high,
          low: d.low,
          close: d.close,
          volume: d.volume,
        }));

        const technicals = calculateAllTechnicals(ohlcv);

        result.rsi14 = technicals.rsi14;
        result.sma20 = technicals.sma20;
        result.sma50 = technicals.sma50;
        result.sma200 = technicals.sma200;
        result.ema9 = technicals.ema9;
        result.ema21 = technicals.ema21;
        result.ema50 = technicals.ema50;
        result.macd = technicals.macd;
        result.bollingerBands = technicals.bollingerBands;
        result.atr14 = technicals.atr14;
        result.stochastic = technicals.stochastic;
        result.pivotPoints = technicals.pivotPoints;
      }
    }

    // Other metal quote (for gold/silver ratio)
    if (otherQuoteRes.ok) {
      const quoteData: FMPQuote[] = await otherQuoteRes.json();
      if (quoteData?.[0]) {
        result.otherMetal = {
          symbol: quoteData[0].symbol,
          price: quoteData[0].price,
          change: quoteData[0].change,
          changePercent: quoteData[0].changePercentage,
        };
      }
    }

    // News
    if (newsRes.ok) {
      const newsData: FMPNews[] = await newsRes.json();
      if (Array.isArray(newsData) && newsData.length > 0) {
        result.news = newsData.map((n) => ({
          title: n.title,
          text: n.text,
          url: n.url,
          source: n.publisher || n.site,
          image: n.image,
          publishedDate: n.publishedDate,
        }));
      }
    }

    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "public, s-maxage=120, stale-while-revalidate=300",
      },
    });
  } catch {
    return NextResponse.json({ error: "Fetch failed" }, { status: 502 });
  }
}
