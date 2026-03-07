import { NextRequest, NextResponse } from "next/server";

const COMMODITY_SYMBOLS = new Set(["XAUUSD", "XAGUSD"]);

interface FMPQuote {
  symbol: string;
  price: number;
  change: number;
  changePercentage: number;
}

interface FMPEconomicEvent {
  date: string;
  country: string;
  event: string;
  currency: string;
  previous: number | null;
  estimate: number | null;
  actual: number | null;
  impact: string;
  unit: string;
}

// Gold-relevant event keywords
const GOLD_KEYWORDS = [
  "gold", "cpi", "inflation", "interest", "fed ", "fomc", "nonfarm", "payroll",
  "gdp", "ppi", "treasury", "employment", "jobless", "consumer sentiment",
  "consumer confidence", "retail sales", "durable goods", "pce",
];

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

  // Date range for economic calendar: today + 14 days
  const today = new Date();
  const twoWeeks = new Date(today);
  twoWeeks.setDate(twoWeeks.getDate() + 14);
  const fromDate = today.toISOString().split("T")[0];
  const toDate = twoWeeks.toISOString().split("T")[0];

  try {
    const [eurRes, gbpRes, jpyRes, chfRes, vixRes, spyRes, calRes] = await Promise.all([
      fetch(`${base}/quote?symbol=EURUSD&apikey=${apiKey}`, { cache: "no-store" }),
      fetch(`${base}/quote?symbol=GBPUSD&apikey=${apiKey}`, { cache: "no-store" }),
      fetch(`${base}/quote?symbol=USDJPY&apikey=${apiKey}`, { cache: "no-store" }),
      fetch(`${base}/quote?symbol=USDCHF&apikey=${apiKey}`, { cache: "no-store" }),
      fetch(`${base}/quote?symbol=^VIX&apikey=${apiKey}`, { cache: "no-store" }),
      fetch(`${base}/quote?symbol=SPY&apikey=${apiKey}`, { cache: "no-store" }),
      fetch(`${base}/economic-calendar?from=${fromDate}&to=${toDate}&apikey=${apiKey}`, { cache: "no-store" }),
    ]);

    const result: Record<string, unknown> = {};

    // Currency rates
    const currencies: Record<string, { rate: number; change: number }> = {};

    async function parseFx(res: Response, key: string) {
      if (res.ok) {
        const data: FMPQuote[] = await res.json();
        if (data?.[0]) {
          currencies[key] = {
            rate: data[0].price,
            change: data[0].changePercentage,
          };
        }
      }
    }

    await Promise.all([
      parseFx(eurRes, "EUR"),
      parseFx(gbpRes, "GBP"),
      parseFx(jpyRes, "JPY"),
      parseFx(chfRes, "CHF"),
    ]);

    result.currencies = currencies;

    // VIX
    if (vixRes.ok) {
      const vixData: FMPQuote[] = await vixRes.json();
      if (vixData?.[0]) {
        result.vix = {
          price: vixData[0].price,
          change: vixData[0].change,
          changePercent: vixData[0].changePercentage,
        };
      }
    }

    // SPY
    if (spyRes.ok) {
      const spyData: FMPQuote[] = await spyRes.json();
      if (spyData?.[0]) {
        result.spy = {
          price: spyData[0].price,
          change: spyData[0].change,
          changePercent: spyData[0].changePercentage,
        };
      }
    }

    // Economic calendar — filter for US, High impact, gold-relevant
    if (calRes.ok) {
      const calData: FMPEconomicEvent[] = await calRes.json();
      if (Array.isArray(calData)) {
        const goldEvents = calData
          .filter((e) => {
            if (e.country !== "US") return false;
            if (e.impact !== "High" && e.impact !== "Medium") return false;
            const lower = e.event.toLowerCase();
            return GOLD_KEYWORDS.some((kw) => lower.includes(kw)) || e.impact === "High";
          })
          .sort((a, b) => a.date.localeCompare(b.date))
          .slice(0, 12)
          .map((e) => ({
            date: e.date,
            event: e.event,
            estimate: e.estimate,
            previous: e.previous,
            actual: e.actual,
            impact: e.impact,
          }));

        result.economicEvents = goldEvents;
      }
    }

    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch {
    return NextResponse.json({ error: "Fetch failed" }, { status: 502 });
  }
}
