"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Bot, Loader2, RefreshCw } from "lucide-react";

interface AIDailyDigestProps {
  className?: string;
}

interface DigestData {
  bullets: string[];
  generatedAt: string;
}

export function AIDailyDigest({ className }: AIDailyDigestProps) {
  const [digest, setDigest] = useState<DigestData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchDigest = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch("/api/ai/daily-digest");
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setDigest(data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDigest();
  }, []);

  return (
    <div className={cn("rounded-xl border border-border/50 bg-card", className)}>
      <div className="flex items-center justify-between px-5 py-4 border-b border-border/50">
        <div className="flex items-center gap-2">
          <div className="size-6 rounded-md bg-brand/10 flex items-center justify-center">
            <Bot className="size-3.5 text-brand" />
          </div>
          <div>
            <h2 className="text-sm font-semibold font-display">AI Daily Digest</h2>
            <p className="text-xs text-muted-foreground">What matters today</p>
          </div>
        </div>
        {!loading && (
          <button
            onClick={fetchDigest}
            className="text-muted-foreground hover:text-foreground transition-colors"
            title="Refresh"
          >
            <RefreshCw className="size-3.5" />
          </button>
        )}
      </div>
      <div className="p-5">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="size-5 text-brand animate-spin" />
            <span className="ml-2 text-sm text-muted-foreground">Generating digest...</span>
          </div>
        ) : error ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            Unable to generate daily digest. AI features require a Gemini API key.
          </p>
        ) : digest ? (
          <ul className="space-y-3">
            {digest.bullets.map((bullet, i) => (
              <li key={i} className="flex gap-3 text-sm leading-relaxed">
                <span className="mt-0.5 flex-shrink-0 size-5 rounded-full bg-brand/10 text-brand text-xs font-bold flex items-center justify-center">
                  {i + 1}
                </span>
                <span className="text-foreground/90">{bullet}</span>
              </li>
            ))}
          </ul>
        ) : null}
        {digest?.generatedAt && (
          <p className="mt-4 text-[10px] text-muted-foreground/50 text-right">
            Generated {new Date(digest.generatedAt).toLocaleTimeString()}
          </p>
        )}
      </div>
    </div>
  );
}
