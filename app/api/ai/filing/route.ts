import { NextResponse } from "next/server";
import { analyzeFilingContent } from "@/lib/ai/filing-analyzer";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { ticker, filingType, filingDate, content } = body;

    if (!ticker || !filingType || !content) {
      return NextResponse.json(
        { error: "ticker, filingType, and content are required" },
        { status: 400 }
      );
    }

    const analysis = await analyzeFilingContent(
      ticker,
      filingType,
      filingDate ?? new Date().toISOString().split("T")[0],
      content
    );

    if (!analysis) {
      return NextResponse.json(
        { error: "Failed to analyze filing. AI features require a Gemini API key." },
        { status: 503 }
      );
    }

    return NextResponse.json(analysis, {
      headers: {
        "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=43200",
      },
    });
  } catch (error) {
    console.error("[API] Filing analysis error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
