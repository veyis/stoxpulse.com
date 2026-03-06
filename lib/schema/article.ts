interface ArticleInput {
  title: string;
  description: string;
  slug: string;
  datePublished: string;
  dateModified: string;
  image: string;
  authorName: string;
}

export function getArticleSchema(article: ArticleInput) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    url: `https://stoxpulse.com/blog/${article.slug}`,
    datePublished: article.datePublished,
    dateModified: article.dateModified,
    image: article.image,
    author: {
      "@type": "Person",
      name: article.authorName,
    },
    publisher: {
      "@type": "Organization",
      name: "StoxPulse",
      url: "https://stoxpulse.com",
      logo: {
        "@type": "ImageObject",
        url: "https://stoxpulse.com/logo.png",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://stoxpulse.com/blog/${article.slug}`,
    },
  };
}
