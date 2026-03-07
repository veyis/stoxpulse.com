import { NextRequest, NextResponse } from "next/server";

interface FMPTechnical {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  rsi?: number;
  sma?: number;
}

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
    const [rsiRes, sma20Res, otherQuoteRes, newsRes] = await Promise.all([
      fetch(
        `${base}/technical-indicators/rsi?symbol=${symbol}&timeframe=1day&periodLength=14&apikey=${apiKey}`,
        { cache: "no-store" }
      ),
      fetch(
        `${base}/technical-indicators/sma?symbol=${symbol}&timeframe=1day&periodLength=20&apikey=${apiKey}`,
        { cache: "no-store" }
      ),
      fetch(
        `${base}/quote?symbol=${OTHER_METAL[symbol]}&apikey=${apiKey}`,
        { cache: "no-store" }
      ),
      fetch(
        `${base}/news/stock?symbols=${symbol}&limit=6&apikey=${apiKey}`,
        { cache: "no-store" }
      ),
    ]);

    const result: Record<string, unknown> = {};

    // RSI — just the latest value
    if (rsiRes.ok) {
      const rsiData: FMPTechnical[] = await rsiRes.json();
      if (rsiData?.[0]?.rsi != null) {
        result.rsi14 = rsiData[0].rsi;
      }
    }

    // SMA 20 — just the latest value
    if (sma20Res.ok) {
      const smaData: FMPTechnical[] = await sma20Res.json();
      if (smaData?.[0]?.sma != null) {
        result.sma20 = smaData[0].sma;
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
