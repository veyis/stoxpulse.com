"use client";

import { useState, useEffect, useCallback } from "react";
import { Star } from "lucide-react";
import {
  addToWatchlist,
  removeFromWatchlist,
  isInWatchlist,
  WATCHLIST_MAX_FREE,
} from "@/lib/watchlist";
import { trackEvent } from "@/lib/analytics";

interface WatchlistButtonProps {
  ticker: string;
  size?: "sm" | "md";
}

export function WatchlistButton({ ticker, size = "md" }: WatchlistButtonProps) {
  const [inList, setInList] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    setInList(isInWatchlist(ticker));
  }, [ticker]);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }, []);

  const handleToggle = () => {
    if (inList) {
      removeFromWatchlist(ticker);
      setInList(false);
      showToast(`${ticker} removed from watchlist`);
      trackEvent("watchlist_removed", { ticker });
    } else {
      const result = addToWatchlist(ticker);
      if (result.success) {
        setInList(true);
        showToast(`${ticker} added to watchlist`);
        trackEvent("watchlist_added", { ticker });
      } else if (result.reason === "limit_reached") {
        showToast(`Watchlist full (${WATCHLIST_MAX_FREE} max)`);
      }
    }
    // Dispatch storage event for other components to react
    window.dispatchEvent(new Event("watchlist-changed"));
  };

  const isSmall = size === "sm";

  return (
    <div className="relative">
      <button
        onClick={handleToggle}
        className={`inline-flex items-center gap-1.5 rounded-lg border font-medium transition-all duration-200 ${
          inList
            ? "border-warning/40 bg-warning/10 text-warning hover:bg-warning/20"
            : "border-border bg-surface-1 text-muted-foreground hover:border-brand/40 hover:text-brand"
        } ${isSmall ? "px-2.5 py-1 text-xs" : "px-3.5 py-2 text-sm"}`}
        aria-label={inList ? `Remove ${ticker} from watchlist` : `Add ${ticker} to watchlist`}
      >
        <Star
          className={`${isSmall ? "size-3" : "size-3.5"} transition-all duration-200 ${
            inList ? "fill-warning text-warning" : ""
          }`}
        />
        {isSmall ? (inList ? "Saved" : "Watch") : (inList ? "In Watchlist" : "Add to Watchlist")}
      </button>

      {/* Toast notification */}
      {toast && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50 whitespace-nowrap rounded-lg bg-surface-2 border border-border px-3 py-1.5 text-xs font-medium text-foreground shadow-lg animate-fade-in">
          {toast}
        </div>
      )}
    </div>
  );
}
