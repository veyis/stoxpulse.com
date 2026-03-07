import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/landing/footer";
import {
  getAllSectors,
  getStocksBySector,
  sectorToSlug,
  slugToSector,
  tickerToSlug,
} from "@/data/stocks/sp500";
import { SectorOverview } from "@/components/stocks/sector-overview";

export function generateStaticParams() {
  return getAllSectors().map((sector) => ({
    sector: sectorToSlug(sector),
  }));
}

type Props = {
  params: Promise<{ sector: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { sector: slug } = await params;
  const sector = slugToSector(slug);

  if (!sector) {
    return { title: "Sector Not Found" };
  }

  const stocks = getStocksBySector(sector);

  return {
    title: `${sector} Stocks — AI Analysis | StoxPulse`,
    description: `AI-powered stock analysis for ${stocks.length} ${sector} companies. Read AI-generated earnings call summaries, SEC filing analysis, and sentiment tracking for ${sector} stocks including ${stocks
      .slice(0, 3)
      .map((s) => s.ticker)
      .join(", ")}, and more.`,
    keywords: [
      `${sector} stocks`,
      `${sector} stock analysis`,
      `${sector} sector outlook`,
      `best ${sector} stocks`,
      `${sector} earnings analysis`,
      `${sector} sector stocks list`,
      `AI ${sector.toLowerCase()} stock analysis`,
    ],
    alternates: {
      canonical: `https://stoxpulse.com/stocks/sector/${sectorToSlug(sector)}`,
    },
    openGraph: {
      title: `${sector} Stocks — AI Analysis | StoxPulse`,
      description: `AI-powered analysis for ${stocks.length} ${sector} companies including ${stocks.slice(0, 3).map((s) => s.ticker).join(", ")}.`,
      url: `https://stoxpulse.com/stocks/sector/${sectorToSlug(sector)}`,
    },
  };
}

export default async function SectorPage({ params }: Props) {
  const { sector: slug } = await params;
  const sector = slugToSector(slug);

  if (!sector) {
    notFound();
  }

  const stocks = getStocksBySector(sector);

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://stoxpulse.com",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Stocks",
        item: "https://stoxpulse.com/stocks",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: sector,
        item: `https://stoxpulse.com/stocks/sector/${sectorToSlug(sector)}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema),
        }}
      />
      <Navbar />
      <main className="min-h-screen bg-background pt-24 pb-16">
        <div className="mx-auto max-w-7xl px-6">
          {/* Breadcrumbs */}
          <nav aria-label="Breadcrumb" className="mb-8">
            <ol className="flex items-center gap-2 text-sm text-muted-foreground">
              <li>
                <Link
                  href="/"
                  className="hover:text-foreground transition-colors duration-200"
                >
                  Home
                </Link>
              </li>
              <li>
                <ChevronRight className="size-3.5" />
              </li>
              <li>
                <Link
                  href="/stocks"
                  className="hover:text-foreground transition-colors duration-200"
                >
                  Stocks
                </Link>
              </li>
              <li>
                <ChevronRight className="size-3.5" />
              </li>
              <li className="text-foreground font-medium">{sector}</li>
            </ol>
          </nav>

          {/* Header */}
          <div className="mb-10">
            <h1 className="font-display text-4xl font-bold tracking-tight text-foreground md:text-5xl">
              {sector} Stocks
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-muted-foreground leading-relaxed">
              AI-powered analysis for {stocks.length} {sector} companies.
              StoxPulse reads earnings calls, SEC filings, and monitors news
              sentiment for each stock below.
            </p>
          </div>

          {/* Enhanced Sector Overview */}
          <SectorOverview
            sector={sector}
            stocks={stocks.map((s) => ({
              ticker: s.ticker,
              name: s.name,
              industry: s.industry,
              slug: tickerToSlug(s.ticker),
            }))}
          />

          {/* Related Tools */}
          <section className="mt-12 rounded-2xl border border-border bg-surface-1 p-6">
            <h2 className="font-display text-lg font-semibold text-foreground mb-3">
              Analyze {sector} Stocks
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Use our free tools to dive deeper into {sector} companies.
            </p>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/tools/stock-screener"
                className="inline-flex items-center gap-1.5 rounded-lg bg-surface-2 border border-border px-3 py-2 text-xs font-medium text-foreground hover:border-brand/30 hover:text-brand transition-colors"
              >
                Stock Screener
                <ChevronRight className="size-3" />
              </Link>
              <Link
                href="/tools/compare-stocks"
                className="inline-flex items-center gap-1.5 rounded-lg bg-surface-2 border border-border px-3 py-2 text-xs font-medium text-foreground hover:border-brand/30 hover:text-brand transition-colors"
              >
                Compare Stocks
                <ChevronRight className="size-3" />
              </Link>
              <Link
                href="/tools/earnings-calendar"
                className="inline-flex items-center gap-1.5 rounded-lg bg-surface-2 border border-border px-3 py-2 text-xs font-medium text-foreground hover:border-brand/30 hover:text-brand transition-colors"
              >
                Earnings Calendar
                <ChevronRight className="size-3" />
              </Link>
            </div>
          </section>

          {/* Other Sectors */}
          <section className="mt-12">
            <h2 className="font-display text-xl font-semibold text-foreground mb-4">
              Browse Other Sectors
            </h2>
            <div className="flex flex-wrap gap-2">
              {getAllSectors()
                .filter((s) => s !== sector)
                .map((s) => {
                  const count = getStocksBySector(s).length;
                  return (
                    <Link
                      key={s}
                      href={`/stocks/sector/${sectorToSlug(s)}`}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface-1 px-4 py-2 text-sm text-muted-foreground transition-all hover:border-brand/30 hover:text-foreground"
                    >
                      {s}
                      <span className="text-xs text-muted-foreground/60">({count})</span>
                      <ChevronRight className="size-3.5" />
                    </Link>
                  );
                })}
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
