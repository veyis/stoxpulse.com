import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "StoxPulse — AI Stock Intelligence";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

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
        {/* Logo area */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "32px",
          }}
        >
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "14px",
              backgroundColor: "rgba(52, 211, 153, 0.1)",
              border: "2px solid rgba(52, 211, 153, 0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              width="28"
              height="28"
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
          <div style={{ display: "flex", fontSize: "48px", fontWeight: 700, color: "#f0f0f5" }}>
            Stox
            <span style={{ color: "#34d399" }}>Pulse</span>
          </div>
        </div>

        {/* Headline */}
        <div
          style={{
            fontSize: "56px",
            fontWeight: 700,
            color: "#f0f0f5",
            textAlign: "center",
            lineHeight: 1.15,
            maxWidth: "900px",
            marginBottom: "20px",
          }}
        >
          Your AI Analyst for
          <br />
          Smarter Investing
        </div>

        {/* Subline */}
        <div
          style={{
            fontSize: "24px",
            color: "rgba(240, 240, 245, 0.5)",
            textAlign: "center",
            maxWidth: "700px",
          }}
        >
          AI reads earnings calls, SEC filings, and financial news — so you don&apos;t have to.
        </div>

        {/* Stats bar */}
        <div
          style={{
            display: "flex",
            gap: "48px",
            marginTop: "48px",
            padding: "20px 40px",
            borderRadius: "16px",
            backgroundColor: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          {[
            { value: "4,000+", label: "Earnings Calls / Quarter" },
            { value: "3,000+", label: "SEC Filings / Day" },
            { value: "2 min", label: "Per Analysis" },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <div style={{ fontSize: "28px", fontWeight: 700, color: "#34d399" }}>
                {stat.value}
              </div>
              <div style={{ fontSize: "14px", color: "rgba(240,240,245,0.4)" }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
