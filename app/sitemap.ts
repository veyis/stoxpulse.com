import type { MetadataRoute } from "next";
import {
  sp500Stocks,
  tickerToSlug,
  getAllSectors,
  sectorToSlug,
} from "@/data/stocks/sp500";
import { blogPosts } from "@/data/blog/posts";
import { glossaryTerms } from "@/data/glossary/terms";
import { competitors } from "@/data/competitors";

const baseUrl = "https://stoxpulse.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/stocks`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/signals`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/signals/methodology`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/tools`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/tools/earnings-call-summarizer`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/glossary`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/compare`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/earnings`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];

  // Dynamic stock ticker pages: /stocks/[slug]
  const stockPages: MetadataRoute.Sitemap = sp500Stocks.map((stock) => ({
    url: `${baseUrl}/stocks/${tickerToSlug(stock.ticker)}`,
    lastModified: now,
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));

  // Dynamic sector pages: /stocks/sector/[slug]
  const sectorPages: MetadataRoute.Sitemap = getAllSectors().map((sector) => ({
    url: `${baseUrl}/stocks/sector/${sectorToSlug(sector)}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  // Blog post pages: /blog/[slug]
  const blogPages: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.updated || post.date),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  // Glossary term pages: /glossary/[term]
  const glossaryPages: MetadataRoute.Sitemap = glossaryTerms.map((term) => ({
    url: `${baseUrl}/glossary/${term.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  // Compare pages: /compare/stoxpulse-vs-[slug]
  const comparePages: MetadataRoute.Sitemap = competitors.map((c) => ({
    url: `${baseUrl}/compare/stoxpulse-vs-${c.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  // Alternatives pages: /alternatives/[slug]-alternatives
  const alternativesPages: MetadataRoute.Sitemap = competitors.map((c) => ({
    url: `${baseUrl}/alternatives/${c.slug}-alternatives`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [
    ...staticPages,
    ...stockPages,
    ...sectorPages,
    ...blogPages,
    ...glossaryPages,
    ...comparePages,
    ...alternativesPages,
  ];
}
