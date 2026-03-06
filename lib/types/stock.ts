export interface StockMeta {
  ticker: string;
  name: string;
  sector: string;
  industry: string;
  exchange: string;
  marketCap?: number;
  description?: string;
  website?: string;
  ceo?: string;
  employees?: number;
  ipoDate?: string;
  country?: string;
}

export interface StockQuote {
  ticker: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  pe?: number;
  eps?: number;
  high52w?: number;
  low52w?: number;
  avgVolume?: number;
  open?: number;
  previousClose?: number;
  dayHigh?: number;
  dayLow?: number;
  priceAvg50?: number;
  priceAvg200?: number;
  lastUpdated: string;
}

export interface EarningsAnalysis {
  ticker: string;
  quarter: string;
  year: number;
  date: string;
  revenue: number;
  revenueEstimate: number;
  revenueSurprise: number;
  eps: number;
  epsEstimate: number;
  epsSurprise: number;
  summary: string;
  keyTakeaways: string[];
  sentiment: "Bullish" | "Neutral" | "Bearish";
  redFlags: string[];
  managementTone: string;
  lastUpdated: string;
}

export interface SECFiling {
  type: string; // 10-K, 10-Q, 8-K, etc.
  date: string;
  description: string;
  url: string;
  aiSummary?: string;
}

export interface InsiderTransaction {
  name: string;
  title: string;
  type: "Buy" | "Sale";
  shares: number;
  pricePerShare: number;
  totalValue: number;
  date: string;
  isRoutine: boolean;
}

export interface StockProfile extends StockMeta {
  quote?: StockQuote;
  latestEarnings?: EarningsAnalysis;
  recentFilings?: SECFiling[];
  insiderTransactions?: InsiderTransaction[];
}

export interface CompetitorData {
  name: string;
  slug: string;
  url: string;
  tagline: string;
  pricing: {
    free: boolean;
    plans: Array<{
      name: string;
      price: number;
      period: string;
      features: string[];
    }>;
  };
  strengths: string[];
  weaknesses: string[];
  bestFor: string;
  notIdealFor: string;
}

export interface GlossaryTerm {
  term: string;
  slug: string;
  definition: string;
  detailedExplanation: string;
  formula?: string;
  example?: string;
  relatedTerms: string[];
  category: string;
  faq: Array<{ question: string; answer: string }>;
}

export interface BlogPost {
  title: string;
  slug: string;
  description: string;
  date: string;
  updated: string;
  author: string;
  category: string;
  tags: string[];
  image: string;
  readTime: string;
  pillar: boolean;
  cluster: string;
  content: string;
}
