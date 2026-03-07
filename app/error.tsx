"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Activity, ArrowLeft, RotateCcw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[StoxPulse Error]", error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-6 text-center px-6 max-w-md">
        <div className="flex items-center justify-center size-14 rounded-xl bg-negative/10 border border-negative/20">
          <Activity className="size-7 text-negative" />
        </div>
        <div>
          <h1 className="text-3xl font-bold font-display tracking-tight">
            Something went wrong
          </h1>
          <p className="mt-2 text-muted-foreground text-sm leading-relaxed">
            We hit an unexpected error loading this page. This has been logged
            and we&apos;ll look into it.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-brand-foreground hover:bg-brand/90 transition-colors"
          >
            <RotateCcw className="size-4" />
            Try Again
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl border border-border px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-surface-1 transition-colors"
          >
            <ArrowLeft className="size-4" />
            Home
          </Link>
        </div>
        {error.digest && (
          <p className="text-xs text-muted-foreground/50">
            Error ID: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
