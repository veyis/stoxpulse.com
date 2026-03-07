"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface TickerQuote {
  symbol: string;
  ticker?: string;
  price: number;
  change: number;
  changePercent: number;
}

const NON_STOCK_SYMBOLS = new Set(["XAUUSD", "XAGUSD"]);

function TickerItem({ q, onNavigate }: { q: TickerQuote; onNavigate: (symbol: string) => void }) {
  const isPositive = q.changePercent >= 0;
  const isClickable = !NON_STOCK_SYMBOLS.has(q.ticker ?? q.symbol);
  return (
    <span
      role={isClickable ? "link" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onMouseDown={isClickable ? (e) => {
        e.preventDefault();
        onNavigate(q.ticker ?? q.symbol);
      } : undefined}
      className={`inline-flex items-center gap-1.5 px-5 whitespace-nowrap transition-opacity ${isClickable ? "cursor-pointer hover:opacity-70" : ""}`}
    >
      <span className="font-mono font-bold text-sm text-foreground">{q.symbol}</span>
      <span className="font-mono text-sm tabular-nums text-muted-foreground">
        {q.price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </span>
      <span className={`font-mono text-sm font-bold tabular-nums ${isPositive ? "text-positive" : "text-negative"}`}>
        {isPositive ? "\u25B2" : "\u25BC"}
      </span>
      <span className={`font-mono text-sm font-semibold tabular-nums ${isPositive ? "text-positive" : "text-negative"}`}>
        {q.changePercent.toFixed(3)}%
      </span>
    </span>
  );
}

export function MarketTicker() {
  const [quotes, setQuotes] = useState<TickerQuote[]>([]);
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    async function fetchQuotes() {
      try {
        const res = await fetch("/api/quotes");
        if (!res.ok) return;
        const data: TickerQuote[] = await res.json();
        if (!cancelled) setQuotes(data);
      } catch {
        // silently fail
      }
    }

    fetchQuotes();
    const interval = setInterval(fetchQuotes, 60_000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  function handleNavigate(symbol: string) {
    const slug = symbol.toLowerCase().replace(/\./g, "-");
    router.push(`/stocks/${slug}`);
  }

  if (quotes.length === 0) {
    return (
      <div className="h-10 bg-secondary border-b border-border flex items-center justify-center">
        <div className="flex gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-2 w-20 rounded bg-muted-foreground/20 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="h-10 bg-secondary border-b border-border overflow-hidden relative">
      {/* Fade edges */}
      <div className="absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-secondary to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-secondary to-transparent z-10 pointer-events-none" />

      <div className="flex items-center h-full animate-ticker">
        {/* Render twice for seamless infinite loop */}
        {[0, 1].map((set) => (
          <div key={set} className="flex items-center shrink-0">
            {quotes.map((q) => (
              <TickerItem key={`${set}-${q.symbol}`} q={q} onNavigate={handleNavigate} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
