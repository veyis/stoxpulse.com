import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/landing/footer";
import { getAllPosts } from "@/data/blog/posts";
import { ChevronRight, Clock, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "StoxPulse Blog — Stock Market Insights & AI Investing",
  description:
    "Stay ahead of the market with expert insights on AI investing, earnings call analysis, SEC filings, and stock research strategies. The StoxPulse blog for self-directed investors.",
  keywords: [
    "stock market blog",
    "AI investing blog",
    "earnings call analysis",
    "SEC filing guide",
    "stock research",
    "retail investor education",
  ],
  openGraph: {
    title: "StoxPulse Blog — Stock Market Insights & AI Investing",
    description:
      "Expert insights on AI investing, earnings calls, SEC filings, and stock research strategies.",
    url: "https://stoxpulse.com/blog",
  },
  alternates: {
    canonical: "https://stoxpulse.com/blog",
  },
};

export default function BlogPage() {
  const posts = getAllPosts();

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://stoxpulse.com" },
      { "@type": "ListItem", position: 2, name: "Blog", item: "https://stoxpulse.com/blog" },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <Navbar />
      <main className="min-h-screen pt-20 bg-background">
        {/* Breadcrumbs */}
        <div className="mx-auto max-w-5xl px-6 pt-8">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
            <ChevronRight className="size-3.5" />
            <span className="text-foreground">Blog</span>
          </nav>
        </div>

        {/* Hero */}
        <section className="mx-auto max-w-5xl px-6 pt-12 pb-12">
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            StoxPulse <span className="text-brand">Blog</span>
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl">
            Expert insights on AI-powered investing, earnings call analysis, SEC filings,
            and smarter stock research for self-directed investors.
          </p>
        </section>

        {/* Posts Grid */}
        <section className="mx-auto max-w-5xl px-6 pb-24">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group rounded-2xl bg-surface-1 border border-border p-6 hover:border-brand/40 transition-colors duration-200"
              >
                {post.pillar && (
                  <span className="inline-block mb-3 rounded-full bg-brand/10 border border-brand/20 px-3 py-0.5 text-xs font-semibold text-brand">
                    Pillar Post
                  </span>
                )}
                <h2 className="font-display text-lg font-semibold text-foreground group-hover:text-brand transition-colors">
                  {post.title}
                </h2>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed line-clamp-3">
                  {post.description}
                </p>
                <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                  <span>
                    {new Date(post.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="size-3" />
                    {post.readTime}
                  </span>
                </div>
                <div className="mt-3 flex items-center gap-1 text-sm font-medium text-brand opacity-0 group-hover:opacity-100 transition-opacity">
                  Read article
                  <ArrowRight className="size-3.5" />
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
