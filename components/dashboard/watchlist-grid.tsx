"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  FileText,
  Zap,
} from "lucide-react";

const watchlistStocks = [
  {
    ticker: "NVDA",
    name: "NVIDIA Corporation",
    price: 924.68,
    change: +3.24,
    changePercent: +0.35,
    pulseScore: 92,
    sentiment: "bullish" as const,
    events: [
      { type: "earnings", label: "Earnings Today", urgent: true },
    ],
    aiSummary: "Strong datacenter demand continues. AI training revenue up 42% YoY.",
  },
  {
    ticker: "AAPL",
    name: "Apple Inc.",
    price: 237.45,
    change: +1.89,
    changePercent: +0.80,
    pulseScore: 78,
    sentiment: "neutral" as const,
    events: [
      { type: "filing", label: "8-K Filed", urgent: false },
    ],
    aiSummary: "New buyback program announced. Services revenue steady. iPhone demand stable in China.",
  },
  {
    ticker: "MSFT",
    name: "Microsoft Corp.",
    price: 441.22,
    change: -2.15,
    changePercent: -0.48,
    pulseScore: 85,
    sentiment: "bullish" as const,
    events: [],
    aiSummary: "Azure growth re-accelerating. Copilot adoption in enterprise driving ARPU. Strong Q2 expected.",
  },
  {
    ticker: "TSLA",
    name: "Tesla Inc.",
    price: 178.92,
    change: -5.43,
    changePercent: -2.95,
    pulseScore: 41,
    sentiment: "bearish" as const,
    events: [
      { type: "insider", label: "CFO Sold $4.2M", urgent: true },
    ],
    aiSummary: "Margin pressure continues. CFO unusual sale flagged. Deliveries below estimates.",
  },
  {
    ticker: "GOOGL",
    name: "Alphabet Inc.",
    price: 178.33,
    change: +0.67,
    changePercent: +0.38,
    pulseScore: 74,
    sentiment: "neutral" as const,
    events: [],
    aiSummary: "Search ad revenue strong. YouTube growing. Cloud closing gap with Azure/AWS.",
  },
  {
    ticker: "AMZN",
    name: "Amazon.com Inc.",
    price: 213.87,
    change: +3.12,
    changePercent: +1.48,
    pulseScore: 88,
    sentiment: "bullish" as const,
    events: [
      { type: "earnings", label: "Earnings Thu", urgent: false },
    ],
    aiSummary: "AWS margins expanding. Ad business now $56B run rate. Retail profitability improving.",
  },
];

const sentimentBg = {
  bullish: "bg-positive/10 text-positive",
  bearish: "bg-negative/10 text-negative",
  neutral: "bg-muted text-muted-foreground",
};

