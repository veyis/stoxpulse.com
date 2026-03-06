"use client";

import { usePathname } from "next/navigation";

const routeNames: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/watchlist": "Watchlist",
  "/dashboard/signals": "Signals",
  "/dashboard/earnings": "Earnings",
  "/dashboard/news": "News",
  "/dashboard/filings": "Filings",
  "/dashboard/screener": "Screener",
  "/dashboard/analytics": "Analytics",
  "/dashboard/alerts": "Alerts",
  "/dashboard/settings": "Settings",
};

export function BreadcrumbNav() {
  const pathname = usePathname();
  const pageName = routeNames[pathname] ?? pathname.split("/").pop() ?? "Page";

  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <span className="font-medium">StoxPulse</span>
      <span className="text-border">/</span>
      <span>{pageName}</span>
    </div>
  );
}
