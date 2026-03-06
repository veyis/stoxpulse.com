import Link from "next/link";
import { Activity, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-6 text-center px-6">
        <div className="flex items-center justify-center size-14 rounded-xl bg-brand/10 border border-brand/20">
          <Activity className="size-7 text-brand" />
        </div>
        <div>
          <h1 className="text-5xl font-bold font-display tracking-tight">404</h1>
          <p className="mt-2 text-muted-foreground">
            This page doesn&apos;t exist or has been moved.
          </p>
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl bg-brand px-6 py-3 text-sm font-semibold text-brand-foreground hover:bg-brand/90 transition-colors"
        >
          <ArrowLeft className="size-4" />
          Back to Home
        </Link>
      </div>
    </div>
  );
}
