import { NextRequest, NextResponse } from "next/server";
import { analyzeEarningsCall } from "@/lib/ai/earnings-analyzer";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { transcript, ticker } = body as {
      transcript?: string;
      ticker?: string;
    };

    if (!transcript || typeof transcript !== "string") {
      return NextResponse.json(
        { error: "Missing required field: transcript" },
        { status: 400 }
      );
    }

    if (transcript.length < 500) {
      return NextResponse.json(
        {
          error:
            "Transcript too short. Please paste at least 500 characters of transcript text.",
        },
        { status: 400 }
      );
    }

    const resolvedTicker = ticker?.toUpperCase() || "UNKNOWN";

    // Use quarter 0 and year 0 as sentinel values for pasted transcripts
    // This avoids cache collisions with real ticker lookups
    const analysis = await analyzeEarningsCall(
      resolvedTicker,
      0,
      0,
      transcript
    );

    if (!analysis) {
      return NextResponse.json(
        { error: "AI analysis failed. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json(analysis);
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}
