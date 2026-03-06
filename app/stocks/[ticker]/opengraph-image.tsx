import { ImageResponse } from "next/og";
import { getStockByTicker, slugToTicker } from "@/data/stocks/sp500";

export const runtime = "edge";
export const alt = "StoxPulse Stock Analysis";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ ticker: string }>;
}) {
  const { ticker: slug } = await params;
  const ticker = slugToTicker(slug);
  const stock = getStockByTicker(ticker);

  const displayTicker = stock?.ticker ?? slug.toUpperCase();
  const displayName = stock?.name ?? "Stock Analysis";
  const displaySector = stock?.sector ?? "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0f1118",
          backgroundImage:
            "radial-gradient(circle at 50% 30%, rgba(52, 211, 153, 0.1) 0%, transparent 60%)",
        }}
      >
        {/* Ticker */}
        <div
          style={{
            fontSize: "120px",
            fontWeight: 800,
            color: "#34d399",
            lineHeight: 1,
            marginBottom: "16px",
            letterSpacing: "-2px",
          }}
        >
          {displayTicker}
        </div>

        {/* Company Name */}
        <div
          style={{
            fontSize: "36px",
            fontWeight: 600,
            color: "#f0f0f5",
            textAlign: "center",
            maxWidth: "800px",
            marginBottom: "20px",
          }}
        >
          {displayName}
        </div>

        {/* Sector Badge */}
        {displaySector && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 24px",
              borderRadius: "9999px",
              backgroundColor: "rgba(52, 211, 153, 0.1)",
              border: "1px solid rgba(52, 211, 153, 0.2)",
              marginBottom: "48px",
            }}
          >
            <div
              style={{
                fontSize: "18px",
                fontWeight: 500,
                color: "#34d399",
              }}
            >
              {displaySector}
            </div>
          </div>
        )}

        {/* Bottom bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            position: "absolute",
            bottom: "40px",
          }}
        >
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "10px",
              backgroundColor: "rgba(52, 211, 153, 0.1)",
              border: "2px solid rgba(52, 211, 153, 0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#34d399"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </div>
          <div
            style={{
              display: "flex",
              fontSize: "24px",
              fontWeight: 700,
              color: "rgba(240, 240, 245, 0.6)",
            }}
          >
            AI Analysis by Stox
            <span style={{ color: "#34d399" }}>Pulse</span>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
