import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Script from "next/script";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://stoxpulse.com"),
  title: {
    default:
      "StoxPulse — AI Earnings Call & SEC Filing Analysis",
    template: "%s | StoxPulse",
  },
  description:
    "AI-powered stock intelligence. StoxPulse reads earnings calls, analyzes SEC filings, and scores news for your watchlist — invest on insight, not headlines.",
  keywords: [
    "earnings call summary",
    "10-K filing analyzer",
    "SEC filing monitor",
    "AI stock analysis",
    "earnings call analyzer",
    "stock intelligence platform",
    "AI investing tool",
    "financial news monitor",
    "stock watchlist alerts",
    "earnings transcript analysis",
    "quarterly earnings insights",
    "retail investor tools",
  ],
  authors: [{ name: "StoxPulse", url: "https://stoxpulse.com" }],
  creator: "StoxPulse",
  publisher: "StoxPulse",
  openGraph: {
    title: "StoxPulse — The AI Research Analyst Serious Investors Wish They Could Afford",
    description:
      "AI reads every earnings call, analyzes every SEC filing, and scores every piece of news for your watchlist. Institutional-grade intelligence for $29/month, not $500K/year.",
    type: "website",
    url: "https://stoxpulse.com",
    siteName: "StoxPulse",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "StoxPulse — AI Stock Intelligence for Serious Investors",
    description:
      "The research analyst serious investors wish they could afford. AI-powered earnings call analysis, SEC filing intelligence, and news sentiment scoring.",
    creator: "@stoxpulse",
  },
  alternates: {
    canonical: "https://stoxpulse.com",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "googleb238538e402fae05",
  },
  category: "finance",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <head>
        {/* GA4 */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-MCY92DS3FJ"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
   
            gtag('config', 'G-MCY92DS3FJ');
          `}
        </Script>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("theme");if(t==="dark"){document.documentElement.classList.add("dark")}}catch(e){}})()`,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "StoxPulse",
              url: "https://stoxpulse.com",
              logo: "https://stoxpulse.com/images/related/logo1.png",
              description:
                "AI-powered stock intelligence platform that reads earnings calls, analyzes SEC filings, and scores financial news for retail investors.",
              sameAs: [
                "https://x.com/stoxpulse",
              ],
              foundingDate: "2026",
              contactPoint: {
                "@type": "ContactPoint",
                contactType: "customer support",
                url: "https://stoxpulse.com",
              },
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "StoxPulse",
              url: "https://stoxpulse.com",
              potentialAction: {
                "@type": "SearchAction",
                target: {
                  "@type": "EntryPoint",
                  urlTemplate:
                    "https://stoxpulse.com/stocks/{search_term_string}",
                },
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
      </head>
      <body className={`${inter.variable} ${spaceGrotesk.variable}`}>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
