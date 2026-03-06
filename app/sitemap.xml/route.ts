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

function url(
  loc: string,
  lastmod: string,
  changefreq: string,
  priority: number
) {
  return `<url><loc>${loc}</loc><lastmod>${lastmod}</lastmod><changefreq>${changefreq}</changefreq><priority>${priority}</priority></url>`;
}

export function GET() {
  const now = "2026-03-06";

  const urls: string[] = [
    // Static pages
    url(baseUrl, now, "daily", 1.0),
    url(`${baseUrl}/stocks`, now, "daily", 0.9),
    url(`${baseUrl}/signals`, now, "daily", 0.9),
    url(`${baseUrl}/signals/methodology`, now, "monthly", 0.7),
    url(`${baseUrl}/blog`, now, "daily", 0.8),
    url(`${baseUrl}/tools`, now, "weekly", 0.8),
    url(`${baseUrl}/tools/earnings-call-summarizer`, now, "weekly", 0.7),
    url(`${baseUrl}/glossary`, now, "weekly", 0.7),
    url(`${baseUrl}/compare`, now, "weekly", 0.7),
    url(`${baseUrl}/earnings`, now, "daily", 0.8),
    url(`${baseUrl}/privacy`, now, "monthly", 0.3),
    url(`${baseUrl}/terms`, now, "monthly", 0.3),

    // Stock pages
    ...sp500Stocks.map((stock) =>
      url(`${baseUrl}/stocks/${tickerToSlug(stock.ticker)}`, now, "daily", 0.8)
    ),

    // Sector pages
    ...getAllSectors().map((sector) =>
      url(
        `${baseUrl}/stocks/sector/${sectorToSlug(sector)}`,
        now,
        "weekly",
        0.7
      )
    ),

    // Blog posts
    ...blogPosts.map((post) =>
      url(
        `${baseUrl}/blog/${post.slug}`,
        post.updated || post.date,
        "weekly",
        0.7
      )
    ),

    // Glossary terms
    ...glossaryTerms.map((term) =>
      url(`${baseUrl}/glossary/${term.slug}`, now, "monthly", 0.6)
    ),

    // Compare pages
    ...competitors.map((c) =>
      url(`${baseUrl}/compare/stoxpulse-vs-${c.slug}`, now, "monthly", 0.6)
    ),

    // Alternatives pages
    ...competitors.map((c) =>
      url(
        `${baseUrl}/alternatives/${c.slug}-alternatives`,
        now,
        "monthly",
        0.6
      )
    ),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
