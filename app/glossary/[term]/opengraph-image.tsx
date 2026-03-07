import { ImageResponse } from "next/og";
import { getTermBySlug } from "@/data/glossary/terms";

export const runtime = "edge";
export const alt = "StoxPulse Financial Glossary";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ term: string }>;
}) {
  const { term: slug } = await params;
  const term = getTermBySlug(slug);

  const title = term?.term ?? slug.replace(/-/g, " ");
  const definition = term?.definition ?? "";
  // Truncate definition for the card
  const shortDef = definition.length > 140 ? definition.slice(0, 137) + "..." : definition;
  const category = term?.category ?? "Finance";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#0f1118",
          backgroundImage:
            "radial-gradient(circle at 20% 80%, rgba(52, 211, 153, 0.06) 0%, transparent 50%)",
          padding: "60px 72px",
        }}
      >
        {/* Top: category badge */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              display: "flex",
              padding: "6px 16px",
              borderRadius: "9999px",
              backgroundColor: "rgba(52, 211, 153, 0.1)",
              border: "1px solid rgba(52, 211, 153, 0.2)",
              fontSize: "15px",
              fontWeight: 600,
              color: "#34d399",
            }}
          >
            {category}
          </div>
          <div style={{ display: "flex", fontSize: "15px", color: "rgba(240, 240, 245, 0.3)" }}>
            Financial Glossary
          </div>
        </div>

        {/* Middle: term name */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div
            style={{
              fontSize: title.length > 30 ? "52px" : "64px",
              fontWeight: 800,
              color: "#f0f0f5",
              lineHeight: 1.1,
            }}
          >
            {title}
          </div>
          {shortDef && (
            <div
              style={{
                fontSize: "22px",
                color: "rgba(240, 240, 245, 0.45)",
                lineHeight: 1.4,
                maxWidth: "900px",
              }}
            >
              {shortDef}
            </div>
          )}
        </div>

        {/* Bottom: branding */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
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
