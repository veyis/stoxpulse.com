interface StockInfo {
  ticker: string;
  name: string;
  exchange: string;
  sector: string;
  description: string;
  website?: string;
  wikipediaUrl?: string;
}

export function getStockSchemas(stock: StockInfo) {
  const corporationSchema = {
    "@context": "https://schema.org",
    "@type": "Corporation",
    name: stock.name,
    tickerSymbol: `${stock.exchange}: ${stock.ticker}`,
    description: stock.description,
    ...(stock.website && { url: stock.website }),
    ...(stock.wikipediaUrl && { sameAs: [stock.wikipediaUrl] }),
  };

  const datasetSchema = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: `${stock.name} (${stock.ticker}) Financial Data`,
    description: `Financial data, earnings analysis, and SEC filings for ${stock.name} (${stock.exchange}: ${stock.ticker})`,
    url: `https://stoxpulse.com/stocks/${stock.ticker}`,
    keywords: [
      stock.ticker,
      stock.name,
      stock.sector,
      "stock",
      "financial data",
      "earnings",
    ],
    creator: {
      "@type": "Organization",
      name: "StoxPulse",
      url: "https://stoxpulse.com",
    },
  };

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
        name: stock.ticker,
        item: `https://stoxpulse.com/stocks/${stock.ticker}`,
      },
    ],
  };

  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `${stock.name} (${stock.ticker}) - Stock Analysis | StoxPulse`,
    description: stock.description,
    url: `https://stoxpulse.com/stocks/${stock.ticker}`,
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: ["h1", ".stock-summary", ".earnings-highlight"],
    },
    breadcrumb: breadcrumbSchema,
  };

  return {
    corporationSchema,
    datasetSchema,
    breadcrumbSchema,
    webPageSchema,
  };
}
