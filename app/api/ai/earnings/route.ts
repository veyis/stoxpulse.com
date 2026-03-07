import { NextRequest, NextResponse } from "next/server";
import { getTranscript } from "@/lib/data";
import { analyzeEarningsCall } from "@/lib/ai/earnings-analyzer";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const ticker = searchParams.get("ticker")?.toUpperCase();
  const quarter = parseInt(searchParams.get("quarter") ?? "0");
  const year = parseInt(searchParams.get("year") ?? "0");

  if (!ticker || !quarter || !year) {
    return NextResponse.json(
      { error: "Missing required params: ticker, quarter, year" },
      { status: 400 }
    );
  }

  // Fetch transcript
  const transcript = await getTranscript(ticker, quarter, year);
  if (!transcript?.content) {
    return NextResponse.json(
      { error: "Transcript not available", ticker, quarter, year },
      { status: 404 }
    );
  }

  // Run AI analysis
  const analysis = await analyzeEarningsCall(ticker, quarter, year, transcript.content);
  if (!analysis) {
    return NextResponse.json(
      { error: "AI analysis failed", ticker, quarter, year },
      { status: 500 }
    );
  }

  return NextResponse.json(analysis, {
    headers: {
      "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
    },
  });
}
