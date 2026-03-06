import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "StoxPulse — AI Stock Intelligence",
    short_name: "StoxPulse",
    description:
      "AI-powered stock intelligence that analyzes earnings calls, SEC filings, and financial news for your watchlist.",
    start_url: "/",
    display: "standalone",
    background_color: "#0f1118",
    theme_color: "#34d399",
    icons: [
      {
        src: "/icons/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
