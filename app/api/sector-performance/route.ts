import { NextResponse } from "next/server";
import { getQuote, getProfile } from "@/lib/data";

// Representative ETFs for each GICS sector
const SECTOR_ETFS: { name: string; slug: string; etf: string }[] = [
  { name: "Technology", slug: "technology", etf: "XLK" },
  { name: "Healthcare", slug: "healthcare", etf: "XLV" },
  { name: "Financials", slug: "financial-services", etf: "XLF" },
  { name: "Consumer Disc.", slug: "consumer-cyclical", etf: "XLY" },
  { name: "Communication", slug: "communication-services", etf: "XLC" },
  { name: "Industrials", slug: "industrials", etf: "XLI" },
  { name: "Consumer Staples", slug: "consumer-defensive", etf: "XLP" },
  { name: "Energy", slug: "energy", etf: "XLE" },
  { name: "Utilities", slug: "utilities", etf: "XLU" },
  { name: "Real Estate", slug: "real-estate", etf: "XLRE" },
  { name: "Materials", slug: "basic-materials", etf: "XLB" },
];

export async function GET() {
  try {
    const results = await Promise.all(
      SECTOR_ETFS.map(async (s) => {
        const [quote, profile] = await Promise.all([
          getQuote(s.etf).catch(() => null),
          getProfile(s.etf).catch(() => null),
        ]);
        return {
          name: s.name,
          slug: s.slug,
          changePercent: quote?.changePercent ?? 0,
          marketCap: profile?.marketCap ?? quote?.marketCap ?? 0,
        };
      })
    );

    return NextResponse.json(results, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=120",
      },
    });
  } catch (error) {
    console.error("[API] Sector performance error:", error);
    return NextResponse.json([], { status: 500 });
  }
}
