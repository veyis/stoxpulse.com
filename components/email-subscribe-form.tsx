"use client";

import { useState } from "react";

export function EmailSubscribeForm() {
  const [email, setEmail] = useState("");
  const [daily, setDaily] = useState(true);
  const [earnings, setEarnings] = useState(true);
  const [filings, setFilings] = useState(true);
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!email.trim()) return;

    setStatus("loading");

    try {
      const res = await fetch("/api/email/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          preferences: { daily, earnings, filings },
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus("error");
        setMessage(data.error ?? "Something went wrong");
        return;
      }

      setStatus("success");
      setMessage(data.message ?? "Subscribed successfully!");
      setEmail("");
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
      {/* Email Input */}
      <div className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          className="flex-1 rounded-lg border border-border bg-surface-1 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-brand-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {status === "loading" ? "..." : "Subscribe"}
        </button>
      </div>

      {/* Preference Checkboxes */}
      <div className="flex flex-wrap gap-x-5 gap-y-2">
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <input
            type="checkbox"
            checked={daily}
            onChange={(e) => setDaily(e.target.checked)}
            className="size-4 rounded border-border bg-surface-1 text-brand accent-brand"
          />
          Daily Digest
        </label>
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <input
            type="checkbox"
            checked={earnings}
            onChange={(e) => setEarnings(e.target.checked)}
            className="size-4 rounded border-border bg-surface-1 text-brand accent-brand"
          />
          Earnings Alerts
        </label>
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <input
            type="checkbox"
            checked={filings}
            onChange={(e) => setFilings(e.target.checked)}
            className="size-4 rounded border-border bg-surface-1 text-brand accent-brand"
          />
          Filing Alerts
        </label>
      </div>

      {/* Status Message */}
      {status !== "idle" && status !== "loading" && (
        <p
          className={`text-sm font-medium ${
            status === "success" ? "text-positive" : "text-negative"
          }`}
        >
          {message}
        </p>
      )}
    </form>
  );
}
