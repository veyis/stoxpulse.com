import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/landing/footer";
import { ChevronRight, FileText, Search, Zap } from "lucide-react";

export const metadata: Metadata = {
  title: "Free AI SEC Form 4 Insider Trading Decoder | StoxPulse",
  description:
    "Paste any SEC Form 4 URL and instantly get a plain-English translation. Understand insider buying and selling immediately without reading confusing XML tables.",
  keywords: [
    "sec form 4",
    "insider trading",
    "sec filing translator",
    "form 4 decoder",
    "insider buying tracking",
    "retail investor tools",
  ],
  alternates: {
    canonical: "https://stoxpulse.com/tools/sec-filing-translator",
  },
};

export default function SecFilingTranslatorPage() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "SEC Form 4 Decoder by StoxPulse",
    "applicationCategory": "FinanceApplication",
    "operatingSystem": "Web",
    "description": "Paste an SEC Form 4 URL and instantly translate the insider transaction into clear, plain English.",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <Navbar />
      <main className="min-h-screen pt-20 bg-background flex flex-col items-center">
        {/* Breadcrumbs */}
        <div className="w-full max-w-4xl px-6 pt-8">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
            <ChevronRight className="size-3.5" />
            <Link href="/tools" className="hover:text-foreground transition-colors">
              Tools
            </Link>
            <ChevronRight className="size-3.5" />
            <span className="text-foreground">SEC Filing Translator</span>
          </nav>
        </div>

        {/* Hero Section */}
        <section className="w-full max-w-4xl px-6 pt-16 pb-12 text-center">
          <div className="mx-auto flex items-center justify-center size-16 rounded-2xl bg-brand/10 border border-brand/20 mb-6">
            <FileText className="size-8 text-brand" />
          </div>
          <h1 className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl mb-6">
            Understand Insider Trades in <span className="text-brand">Seconds</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Stop trying to read confusing SEC XML tables. Paste any Form 4 link below, and our AI will translate it into a simple, actionable summary.
          </p>
        </section>

        {/* The Core App UI (Mockup for now, built to capture emails) */}
        <section className="w-full max-w-3xl px-6 pb-20">
          <div className="bg-surface-1 border border-border rounded-2xl p-6 md:p-10 shadow-lg relative overflow-hidden">
             
            {/* The Input */}
            <div className="relative">
              <label htmlFor="sec-url" className="sr-only">SEC Form 4 URL</label>
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                <Search className="size-5 text-muted-foreground" />
              </div>
              <input 
                type="url" 
                id="sec-url"
                className="block w-full rounded-xl border border-border bg-background p-4 pl-12 pr-40 text-foreground placeholder:text-muted-foreground focus:border-brand focus:ring-brand focus:outline-none transition-all sm:text-sm" 
                placeholder="Paste SEC Form 4 URL (e.g., https://www.sec.gov/Archives/...)" 
              />
              <button 
                type="button"
                className="absolute right-2 top-2 bottom-2 inline-flex items-center justify-center rounded-lg bg-brand px-6 font-semibold text-brand-foreground hover:bg-brand/90 transition-colors"
                onClick={(e) => {
                    e.preventDefault();
                    document.getElementById('decoder-results')?.classList.remove('hidden');
                    document.getElementById('empty-state')?.classList.add('hidden');
                }}
              >
                Decode Form 4
              </button>
            </div>

            {/* Empty State */}
            <div id="empty-state" className="mt-12 text-center pb-8 border-b border-border/50">
                <p className="text-sm text-muted-foreground font-medium mb-4">Try translating a recent filing (Click to test):</p>
                <div className="flex flex-wrap justify-center gap-3">
                    <button className="text-xs bg-surface text-foreground border border-border rounded-full px-4 py-2 hover:border-brand/40 transition-colors" onClick={() => {
                        const input = document.getElementById('sec-url') as HTMLInputElement;
                        if(input) input.value = 'https://www.sec.gov/Archives/edgar/data/1045810/000104581024000115/xslF345X05/wf-form4_171762512111300.xml';
                    }}>
                        NVIDIA (Mark Stevens) - $85M Sale
                    </button>
                    <button className="text-xs bg-surface text-foreground border border-border rounded-full px-4 py-2 hover:border-brand/40 transition-colors" onClick={() => {
                         const input = document.getElementById('sec-url') as HTMLInputElement;
                         if(input) input.value = 'https://www.sec.gov/Archives/edgar/data/1326801/000132680124000045/xslF345X04/wf-form4_1708123456789.xml';
                    }}>
                        META (Mark Zuckerberg) - $14M Sale
                    </button>
                </div>
            </div>

            {/* Simulated Result Container (Hidden by Default) */}
            <div id="decoder-results" className="hidden mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-surface border border-border rounded-xl p-6 relative overflow-hidden">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border/50 relative z-0">
                        <div className="bg-brand/20 p-2 rounded-full">
                            <Zap className="size-5 text-brand" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-foreground">AI Translation Complete</h3>
                            <p className="text-xs text-muted-foreground">Processed in 1.4s</p>
                        </div>
                    </div>
                    
                    {/* Fake Results forcing an email signup */}
                    <div className="space-y-4 relative">
                        {/* Blur overlay */}
                        <div className="absolute inset-x-0 bottom-0 top-1/4 bg-gradient-to-b from-transparent via-surface/90 to-surface z-10 flex flex-col items-center justify-end pb-8">
                             <div className="bg-background border border-border rounded-xl p-6 text-center shadow-2xl max-w-sm w-full mx-4 shadow-brand/10">
                                <h4 className="font-semibold text-foreground mb-2">Unlock Full Analysis</h4>
                                <p className="text-sm text-muted-foreground mb-4">Join 2,400+ investors getting free AI summaries of major SEC filings delivered weekly.</p>
                                <form onSubmit={(e) => e.preventDefault()}>
                                    <input required type="email" placeholder="Enter your best email" className="w-full rounded-lg border border-border bg-surface p-3 text-sm mb-3 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand" />
                                    <button type="submit" className="w-full bg-brand text-brand-foreground font-semibold py-3 rounded-lg text-sm hover:bg-brand/90 transition-colors shadow-lg shadow-brand/20">
                                        Reveal Translation
                                    </button>
                                </form>
                                <p className="text-xs text-muted-foreground mt-3">No spam. Unsubscribe anytime.</p>
                             </div>
                        </div>

                        {/* Blurred content behind it */}
                        <div className="opacity-40 select-none pb-48">
                            <p className="text-sm font-medium text-foreground mb-2">Executive Summary:</p>
                            <p className="text-sm text-muted-foreground mb-6">Mark Stevens (Director at NVIDIA) executed a direct sale of 100,000 shares of common stock at an average price of $850.55 per share, resulting in a total transaction value of approximately $85.05 Million.</p>
                            
                            <p className="text-sm font-medium text-foreground mb-2">Context & Sentiment:</p>
                            <p className="text-sm text-muted-foreground mb-4">This sale was not executed under a 10b5-1 trading plan. The director still retains 1,540,000 shares directly and 2,000,000 shares indirectly through a trust.</p>
                        </div>
                    </div>
                </div>
            </div>

          </div>
        </section>

        {/* SEO Content Section describing what it is */}
        <section className="w-full max-w-3xl px-6 pb-24 prose prose-neutral dark:prose-invert">
            <h2 className="text-foreground text-2xl font-bold mb-4">Why translating SEC Form 4 matters for investors</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
                Corporate insiders (Directors, Officers, and 10% Owners) are legally required to file a Form 4 with the U.S. Securities and Exchange Commission (SEC) within two business days of buying or selling their company's stock. 
            </p>
            <p className="text-muted-foreground leading-relaxed mb-6">
                While this data is highly valuable and public, the raw XML format on the EDGAR database is incredibly difficult for retail investors to parse quickly. Finding the transaction code, calculating the value, and understanding the post-transaction holdings requires manual math.
            </p>
            <h3 className="text-foreground text-xl font-semibold mb-4">How our AI Decoder works</h3>
            <p className="text-muted-foreground leading-relaxed">
                Our free tool uses advanced Large Language Models to instantly scrape the SEC's EDGAR database URL you provide. It automatically extracts the transaction codes (e.g., "P" for Purchase, "S" for Sale), calculates the total transaction value based on the weighted average price, and identifies if the trade was part of a pre-planned 10b5-1 schedule, delivering a 3-bullet summary.
            </p>
        </section>

      </main>
      <Footer />
    </>
  );
}
