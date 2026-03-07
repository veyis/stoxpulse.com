import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "StoxPulse Free Stock Tools";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const tools = [
  "Earnings Summarizer",
  "SEC Filing Translator",
  "Stock Screener",
  "DCF Calculator",
  "Dividend Calculator",
  "Portfolio Risk Scanner",
];

export default async function Image() {
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
            "radial-gradient(circle at 50% 30%, rgba(52, 211, 153, 0.08) 0%, transparent 60%)",
        }}
      >
        {/* Title */}
        <div
          style={{
            fontSize: "56px",
            fontWeight: 700,
            color: "#f0f0f5",
            textAlign: "center",
            marginBottom: "12px",
          }}
        >
          10 Free Stock Tools
        </div>

        <div
          style={{
            fontSize: "24px",
            color: "rgba(240, 240, 245, 0.4)",
            marginBottom: "48px",
          }}
        >
          No signup required
        </div>

        {/* Tool grid */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "12px",
            maxWidth: "800px",
          }}
        >
          {tools.map((tool) => (
            <div
              key={tool}
              style={{
                display: "flex",
                padding: "10px 20px",
                borderRadius: "12px",
                backgroundColor: "rgba(52, 211, 153, 0.08)",
                border: "1px solid rgba(52, 211, 153, 0.15)",
                fontSize: "18px",
                fontWeight: 500,
                color: "#34d399",
              }}
            >
              {tool}
            </div>
          ))}
        </div>

        {/* Bottom branding */}
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
              width: "36px",
              height: "36px",
              borderRadius: "9px",
              backgroundColor: "rgba(52, 211, 153, 0.1)",
              border: "2px solid rgba(52, 211, 153, 0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </div>
          <div style={{ display: "flex", fontSize: "20px", fontWeight: 700, color: "rgba(240, 240, 245, 0.5)" }}>
            Stox<span style={{ color: "#34d399" }}>Pulse</span>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
