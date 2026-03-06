import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { motion } from "framer-motion";

const portfolioStats = [
  { label: "Watchlist", value: "12 stocks" },
  { label: "Earnings This Week", value: "4" },
  { label: "New Filings (24h)", value: "7" },
  { label: "Alert Score", value: "3 items" },
];

export function DashboardHeader() {
  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
      }}
      className="space-y-6"
    >
      <motion.div 
        variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            Good morning
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Here&apos;s what&apos;s happening with your watchlist today.
          </p>
        </div>
        <Button size="sm" className="gap-1.5 self-start glow-brand bg-brand text-brand-foreground hover:bg-brand/90 transition-all hover:scale-105 active:scale-95 shadow-md">
          <Plus className="size-4" />
          Add Stock
        </Button>
      </motion.div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {portfolioStats.map((stat) => (
          <motion.div
            variants={{ hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0 } }}
            key={stat.label}
            className="rounded-2xl border border-border/50 bg-surface-1/40 backdrop-blur-md p-5 transition-all duration-300 hover:border-brand/30 hover:bg-surface-1/60 hover:-translate-y-0.5 hover:shadow-md hover:shadow-brand/5"
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{stat.label}</p>
            <p className="text-2xl font-bold font-display mt-1.5 text-foreground">{stat.value}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
