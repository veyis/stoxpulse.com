// AI-generated signal types
// These are the structured outputs from the LLM

import type { SignalType } from "@/components/stocks/signal-badge";

export interface AISignal {
  type: SignalType;
  title: string;
  detail: string;
  severity: "high" | "medium" | "low";
  sentiment: "bullish" | "bearish" | "neutral";
  confidence: number; // 0.0 – 1.0
  dataPoints: string[]; // which metrics/facts support this signal
}

export interface AIKeyMetric {
  label: string;
  value: string;
  interpretation: "positive" | "negative" | "neutral";
}

export interface AIStockAnalysis {
  ticker: string;
  signals: AISignal[];
  summary: string;
  detailedAnalysis: string; // 2-4 sentence deeper analysis
  overallSentiment: "bullish" | "bearish" | "neutral";
  sentimentScore: number; // -1.0 (very bearish) to +1.0 (very bullish)
  keyMetrics: AIKeyMetric[]; // 3-6 highlighted metrics with interpretation
  riskFactors: string[]; // top 1-3 risk factors
  catalysts: string[]; // upcoming 1-3 catalysts
}

// JSON Schema for Gemini structured output
export const AI_SIGNAL_SCHEMA = {
  type: "object",
  properties: {
    signals: {
      type: "array",
      items: {
        type: "object",
        properties: {
          type: {
            type: "string",
            enum: [
              "earnings-beat",
              "earnings-miss",
              "insider-buy",
              "insider-sell",
              "price-target-up",
              "price-target-down",
              "new-filing",
              "ai-insight",
              "analyst-upgrade",
              "analyst-downgrade",
              "valuation-alert",
              "momentum-signal",
              "cash-flow-alert",
            ],
            description:
              "Signal type. earnings-beat/miss for earnings. insider-buy/sell for insider trades. price-target-up/down for price movements. new-filing for SEC filings. analyst-upgrade/downgrade for consensus shifts. valuation-alert for over/undervaluation. momentum-signal for technical price signals. cash-flow-alert for cash flow quality issues. ai-insight for general analysis.",
          },
          title: {
            type: "string",
            description: "Short signal headline (max 80 chars). Be specific with numbers.",
          },
          detail: {
            type: "string",
            description: "One sentence explanation with data points. Max 200 chars.",
          },
          severity: {
            type: "string",
            enum: ["high", "medium", "low"],
            description: "high = actionable now, medium = worth noting, low = FYI",
          },
          sentiment: {
            type: "string",
            enum: ["bullish", "bearish", "neutral"],
          },
          confidence: {
            type: "number",
            description: "Confidence in this signal from 0.0 to 1.0. Higher when supported by multiple data points.",
          },
          dataPoints: {
            type: "array",
            items: { type: "string" },
            description: "1-3 specific metrics or facts that support this signal (e.g. 'P/E 28.5 vs sector avg 22', 'FCF margin expanded from 18% to 24%')",
          },
        },
        required: ["type", "title", "detail", "severity", "sentiment", "confidence", "dataPoints"],
      },
      description: "2-5 most important signals. Only include genuinely insightful signals, not obvious observations.",
    },
    summary: {
      type: "string",
      description: "One sentence overall take on this stock right now. Max 150 chars. Be specific with numbers.",
    },
    detailedAnalysis: {
      type: "string",
      description: "2-4 sentence deeper analysis covering valuation, financial health, and momentum. Max 500 chars.",
    },
    overallSentiment: {
      type: "string",
      enum: ["bullish", "bearish", "neutral"],
    },
    sentimentScore: {
      type: "number",
      description: "Sentiment from -1.0 (very bearish) to +1.0 (very bullish). 0 = neutral. Be precise: -0.3 = slightly bearish, +0.7 = strongly bullish.",
    },
    keyMetrics: {
      type: "array",
      items: {
        type: "object",
        properties: {
          label: { type: "string", description: "Metric name (e.g. 'P/E Ratio', 'FCF Yield', 'Revenue Growth')" },
          value: { type: "string", description: "Formatted value (e.g. '28.5x', '4.2%', '+18% YoY')" },
          interpretation: {
            type: "string",
            enum: ["positive", "negative", "neutral"],
            description: "Whether this metric is positive, negative, or neutral for the stock",
          },
        },
        required: ["label", "value", "interpretation"],
      },
      description: "3-6 key metrics that best characterize this stock right now. Pick the most telling numbers.",
    },
    riskFactors: {
      type: "array",
      items: { type: "string" },
      description: "1-3 key risk factors. Be specific (e.g. 'Current ratio 0.87 indicates short-term liquidity pressure').",
    },
    catalysts: {
      type: "array",
      items: { type: "string" },
      description: "1-3 upcoming catalysts that could move the stock (earnings dates, product launches, regulatory events).",
    },
  },
  required: [
    "signals",
    "summary",
    "detailedAnalysis",
    "overallSentiment",
    "sentimentScore",
    "keyMetrics",
    "riskFactors",
    "catalysts",
  ],
};
