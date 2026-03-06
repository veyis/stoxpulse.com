import { cn } from "@/lib/utils";
import {
  TrendingUp,
  TrendingDown,
  User,
  FileText,
  Target,
  Bot,
  BarChart3,
  Activity,
  Wallet,
  type LucideIcon,
} from "lucide-react";

export type SignalType =
  | "earnings-beat"
  | "earnings-miss"
  | "insider-buy"
  | "insider-sell"
  | "price-target-up"
  | "price-target-down"
  | "new-filing"
  | "ai-insight"
  | "analyst-upgrade"
  | "analyst-downgrade"
  | "valuation-alert"
  | "momentum-signal"
  | "cash-flow-alert";

const signalConfig: Record<
  SignalType,
  { label: string; icon: LucideIcon; color: string; bg: string; border: string }
> = {
  "earnings-beat": {
    label: "Earnings Beat",
    icon: TrendingUp,
    color: "text-positive",
    bg: "bg-positive-muted",
    border: "border-l-positive",
  },
  "earnings-miss": {
    label: "Earnings Miss",
    icon: TrendingDown,
    color: "text-negative",
    bg: "bg-negative-muted",
    border: "border-l-negative",
  },
  "insider-buy": {
    label: "Insider Buy",
    icon: User,
    color: "text-info",
    bg: "bg-info-muted",
    border: "border-l-info",
  },
  "insider-sell": {
    label: "Insider Sell",
    icon: User,
    color: "text-warning",
    bg: "bg-warning-muted",
    border: "border-l-warning",
  },
  "price-target-up": {
    label: "PT Raised",
    icon: Target,
    color: "text-positive",
    bg: "bg-positive-muted",
    border: "border-l-positive",
  },
  "price-target-down": {
    label: "PT Lowered",
    icon: Target,
    color: "text-negative",
    bg: "bg-negative-muted",
    border: "border-l-negative",
  },
  "new-filing": {
    label: "New Filing",
    icon: FileText,
    color: "text-muted-foreground",
    bg: "bg-surface-2",
    border: "border-l-border",
  },
  "ai-insight": {
    label: "AI Insight",
    icon: Bot,
    color: "text-brand",
    bg: "bg-brand/10",
    border: "border-l-brand",
  },
  "analyst-upgrade": {
    label: "Upgrade",
    icon: TrendingUp,
    color: "text-positive",
    bg: "bg-positive-muted",
    border: "border-l-positive",
  },
  "analyst-downgrade": {
    label: "Downgrade",
    icon: TrendingDown,
    color: "text-negative",
    bg: "bg-negative-muted",
    border: "border-l-negative",
  },
  "valuation-alert": {
    label: "Valuation",
    icon: BarChart3,
    color: "text-warning",
    bg: "bg-warning-muted",
    border: "border-l-warning",
  },
  "momentum-signal": {
    label: "Momentum",
    icon: Activity,
    color: "text-info",
    bg: "bg-info-muted",
    border: "border-l-info",
  },
  "cash-flow-alert": {
    label: "Cash Flow",
    icon: Wallet,
    color: "text-warning",
    bg: "bg-warning-muted",
    border: "border-l-warning",
  },
};

interface SignalBadgeProps {
  type: SignalType;
  size?: "sm" | "md";
  className?: string;
}

export function SignalBadge({ type, size = "sm", className }: SignalBadgeProps) {
  const config = signalConfig[type] ?? signalConfig["ai-insight"];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full font-medium",
        config.bg,
        config.color,
        size === "sm" ? "px-2 py-0.5 text-[10px] uppercase tracking-wider" : "px-2.5 py-1 text-xs",
        className
      )}
    >
      <Icon className={size === "sm" ? "h-2.5 w-2.5" : "h-3 w-3"} />
      {config.label}
    </span>
  );
}

export { signalConfig };
