import Link from "next/link";
import { JsonLd } from "@/lib/json-ld";

interface BreadcrumbItem {
  name: string;
  href: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `https://stoxpulse.com${item.href}`,
    })),
  };

  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <JsonLd data={breadcrumbSchema} />
      <ol className="flex items-center gap-1.5 text-sm text-muted-foreground">
        {items.map((item, index) => (
          <li key={item.href} className="flex items-center gap-1.5">
            {index > 0 && (
              <span className="text-muted-foreground/50">/</span>
            )}
            {index === items.length - 1 ? (
              <span className="text-foreground">{item.name}</span>
            ) : (
              <Link
                href={item.href}
                className="transition-colors hover:text-foreground"
              >
                {item.name}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
