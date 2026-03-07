import { NextResponse } from "next/server";
import { getQuote, getProfile } from "@/lib/data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ticker = searchParams.get("ticker");
  const investment = parseFloat(searchParams.get("investment") ?? "10000");
  const years = parseInt(searchParams.get("years") ?? "10", 10);
  const growthRate = parseFloat(searchParams.get("growthRate") ?? "5") / 100;
  const drip = searchParams.get("drip") !== "false";

  if (!ticker) {
    return NextResponse.json({ error: "Ticker is required" }, { status: 400 });
  }

  try {
    const [quote, profile] = await Promise.all([
      getQuote(ticker).catch(() => null),
      getProfile(ticker).catch(() => null),
    ]);

    if (!quote || !quote.price) {
      return NextResponse.json({ error: `Could not find data for ${ticker}` }, { status: 404 });
    }

    const price = quote.price;
    const dividendYield = profile?.lastDividend
      ? (profile.lastDividend / price) * 100
      : 0;
    const annualDividendPerShare = profile?.lastDividend ?? 0;

    if (annualDividendPerShare === 0) {
      return NextResponse.json(
        { error: `${ticker} does not currently pay a dividend` },
        { status: 400 }
      );
    }

    const sharesOwned = investment / price;
    const annualIncome = sharesOwned * annualDividendPerShare;
    const monthlyIncome = annualIncome / 12;

    // Generate projections
    const projections = [];
    let currentShares = sharesOwned;
    let currentDividendPerShare = annualDividendPerShare;
    let totalDividends = 0;

    for (let y = 1; y <= Math.min(years, 30); y++) {
      const yearIncome = currentShares * currentDividendPerShare;
      totalDividends += yearIncome;

      if (drip) {
        // Reinvest dividends at current price (simplified — no price appreciation)
        currentShares += yearIncome / price;
      }

      projections.push({
        year: y,
        shares: currentShares,
        annualIncome: yearIncome,
        totalDividends,
        totalValue: currentShares * price,
      });

      // Grow dividend
      currentDividendPerShare *= 1 + growthRate;
    }

    return NextResponse.json(
      {
        ticker,
        price,
        dividendYield,
        annualDividend: annualDividendPerShare,
        sharesOwned,
        annualIncome,
        monthlyIncome,
        projections,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=120",
        },
      }
    );
  } catch (error) {
    console.error(`[Dividend Calc] Error for ${ticker}:`, error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
