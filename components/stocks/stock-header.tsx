"use client";

import { Badge } from "@/components/ui/badge";
import { StockPrice } from "./stock-price";
import { FiftyTwoWeekBar } from "./fifty-two-week-bar";
import type { StockQuote } from "@/lib/types/stock";
import type { CompanyProfile } from "@/lib/data/types";

interface StockHeaderProps {
  ticker: string;
  quote: StockQuote | null;
  profile: CompanyProfile | null;
}

export function StockHeader({ ticker, quote, profile }: StockHeaderProps) {
  const name = profile?.name ?? ticker;

  return (
    <div className="stock-header space-y-4">
      {/* Company name + badges */}
      <div>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold font-display tracking-tight">{name}</h1>
        <div className="flex items-center gap-2 mt-2">
          <Badge variant="secondary" className="text-xs font-mono font-bold px-2.5 py-0.5">
            {ticker}
          </Badge>
          {profile?.exchange && (
            <Badge variant="outline" className="text-xs px-2.5 py-0.5">
              {profile.exchange}
            </Badge>
          )}
          {profile?.sector && (
            <Badge variant="outline" className="text-xs px-2.5 py-0.5">
              {profile.sector}
            </Badge>
          )}
        </div>
      </div>

      {/* Price block */}
      {quote && (
        <div className="flex flex-col sm:flex-row sm:items-end gap-4">
          <StockPrice
            price={quote.price}
            change={quote.change}
            changePercent={quote.changePercent}
            size="xl"
          />
          {quote.high52w && quote.low52w && (
            <div className="sm:ml-auto sm:w-64">
              <FiftyTwoWeekBar
                low={quote.low52w}
                high={quote.high52w}
                current={quote.price}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
