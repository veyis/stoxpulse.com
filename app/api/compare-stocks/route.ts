import { NextResponse } from "next/server";
import { getQuote, getProfile } from "@/lib/data";
import type { StockPageData } from "@/lib/data";
import { calculatePulseScore } from "@/lib/pulse-score";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const raw = searchParams.get("tickers");

  if (!raw) {
    return NextResponse.json(
      { error: "tickers query param is required (comma-separated, 2-5)" },
      { status: 400 },
    );
  }

  const tickers = raw
    .split(",")
    .map((t) => t.trim().toUpperCase())
    .filter(Boolean);

  if (tickers.length < 2 || tickers.length > 5) {
    return NextResponse.json(
      { error: "Provide between 2 and 5 tickers" },
      { status: 400 },
    );
  }

  try {
    // Fetch quote + profile for every ticker in parallel
    const results = await Promise.all(
      tickers.map(async (ticker) => {
        const [quote, profile] = await Promise.all([
          getQuote(ticker).catch(() => null),
          getProfile(ticker).catch(() => null),
        ]);
        return { ticker, quote, profile };
      }),
    );

    // Build response array
    const stocks = results.map(({ ticker, quote, profile }) => {
      // Build minimal StockPageData for pulse score
      const pageData: StockPageData = {
        quote,
        profile,
        financials: null,
        balanceSheet: null,
        cashFlow: null,
        ratios: null,
        filings: [],
        insiderTrades: [],
        news: [],
        historicalPrices: [],
        recommendations: [],
        analystEstimates: [],
        priceTargets: [],
        upgradesDowngrades: [],
        earningsSurprises: [],
        peers: [],
        dcf: null,
        aiAnalysis: null,
      };

      const pulseScore = calculatePulseScore(pageData);

      const divYield =
        profile?.lastDividend && quote?.price
          ? (profile.lastDividend / quote.price) * 100
          : null;

      return {
        ticker,
        name: profile?.name ?? ticker,
        sector: profile?.sector ?? "N/A",
        price: quote?.price ?? null,
        change: quote?.change ?? null,
        changePercent: quote?.changePercent ?? null,
        marketCap: quote?.marketCap ?? profile?.marketCap ?? null,
        pe: quote?.pe ?? null,
        eps: quote?.eps ?? null,
        divYield,
        high52w: quote?.high52w ?? null,
        low52w: quote?.low52w ?? null,
        beta: profile?.beta ?? null,
        pulseScore: pulseScore.total,
        grade: pulseScore.grade,
        dimensions: pulseScore.dimensions.map((d) => ({
          name: d.name,
          score: d.score,
        })),
      };
    });

    // Filter out stocks with no data at all
    const valid = stocks.filter((s) => s.price !== null);
    if (valid.length < 2) {
      return NextResponse.json(
        { error: "Could not fetch data for enough tickers. Check symbols and try again." },
        { status: 404 },
      );
    }

    // AI Verdict (optional — only if GEMINI_API_KEY is set)
    let aiVerdict: string | null = null;
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && valid.length >= 2) {
      try {
        const summaryLines = valid.map(
          (s) =>
            `${s.ticker} (${s.name}): Price $${s.price}, P/E ${s.pe ?? "N/A"}, EPS ${s.eps ?? "N/A"}, Mkt Cap ${s.marketCap ? `$${(s.marketCap / 1e9).toFixed(1)}B` : "N/A"}, Div Yield ${s.divYield ? `${s.divYield.toFixed(2)}%` : "N/A"}, Beta ${s.beta ?? "N/A"}, Pulse Score ${s.pulseScore}/100 (${s.grade}), Sector: ${s.sector}`,
        );
        const prompt = `You are a concise stock analyst. Compare these stocks in 2-3 sentences for a retail investor. Mention which is better for value, growth, or income if applicable. Be specific with numbers. Do NOT use markdown.\n\n${summaryLines.join("\n")}`;

        const { GoogleGenAI } = await import("@google/genai");
        const ai = new GoogleGenAI({ apiKey });
        const result = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt,
          config: { temperature: 0.3, maxOutputTokens: 200 },
        });
        aiVerdict = result.text ?? null;
      } catch (err) {
        console.error("[Compare Stocks] AI verdict error:", err);
        // Non-fatal — just return null
      }
    }

    return NextResponse.json(
      { stocks: valid, aiVerdict },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=120",
        },
      },
    );
  } catch (error) {
    console.error("[Compare Stocks] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
