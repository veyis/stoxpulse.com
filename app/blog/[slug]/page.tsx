import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/landing/footer";
import { getAllPosts, getPostBySlug, getPostsByCluster } from "@/data/blog/posts";
import { ChevronRight, Clock, ArrowRight, ArrowLeft, User } from "lucide-react";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};

  return {
    title: `${post.title} | StoxPulse Blog`,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      url: `https://stoxpulse.com/blog/${slug}`,
      type: "article",
      publishedTime: post.date,
      modifiedTime: post.updated,
      authors: [post.author],
      images: [{ url: post.image }],
    },
    alternates: {
      canonical: `https://stoxpulse.com/blog/${slug}`,
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = getPostsByCluster(post.cluster).filter(
    (p) => p.slug !== post.slug
  );

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://stoxpulse.com" },
      { "@type": "ListItem", position: 2, name: "Blog", item: "https://stoxpulse.com/blog" },
      {
        "@type": "ListItem",
        position: 3,
        name: post.title,
        item: `https://stoxpulse.com/blog/${slug}`,
      },
    ],
  };

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    image: `https://stoxpulse.com${post.image}`,
    datePublished: post.date,
    dateModified: post.updated,
    author: {
      "@type": "Organization",
      name: post.author,
      url: "https://stoxpulse.com",
    },
    publisher: {
      "@type": "Organization",
      name: "StoxPulse",
      url: "https://stoxpulse.com",
      logo: "https://stoxpulse.com/images/related/logo1.png",
    },
    mainEntityOfPage: `https://stoxpulse.com/blog/${slug}`,
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: ["article header h1", "article header p", ".prose-custom"],
    },
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `What does this article about ${post.category.toLowerCase()} cover?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: post.description,
        },
      },
      {
        "@type": "Question",
        name: "Who is this article for?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "This article is written for self-directed retail investors who want to leverage AI-powered tools and data-driven strategies to make smarter investment decisions.",
        },
      },
    ],
  };

  const paragraphs = post.content.split("\n\n").filter((p) => p.trim());

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <Navbar />
      <main className="min-h-screen pt-20 bg-background">
        {/* Breadcrumbs */}
        <div className="mx-auto max-w-4xl px-6 pt-8">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
            <ChevronRight className="size-3.5" />
            <Link href="/blog" className="hover:text-foreground transition-colors">
              Blog
            </Link>
            <ChevronRight className="size-3.5" />
            <span className="text-foreground line-clamp-1">{post.title}</span>
          </nav>
        </div>

        {/* Article Header */}
        <article className="mx-auto max-w-4xl px-6 pt-12 pb-16">
          <header className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <span className="inline-flex items-center rounded-full bg-brand/10 border border-brand/20 px-3 py-0.5 text-xs font-semibold text-brand">
                {post.category}
              </span>
              {post.pillar && (
                <span className="inline-flex items-center rounded-full bg-surface-2 border border-border px-3 py-0.5 text-xs font-medium text-muted-foreground">
                  Pillar Post
                </span>
              )}
            </div>
            <h1 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              {post.title}
            </h1>
            <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
              {post.description}
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <User className="size-4" />
                {post.author}
              </span>
              <span>
                {new Date(post.date).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="size-3.5" />
                {post.readTime}
              </span>
              {post.updated !== post.date && (
                <span className="text-xs">
                  Updated:{" "}
                  {new Date(post.updated).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              )}
            </div>
          </header>

          {/* Article Content */}
          <div className="prose-custom space-y-6">
            {paragraphs.map((paragraph, index) => (
              <p
                key={index}
                className="text-muted-foreground leading-relaxed text-base"
              >
                {paragraph}
              </p>
            ))}
          </div>

          {/* Contextual Tool Links — builds topical authority */}
          <div className="mt-10 rounded-2xl border border-brand/20 bg-brand/5 p-6">
            <h3 className="font-display text-lg font-bold text-foreground mb-4">
              Try These Free Tools
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {(post.cluster === "sec-filings" || post.cluster === "earnings") && (
                <Link
                  href="/tools/sec-filing-translator"
                  className="group flex items-center gap-3 rounded-xl border border-border/50 bg-background px-4 py-3 hover:border-brand/30 transition-all"
                >
                  <span className="font-semibold text-sm text-foreground group-hover:text-brand transition-colors flex-1">SEC Form 4 Decoder</span>
                  <ArrowRight className="size-4 text-muted-foreground/30 group-hover:text-brand transition-all" />
                </Link>
              )}
              <Link
                href="/tools/stock-sentiment-checker"
                className="group flex items-center gap-3 rounded-xl border border-border/50 bg-background px-4 py-3 hover:border-brand/30 transition-all"
              >
                <span className="font-semibold text-sm text-foreground group-hover:text-brand transition-colors flex-1">Stock Sentiment Checker</span>
                <ArrowRight className="size-4 text-muted-foreground/30 group-hover:text-brand transition-all" />
              </Link>
              {(post.cluster === "earnings" || post.cluster === "ai-investing") && (
                <Link
                  href="/tools/earnings-call-summarizer"
                  className="group flex items-center gap-3 rounded-xl border border-border/50 bg-background px-4 py-3 hover:border-brand/30 transition-all"
                >
                  <span className="font-semibold text-sm text-foreground group-hover:text-brand transition-colors flex-1">Earnings Call Summarizer</span>
                  <ArrowRight className="size-4 text-muted-foreground/30 group-hover:text-brand transition-all" />
                </Link>
              )}
              <Link
                href="/stocks"
                className="group flex items-center gap-3 rounded-xl border border-border/50 bg-background px-4 py-3 hover:border-brand/30 transition-all"
              >
                <span className="font-semibold text-sm text-foreground group-hover:text-brand transition-colors flex-1">Browse S&amp;P 500 Stocks</span>
                <ArrowRight className="size-4 text-muted-foreground/30 group-hover:text-brand transition-all" />
              </Link>
            </div>
          </div>

          {/* Tags */}
          <div className="mt-12 pt-8 border-t border-border">
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center rounded-full bg-surface-2 px-3 py-1 text-xs text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </article>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="mx-auto max-w-4xl px-6 pb-16">
            <h2 className="font-display text-2xl font-bold text-foreground mb-6">
              Related Articles
            </h2>
            <div className="grid gap-6 sm:grid-cols-2">
              {relatedPosts.map((related) => (
                <Link
                  key={related.slug}
                  href={`/blog/${related.slug}`}
                  className="group rounded-2xl bg-surface-1 border border-border p-6 hover:border-brand/40 transition-colors"
                >
                  <h3 className="font-display text-base font-semibold text-foreground group-hover:text-brand transition-colors">
                    {related.title}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                    {related.description}
                  </p>
                  <div className="mt-3 flex items-center gap-1 text-sm font-medium text-brand opacity-0 group-hover:opacity-100 transition-opacity">
                    Read article
                    <ArrowRight className="size-3.5" />
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="mx-auto max-w-4xl px-6 pb-24">
          <div className="rounded-2xl bg-surface-1 border border-border p-8 md:p-12 text-center">
            <h2 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
              Ready to try AI-powered stock analysis?
            </h2>
            <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
              Join thousands of self-directed investors using StoxPulse to analyze
              earnings calls, SEC filings, and market news with AI.
            </p>
            <div className="mt-6 flex items-center justify-center gap-4">
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 rounded-lg bg-surface-2 px-5 py-2.5 text-sm font-medium text-foreground hover:bg-surface-3 transition-colors"
              >
                <ArrowLeft className="size-4" />
                All Articles
              </Link>
              <Link
                href="/#waitlist"
                className="inline-flex items-center justify-center rounded-lg bg-brand px-6 py-3 text-sm font-semibold text-brand-foreground hover:bg-brand/90 transition-colors"
              >
                Get Early Access
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
