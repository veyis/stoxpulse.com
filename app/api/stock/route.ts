import { NextRequest, NextResponse } from "next/server";
import { getStockPageData, getActiveProviders } from "@/lib/data";

export async function GET(request: NextRequest) {
  const ticker = request.nextUrl.searchParams.get("ticker");

  if (!ticker) {
    return NextResponse.json(
      { error: "Missing ?ticker= parameter", providers: getActiveProviders() },
      { status: 400 }
    );
  }

  try {
    const data = await getStockPageData(ticker.toUpperCase());
    return NextResponse.json({
      ticker: ticker.toUpperCase(),
      providers: getActiveProviders(),
      data,
    });
  } catch (error) {
    return NextResponse.json(
      { error: String(error), providers: getActiveProviders() },
      { status: 500 }
    );
  }
}
