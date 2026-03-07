import { NextResponse } from "next/server";
import { getQuote, getFinancials, getCashFlow } from "@/lib/data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ticker = searchParams.get("ticker");
  const growthRate = parseFloat(searchParams.get("growthRate") ?? "10") / 100;
  const discountRate = parseFloat(searchParams.get("discountRate") ?? "10") / 100;
  const terminalGrowth = parseFloat(searchParams.get("terminalGrowth") ?? "3") / 100;
  const years = parseInt(searchParams.get("years") ?? "5", 10);

  if (!ticker) {
    return NextResponse.json({ error: "Ticker is required" }, { status: 400 });
  }

  if (discountRate <= terminalGrowth) {
    return NextResponse.json(
      { error: "Discount rate must be greater than terminal growth rate" },
      { status: 400 }
    );
  }

  try {
    const [quote, financials, cashFlow] = await Promise.all([
      getQuote(ticker).catch(() => null),
      getFinancials(ticker).catch(() => null),
      getCashFlow(ticker).catch(() => null),
    ]);

    if (!quote?.price) {
      return NextResponse.json({ error: `Could not find data for ${ticker}` }, { status: 404 });
    }

    // Get the most recent FCF
    const latestCF = cashFlow?.annual?.[0] ?? financials?.annual?.[0];
    let baseFCF = latestCF?.freeCashFlow ?? null;

    // Fallback: estimate FCF from operating cash flow - capex
    if (!baseFCF && latestCF) {
      const ocf = latestCF.operatingCashFlow ?? 0;
      const capex = latestCF.capitalExpenditures ?? 0;
      baseFCF = ocf - capex;
    }

    if (!baseFCF || baseFCF <= 0) {
      return NextResponse.json(
        { error: `${ticker} does not have positive free cash flow for DCF analysis` },
        { status: 400 }
      );
    }

    const sharesOutstanding = latestCF?.sharesOutstanding ?? quote.marketCap / quote.price;

    // Project FCF
    const projectedFCF: number[] = [];
    let currentFCF = baseFCF;
    for (let i = 0; i < years; i++) {
      currentFCF *= (1 + growthRate);
      projectedFCF.push(currentFCF);
    }

    // Calculate PV of projected FCFs
    let pvFCF = 0;
    for (let i = 0; i < projectedFCF.length; i++) {
      pvFCF += projectedFCF[i] / Math.pow(1 + discountRate, i + 1);
    }

    // Terminal value (Gordon Growth Model)
    const terminalFCF = projectedFCF[projectedFCF.length - 1] * (1 + terminalGrowth);
    const terminalValue = terminalFCF / (discountRate - terminalGrowth);
    const pvTerminal = terminalValue / Math.pow(1 + discountRate, years);

    const enterpriseValue = pvFCF + pvTerminal;
    const intrinsicValue = enterpriseValue / sharesOutstanding;
    const upside = ((intrinsicValue - quote.price) / quote.price) * 100;

    // Sensitivity analysis: vary growth ±4% and discount ±2%
    const growthRates = [
      growthRate - 0.04, growthRate - 0.02, growthRate,
      growthRate + 0.02, growthRate + 0.04,
    ];
    const discountRates = [
      discountRate - 0.02, discountRate - 0.01, discountRate,
      discountRate + 0.01, discountRate + 0.02,
    ];

    const sensitivity = growthRates.map((gr) => ({
      growthRate: Math.round(gr * 100),
      values: discountRates.map((dr) => {
        if (dr <= terminalGrowth) return { discountRate: Math.round(dr * 100), value: 0 };
        let pv = 0;
        let fcf = baseFCF;
        for (let i = 0; i < years; i++) {
          fcf *= (1 + gr);
          pv += fcf / Math.pow(1 + dr, i + 1);
        }
        const tv = fcf * (1 + terminalGrowth) / (dr - terminalGrowth);
        pv += tv / Math.pow(1 + dr, years);
        return {
          discountRate: Math.round(dr * 100),
          value: pv / sharesOutstanding,
        };
      }),
    }));

    return NextResponse.json(
      {
        ticker,
        currentPrice: quote.price,
        intrinsicValue,
        upside,
        fcfPerShare: baseFCF / sharesOutstanding,
        sharesOutstanding,
        projectedFCF,
        terminalValue,
        enterpriseValue,
        sensitivity,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=120",
        },
      }
    );
  } catch (error) {
    console.error(`[DCF Calc] Error for ${ticker}:`, error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
