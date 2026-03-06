import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SECFiling } from "@/lib/types/stock";

const filingColors: Record<string, string> = {
  "10-K": "bg-info-muted text-info",
  "10-Q": "bg-info-muted text-info",
  "8-K": "bg-warning-muted text-warning",
  "4": "bg-surface-2 text-muted-foreground",
  "DEF 14A": "bg-surface-2 text-muted-foreground",
};

interface FilingsListProps {
  filings: SECFiling[];
  className?: string;
}

export function FilingsList({ filings, className }: FilingsListProps) {
  if (filings.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-4">No recent filings found.</p>
    );
  }

  return (
    <div className={cn("space-y-1", className)}>
      {filings.map((filing, i) => (
        <a
          key={`${filing.type}-${filing.date}-${i}`}
          href={filing.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between gap-3 rounded-md px-3 py-2.5 transition-colors hover:bg-surface-2/50 group"
        >
          <div className="flex items-center gap-3 min-w-0">
            <Badge
              variant="secondary"
              className={cn(
                "text-[10px] font-semibold uppercase shrink-0 min-w-[3rem] justify-center",
                filingColors[filing.type] ?? "bg-surface-2 text-muted-foreground"
              )}
            >
              {filing.type}
            </Badge>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{filing.description}</p>
              <p className="text-xs text-muted-foreground tabular-nums">{filing.date}</p>
            </div>
          </div>
          <ExternalLink className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
        </a>
      ))}
    </div>
  );
}
