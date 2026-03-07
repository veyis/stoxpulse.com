import { resend, isEmailEnabled } from "./client";
import { DailyDigestEmail } from "./templates/daily-digest";
import type { DailyDigestProps } from "./templates/daily-digest";
import { EarningsAlertEmail } from "./templates/earnings-alert";
import type { EarningsAlertProps } from "./templates/earnings-alert";
import { FilingAlertEmail } from "./templates/filing-alert";
import type { FilingAlertProps } from "./templates/filing-alert";

const FROM = "StoxPulse <digest@stoxpulse.com>";

export async function sendDailyDigest(email: string, data: DailyDigestProps) {
  if (!isEmailEnabled() || !resend) {
    console.warn("[Email] Resend not configured, skipping daily digest send");
    return null;
  }

  const { data: result, error } = await resend.emails.send({
    from: FROM,
    to: email,
    subject: `Your Daily Market Digest — ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}`,
    react: DailyDigestEmail(data),
  });

  if (error) {
    console.error("[Email] Failed to send daily digest:", error);
    throw new Error(`Failed to send daily digest: ${error.message}`);
  }

  return result;
}

export async function sendEarningsAlert(
  email: string,
  data: EarningsAlertProps,
) {
  if (!isEmailEnabled() || !resend) {
    console.warn("[Email] Resend not configured, skipping earnings alert send");
    return null;
  }

  const epsDiff = data.epsActual - data.epsEstimate;
  const beatPercent =
    data.epsEstimate !== 0
      ? Math.abs((epsDiff / Math.abs(data.epsEstimate)) * 100).toFixed(0)
      : "N/A";
  const beatOrMiss = epsDiff >= 0 ? "Beat" : "Miss";

  const { data: result, error } = await resend.emails.send({
    from: FROM,
    to: email,
    subject: `[${data.ticker}] Earnings: ${beatOrMiss} by ${beatPercent}% | Revenue ${data.revenueGrowth} YoY`,
    react: EarningsAlertEmail(data),
  });

  if (error) {
    console.error("[Email] Failed to send earnings alert:", error);
    throw new Error(`Failed to send earnings alert: ${error.message}`);
  }

  return result;
}

export async function sendFilingAlert(
  email: string,
  data: FilingAlertProps,
) {
  if (!isEmailEnabled() || !resend) {
    console.warn("[Email] Resend not configured, skipping filing alert send");
    return null;
  }

  const { data: result, error } = await resend.emails.send({
    from: FROM,
    to: email,
    subject: `[${data.ticker}] ${data.filingType} Filed — Significance: ${data.significance}/10`,
    react: FilingAlertEmail(data),
  });

  if (error) {
    console.error("[Email] Failed to send filing alert:", error);
    throw new Error(`Failed to send filing alert: ${error.message}`);
  }

  return result;
}

export type { DailyDigestProps, EarningsAlertProps, FilingAlertProps };
