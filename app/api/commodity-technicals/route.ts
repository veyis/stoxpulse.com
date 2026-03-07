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
  ema?: number;
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
    const [rsiRes, rsi4hRes, sma20Res, sma50Res, sma200Res, ema9Res, ema21Res, ema50Res, otherQuoteRes, newsRes] = await Promise.all([
      fetch(`${base}/technical-indicators/rsi?symbol=${symbol}&timeframe=1day&periodLength=14&apikey=${apiKey}`, { cache: "no-store" }),
      fetch(`${base}/technical-indicators/rsi?symbol=${symbol}&timeframe=4hour&periodLength=14&apikey=${apiKey}`, { cache: "no-store" }),
      fetch(`${base}/technical-indicators/sma?symbol=${symbol}&timeframe=1day&periodLength=20&apikey=${apiKey}`, { cache: "no-store" }),
      fetch(`${base}/technical-indicators/sma?symbol=${symbol}&timeframe=1day&periodLength=50&apikey=${apiKey}`, { cache: "no-store" }),
      fetch(`${base}/technical-indicators/sma?symbol=${symbol}&timeframe=1day&periodLength=200&apikey=${apiKey}`, { cache: "no-store" }),
      fetch(`${base}/technical-indicators/ema?symbol=${symbol}&timeframe=1day&periodLength=9&apikey=${apiKey}`, { cache: "no-store" }),
      fetch(`${base}/technical-indicators/ema?symbol=${symbol}&timeframe=1day&periodLength=21&apikey=${apiKey}`, { cache: "no-store" }),
      fetch(`${base}/technical-indicators/ema?symbol=${symbol}&timeframe=1day&periodLength=50&apikey=${apiKey}`, { cache: "no-store" }),
      fetch(`${base}/quote?symbol=${OTHER_METAL[symbol]}&apikey=${apiKey}`, { cache: "no-store" }),
      fetch(`${base}/news/stock?symbols=${symbol}&limit=6&apikey=${apiKey}`, { cache: "no-store" }),
    ]);

    const result: Record<string, unknown> = {};

    // RSI — just the latest value
    if (rsiRes.ok) {
      const rsiData: FMPTechnical[] = await rsiRes.json();
      if (rsiData?.[0]?.rsi != null) {
        result.rsi14 = rsiData[0].rsi;
      }
    }

    // RSI 4-hour
    if (rsi4hRes.ok) {
      const rsi4hData: FMPTechnical[] = await rsi4hRes.json();
      if (rsi4hData?.[0]?.rsi != null) {
        result.rsi4h = rsi4hData[0].rsi;
      }
    }

    // SMA 20 — just the latest value
    if (sma20Res.ok) {
      const smaData: FMPTechnical[] = await sma20Res.json();
      if (smaData?.[0]?.sma != null) {
        result.sma20 = smaData[0].sma;
      }
    }

    // SMA 50 (from API, more accurate than quote's priceAvg50)
    if (sma50Res.ok) {
      const sma50Data: FMPTechnical[] = await sma50Res.json();
      if (sma50Data?.[0]?.sma != null) {
        result.sma50 = sma50Data[0].sma;
      }
    }

    // SMA 200 (from API, more accurate than quote's priceAvg200)
    if (sma200Res.ok) {
      const sma200Data: FMPTechnical[] = await sma200Res.json();
      if (sma200Data?.[0]?.sma != null) {
        result.sma200 = sma200Data[0].sma;
      }
    }

    // EMA 9
    if (ema9Res.ok) {
      const ema9Data: FMPTechnical[] = await ema9Res.json();
      if (ema9Data?.[0]?.ema != null) {
        result.ema9 = ema9Data[0].ema;
      }
    }

    // EMA 21
    if (ema21Res.ok) {
      const ema21Data: FMPTechnical[] = await ema21Res.json();
      if (ema21Data?.[0]?.ema != null) {
        result.ema21 = ema21Data[0].ema;
      }
    }

    // EMA 50
    if (ema50Res.ok) {
      const ema50Data: FMPTechnical[] = await ema50Res.json();
      if (ema50Data?.[0]?.ema != null) {
        result.ema50 = ema50Data[0].ema;
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
