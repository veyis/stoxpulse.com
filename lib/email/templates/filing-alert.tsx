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

export interface FilingAlertProps {
  ticker: string;
  filingType: string;
  summary: string;
  significance: number;
  filingUrl: string;
  analysisUrl: string;
  unsubscribeUrl: string;
}

const colors = {
  bg: "#0a0a0a",
  surface: "#141414",
  border: "#2a2a2a",
  green: "#22c55e",
  red: "#ef4444",
  yellow: "#eab308",
  textPrimary: "#fafafa",
  textSecondary: "#a1a1aa",
  textMuted: "#71717a",
};

function significanceColor(score: number): string {
  if (score >= 8) return colors.red;
  if (score >= 5) return colors.yellow;
  return colors.green;
}

function significanceLabel(score: number): string {
  if (score >= 8) return "High Impact";
  if (score >= 5) return "Medium Impact";
  return "Low Impact";
}

export function FilingAlertEmail({
  ticker,
  filingType,
  summary,
  significance,
  filingUrl,
  analysisUrl,
  unsubscribeUrl,
}: FilingAlertProps) {
  const sigColor = significanceColor(significance);
  const sigLabel = significanceLabel(significance);

  return (
    <Html>
      <Head />
      <Preview>
        [{ticker}] {filingType} Filed — {sigLabel}
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
              SEC Filing Alert
            </Text>
          </Section>

          {/* Filing Badge + Ticker */}
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
                display: "inline-block",
                fontSize: "12px",
                fontWeight: 700,
                color: colors.textPrimary,
                backgroundColor: colors.border,
                padding: "4px 12px",
                borderRadius: "6px",
                margin: "0 0 12px",
                fontFamily: "system-ui, -apple-system, monospace",
                letterSpacing: "1px",
                textTransform: "uppercase",
              }}
            >
              {filingType}
            </Text>
            <Text
              style={{
                fontSize: "32px",
                fontWeight: 700,
                color: colors.textPrimary,
                margin: "0 0 16px",
                fontFamily: "system-ui, -apple-system, monospace",
                letterSpacing: "2px",
              }}
            >
              {ticker}
            </Text>

            {/* Significance Score */}
            <Row>
              <Column style={{ textAlign: "center" }}>
                <Text
                  style={{
                    fontSize: "12px",
                    color: colors.textMuted,
                    margin: "0 0 6px",
                    fontFamily: "system-ui, -apple-system, sans-serif",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  Significance
                </Text>
                <Text
                  style={{
                    fontSize: "28px",
                    fontWeight: 700,
                    color: sigColor,
                    margin: "0 0 4px",
                    fontFamily: "system-ui, -apple-system, sans-serif",
                  }}
                >
                  {significance}/10
                </Text>
                <Text
                  style={{
                    fontSize: "13px",
                    fontWeight: 600,
                    color: sigColor,
                    margin: 0,
                    fontFamily: "system-ui, -apple-system, sans-serif",
                  }}
                >
                  {sigLabel}
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
              AI Summary
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

          {/* CTA Buttons */}
          <Section style={{ textAlign: "center", marginBottom: "16px" }}>
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
              Read AI Analysis
            </Link>
          </Section>

          <Section style={{ textAlign: "center", marginBottom: "32px" }}>
            <Link
              href={filingUrl}
              style={{
                fontSize: "13px",
                color: colors.textSecondary,
                textDecoration: "underline",
                fontFamily: "system-ui, -apple-system, sans-serif",
              }}
            >
              View Original Filing on SEC.gov
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

export default FilingAlertEmail;
