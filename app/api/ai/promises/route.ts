import { NextResponse } from "next/server";
import { getPromiseTracker } from "@/lib/ai/promise-tracker";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ticker = searchParams.get("ticker");

  if (!ticker) {
    return NextResponse.json({ error: "Ticker is required" }, { status: 400 });
  }

  try {
    const tracker = await getPromiseTracker(ticker.toUpperCase());
    return NextResponse.json(tracker, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=1800",
      },
    });
  } catch (error) {
    console.error(`[API] Promise tracker error for ${ticker}:`, error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
