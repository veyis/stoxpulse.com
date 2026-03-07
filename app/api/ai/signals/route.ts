import { NextResponse } from "next/server";
import { generateAISignals } from "@/lib/ai/gemini";
import {
  getQuote,
  getProfile,
  getFinancials,
  getBalanceSheet,
  getCashFlow,
  getRatios,
  getFilings,
  getInsiderTrades,
  getNews,
  getHistoricalPrices,
  getRecommendations,
  getAnalystEstimates,
  getEarningsCalendar,
  getPriceTargets,
  getUpgradesDowngrades,
} from "@/lib/data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ticker = searchParams.get("ticker");

  if (!ticker) {
    return NextResponse.json({ error: "Ticker is required" }, { status: 400 });
  }

  try {
    // Fetch all data sources in parallel — now includes price targets & upgrades
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const [
      quote, profile, financials, balanceSheet, cashFlow, ratios,
      filings, insiderTrades, news, historicalPrices,
      recommendations, analystEstimates, earningsCalendar,
      priceTargets, upgradesDowngrades,
    ] = await Promise.all([
      getQuote(ticker).catch(() => null),
      getProfile(ticker).catch(() => null),
      getFinancials(ticker).catch(() => null),
      getBalanceSheet(ticker).catch(() => null),
      getCashFlow(ticker).catch(() => null),
      getRatios(ticker).catch(() => null),
      getFilings(ticker, 20).catch(() => []),
      getInsiderTrades(ticker, 15).catch(() => []),
      getNews(ticker, 15).catch(() => []),
      getHistoricalPrices(ticker).catch(() => []),
      getRecommendations(ticker).catch(() => []),
      getAnalystEstimates(ticker).catch(() => []),
      getEarningsCalendar(
        today.toISOString().split("T")[0],
        nextWeek.toISOString().split("T")[0]
      ).catch(() => []),
      getPriceTargets(ticker).catch(() => []),
      getUpgradesDowngrades(ticker).catch(() => []),
    ]);

    const aiAnalysis = await generateAISignals({
      ticker,
      quote,
      profile,
      financials,
      balanceSheet,
      cashFlow,
      ratios,
      filings,
      insiderTrades,
      news,
      earningsCalendar,
      historicalPrices,
      recommendations,
      analystEstimates,
      priceTargets,
      upgradesDowngrades,
    });

    if (!aiAnalysis) {
      return NextResponse.json({ error: "Failed to generate AI signals" }, { status: 500 });
    }

    return NextResponse.json(aiAnalysis);
  } catch (error) {
    console.error(`[API] AI Signals error for ${ticker}:`, error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
