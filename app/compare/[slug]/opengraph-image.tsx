import { ImageResponse } from "next/og";
import { competitors } from "@/data/competitors";

export const runtime = "edge";
export const alt = "StoxPulse Comparison";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

function parseCompetitorSlug(slug: string): string {
  return slug.replace(/^stoxpulse-vs-/, "");
}

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const competitorSlug = parseCompetitorSlug(slug);
  const competitor = competitors.find((c) => c.slug === competitorSlug);

  const competitorName = competitor?.name ?? slug.replace(/-/g, " ");

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
            "radial-gradient(circle at 30% 40%, rgba(52, 211, 153, 0.1) 0%, transparent 40%), radial-gradient(circle at 70% 40%, rgba(99, 102, 241, 0.08) 0%, transparent 40%)",
        }}
      >
        {/* VS Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "40px",
            marginBottom: "40px",
          }}
        >
          {/* StoxPulse side */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "20px",
                backgroundColor: "rgba(52, 211, 153, 0.1)",
                border: "2px solid rgba(52, 211, 153, 0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
            </div>
            <div style={{ display: "flex", fontSize: "28px", fontWeight: 700, color: "#f0f0f5" }}>
              Stox<span style={{ color: "#34d399" }}>Pulse</span>
            </div>
          </div>

          {/* VS Badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "56px",
              height: "56px",
              borderRadius: "9999px",
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              fontSize: "22px",
              fontWeight: 800,
              color: "rgba(240, 240, 245, 0.5)",
            }}
          >
            VS
          </div>

          {/* Competitor side */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "20px",
                backgroundColor: "rgba(99, 102, 241, 0.1)",
                border: "2px solid rgba(99, 102, 241, 0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "36px",
                fontWeight: 800,
                color: "#818cf8",
              }}
            >
              {competitorName.charAt(0)}
            </div>
            <div style={{ display: "flex", fontSize: "28px", fontWeight: 700, color: "#f0f0f5" }}>
              {competitorName}
            </div>
          </div>
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: "24px",
            color: "rgba(240, 240, 245, 0.4)",
            textAlign: "center",
          }}
        >
          In-Depth Comparison for 2026
        </div>

        {/* Bottom branding */}
        <div
          style={{
            display: "flex",
            position: "absolute",
            bottom: "36px",
            fontSize: "16px",
            color: "rgba(240, 240, 245, 0.25)",
          }}
        >
          stoxpulse.com
        </div>
      </div>
    ),
    { ...size }
  );
}
