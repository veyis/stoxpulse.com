import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Link,
  Hr,
  Row,
  Column,
  Preview,
} from "@react-email/components";
import * as React from "react";

export interface EarningsAlertProps {
  ticker: string;
  companyName: string;
  summary: string;
  epsActual: number;
  epsEstimate: number;
  revenueGrowth: string;
  sentiment: string;
  analysisUrl: string;
  unsubscribeUrl: string;
}

const colors = {
  bg: "#0a0a0a",
  surface: "#141414",
  border: "#2a2a2a",
  green: "#22c55e",
  red: "#ef4444",
  textPrimary: "#fafafa",
  textSecondary: "#a1a1aa",
  textMuted: "#71717a",
};

export function EarningsAlertEmail({
  ticker,
  companyName,
  summary,
  epsActual,
  epsEstimate,
  revenueGrowth,
  sentiment,
  analysisUrl,
  unsubscribeUrl,
}: EarningsAlertProps) {
  const epsDiff = epsActual - epsEstimate;
  const epsBeatPercent =
    epsEstimate !== 0
      ? ((epsDiff / Math.abs(epsEstimate)) * 100).toFixed(1)
      : "N/A";
  const isBeat = epsDiff >= 0;
  const sentimentColor =
    sentiment === "bullish"
      ? colors.green
      : sentiment === "bearish"
        ? colors.red
        : colors.textSecondary;

  return (
    <Html>
      <Head />
      <Preview>
        [{ticker}] Earnings: {isBeat ? "Beat" : "Miss"} by {epsBeatPercent}% |
        Revenue {revenueGrowth} YoY
      </Preview>
      <Body style={{ backgroundColor: colors.bg, margin: 0, padding: 0 }}>
        <Container
          style={{
            maxWidth: "600px",
            margin: "0 auto",
            padding: "32px 16px",
          }}
        >
          {/* Header */}
          <Section style={{ textAlign: "center", marginBottom: "32px" }}>
            <Text
              style={{
                fontSize: "28px",
                fontWeight: 700,
                color: colors.green,
                margin: "0 0 4px",
                fontFamily: "system-ui, -apple-system, sans-serif",
                letterSpacing: "-0.5px",
              }}
            >
              StoxPulse
            </Text>
            <Text
              style={{
                fontSize: "14px",
                color: colors.textSecondary,
                margin: 0,
                fontFamily: "system-ui, -apple-system, sans-serif",
              }}
            >
              Earnings Alert
            </Text>
          </Section>

          {/* Ticker Banner */}
          <Section
            style={{
              backgroundColor: colors.surface,
              borderRadius: "12px",
              padding: "24px",
              marginBottom: "20px",
              border: `1px solid ${colors.border}`,
              textAlign: "center",
            }}
          >
            <Text
              style={{
                fontSize: "14px",
                color: colors.textMuted,
                margin: "0 0 4px",
                fontFamily: "system-ui, -apple-system, sans-serif",
              }}
            >
              {companyName}
            </Text>
            <Text
              style={{
                fontSize: "32px",
                fontWeight: 700,
                color: colors.textPrimary,
                margin: "0 0 12px",
                fontFamily: "system-ui, -apple-system, monospace",
                letterSpacing: "2px",
              }}
            >
              {ticker}
            </Text>
            <Text
              style={{
                display: "inline-block",
                fontSize: "14px",
                fontWeight: 600,
                color: isBeat ? colors.green : colors.red,
                backgroundColor: isBeat
                  ? "rgba(34, 197, 94, 0.1)"
                  : "rgba(239, 68, 68, 0.1)",
                padding: "6px 16px",
                borderRadius: "999px",
                margin: 0,
                fontFamily: "system-ui, -apple-system, sans-serif",
              }}
            >
              {isBeat ? "BEAT" : "MISS"} by {epsBeatPercent}%
            </Text>
          </Section>

          {/* Key Numbers */}
          <Section
            style={{
              backgroundColor: colors.surface,
              borderRadius: "12px",
              padding: "24px",
              marginBottom: "20px",
              border: `1px solid ${colors.border}`,
            }}
          >
            <Text
              style={{
                fontSize: "16px",
                fontWeight: 600,
                color: colors.textPrimary,
                margin: "0 0 16px",
                fontFamily: "system-ui, -apple-system, sans-serif",
              }}
            >
              Key Numbers
            </Text>

            <Row style={{ marginBottom: "12px" }}>
              <Column style={{ width: "50%" }}>
                <Text
                  style={{
                    fontSize: "12px",
                    color: colors.textMuted,
                    margin: "0 0 4px",
                    fontFamily: "system-ui, -apple-system, sans-serif",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  EPS Actual
                </Text>
                <Text
                  style={{
                    fontSize: "22px",
                    fontWeight: 700,
                    color: colors.textPrimary,
                    margin: 0,
                    fontFamily: "system-ui, -apple-system, sans-serif",
                  }}
                >
                  ${epsActual.toFixed(2)}
                </Text>
              </Column>
              <Column style={{ width: "50%" }}>
                <Text
                  style={{
                    fontSize: "12px",
                    color: colors.textMuted,
                    margin: "0 0 4px",
                    fontFamily: "system-ui, -apple-system, sans-serif",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  EPS Estimate
                </Text>
                <Text
                  style={{
                    fontSize: "22px",
                    fontWeight: 700,
                    color: colors.textSecondary,
                    margin: 0,
                    fontFamily: "system-ui, -apple-system, sans-serif",
                  }}
                >
                  ${epsEstimate.toFixed(2)}
                </Text>
              </Column>
            </Row>

            <Row>
              <Column style={{ width: "50%" }}>
                <Text
                  style={{
                    fontSize: "12px",
                    color: colors.textMuted,
                    margin: "0 0 4px",
                    fontFamily: "system-ui, -apple-system, sans-serif",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  Revenue Growth
                </Text>
                <Text
                  style={{
                    fontSize: "22px",
                    fontWeight: 700,
                    color: colors.green,
                    margin: 0,
                    fontFamily: "system-ui, -apple-system, sans-serif",
                  }}
                >
                  {revenueGrowth}
                </Text>
              </Column>
              <Column style={{ width: "50%" }}>
                <Text
                  style={{
                    fontSize: "12px",
                    color: colors.textMuted,
                    margin: "0 0 4px",
                    fontFamily: "system-ui, -apple-system, sans-serif",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  Sentiment
                </Text>
                <Text
                  style={{
                    fontSize: "22px",
                    fontWeight: 700,
                    color: sentimentColor,
                    margin: 0,
                    fontFamily: "system-ui, -apple-system, sans-serif",
                    textTransform: "capitalize",
                  }}
                >
                  {sentiment}
                </Text>
              </Column>
            </Row>
          </Section>

          {/* AI Summary */}
          <Section
            style={{
              backgroundColor: colors.surface,
              borderRadius: "12px",
              padding: "24px",
              marginBottom: "20px",
              border: `1px solid ${colors.border}`,
            }}
          >
            <Text
              style={{
                fontSize: "16px",
                fontWeight: 600,
                color: colors.textPrimary,
                margin: "0 0 12px",
                fontFamily: "system-ui, -apple-system, sans-serif",
              }}
            >
              AI Analysis
            </Text>
            <Text
              style={{
                fontSize: "14px",
                lineHeight: "1.7",
                color: colors.textSecondary,
                margin: 0,
                fontFamily: "system-ui, -apple-system, sans-serif",
              }}
            >
              {summary}
            </Text>
          </Section>

          {/* CTA Button */}
          <Section style={{ textAlign: "center", marginBottom: "32px" }}>
            <Link
              href={analysisUrl}
              style={{
                display: "inline-block",
                backgroundColor: colors.green,
                color: "#000",
                fontSize: "14px",
                fontWeight: 600,
                padding: "12px 32px",
                borderRadius: "8px",
                textDecoration: "none",
                fontFamily: "system-ui, -apple-system, sans-serif",
              }}
            >
              See Full Analysis on StoxPulse
            </Link>
          </Section>

          {/* Footer */}
          <Hr style={{ borderColor: colors.border, margin: "24px 0" }} />
          <Section style={{ textAlign: "center" }}>
            <Text
              style={{
                fontSize: "12px",
                color: colors.textMuted,
                margin: "0 0 8px",
                fontFamily: "system-ui, -apple-system, sans-serif",
              }}
            >
              Powered by StoxPulse AI
            </Text>
            <Link
              href={unsubscribeUrl}
              style={{
                fontSize: "12px",
                color: colors.textMuted,
                textDecoration: "underline",
                fontFamily: "system-ui, -apple-system, sans-serif",
              }}
            >
              Unsubscribe
            </Link>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export default EarningsAlertEmail;
