export interface CommodityInfo {
  symbol: string;
  slug: string;
  name: string;
  shortName: string;
  unit: string;
  description: string;
  relatedETFs: { ticker: string; name: string }[];
  factors: string[];
  faq: { question: string; answer: string }[];
}

export const commodities: CommodityInfo[] = [
  {
    symbol: "XAUUSD",
    slug: "xauusd",
    name: "Gold (XAU/USD)",
    shortName: "Gold",
    unit: "per troy ounce",
    description:
      "Gold is a precious metal traded globally as a commodity and currency hedge. Priced in US dollars per troy ounce, it is considered a safe-haven asset and a store of value during periods of economic uncertainty, inflation, and geopolitical instability. Central banks hold gold as part of their reserves, and it is widely used in jewelry, electronics, and investment products like ETFs and futures.",
    relatedETFs: [
      { ticker: "GLD", name: "SPDR Gold Shares" },
      { ticker: "IAU", name: "iShares Gold Trust" },
      { ticker: "GDX", name: "VanEck Gold Miners ETF" },
      { ticker: "GDXJ", name: "VanEck Junior Gold Miners ETF" },
    ],
    factors: [
      "US Dollar strength (inverse relationship)",
      "Federal Reserve interest rate policy",
      "Inflation expectations & CPI data",
      "Geopolitical tensions and conflicts",
      "Central bank gold purchases",
      "Real yields (Treasury yields minus inflation)",
      "Global recession fears",
      "Physical demand from jewelry & industry",
    ],
    faq: [
      {
        question: "What drives the price of gold?",
        answer:
          "Gold prices are primarily driven by the US dollar strength, interest rates, inflation expectations, and geopolitical risk. When real interest rates fall or uncertainty rises, investors move into gold as a safe haven, pushing prices higher. Central bank purchases, particularly from China and emerging markets, have also been a major demand driver.",
      },
      {
        question: "How does StoxPulse track gold prices?",
        answer:
          "StoxPulse displays real-time XAU/USD spot prices — the global benchmark for gold trading. We show live price changes, 52-week ranges, historical charts, and moving averages. Our AI monitors news and economic data that affect gold prices.",
      },
      {
        question: "What is the difference between spot gold and gold futures?",
        answer:
          "Spot gold (XAU/USD) represents the current market price for immediate delivery. Gold futures (GC) are contracts to buy or sell gold at a predetermined price on a future date. Futures typically trade at a slight premium to spot due to carrying costs. StoxPulse tracks the spot price as it reflects real-time market conditions.",
      },
      {
        question: "Why do investors buy gold?",
        answer:
          "Investors buy gold for portfolio diversification, inflation protection, and as a hedge against currency devaluation and economic instability. Gold has historically maintained its purchasing power over centuries and tends to perform well during periods of market stress when stocks and bonds decline.",
      },
    ],
  },
  {
    symbol: "XAGUSD",
    slug: "xagusd",
    name: "Silver (XAG/USD)",
    shortName: "Silver",
    unit: "per troy ounce",
    description:
      "Silver is a precious and industrial metal traded globally in US dollars per troy ounce. It serves a dual role as both a store of value like gold and a critical industrial commodity used in electronics, solar panels, medical devices, and electric vehicles. Silver's industrial demand makes it more volatile than gold and more sensitive to economic growth expectations.",
    relatedETFs: [
      { ticker: "SLV", name: "iShares Silver Trust" },
      { ticker: "SIVR", name: "abrdn Physical Silver Shares ETF" },
      { ticker: "SIL", name: "Global X Silver Miners ETF" },
    ],
    factors: [
      "US Dollar strength (inverse relationship)",
      "Industrial demand (solar, electronics, EVs)",
      "Gold price correlation (typically moves with gold)",
      "Federal Reserve monetary policy",
      "Green energy transition & solar panel demand",
      "Mining supply disruptions",
      "Inflation expectations",
      "Gold-to-silver ratio",
    ],
    faq: [
      {
        question: "What drives the price of silver?",
        answer:
          "Silver is driven by both precious metal demand (like gold) and industrial demand. About 50% of silver demand comes from industrial uses including solar panels, electronics, and medical equipment. This dual nature makes silver more volatile than gold — it rallies harder in bull markets and falls more sharply in downturns.",
      },
      {
        question: "How does StoxPulse track silver prices?",
        answer:
          "StoxPulse displays real-time XAG/USD spot prices — the global benchmark for silver trading. We provide live price changes, 52-week ranges, historical price charts, and key moving averages to help you track silver market trends.",
      },
      {
        question: "What is the gold-to-silver ratio?",
        answer:
          "The gold-to-silver ratio measures how many ounces of silver it takes to buy one ounce of gold. Historically it averages around 60-70. When the ratio is high (above 80), silver is considered undervalued relative to gold. Traders use this ratio to determine relative value between the two metals.",
      },
      {
        question: "Why is silver more volatile than gold?",
        answer:
          "Silver's smaller market size, dual industrial/precious metal demand, and lower price per ounce make it more volatile. Industrial demand fluctuates with economic cycles, and the silver market is more easily moved by large trades. This volatility creates both higher risk and higher potential returns compared to gold.",
      },
    ],
  },
];

export function getCommodityBySlug(slug: string): CommodityInfo | undefined {
  return commodities.find((c) => c.slug === slug);
}

export function getCommodityBySymbol(symbol: string): CommodityInfo | undefined {
  return commodities.find((c) => c.symbol === symbol);
}

export function isCommoditySlug(slug: string): boolean {
  return commodities.some((c) => c.slug === slug);
}
