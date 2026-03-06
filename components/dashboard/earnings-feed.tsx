import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap, TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from "lucide-react";

const earningsReports = [
  {
    ticker: "META",
    name: "Meta Platforms",
    date: "Feb 28, 2026",
    status: "analyzed" as const,
    result: "beat" as const,
    revenueVsExpected: "+5.2%",
    epsVsExpected: "+8.1%",
    sentimentChange: "up" as const,
    keyInsight:
      "Reality Labs losses narrowing faster than expected. Ad revenue per user up 18% in North America. Management raised Q2 guidance significantly.",
    redFlags: [],
    highlights: ["Revenue: $48.2B vs $45.8B expected", "AI ad targeting driving 22% engagement lift"],
  },
  {
    ticker: "GOOG",
    name: "Alphabet",
    date: "Feb 27, 2026",
    status: "analyzed" as const,
    result: "beat" as const,
    revenueVsExpected: "+3.8%",
    epsVsExpected: "+6.2%",
    sentimentChange: "stable" as const,
    keyInsight:
      "Search revenue grew 14% YoY. Cloud segment reached profitability milestone. YouTube ad revenue exceeded $10B for the quarter.",
    redFlags: ["Regulatory headwinds in EU mentioned 4 times (up from 1 last quarter)"],
    highlights: ["Cloud operating margin turned positive: 5.2%"],
  },
  {
    ticker: "NVDA",
    name: "NVIDIA",
    date: "Today — After Close",
    status: "upcoming" as const,
    result: null,
    revenueVsExpected: null,
    epsVsExpected: null,
    sentimentChange: null,
    keyInsight: null,
    redFlags: [],
    highlights: [
      "Consensus: $38.5B revenue, $0.89 EPS",
      "Key metric to watch: Data Center revenue growth rate",
      "Watch for: Blackwell chip production timeline update",
    ],
  },
];

const resultStyles = {
  beat: "bg-positive/10 text-positive border-positive/20",
  miss: "bg-negative/10 text-negative border-negative/20",
  inline: "bg-muted text-muted-foreground",
};

export function EarningsFeed() {
  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Earnings Intelligence</CardTitle>
          <Badge variant="outline" className="text-xs">
            4 reports this week
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {earningsReports.map((report) => (
          <div
            key={report.ticker + report.date}
            className="rounded-xl border border-border bg-background p-4 space-y-3 hover:border-primary/20 transition-colors cursor-pointer"
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="font-display font-bold">{report.ticker}</span>
                <span className="text-xs text-muted-foreground">{report.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{report.date}</span>
                {report.status === "analyzed" && report.result && (
                  <Badge variant="outline" className={`text-[10px] ${resultStyles[report.result]}`}>
                    {report.result === "beat" ? <TrendingUp className="size-2.5 mr-1" /> : <TrendingDown className="size-2.5 mr-1" />}
                    {report.result === "beat" ? "Beat" : "Miss"}
                  </Badge>
                )}
                {report.status === "upcoming" && (
                  <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/20">
                    Upcoming
                  </Badge>
                )}
              </div>
            </div>

            {/* Results (for analyzed reports) */}
            {report.status === "analyzed" && (
              <div className="flex gap-4 text-xs">
                <div>
                  <span className="text-muted-foreground">Revenue vs Est: </span>
                  <span className="font-medium text-positive">{report.revenueVsExpected}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">EPS vs Est: </span>
                  <span className="font-medium text-positive">{report.epsVsExpected}</span>
                </div>
              </div>
            )}

            {/* AI Insight */}
            {report.keyInsight && (
              <div className="flex items-start gap-2 rounded-lg bg-primary/5 border border-primary/10 p-3">
                <Zap className="size-3.5 text-primary shrink-0 mt-0.5" />
                <p className="text-xs text-foreground leading-relaxed">{report.keyInsight}</p>
              </div>
            )}

            {/* Highlights */}
            {report.highlights.length > 0 && (
              <div className="space-y-1.5">
                {report.highlights.map((h, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs">
                    <CheckCircle className="size-3 text-positive shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{h}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Red Flags */}
            {report.redFlags.length > 0 && (
              <div className="space-y-1.5">
                {report.redFlags.map((flag, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs">
                    <AlertTriangle className="size-3 text-warning shrink-0 mt-0.5" />
                    <span className="text-warning/80">{flag}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
