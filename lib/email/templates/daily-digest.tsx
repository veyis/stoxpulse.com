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

export interface DailyDigestProps {
  bullets: string[];
  watchlist: {
    ticker: string;
    price: number;
    changePercent: number;
    grade: string;
  }[];
  upcomingEarnings: {
    ticker: string;
    date: string;
    time: string;
  }[];
  unsubscribeUrl: string;
}

const colors = {
  bg: "#0a0a0a",
  surface: "#141414",
  surfaceAlt: "#1a1a1a",
  border: "#2a2a2a",
  green: "#22c55e",
  red: "#ef4444",
  textPrimary: "#fafafa",
  textSecondary: "#a1a1aa",
  textMuted: "#71717a",
};

export function DailyDigestEmail({
  bullets,
  watchlist,
  upcomingEarnings,
  unsubscribeUrl,
}: DailyDigestProps) {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Html>
      <Head />
      <Preview>Your daily market digest from StoxPulse AI</Preview>
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
              Daily Digest &middot; {today}
            </Text>
          </Section>

          {/* Section 1: 3 Key Takeaways */}
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
                fontSize: "18px",
                fontWeight: 600,
                color: colors.textPrimary,
                margin: "0 0 16px",
                fontFamily: "system-ui, -apple-system, sans-serif",
              }}
            >
              3 Key Takeaways
            </Text>
            {bullets.map((bullet, i) => (
              <Row key={i} style={{ marginBottom: i < bullets.length - 1 ? "12px" : "0" }}>
                <Column style={{ width: "28px", verticalAlign: "top" }}>
                  <Text
                    style={{
                      fontSize: "14px",
                      color: colors.green,
                      margin: 0,
                      fontFamily: "system-ui, -apple-system, sans-serif",
                      fontWeight: 600,
                    }}
                  >
                    {i + 1}.
                  </Text>
                </Column>
                <Column>
                  <Text
                    style={{
                      fontSize: "14px",
                      lineHeight: "1.6",
                      color: colors.textSecondary,
                      margin: 0,
                      fontFamily: "system-ui, -apple-system, sans-serif",
                    }}
                  >
                    {bullet}
                  </Text>
                </Column>
              </Row>
            ))}
          </Section>

          {/* Section 2: Watchlist Snapshot */}
          {watchlist.length > 0 && (
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
                  fontSize: "18px",
                  fontWeight: 600,
                  color: colors.textPrimary,
                  margin: "0 0 16px",
                  fontFamily: "system-ui, -apple-system, sans-serif",
                }}
              >
                Watchlist Snapshot
              </Text>

              {/* Table Header */}
              <Row
                style={{
                  borderBottom: `1px solid ${colors.border}`,
                  paddingBottom: "8px",
                  marginBottom: "8px",
                }}
              >
                <Column style={{ width: "30%" }}>
                  <Text
                    style={{
                      fontSize: "11px",
                      textTransform: "uppercase",
                      color: colors.textMuted,
                      margin: 0,
                      fontFamily: "system-ui, -apple-system, sans-serif",
                      letterSpacing: "0.5px",
                    }}
                  >
                    Ticker
                  </Text>
                </Column>
                <Column style={{ width: "25%", textAlign: "right" }}>
                  <Text
                    style={{
                      fontSize: "11px",
                      textTransform: "uppercase",
                      color: colors.textMuted,
                      margin: 0,
                      fontFamily: "system-ui, -apple-system, sans-serif",
                      letterSpacing: "0.5px",
                    }}
                  >
                    Price
                  </Text>
                </Column>
                <Column style={{ width: "25%", textAlign: "right" }}>
                  <Text
                    style={{
                      fontSize: "11px",
                      textTransform: "uppercase",
                      color: colors.textMuted,
                      margin: 0,
                      fontFamily: "system-ui, -apple-system, sans-serif",
                      letterSpacing: "0.5px",
                    }}
                  >
                    Change
                  </Text>
                </Column>
                <Column style={{ width: "20%", textAlign: "center" }}>
                  <Text
                    style={{
                      fontSize: "11px",
                      textTransform: "uppercase",
                      color: colors.textMuted,
                      margin: 0,
                      fontFamily: "system-ui, -apple-system, sans-serif",
                      letterSpacing: "0.5px",
                    }}
                  >
                    Pulse
                  </Text>
                </Column>
              </Row>

              {/* Table Rows */}
              {watchlist.map((stock, i) => (
                <Row
                  key={stock.ticker}
                  style={{
                    borderBottom:
                      i < watchlist.length - 1
                        ? `1px solid ${colors.border}`
                        : "none",
                    padding: "8px 0",
                  }}
                >
                  <Column style={{ width: "30%" }}>
                    <Text
                      style={{
                        fontSize: "14px",
                        fontWeight: 600,
                        color: colors.textPrimary,
                        margin: "4px 0",
                        fontFamily: "system-ui, -apple-system, monospace",
                      }}
                    >
                      {stock.ticker}
                    </Text>
                  </Column>
                  <Column style={{ width: "25%", textAlign: "right" }}>
                    <Text
                      style={{
                        fontSize: "14px",
                        color: colors.textSecondary,
                        margin: "4px 0",
                        fontFamily: "system-ui, -apple-system, sans-serif",
                      }}
                    >
                      ${stock.price.toFixed(2)}
                    </Text>
                  </Column>
                  <Column style={{ width: "25%", textAlign: "right" }}>
                    <Text
                      style={{
                        fontSize: "14px",
                        fontWeight: 600,
                        color:
                          stock.changePercent >= 0
                            ? colors.green
                            : colors.red,
                        margin: "4px 0",
                        fontFamily: "system-ui, -apple-system, sans-serif",
                      }}
                    >
                      {stock.changePercent >= 0 ? "+" : ""}
                      {stock.changePercent.toFixed(2)}%
                    </Text>
                  </Column>
                  <Column style={{ width: "20%", textAlign: "center" }}>
                    <Text
                      style={{
                        fontSize: "13px",
                        fontWeight: 700,
                        color: gradeColor(stock.grade),
                        margin: "4px 0",
                        fontFamily: "system-ui, -apple-system, sans-serif",
                      }}
                    >
                      {stock.grade}
                    </Text>
                  </Column>
                </Row>
              ))}
            </Section>
          )}

          {/* Section 3: Upcoming Earnings */}
          {upcomingEarnings.length > 0 && (
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
                  fontSize: "18px",
                  fontWeight: 600,
                  color: colors.textPrimary,
                  margin: "0 0 16px",
                  fontFamily: "system-ui, -apple-system, sans-serif",
                }}
              >
                Upcoming This Week
              </Text>
              {upcomingEarnings.map((earning, i) => (
                <Row
                  key={`${earning.ticker}-${i}`}
                  style={{
                    marginBottom:
                      i < upcomingEarnings.length - 1 ? "10px" : "0",
                  }}
                >
                  <Column style={{ width: "30%" }}>
                    <Text
                      style={{
                        fontSize: "14px",
                        fontWeight: 600,
                        color: colors.green,
                        margin: 0,
                        fontFamily: "system-ui, -apple-system, monospace",
                      }}
                    >
                      {earning.ticker}
                    </Text>
                  </Column>
                  <Column style={{ width: "40%" }}>
                    <Text
                      style={{
                        fontSize: "14px",
                        color: colors.textSecondary,
                        margin: 0,
                        fontFamily: "system-ui, -apple-system, sans-serif",
                      }}
                    >
                      {earning.date}
                    </Text>
                  </Column>
                  <Column style={{ width: "30%", textAlign: "right" }}>
                    <Text
                      style={{
                        fontSize: "12px",
                        color: colors.textMuted,
                        margin: 0,
                        fontFamily: "system-ui, -apple-system, sans-serif",
                        textTransform: "uppercase",
                      }}
                    >
                      {earning.time}
                    </Text>
                  </Column>
                </Row>
              ))}
            </Section>
          )}

          {/* Footer */}
          <Hr
            style={{
              borderColor: colors.border,
              margin: "24px 0",
            }}
          />
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

function gradeColor(grade: string): string {
  switch (grade) {
    case "A+":
    case "A":
      return colors.green;
    case "B+":
    case "B":
      return "#60a5fa";
    case "C+":
    case "C":
      return "#fbbf24";
    case "D":
    case "F":
      return colors.red;
    default:
      return colors.textSecondary;
  }
}

export default DailyDigestEmail;
