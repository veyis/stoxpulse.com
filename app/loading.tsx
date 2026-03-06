import { Activity } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center justify-center size-12 rounded-xl bg-brand/10 border border-brand/20 animate-pulse-glow">
          <Activity className="size-6 text-brand" />
        </div>
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}
