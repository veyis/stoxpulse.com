import { AlertTriangle, FileText, TrendingUp } from "lucide-react";

const alerts = [
  {
    type: "earnings" as const,
    icon: TrendingUp,
    text: "NVDA reports earnings after market close today",
    time: "4:30 PM ET",
  },
  {
    type: "filing" as const,
    icon: FileText,
    text: "AAPL 8-K filed: $100B buyback authorized",
    time: "2h ago",
  },
  {
    type: "insider" as const,
    icon: AlertTriangle,
    text: "TSLA CFO sold $4.2M in shares (unusual — outside 10b5-1 plan)",
    time: "5h ago",
  },
];

const typeStyles = {
  earnings: "border-brand/30 bg-brand/5",
  filing: "border-info/30 bg-info/5",
  insider: "border-warning/30 bg-warning/5",
};

const iconStyles = {
  earnings: "text-brand",
  filing: "text-info",
  insider: "text-warning",
};

export function AlertsBanner() {
  return (
    <div className="space-y-2">
      {alerts.map((alert, i) => (
        <div
          key={i}
          className={`flex items-center gap-3 rounded-lg border px-4 py-2.5 text-sm ${typeStyles[alert.type]}`}
        >
          <alert.icon className={`size-4 shrink-0 ${iconStyles[alert.type]}`} />
          <span className="flex-1 text-foreground">{alert.text}</span>
          <span className="text-xs text-muted-foreground shrink-0">{alert.time}</span>
        </div>
      ))}
    </div>
  );
}
