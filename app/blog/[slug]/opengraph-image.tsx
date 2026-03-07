import { ImageResponse } from "next/og";
import { getPostBySlug } from "@/data/blog/posts";

export const runtime = "edge";
export const alt = "StoxPulse Blog";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  const title = post?.title ?? "StoxPulse Blog";
  const category = post?.category ?? "Investing";
  const readTime = post?.readTime ?? "5 min read";
  const author = post?.author ?? "StoxPulse";

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
            "radial-gradient(circle at 80% 20%, rgba(52, 211, 153, 0.08) 0%, transparent 50%)",
          padding: "60px 72px",
        }}
      >
        {/* Top: category + read time */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              display: "flex",
              padding: "6px 18px",
              borderRadius: "9999px",
              backgroundColor: "rgba(52, 211, 153, 0.12)",
              border: "1px solid rgba(52, 211, 153, 0.25)",
              fontSize: "16px",
              fontWeight: 600,
              color: "#34d399",
            }}
          >
            {category}
          </div>
          <div style={{ display: "flex", fontSize: "16px", color: "rgba(240, 240, 245, 0.4)" }}>
            {readTime}
          </div>
        </div>

        {/* Middle: title */}
        <div
          style={{
            display: "flex",
            fontSize: title.length > 60 ? "44px" : "52px",
            fontWeight: 700,
            color: "#f0f0f5",
            lineHeight: 1.2,
            maxWidth: "950px",
          }}
        >
          {title}
        </div>

        {/* Bottom: branding + author */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
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
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
            </div>
            <div style={{ display: "flex", fontSize: "22px", fontWeight: 700, color: "rgba(240, 240, 245, 0.6)" }}>
              Stox<span style={{ color: "#34d399" }}>Pulse</span>
            </div>
          </div>
          <div style={{ display: "flex", fontSize: "16px", color: "rgba(240, 240, 245, 0.35)" }}>
            by {author}
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
