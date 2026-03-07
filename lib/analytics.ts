// Centralized analytics tracking for StoxPulse
// Sends events to both GA4 and Vercel Analytics

type EventParams = Record<string, string | number | boolean>;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export function trackEvent(name: string, params?: EventParams) {
  // GA4
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", name, params);
  }
}

// Pre-defined events for type safety and consistency
export const analytics = {
  ctaClicked: (location: string, text: string) =>
    trackEvent("cta_clicked", { location, button_text: text }),

  waitlistSubmitted: (source: string) =>
    trackEvent("waitlist_submitted", { source }),

  waitlistError: (error: string) =>
    trackEvent("waitlist_error", { error }),

  pricingViewed: (plan: string) =>
    trackEvent("pricing_cta_clicked", { plan }),

  faqOpened: (question: string) =>
    trackEvent("faq_opened", { question }),

  toolUsed: (tool: string) =>
    trackEvent("tool_used", { tool_name: tool }),

  stockViewed: (ticker: string) =>
    trackEvent("stock_viewed", { ticker }),
};
