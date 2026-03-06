import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/landing/footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — StoxPulse",
  description: "StoxPulse privacy policy. How we collect, use, and protect your data.",
  alternates: {
    canonical: "https://stoxpulse.com/privacy",
  },
};

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-3xl px-6 pt-32 pb-24">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Privacy Policy</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated: March 5, 2026</p>

        <div className="mt-10 space-y-8 text-sm text-muted-foreground leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">1. Information We Collect</h2>
            <p>
              When you use StoxPulse, we collect information you provide directly, such as your email
              address when joining our waitlist or creating an account. We also collect usage data
              including pages visited, features used, and interaction patterns to improve our service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">2. How We Use Your Information</h2>
            <p>We use your information to:</p>
            <ul className="mt-2 list-disc list-inside space-y-1">
              <li>Provide, maintain, and improve StoxPulse services</li>
              <li>Send you updates about your watchlist and alerts you&apos;ve configured</li>
              <li>Communicate product updates and launch announcements</li>
              <li>Respond to your requests and support inquiries</li>
              <li>Analyze usage patterns to improve user experience</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">3. Data Sharing</h2>
            <p>
              We do not sell your personal information. We may share data with service providers who
              help us operate StoxPulse (hosting, email delivery, analytics), but only to the extent
              necessary for them to perform their services. All third-party providers are bound by
              data protection agreements.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">4. Data Security</h2>
            <p>
              We implement industry-standard security measures to protect your data, including
              encryption in transit (TLS) and at rest. However, no method of electronic storage is
              100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">5. Cookies & Analytics</h2>
            <p>
              We use essential cookies to maintain your session and preferences. We may use analytics
              tools to understand how our service is used. You can disable non-essential cookies
              through your browser settings.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">6. Your Rights</h2>
            <p>
              You have the right to access, correct, or delete your personal data. You can
              unsubscribe from marketing emails at any time. To exercise any of these rights,
              contact us at privacy@stoxpulse.com.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">7. Changes to This Policy</h2>
            <p>
              We may update this privacy policy from time to time. We will notify you of any
              material changes by posting the new policy on this page and updating the &quot;Last
              updated&quot; date.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">8. Contact</h2>
            <p>
              If you have questions about this privacy policy, please contact us at
              privacy@stoxpulse.com.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
