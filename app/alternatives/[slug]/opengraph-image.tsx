import { ImageResponse } from "next/og";
import { competitors } from "@/data/competitors";

export const runtime = "edge";
export const alt = "StoxPulse Alternatives";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

function parseAltSlug(slug: string): string {
  return slug.replace(/-alternatives$/, "");
}

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const competitorSlug = parseAltSlug(slug);
  const competitor = competitors.find((c) => c.slug === competitorSlug);

  const name = competitor?.name ?? competitorSlug.replace(/-/g, " ");

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
        <div
          style={{
            fontSize: "28px",
            color: "rgba(240, 240, 245, 0.4)",
            marginBottom: "16px",
          }}
        >
          Top Alternatives to
        </div>

        <div
          style={{
            fontSize: "64px",
            fontWeight: 800,
            color: "#f0f0f5",
            textAlign: "center",
            marginBottom: "24px",
          }}
        >
          {name}
        </div>

        <div
          style={{
            display: "flex",
            padding: "10px 28px",
            borderRadius: "12px",
            backgroundColor: "rgba(52, 211, 153, 0.1)",
            border: "1px solid rgba(52, 211, 153, 0.2)",
            fontSize: "20px",
            fontWeight: 600,
            color: "#34d399",
          }}
        >
          2026 Comparison Guide
        </div>

        {/* Bottom branding */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            position: "absolute",
            bottom: "36px",
          }}
        >
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              backgroundColor: "rgba(52, 211, 153, 0.1)",
              border: "2px solid rgba(52, 211, 153, 0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </div>
          <div style={{ display: "flex", fontSize: "18px", fontWeight: 700, color: "rgba(240, 240, 245, 0.4)" }}>
            stoxpulse.com
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
