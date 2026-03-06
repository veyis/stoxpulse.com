"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Area,
  AreaChart,
} from "recharts";
import { FilingsList } from "./filings-list";
import { InsiderTable } from "./insider-table";
import { NewsList } from "./news-list";
import { FiftyTwoWeekBar } from "./fifty-two-week-bar";
import { PriceChart } from "./price-chart";
import { AIInsightCard } from "./ai-insight-card";
import {
  Building2,
  Globe,
  Users,
  Phone,
  MapPin,
  DollarSign,
  BarChart3,
  PieChart,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { StockQuote, SECFiling, InsiderTransaction } from "@/lib/types/stock";
import type {
  FinancialStatements,
  FinancialRatios,
  FinancialPeriod,
  NewsItem,
  CompanyProfile,
  HistoricalPrice,
  AnalystRecommendation,
  AnalystEstimate,
} from "@/lib/data/types";

interface StockTabsProps {
  ticker: string;
  quote: StockQuote | null;
  profile: CompanyProfile | null;
  financials: FinancialStatements | null;
  balanceSheet: FinancialStatements | null;
  cashFlow: FinancialStatements | null;
  ratios: FinancialRatios | null;
  filings: SECFiling[];
  insiderTrades: InsiderTransaction[];
  news: NewsItem[];
  historicalPrices: HistoricalPrice[];
  recommendations: AnalystRecommendation[];
  analystEstimates: AnalystEstimate[];
}

// ── Helpers ──────────────────────────────────────────────────────

function fmt(num: number | null | undefined): string {
  if (num == null) return "—";
  if (Math.abs(num) >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
  if (Math.abs(num) >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
  if (Math.abs(num) >= 1e6) return `$${(num / 1e6).toFixed(1)}M`;
  if (Math.abs(num) >= 1e3) return `$${(num / 1e3).toFixed(0)}K`;
  return `$${num.toLocaleString()}`;
}

function fmtNum(num: number | null | undefined): string {
  if (num == null) return "—";
  if (Math.abs(num) >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
  if (Math.abs(num) >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
  if (Math.abs(num) >= 1e3) return `${(num / 1e3).toFixed(0)}K`;
  return num.toLocaleString();
}

function fmtPct(num: number | null | undefined): string {
  if (num == null) return "—";
  return `${(num * 100).toFixed(1)}%`;
}

function fmtRatio(num: number | null | undefined): string {
  if (num == null) return "—";
  return num.toFixed(2);
}

function fmtDollar(num: number | null | undefined): string {
  if (num == null) return "—";
  return `$${num.toFixed(2)}`;
}

function timeAgo(datetime: string): string {
  const now = new Date();
  const date = new Date(datetime);
  const diff = now.getTime() - date.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// ── Stat Item ────────────────────────────────────────────────────

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-0.5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold tabular-nums">{value}</p>
    </div>
  );
}

// ── Detail Row ───────────────────────────────────────────────────

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-border/30 last:border-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-xs font-semibold tabular-nums">{value}</span>
    </div>
  );
}

// ── News sidebar with images ────────────────────────────────────

function NewsSidebar({ news, name }: { news: NewsItem[]; name: string }) {
  if (news.length === 0) return null;
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Latest {name} News</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border/30">
          {news.map((item, i) => (
            <a
              key={item.id ?? `news-${i}`}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex gap-3 px-4 py-3 hover:bg-secondary/30 transition-colors group"
            >
              {item.image && (
                <img
                  src={item.image}
                  alt=""
                  className="w-16 h-12 rounded object-cover shrink-0 bg-muted"
                  loading="lazy"
                />
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium leading-snug line-clamp-2 group-hover:text-brand transition-colors">
                  {item.headline}
                </p>
                <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                  <span>{item.source}</span>
                  <span className="text-border">·</span>
                  <span>{timeAgo(item.datetime)}</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ── Revenue/Income Chart ────────────────────────────────────────

function RevenueChart({ financials }: { financials: FinancialStatements }) {
  const data = [...financials.annual]
    .reverse()
    .slice(-6)
    .map((p) => ({
      period: `FY ${p.year}`,
      revenue: p.revenue ? p.revenue / 1e9 : 0,
      netIncome: p.netIncome ? p.netIncome / 1e9 : 0,
    }));

  if (data.length < 2) return null;

  const chartConfig = {
    revenue: { label: "Revenue", color: "var(--color-brand)" },
    netIncome: { label: "Net Income", color: "var(--color-info)" },
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Revenue & Net Income</CardTitle>
        <p className="text-xs text-muted-foreground">Annual, in billions (USD)</p>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <BarChart data={data} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
            <XAxis dataKey="period" tick={{ fontSize: 11 }} className="text-muted-foreground" />
            <YAxis tick={{ fontSize: 11 }} className="text-muted-foreground" tickFormatter={(v) => `${v}B`} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="revenue" fill="var(--color-revenue)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="netIncome" fill="var(--color-netIncome)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

// ── EPS Chart ───────────────────────────────────────────────────

function EPSChart({ financials }: { financials: FinancialStatements }) {
  const data = [...financials.annual]
    .reverse()
    .slice(-6)
    .map((p) => ({
      period: `FY ${p.year}`,
      eps: p.epsDiluted ?? p.eps ?? 0,
    }));

  if (data.length < 2) return null;

  const chartConfig = {
    eps: { label: "EPS (Diluted)", color: "var(--color-positive)" },
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Earnings Per Share</CardTitle>
        <p className="text-xs text-muted-foreground">Annual, diluted</p>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <AreaChart data={data} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
            <XAxis dataKey="period" tick={{ fontSize: 11 }} className="text-muted-foreground" />
            <YAxis tick={{ fontSize: 11 }} className="text-muted-foreground" tickFormatter={(v) => `$${v}`} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <defs>
              <linearGradient id="epsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-eps)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--color-eps)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area type="monotone" dataKey="eps" stroke="var(--color-eps)" fill="url(#epsGradient)" strokeWidth={2} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

// ── Margin Chart ────────────────────────────────────────────────

function MarginChart({ financials }: { financials: FinancialStatements }) {
  const data = [...financials.annual]
    .reverse()
    .slice(-6)
    .map((p) => ({
      period: `FY ${p.year}`,
      gross: p.revenue && p.grossProfit ? (p.grossProfit / p.revenue) * 100 : 0,
      operating: p.revenue && p.operatingIncome ? (p.operatingIncome / p.revenue) * 100 : 0,
      net: p.revenue && p.netIncome ? (p.netIncome / p.revenue) * 100 : 0,
    }));

  if (data.length < 2) return null;

  const chartConfig = {
    gross: { label: "Gross Margin", color: "var(--color-brand)" },
    operating: { label: "Op. Margin", color: "var(--color-info)" },
    net: { label: "Net Margin", color: "var(--color-warning)" },
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Profit Margins</CardTitle>
        <p className="text-xs text-muted-foreground">Annual trend (%)</p>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <LineChart data={data} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
            <XAxis dataKey="period" tick={{ fontSize: 11 }} className="text-muted-foreground" />
            <YAxis tick={{ fontSize: 11 }} className="text-muted-foreground" tickFormatter={(v) => `${v}%`} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Line type="monotone" dataKey="gross" stroke="var(--color-gross)" strokeWidth={2} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="operating" stroke="var(--color-operating)" strokeWidth={2} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="net" stroke="var(--color-net)" strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

// ── Cash Flow Chart ─────────────────────────────────────────────

function CashFlowChart({ cashFlow }: { cashFlow: FinancialStatements }) {
  const data = [...cashFlow.annual]
    .reverse()
    .slice(-6)
    .map((p) => ({
      period: `FY ${p.year}`,
      operating: p.operatingCashFlow ? p.operatingCashFlow / 1e9 : 0,
      capex: p.capitalExpenditures ? -(p.capitalExpenditures / 1e9) : 0,
      fcf: p.freeCashFlow ? p.freeCashFlow / 1e9 : 0,
    }));

  if (data.length < 2) return null;

  const chartConfig = {
    operating: { label: "Operating CF", color: "var(--color-brand)" },
    capex: { label: "CapEx", color: "var(--color-negative)" },
    fcf: { label: "Free Cash Flow", color: "var(--color-info)" },
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Cash Flow</CardTitle>
        <p className="text-xs text-muted-foreground">Annual, in billions (USD)</p>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <BarChart data={data} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
            <XAxis dataKey="period" tick={{ fontSize: 11 }} className="text-muted-foreground" />
            <YAxis tick={{ fontSize: 11 }} className="text-muted-foreground" tickFormatter={(v) => `${v}B`} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="operating" fill="var(--color-operating)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="capex" fill="var(--color-capex)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="fcf" fill="var(--color-fcf)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

// ── Financial Statement Table ───────────────────────────────────

function FinancialTable({
  data,
  rows,
  defaultPeriod = "annual",
}: {
  data: FinancialStatements;
  rows: { label: string; key?: keyof FinancialPeriod; format?: (n: number | null) => string; computed?: (d: FinancialPeriod) => string }[];
  defaultPeriod?: "annual" | "quarterly";
}) {
  const [period, setPeriod] = useState<"annual" | "quarterly">(defaultPeriod);
  const periodData = period === "annual" ? data.annual : data.quarterly;
  const displayData = periodData.slice(0, period === "annual" ? 6 : 8);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-1 rounded-lg bg-secondary/50 p-1 w-fit">
        {(["annual", "quarterly"] as const).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={cn(
              "px-3 py-1.5 text-xs font-medium rounded-md transition-colors capitalize",
              period === p ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {p}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-lg border border-border/50">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/30">
              <TableHead className="text-xs font-medium uppercase tracking-wider sticky left-0 bg-secondary/30 min-w-[120px]">
                Metric
              </TableHead>
              {displayData.map((d) => (
                <TableHead
                  key={`${d.year}-${d.period}`}
                  className="text-right text-xs font-medium uppercase tracking-wider whitespace-nowrap"
                >
                  {d.period === "FY" ? `FY ${d.year}` : `${d.period} ${d.year}`}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, i) => (
              <TableRow key={row.label} className={i % 2 === 0 ? "" : "bg-secondary/10"}>
                <TableCell className="text-xs font-medium sticky left-0 bg-inherit whitespace-nowrap">
                  {row.label}
                </TableCell>
                {displayData.map((d) => (
                  <TableCell
                    key={`${d.year}-${d.period}-${row.label}`}
                    className="text-right tabular-nums text-xs whitespace-nowrap"
                  >
                    {row.computed
                      ? row.computed(d)
                      : row.key && row.format
                        ? row.format(d[row.key] as number | null)
                        : "—"}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// ── Valuation Card ──────────────────────────────────────────────

function ValuationCard({ ratios, quote }: { ratios: FinancialRatios; quote: StockQuote | null }) {
  const metrics = [
    { label: "P/E Ratio", value: fmtRatio(ratios.priceToEarningsRatio) },
    { label: "P/B Ratio", value: fmtRatio(ratios.priceToBookRatio) },
    { label: "P/S Ratio", value: fmtRatio(ratios.priceToSalesRatio) },
    { label: "P/FCF Ratio", value: fmtRatio(ratios.priceToFreeCashFlowRatio) },
    { label: "EV/EBITDA", value: fmtRatio(ratios.evToEBITDA) },
    { label: "EV/Sales", value: fmtRatio(ratios.evToSales) },
    { label: "Enterprise Value", value: ratios.enterpriseValue ? fmt(ratios.enterpriseValue) : "—" },
    { label: "Earnings Yield", value: fmtPct(ratios.earningsYield) },
    { label: "FCF Yield", value: fmtPct(ratios.freeCashFlowYield) },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-brand" />
          Valuation
        </CardTitle>
      </CardHeader>
      <CardContent>
        {metrics.map((m) => <DetailRow key={m.label} label={m.label} value={m.value} />)}
      </CardContent>
    </Card>
  );
}

// ── Profitability Card ──────────────────────────────────────────

function ProfitabilityCard({ ratios }: { ratios: FinancialRatios }) {
  const metrics = [
    { label: "Gross Margin", value: ratios.grossProfitMargin },
    { label: "Operating Margin", value: ratios.operatingProfitMargin },
    { label: "Net Margin", value: ratios.netProfitMargin },
    { label: "ROE", value: ratios.returnOnEquity },
    { label: "ROA", value: ratios.returnOnAssets },
    { label: "ROIC", value: ratios.returnOnInvestedCapital },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-brand" />
          Profitability
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {metrics.map((m) => (
          <div key={m.label} className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{m.label}</span>
              <span className="text-xs font-semibold tabular-nums">{fmtPct(m.value)}</span>
            </div>
            {m.value != null && (
              <Progress value={Math.min(Math.max(m.value * 100, 0), 100)} className="h-1.5" />
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// ── Liquidity & Leverage Card ───────────────────────────────────

function LiquidityCard({ ratios }: { ratios: FinancialRatios }) {
  const metrics = [
    { label: "Current Ratio", value: fmtRatio(ratios.currentRatio) },
    { label: "Quick Ratio", value: fmtRatio(ratios.quickRatio) },
    { label: "Cash Ratio", value: fmtRatio(ratios.cashRatio) },
    { label: "Debt/Equity", value: fmtRatio(ratios.debtToEquityRatio) },
    { label: "Debt/Assets", value: fmtPct(ratios.debtToAssetsRatio) },
    { label: "Interest Coverage", value: fmtRatio(ratios.interestCoverageRatio) },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <PieChart className="h-4 w-4 text-brand" />
          Liquidity & Leverage
        </CardTitle>
      </CardHeader>
      <CardContent>
        {metrics.map((m) => <DetailRow key={m.label} label={m.label} value={m.value} />)}
      </CardContent>
    </Card>
  );
}

// ── Per-Share Card ───────────────────────────────────────────────

function PerShareCard({ ratios }: { ratios: FinancialRatios }) {
  const metrics = [
    { label: "Revenue/Share", value: fmtDollar(ratios.revenuePerShare) },
    { label: "EPS", value: fmtDollar(ratios.netIncomePerShare) },
    { label: "Book Value/Share", value: fmtDollar(ratios.bookValuePerShare) },
    { label: "FCF/Share", value: fmtDollar(ratios.freeCashFlowPerShare) },
    { label: "Dividend Yield", value: fmtPct(ratios.dividendYield) },
    { label: "Payout Ratio", value: fmtPct(ratios.dividendPayoutRatio) },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Per-Share Data & Dividends</CardTitle>
      </CardHeader>
      <CardContent>
        {metrics.map((m) => <DetailRow key={m.label} label={m.label} value={m.value} />)}
      </CardContent>
    </Card>
  );
}


// ── Analyst Recommendation Chart ──────────────────────────────

function RecommendationChart({ recommendations }: { recommendations: AnalystRecommendation[] }) {
  const data = [...recommendations]
    .slice(0, 6)
    .reverse()
    .map((r) => ({
      period: new Date(r.period).toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
      strongBuy: r.strongBuy,
      buy: r.buy,
      hold: r.hold,
      sell: r.sell,
      strongSell: r.strongSell,
    }));

  if (data.length === 0) return null;

  const latest = recommendations[0];
  const total = latest.strongBuy + latest.buy + latest.hold + latest.sell + latest.strongSell;

  const chartConfig = {
    strongBuy: { label: "Strong Buy", color: "oklch(60% 0.18 155)" },
    buy: { label: "Buy", color: "oklch(70% 0.15 155)" },
    hold: { label: "Hold", color: "oklch(75% 0.15 85)" },
    sell: { label: "Sell", color: "oklch(65% 0.18 25)" },
    strongSell: { label: "Strong Sell", color: "oklch(55% 0.22 25)" },
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Analyst Recommendations</CardTitle>
        <p className="text-xs text-muted-foreground">
          {total} analysts — {latest.strongBuy + latest.buy} Buy, {latest.hold} Hold, {latest.sell + latest.strongSell} Sell
        </p>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <BarChart data={data} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
            <XAxis dataKey="period" tick={{ fontSize: 11 }} className="text-muted-foreground" />
            <YAxis tick={{ fontSize: 11 }} className="text-muted-foreground" />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="strongBuy" stackId="a" fill="var(--color-strongBuy)" />
            <Bar dataKey="buy" stackId="a" fill="var(--color-buy)" />
            <Bar dataKey="hold" stackId="a" fill="var(--color-hold)" />
            <Bar dataKey="sell" stackId="a" fill="var(--color-sell)" />
            <Bar dataKey="strongSell" stackId="a" fill="var(--color-strongSell)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

// ── Analyst Estimates Table ─────────────────────────────────────

function EstimatesTable({ estimates }: { estimates: AnalystEstimate[] }) {
  const data = estimates.slice(0, 8);
  if (data.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Analyst Estimates</CardTitle>
        <p className="text-xs text-muted-foreground">Forward EPS & revenue consensus</p>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto rounded-lg border border-border/50">
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary/30">
                <TableHead className="text-xs font-medium uppercase tracking-wider">Period</TableHead>
                <TableHead className="text-right text-xs font-medium uppercase tracking-wider">EPS Est.</TableHead>
                <TableHead className="text-right text-xs font-medium uppercase tracking-wider hidden sm:table-cell">EPS Range</TableHead>
                <TableHead className="text-right text-xs font-medium uppercase tracking-wider">Rev Est.</TableHead>
                <TableHead className="text-right text-xs font-medium uppercase tracking-wider hidden sm:table-cell">Analysts</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((e, i) => (
                <TableRow key={e.date} className={i % 2 === 0 ? "" : "bg-secondary/10"}>
                  <TableCell className="text-xs font-medium whitespace-nowrap">
                    {new Date(e.date).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-xs">{e.epsAvg != null ? `$${e.epsAvg.toFixed(2)}` : "—"}</TableCell>
                  <TableCell className="text-right tabular-nums text-xs text-muted-foreground hidden sm:table-cell">
                    {e.epsLow != null && e.epsHigh != null ? `$${e.epsLow.toFixed(2)} – $${e.epsHigh.toFixed(2)}` : "—"}
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-xs">{e.revenueAvg != null ? fmt(e.revenueAvg) : "—"}</TableCell>
                  <TableCell className="text-right tabular-nums text-xs hidden sm:table-cell">{e.numAnalysts || "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Main Component ──────────────────────────────────────────────

export function StockTabs({
  ticker,
  quote,
  profile,
  financials,
  balanceSheet,
  cashFlow,
  ratios,
  filings,
  insiderTrades,
  news,
  historicalPrices,
  recommendations,
  analystEstimates,
}: StockTabsProps) {
  const name = profile?.name ?? ticker;

  const incomeRows = [
    { label: "Revenue", key: "revenue" as const, format: fmt },
    { label: "Cost of Revenue", key: "costOfRevenue" as const, format: fmt },
    { label: "Gross Profit", key: "grossProfit" as const, format: fmt },
    { label: "Gross Margin", computed: (d: FinancialPeriod) => d.revenue && d.grossProfit ? `${((d.grossProfit / d.revenue) * 100).toFixed(1)}%` : "—" },
    { label: "Operating Income", key: "operatingIncome" as const, format: fmt },
    { label: "Op. Margin", computed: (d: FinancialPeriod) => d.revenue && d.operatingIncome ? `${((d.operatingIncome / d.revenue) * 100).toFixed(1)}%` : "—" },
    { label: "Net Income", key: "netIncome" as const, format: fmt },
    { label: "Net Margin", computed: (d: FinancialPeriod) => d.revenue && d.netIncome ? `${((d.netIncome / d.revenue) * 100).toFixed(1)}%` : "—" },
    { label: "EPS", key: "eps" as const, format: fmtDollar },
    { label: "EPS (Diluted)", key: "epsDiluted" as const, format: fmtDollar },
  ];

  const balanceRows = [
    { label: "Total Assets", key: "totalAssets" as const, format: fmt },
    { label: "Total Liabilities", key: "totalLiabilities" as const, format: fmt },
    { label: "Stockholders' Equity", key: "stockholdersEquity" as const, format: fmt },
    { label: "Cash & Equivalents", key: "cash" as const, format: fmt },
    { label: "Long-Term Debt", key: "longTermDebt" as const, format: fmt },
  ];

  const cashFlowRows = [
    { label: "Operating Cash Flow", key: "operatingCashFlow" as const, format: fmt },
    { label: "Capital Expenditures", key: "capitalExpenditures" as const, format: (n: number | null) => n != null ? `-${fmt(n)}` : "—" },
    { label: "Free Cash Flow", key: "freeCashFlow" as const, format: fmt },
    { label: "Dividends Paid", key: "dividendsPaid" as const, format: (n: number | null) => n != null ? `-${fmt(n)}` : "—" },
  ];

  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="w-full justify-start bg-secondary/50 border border-border/50 rounded-xl h-auto p-1.5 gap-1 overflow-x-auto no-scrollbar">
        {[
          { value: "overview", label: "Overview" },
          { value: "chart", label: "Chart" },
          { value: "profile", label: "Profile" },
          { value: "financials", label: "Financials" },
          { value: "analysis", label: "Analysis" },
          { value: "news", label: "News" },
          { value: "ownership", label: "Ownership" },
        ].map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            className="text-xs sm:text-sm font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg px-3 sm:px-4 py-2 whitespace-nowrap shrink-0"
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>

      {/* ─── Overview Tab ─── */}
      <TabsContent value="overview" className="mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {quote && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Key Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <StatItem label="Market Cap" value={fmt(quote.marketCap)} />
                    <StatItem label="P/E Ratio" value={quote.pe ? quote.pe.toFixed(1) : "—"} />
                    <StatItem label="EPS" value={quote.eps ? fmtDollar(quote.eps) : "—"} />
                    <StatItem label="Volume" value={fmtNum(quote.volume)} />
                    <StatItem label="Avg Volume" value={quote.avgVolume ? fmtNum(quote.avgVolume) : "—"} />
                    <StatItem label="Open" value={quote.open ? fmtDollar(quote.open) : "—"} />
                    <StatItem label="Prev. Close" value={quote.previousClose ? fmtDollar(quote.previousClose) : "—"} />
                    <StatItem label="Day Range" value={quote.dayLow && quote.dayHigh ? `${fmtDollar(quote.dayLow)} - ${fmtDollar(quote.dayHigh)}` : "—"} />
                    <StatItem label="50-Day Avg" value={quote.priceAvg50 ? fmtDollar(quote.priceAvg50) : "—"} />
                    <StatItem label="200-Day Avg" value={quote.priceAvg200 ? fmtDollar(quote.priceAvg200) : "—"} />
                    <StatItem label="52W High" value={quote.high52w ? fmtDollar(quote.high52w) : "—"} />
                    <StatItem label="52W Low" value={quote.low52w ? fmtDollar(quote.low52w) : "—"} />
                  </div>
                  {quote.high52w && quote.low52w && (
                    <div className="mt-4 pt-4 border-t border-border/30">
                      <FiftyTwoWeekBar low={quote.low52w} high={quote.high52w} current={quote.price} />
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {historicalPrices.length > 0 && <PriceChart prices={historicalPrices} ticker={ticker} quote={quote} />}

            {financials && financials.annual.length >= 2 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <RevenueChart financials={financials} />
                <EPSChart financials={financials} />
              </div>
            )}

            {profile && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">About</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                    {profile.ceo && (
                      <div className="flex items-start gap-2">
                        <Users className="h-3.5 w-3.5 mt-0.5 text-muted-foreground shrink-0" />
                        <div>
                          <p className="text-xs text-muted-foreground">CEO</p>
                          <p className="text-xs font-medium">{profile.ceo}</p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-start gap-2">
                      <Building2 className="h-3.5 w-3.5 mt-0.5 text-muted-foreground shrink-0" />
                      <div>
                        <p className="text-xs text-muted-foreground">Sector</p>
                        <p className="text-xs font-medium">{profile.sector}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Industry</p>
                      <p className="text-xs font-medium">{profile.industry}</p>
                    </div>
                    {profile.website && (
                      <div className="flex items-start gap-2">
                        <Globe className="h-3.5 w-3.5 mt-0.5 text-muted-foreground shrink-0" />
                        <div>
                          <p className="text-xs text-muted-foreground">Website</p>
                          <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-brand hover:underline truncate block">
                            {profile.website.replace(/^https?:\/\/(www\.)?/, "")}
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                  {profile.description && (
                    <div className="mt-4 pt-4 border-t border-border/30">
                      <p className="text-xs leading-relaxed text-foreground/80">{profile.description}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {filings.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Recent SEC Filings</CardTitle>
                </CardHeader>
                <CardContent>
                  <FilingsList filings={filings.slice(0, 5)} />
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <NewsSidebar news={news.slice(0, 8)} name={name} />
            {(quote || profile) && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Financial Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  {profile?.exchange && <DetailRow label="Exchange" value={profile.exchangeFullName ?? profile.exchange} />}
                  {profile?.cik && <DetailRow label="CIK" value={profile.cik} />}
                  {profile?.isin && <DetailRow label="ISIN" value={profile.isin} />}
                  {profile?.cusip && <DetailRow label="CUSIP" value={profile.cusip} />}
                  {quote && <DetailRow label="Market Cap" value={fmt(quote.marketCap)} />}
                  {profile?.beta && <DetailRow label="Beta" value={profile.beta.toFixed(3)} />}
                  {profile?.lastDividend && <DetailRow label="Last Dividend" value={`$${profile.lastDividend.toFixed(2)}`} />}
                  {profile?.employees && <DetailRow label="Employees" value={profile.employees.toLocaleString()} />}
                  {profile?.phone && <DetailRow label="Phone" value={profile.phone} />}
                  {profile?.address && <DetailRow label="Address" value={`${profile.address}${profile.city ? `, ${profile.city}` : ""}`} />}
                  {profile?.country && <DetailRow label="Country" value={profile.country} />}
                  {profile?.ipoDate && <DetailRow label="IPO Date" value={profile.ipoDate} />}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </TabsContent>

      {/* ─── Chart Tab ─── */}
      <TabsContent value="chart" className="mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {historicalPrices.length > 0 ? (
              <PriceChart prices={historicalPrices} ticker={ticker} quote={quote} />
            ) : (
              <Card><CardContent className="py-12 text-center text-muted-foreground"><p className="text-sm">Historical price data not available for {ticker}.</p></CardContent></Card>
            )}

            {financials && financials.annual.length >= 2 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <RevenueChart financials={financials} />
                <EPSChart financials={financials} />
              </div>
            )}

            {financials && financials.annual.length >= 2 && <MarginChart financials={financials} />}
            {cashFlow && cashFlow.annual.length >= 2 && <CashFlowChart cashFlow={cashFlow} />}
          </div>
          <div className="space-y-6">
            {quote && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Price Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <DetailRow label="Price" value={fmtDollar(quote.price)} />
                  <DetailRow label="Change" value={`${quote.change >= 0 ? "+" : ""}${quote.change.toFixed(2)} (${quote.changePercent >= 0 ? "+" : ""}${quote.changePercent.toFixed(2)}%)`} />
                  {quote.open && <DetailRow label="Open" value={fmtDollar(quote.open)} />}
                  {quote.previousClose && <DetailRow label="Prev. Close" value={fmtDollar(quote.previousClose)} />}
                  {quote.dayHigh && quote.dayLow && <DetailRow label="Day Range" value={`${fmtDollar(quote.dayLow)} – ${fmtDollar(quote.dayHigh)}`} />}
                  {quote.high52w && quote.low52w && <DetailRow label="52W Range" value={`${fmtDollar(quote.low52w)} – ${fmtDollar(quote.high52w)}`} />}
                  {quote.priceAvg50 && <DetailRow label="50-Day Avg" value={fmtDollar(quote.priceAvg50)} />}
                  {quote.priceAvg200 && <DetailRow label="200-Day Avg" value={fmtDollar(quote.priceAvg200)} />}
                  <DetailRow label="Volume" value={fmtNum(quote.volume)} />
                  {quote.avgVolume && <DetailRow label="Avg Volume" value={fmtNum(quote.avgVolume)} />}
                </CardContent>
              </Card>
            )}
            <NewsSidebar news={news.slice(0, 5)} name={name} />
          </div>
        </div>
      </TabsContent>

      {/* ─── Profile Tab ─── */}
      <TabsContent value="profile" className="mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {profile ? (
              <>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Company Profile</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {profile.ceo && <StatItem label="CEO" value={profile.ceo} />}
                      <StatItem label="Sector" value={profile.sector} />
                      <StatItem label="Industry" value={profile.industry} />
                      <StatItem label="Exchange" value={profile.exchangeFullName ?? profile.exchange} />
                      {profile.employees && <StatItem label="Employees" value={profile.employees.toLocaleString()} />}
                      {profile.ipoDate && <StatItem label="IPO Date" value={profile.ipoDate} />}
                      {profile.country && <StatItem label="Country" value={profile.country} />}
                      {profile.beta && <StatItem label="Beta" value={profile.beta.toFixed(3)} />}
                      {profile.lastDividend && <StatItem label="Last Dividend" value={`$${profile.lastDividend.toFixed(2)}`} />}
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {(profile.address || profile.phone || profile.website) && (
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          Contact
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 text-xs">
                        {profile.address && <p>{profile.address}{profile.city ? `, ${profile.city}` : ""}{profile.state ? `, ${profile.state}` : ""} {profile.zip}</p>}
                        {profile.phone && <p className="flex items-center gap-1.5"><Phone className="h-3 w-3 text-muted-foreground" />{profile.phone}</p>}
                        {profile.website && (
                          <a href={profile.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-brand hover:underline">
                            <Globe className="h-3 w-3" />
                            {profile.website.replace(/^https?:\/\/(www\.)?/, "")}
                          </a>
                        )}
                      </CardContent>
                    </Card>
                  )}
                  {(profile.cik || profile.isin || profile.cusip) && (
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Identifiers</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {profile.cik && <DetailRow label="CIK" value={profile.cik} />}
                        {profile.isin && <DetailRow label="ISIN" value={profile.isin} />}
                        {profile.cusip && <DetailRow label="CUSIP" value={profile.cusip} />}
                      </CardContent>
                    </Card>
                  )}
                </div>

                {profile.description && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Description</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs leading-relaxed">{profile.description}</p>
                    </CardContent>
                  </Card>
                )}
              </>
            ) : (
              <Card><CardContent className="py-12 text-center text-muted-foreground"><p className="text-sm">Profile data not available for {ticker}.</p></CardContent></Card>
            )}
          </div>
          <div className="space-y-6">
            <NewsSidebar news={news.slice(0, 6)} name={name} />
          </div>
        </div>
      </TabsContent>

      {/* ─── Financial Statements Tab ─── */}
      <TabsContent value="financials" className="mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {financials && financials.annual.length > 0 ? (
              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-sm">Income Statement</CardTitle></CardHeader>
                <CardContent><FinancialTable data={financials} rows={incomeRows} /></CardContent>
              </Card>
            ) : (
              <Card><CardContent className="py-12 text-center text-muted-foreground"><p className="text-sm">Income statement data not available for {ticker}.</p></CardContent></Card>
            )}

            {balanceSheet && balanceSheet.annual.length > 0 && (
              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-sm">Balance Sheet</CardTitle></CardHeader>
                <CardContent><FinancialTable data={balanceSheet} rows={balanceRows} /></CardContent>
              </Card>
            )}

            {cashFlow && cashFlow.annual.length > 0 && (
              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-sm">Cash Flow Statement</CardTitle></CardHeader>
                <CardContent><FinancialTable data={cashFlow} rows={cashFlowRows} /></CardContent>
              </Card>
            )}

            {financials && financials.annual.length >= 2 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <MarginChart financials={financials} />
                {cashFlow && cashFlow.annual.length >= 2 && <CashFlowChart cashFlow={cashFlow} />}
              </div>
            )}
          </div>
          <div className="space-y-6">
            {ratios && <ValuationCard ratios={ratios} quote={quote} />}
            {(quote || profile) && (
              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-sm">Quick Stats</CardTitle></CardHeader>
                <CardContent>
                  {quote && <DetailRow label="Market Cap" value={fmt(quote.marketCap)} />}
                  {quote?.pe && <DetailRow label="P/E Ratio" value={quote.pe.toFixed(1)} />}
                  {quote?.eps && <DetailRow label="EPS" value={fmtDollar(quote.eps)} />}
                  {quote && <DetailRow label="Price" value={fmtDollar(quote.price)} />}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </TabsContent>

      {/* ─── Analysis Tab (AI + Ratios + Recommendations + Estimates) ─── */}
      <TabsContent value="analysis" className="mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <AIInsightCard ticker={ticker} compact />

            {recommendations.length > 0 && <RecommendationChart recommendations={recommendations} />}

            {analystEstimates.length > 0 && <EstimatesTable estimates={analystEstimates} />}

            {ratios ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <ProfitabilityCard ratios={ratios} />
                  <LiquidityCard ratios={ratios} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <ValuationCard ratios={ratios} quote={quote} />
                  <PerShareCard ratios={ratios} />
                </div>
              </>
            ) : recommendations.length === 0 && analystEstimates.length === 0 ? (
              <Card><CardContent className="py-12 text-center text-muted-foreground"><p className="text-sm">Analysis data not available for {ticker}.</p></CardContent></Card>
            ) : null}
          </div>
          <div className="space-y-6">
            <NewsSidebar news={news.slice(0, 6)} name={name} />
          </div>
        </div>
      </TabsContent>

      {/* ─── News Tab ─── */}
      <TabsContent value="news" className="mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {news.length > 0 && (
              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-sm">Latest News</CardTitle></CardHeader>
                <CardContent><NewsList news={news} /></CardContent>
              </Card>
            )}
            {filings.length > 0 && (
              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-sm">SEC Filings</CardTitle></CardHeader>
                <CardContent><FilingsList filings={filings} /></CardContent>
              </Card>
            )}
            {filings.length === 0 && news.length === 0 && (
              <Card><CardContent className="py-12 text-center text-muted-foreground"><p className="text-sm">No news or filings available for {ticker}.</p></CardContent></Card>
            )}
          </div>
          <div className="space-y-6">
            {(quote || profile) && (
              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-sm">Financial Summary</CardTitle></CardHeader>
                <CardContent>
                  {quote && <DetailRow label="Price" value={fmtDollar(quote.price)} />}
                  {quote && <DetailRow label="Market Cap" value={fmt(quote.marketCap)} />}
                  {profile?.exchange && <DetailRow label="Exchange" value={profile.exchange} />}
                  {profile?.sector && <DetailRow label="Sector" value={profile.sector} />}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </TabsContent>

      {/* ─── Ownership Tab ─── */}
      <TabsContent value="ownership" className="mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {insiderTrades.length > 0 ? (
              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-sm">Insider Transactions</CardTitle></CardHeader>
                <CardContent><InsiderTable transactions={insiderTrades} /></CardContent>
              </Card>
            ) : (
              <Card><CardContent className="py-12 text-center text-muted-foreground"><p className="text-sm">No insider transaction data available for {ticker}.</p></CardContent></Card>
            )}
          </div>
          <div className="space-y-6">
            <NewsSidebar news={news.slice(0, 6)} name={name} />
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
}
