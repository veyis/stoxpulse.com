import { getFilings } from "@/lib/data";
import { DEFAULT_WATCHLIST } from "@/lib/data/dashboard";
import { cn } from "@/lib/utils";
import { connection } from "next/server";
import Link from "next/link";
import { tickerToSlug } from "@/data/stocks/sp500";
import { FileText } from "lucide-react";

export const metadata = {
  title: "SEC Filings — StoxPulse",
};

function FilingTypeBadge({ type }: { type: string }) {
  const style = {
    "10-K": "bg-brand/10 text-brand",
    "10-Q": "bg-info-muted text-info",
    "8-K": "bg-warning-muted text-warning",
  }[type] ?? "bg-surface-2 text-muted-foreground";

  return (
    <span className={cn("inline-flex items-center rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider font-mono", style)}>
      {type}
    </span>
  );
}

export default async function FilingsPage() {
  await connection();

  // Fetch filings for all watchlist tickers
  const results = await Promise.all(
    DEFAULT_WATCHLIST.map(async (ticker) => ({
      ticker,
      filings: await getFilings(ticker, 5).catch(() => []),
    }))
  );

  // Flatten and sort by date
  const allFilings = results
    .flatMap(({ ticker, filings }) =>
      filings.map((f) => ({ ...f, ticker }))
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold font-display tracking-tight">SEC Filings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Recent SEC filings from EDGAR for your watchlist stocks. {allFilings.length} filings.
        </p>
      </div>

      <div className="rounded-xl border border-border/50 bg-card">
        <div className="divide-y divide-border/30">
          {allFilings.length === 0 ? (
            <div className="py-12 text-center">
              <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No recent filings found.</p>
            </div>
          ) : (
            allFilings.map((filing, i) => (
              <div
                key={`${filing.ticker}-${filing.type}-${i}`}
                className="flex items-center gap-4 px-5 py-3.5 hover:bg-surface-2/30 transition-colors"
              >
                <Link
                  href={`/stocks/${tickerToSlug(filing.ticker)}`}
                  className="font-mono font-bold text-sm w-16 shrink-0 hover:text-brand transition-colors"
                >
                  {filing.ticker}
                </Link>
                <FilingTypeBadge type={filing.type} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">{filing.description}</p>
                </div>
                <span className="text-xs text-muted-foreground tabular-nums shrink-0">
                  {filing.date}
                </span>
                {filing.url && (
                  <a
                    href={filing.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-brand hover:underline shrink-0"
                  >
                    View
                  </a>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