function PulseScoreBadge({ score }: { score: number }) {
  const color =
    score >= 80 ? "bg-positive/10 text-positive border-positive/20" :
    score >= 60 ? "bg-warning/10 text-warning border-warning/20" :
    "bg-negative/10 text-negative border-negative/20";

  return (
    <div className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-bold ${color}`}>
      <Activity className="size-3" />
      {score}
    </div>
  );
}

export function WatchlistGrid() {
  return (
    <Tabs defaultValue="grid">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="text-lg">Watchlist</CardTitle>
          <TabsList className="h-8">
            <TabsTrigger value="grid" className="text-xs px-3 h-7">Cards</TabsTrigger>
            <TabsTrigger value="list" className="text-xs px-3 h-7">List</TabsTrigger>
          </TabsList>
        </CardHeader>
        <CardContent>
          {/* Cards view */}
          <TabsContent value="grid" className="mt-0">
            <motion.div 
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
              }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-4"
            >
              {watchlistStocks.map((stock) => (
                <motion.div
                  variants={{ hidden: { opacity: 0, scale: 0.98 }, visible: { opacity: 1, scale: 1 } }}
                  key={stock.ticker}
                  className="group relative rounded-2xl border border-border/50 bg-surface-1/40 backdrop-blur-md p-5 transition-all duration-300 hover:border-brand/40 hover:bg-surface-1/60 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand/5 cursor-pointer"
                >
                  {/* Header row: Ticker + Price */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-display font-bold text-[17px] group-hover:text-brand transition-colors">{stock.ticker}</span>
                        <PulseScoreBadge score={stock.pulseScore} />
                      </div>
                      <p className="text-[13px] font-medium text-muted-foreground mt-0.5 truncate">{stock.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono font-bold text-[15px]">${stock.price.toFixed(2)}</p>
                      <div className={`flex items-center justify-end gap-1 text-xs font-bold mt-1 ${stock.change >= 0 ? "text-positive" : "text-negative"}`}>
                        {stock.change >= 0 ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
                        {stock.change >= 0 ? "+" : ""}{stock.changePercent.toFixed(2)}%
                      </div>
                    </div>
                  </div>

                  {/* AI Summary */}
                  <div className="flex items-start gap-2 mb-4 bg-surface-2/40 rounded-lg p-3 border border-border/30 group-hover:border-brand/20 transition-colors">
                    <Zap className="size-3.5 text-brand shrink-0 mt-0.5" />
                    <p className="text-[13px] text-muted-foreground leading-relaxed line-clamp-2">
                      {stock.aiSummary}
                    </p>
                  </div>

                  {/* Events + Sentiment */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className={`text-[10px] h-5 ${sentimentBg[stock.sentiment]}`}>
                      {stock.sentiment}
                    </Badge>
                    {stock.events.map((event, i) => (
                      <Badge
                        key={i}
                        variant="outline"
                        className={`text-[10px] uppercase font-bold tracking-wider h-5 gap-1 shadow-sm ${
                          event.urgent
                            ? "border-brand/30 bg-brand/10 text-brand"
                            : "border-border/50 bg-surface-2"
                        }`}
                      >
                        <FileText className="size-2.5" />
                        {event.label}
                      </Badge>
                    ))}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </TabsContent>

          {/* List view */}
          <TabsContent value="list" className="mt-0">
            <div className="rounded-xl border border-border overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left font-medium text-muted-foreground px-4 py-2.5 text-xs">Ticker</th>
                    <th className="text-right font-medium text-muted-foreground px-4 py-2.5 text-xs">Price</th>
                    <th className="text-right font-medium text-muted-foreground px-4 py-2.5 text-xs">Change</th>
                    <th className="text-center font-medium text-muted-foreground px-4 py-2.5 text-xs">Pulse</th>
                    <th className="text-center font-medium text-muted-foreground px-4 py-2.5 text-xs">Sentiment</th>
                    <th className="text-left font-medium text-muted-foreground px-4 py-2.5 text-xs hidden md:table-cell">AI Insight</th>
                  </tr>
                </thead>
                <tbody>
                  {watchlistStocks.map((stock) => (
                    <tr
                      key={stock.ticker}
                      className="border-b border-border last:border-0 hover:bg-accent/30 cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div>
                          <span className="font-display font-bold">{stock.ticker}</span>
                          <p className="text-xs text-muted-foreground">{stock.name}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-semibold">
                        ${stock.price.toFixed(2)}
                      </td>
                      <td className={`px-4 py-3 text-right font-medium ${stock.change >= 0 ? "text-positive" : "text-negative"}`}>
                        <div className="flex items-center justify-end gap-1">
                          {stock.change >= 0 ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
                          {stock.change >= 0 ? "+" : ""}{stock.changePercent.toFixed(2)}%
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <PulseScoreBadge score={stock.pulseScore} />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge variant="outline" className={`text-[10px] h-5 ${sentimentBg[stock.sentiment]}`}>
                          {stock.sentiment}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <p className="text-xs text-muted-foreground line-clamp-1 max-w-xs">
                          {stock.aiSummary}
                        </p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>
        </CardContent>
      </Card>
    </Tabs>
  );
}
